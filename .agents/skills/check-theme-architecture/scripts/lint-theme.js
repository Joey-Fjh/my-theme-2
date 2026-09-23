#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const espree = require('espree');
const fg = require('fast-glob');
const { parseLiquidAst, walk } = require('./lib/liquid-ast');

const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];

const PROTECTED_RUNTIME_NAMES = new Set([
    'all_products',
    'article',
    'articles',
    'block',
    'blog',
    'blogs',
    'canonical_url',
    'cart',
    'collection',
    'collections',
    'content_for_header',
    'content_for_layout',
    'customer',
    'form',
    'forloop',
    'gift_card',
    'handle',
    'images',
    'linklists',
    'localization',
    'metaobjects',
    'order',
    'page',
    'page_description',
    'page_image',
    'page_title',
    'pages',
    'paginate',
    'predictive_search',
    'product',
    'recommendations',
    'request',
    'routes',
    'search',
    'section',
    'settings',
    'shop',
    'template',
    'theme',
]);

const TAB_ARIA_SELECTED_ATTRS = ['aria-selected', ':aria-selected', 'x-bind:aria-selected'];
const TAB_ARIA_CONTROLS_ATTRS = ['aria-controls', ':aria-controls', 'x-bind:aria-controls'];

const BUNDLED_ASSET_TAG_NAMES = ['stylesheet', 'javascript'];
const CSS_GLOBS = ['tailwind/**/*.css', 'assets/*.css'];

const { extractBlocks } = require('./lint-embedded-compat.cjs');

const INVALID_RGB_ALPHA_RE = /rgba?\(\s*var\(--color-[a-z0-9-]+\)\s*\//i;
const INVALID_RGB_ALPHA_MESSAGE =
    'Scheme color variables are comma-separated RGB triplets. ' +
    'Use rgba(var(--color-*), alpha) instead of rgb(var(--color-*) / alpha).';

function parseRootArg(argv) {
    const index = argv.indexOf('--root');

    if (index !== -1 && argv[index + 1]) {
        return path.resolve(argv[index + 1]);
    }

    return process.cwd();
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function maskNonExecutableLiquid(text) {
    let masked = text;

    for (const [openTag, closeTag] of [
        ['comment', 'endcomment'],
        ['doc', 'enddoc'],
    ]) {
        const re = new RegExp(
            `{%-?\\s*${openTag}\\s*-?%}[\\s\\S]*?{%-?\\s*${closeTag}\\s*-?%}`,
            'gi',
        );
        masked = masked.replace(re, (match) => match.replace(/[^\n\r]/g, ' '));
    }

    return masked;
}

function collectProtectedRuntimeNameFailures(ast, text, file, failures) {
    walk(ast, (node) => {
        if (node.type !== 'LiquidTag') {
            return;
        }

        if (node.name !== 'assign' && node.name !== 'capture') {
            return;
        }

        const name = node.markup?.name;

        if (typeof name !== 'string' || !PROTECTED_RUNTIME_NAMES.has(name)) {
            return;
        }

        failures.push({
            file,
            line: lineAt(text, node.position?.start ?? 0),
            message: `Do not ${node.name} over protected Shopify Liquid runtime name "${name}".`,
        });
    });
}

function hasHtmlAttribute(attributes, names) {
    const expected = new Set(Array.isArray(names) ? names : [names]);

    return (attributes ?? []).some((attr) => {
        if (!Array.isArray(attr.name)) return false;
        const attrName = attr.name.map((part) => part.value || '').join('');
        return expected.has(attrName);
    });
}

function getHtmlAttributeValue(attributes, name) {
    if (!attributes) return '';

    for (const attr of attributes) {
        if (!Array.isArray(attr.name)) continue;

        const attrName = attr.name.map((part) => part.value || '').join('');
        if (attrName !== name) continue;

        return (attr.value ?? [])
            .map((part) => (part.type === 'TextNode' ? part.value || '' : ''))
            .join('')
            .trim();
    }

    return '';
}

function collectTabFailures(ast, text, file, failures) {
    walk(ast, (node) => {
        if (!node.attributes) return;

        const role = getHtmlAttributeValue(node.attributes, 'role');
        if (role !== 'tab') return;

        const missing = [];

        if (!hasHtmlAttribute(node.attributes, TAB_ARIA_SELECTED_ATTRS)) {
            missing.push('aria-selected');
        }

        if (!hasHtmlAttribute(node.attributes, TAB_ARIA_CONTROLS_ATTRS)) {
            missing.push('aria-controls');
        }

        if (missing.length === 0) return;

        failures.push({
            file,
            line: lineAt(text, node.position?.start ?? 0),
            message: `role="tab" is missing ${missing.join(', ')}.`,
        });
    });
}

// Alpine directives whose value is not a JavaScript expression.
const ALPINE_NON_EXPRESSION_DIRECTIVES = new Set([
    'x-cloak',
    'x-ignore',
    'x-ref',
    'x-teleport',
    'x-transition',
]);
const HTML_ENTITIES = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    newline: '\n',
    quot: '"',
    tab: '\t',
};
const ALPINE_EXPRESSION_MESSAGE =
    'keep Alpine attributes to simple expressions: move the logic into the registered component, and pass Liquid values through data-*.';

function isAlpineExpressionAttribute(name) {
    if (name.startsWith('@') || name.startsWith(':')) return true;
    if (!name.startsWith('x-')) return false;
    return !ALPINE_NON_EXPRESSION_DIRECTIVES.has(name.split(/[:.]/)[0]);
}

// Returns the decoded value, or null when it holds an entity this check cannot read.
function decodeHtmlEntities(value) {
    let unknown = false;
    const decoded = value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (match, entity) => {
        if (entity[0] === '#') {
            const hex = entity[1] === 'x' || entity[1] === 'X';
            const codePoint = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
            if (codePoint > 0x10ffff) {
                unknown = true;
                return ' ';
            }
            return String.fromCodePoint(codePoint);
        }
        const known = HTML_ENTITIES[entity.toLowerCase()];
        if (known === undefined) unknown = true;
        return known ?? ' ';
    });
    return unknown ? null : decoded;
}

function findFunctionOrSequence(node, allowSequence) {
    if (!node || typeof node.type !== 'string') return null;
    if (
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ClassExpression'
    ) {
        return 'a function';
    }
    if (node.type === 'SequenceExpression' && !allowSequence) return 'a comma sequence';

    for (const [key, value] of Object.entries(node)) {
        if (key === 'parent' || key === 'loc' || key === 'range') continue;
        const children = Array.isArray(value) ? value : [value];
        for (const child of children) {
            if (child && typeof child === 'object') {
                const found = findFunctionOrSequence(child, allowSequence);
                if (found) return found;
            }
        }
    }
    return null;
}

// Parses the attribute as one JavaScript expression and returns why it is not simple, or null.
const NOT_SINGLE_EXPRESSION = 'statements or invalid JavaScript (not a single expression)';

// Module source type allows Alpine's top-level `await`.
function parseSingleExpression(code) {
    const wrapped = `(${code}\n)`;
    let program;
    try {
        program = espree.parse(wrapped, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            tokens: true,
        });
    } catch {
        return null;
    }

    if (program.body.length !== 1 || program.body[0].type !== 'ExpressionStatement') return null;

    // The wrapper's opening parenthesis must close only at the last token; otherwise the value escaped it.
    let depth = 0;
    const { tokens } = program;
    for (let index = 0; index < tokens.length; index += 1) {
        const { type, value } = tokens[index];
        if (type !== 'Punctuator') continue;
        if (value === '(') depth += 1;
        if (value === ')') {
            depth -= 1;
            if (depth === 0 && index !== tokens.length - 1) return null;
        }
    }

    return program.body[0].expression;
}

function describeAlpineExpressionProblem(name, code) {
    if (code.trim() === '') return null;

    // x-for="(item, index) in items": only the binding on the left may be a comma list.
    const forParts = name.startsWith('x-for')
        ? code.match(/^\s*([\s\S]+?)\s+(?:in|of)\s+([\s\S]+)$/)
        : null;
    const checks = forParts ? [[forParts[1], true], [forParts[2], false]] : [[code, false]];

    for (const [part, allowSequence] of checks) {
        const expression = parseSingleExpression(part);
        if (!expression) return NOT_SINGLE_EXPRESSION;

        const problem = findFunctionOrSequence(expression, allowSequence);
        if (problem) return problem;
    }

    return null;
}

// Attributes inside {% if %} / {% unless %} / {% case %} branches sit in LiquidTag children.
function flattenAttributes(attributes, result = []) {
    for (const attr of attributes ?? []) {
        if (Array.isArray(attr.name)) {
            result.push(attr);
        } else if (Array.isArray(attr.children)) {
            for (const child of attr.children) {
                flattenAttributes(child.children ?? [child], result);
            }
        }
    }
    return result;
}

function collectAlpineExpressionFailures(ast, text, file, failures) {
    walk(ast, (node) => {
        for (const attr of flattenAttributes(node.attributes)) {
            const name = attr.name.map((part) => part.value || '').join('');
            if (!isAlpineExpressionAttribute(name)) continue;

            const parts = attr.value ?? [];
            const reasons = [];

            if (parts.some((part) => part.type !== 'TextNode')) {
                reasons.push('Liquid');
            }

            // A Liquid part stands in as a number so the rest of the expression still parses.
            const decoded = decodeHtmlEntities(
                parts.map((part) => (part.type === 'TextNode' ? part.value || '' : '0')).join(''),
            );

            if (decoded === null) {
                reasons.push('an HTML entity this check cannot read (write the character itself)');
            } else {
                const problem = describeAlpineExpressionProblem(name, decoded);
                if (problem) reasons.push(problem);
            }

            if (reasons.length === 0) continue;

            failures.push({
                file,
                line: lineAt(text, attr.position?.start ?? node.position?.start ?? 0),
                message: `Alpine attribute "${name}" contains ${reasons.join(', ')}; ${ALPINE_EXPRESSION_MESSAGE}`,
            });
        }
    });
}

function collectBundledAssetTagFailures(ast, text, file, failures) {
    const tagsByName = Object.fromEntries(BUNDLED_ASSET_TAG_NAMES.map((name) => [name, []]));

    walk(ast, (node) => {
        if (node.type !== 'LiquidRawTag') {
            return;
        }

        if (!tagsByName[node.name]) {
            return;
        }

        tagsByName[node.name].push(node);
    });

    for (const tagName of BUNDLED_ASSET_TAG_NAMES) {
        const tags = tagsByName[tagName];

        for (let index = 1; index < tags.length; index += 1) {
            const node = tags[index];
            failures.push({
                file,
                line: lineAt(text, node.blockStartPosition?.start ?? node.position?.start ?? 0),
                message:
                    `Only one {% ${tagName} %} tag is allowed per file (found ${tags.length}). ` +
                    'Multiple tags cause a syntax error in the theme editor.',
            });
        }

        for (const node of tags) {
            if (!node.body) {
                continue;
            }

            walk(node.body, (inner) => {
                if (inner.type === 'LiquidVariableOutput') {
                    failures.push({
                        file,
                        line: lineAt(text, inner.position?.start ?? 0),
                        message:
                            `Liquid output tags are not allowed inside {% ${tagName} %} blocks. ` +
                            'Liquid is not rendered in bundled asset tags.',
                    });
                }

                if (inner.type === 'LiquidTag') {
                    failures.push({
                        file,
                        line: lineAt(text, inner.position?.start ?? 0),
                        message:
                            `Liquid tags are not allowed inside {% ${tagName} %} blocks. ` +
                            'Liquid is not rendered in bundled asset tags.',
                    });
                }
            });
        }
    }
}

function stripCssComments(text) {
    return text.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n\r]/g, ' '));
}

function splitCssRules(text, rangeStart = 0, rangeEnd = text.length) {
    const segment = text.slice(rangeStart, rangeEnd);
    const stripped = stripCssComments(segment);
    const rules = [];
    let depth = 0;
    let ruleStart = 0;

    for (let index = 0; index < stripped.length; index += 1) {
        const char = stripped[index];

        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;

            if (depth !== 0) {
                continue;
            }

            const chunk = stripped.slice(ruleStart, index + 1);
            const brace = chunk.indexOf('{');

            if (brace !== -1) {
                const selectorPart = chunk.slice(0, brace);
                const selectorTrimmed = selectorPart.trim();
                const leadingWhitespace = selectorPart.length - selectorPart.trimStart().length;
                const absoluteOffset = rangeStart + ruleStart + leadingWhitespace;

                if (selectorTrimmed.startsWith('@')) {
                    const nestedStart = rangeStart + ruleStart + brace + 1;
                    const nestedEnd = rangeStart + ruleStart + index;
                    rules.push(...splitCssRules(text, nestedStart, nestedEnd));
                } else {
                    rules.push({
                        selector: selectorTrimmed,
                        decls: chunk.slice(brace + 1, -1),
                        offset: absoluteOffset,
                    });
                }
            }

            ruleStart = index + 1;
        }
    }

    return rules;
}

function collectInvalidRgbAlphaFailures(cssText, file, failures, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const lines = cssText.split('\n');
    let offset = 0;

    for (const line of lines) {
        const strippedLine = stripCssComments(line);

        if (INVALID_RGB_ALPHA_RE.test(strippedLine)) {
            failures.push({
                file,
                line: lineAt(lineText, baseOffset + offset),
                message: INVALID_RGB_ALPHA_MESSAGE,
            });
        }

        offset += line.length + 1;
    }
}

async function runThemeLint(root) {
    const failures = [];
    const files = await fg(LIQUID_GLOBS, { cwd: root, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const text = await fs.readFile(path.join(root, file), 'utf8');
        const { ast, error } = parseLiquidAst(text);

        if (error) {
            failures.push({
                file,
                line: 1,
                message: `Liquid parse error: ${error.message}`,
            });
            continue;
        }

        collectProtectedRuntimeNameFailures(ast, text, file, failures);
        collectBundledAssetTagFailures(ast, text, file, failures);
        collectTabFailures(ast, text, file, failures);
        collectAlpineExpressionFailures(ast, text, file, failures);

        for (const block of extractBlocks(text, 'stylesheet')) {
            collectInvalidRgbAlphaFailures(block.code, file, failures, {
                baseOffset: block.offset,
                lineText: text,
            });
        }
    }

    const cssFiles = await fg(CSS_GLOBS, { cwd: root, dot: false, onlyFiles: true });

    for (const file of cssFiles.map(formatPath)) {
        const text = await fs.readFile(path.join(root, file), 'utf8');
        collectInvalidRgbAlphaFailures(text, file, failures);
    }

    return failures;
}

async function main(argv = process.argv) {
    const root = parseRootArg(argv);
    const failures = await runThemeLint(root);

    if (failures.length === 0) {
        console.log('Theme architecture lint passed.');
        return;
    }

    console.error(`Theme architecture lint found ${failures.length} issue(s):`);
    for (const failure of failures) {
        console.error(`${failure.file}:${failure.line}: ${failure.message}`);
    }

    process.exitCode = 1;
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = {
    PROTECTED_RUNTIME_NAMES,
    maskNonExecutableLiquid,
    runThemeLint,
    collectProtectedRuntimeNameFailures,
    collectBundledAssetTagFailures,
    collectTabFailures,
    collectInvalidRgbAlphaFailures,
    splitCssRules,
    stripCssComments,
};
