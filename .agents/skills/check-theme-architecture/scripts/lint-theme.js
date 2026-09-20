#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
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

const SVG_TEXT_LENGTH_RE = /<text\b(?=[^>]*\btextLength\s*=)[^>]*>([\s\S]*?)<\/text>/gi;

const TAB_ARIA_SELECTED_ATTRS = ['aria-selected', ':aria-selected', 'x-bind:aria-selected'];
const TAB_ARIA_CONTROLS_ATTRS = ['aria-controls', ':aria-controls', 'x-bind:aria-controls'];

const BUNDLED_ASSET_TAG_NAMES = ['stylesheet', 'javascript'];
const CSS_GLOBS = ['tailwind/**/*.css', 'assets/*.css'];

const { extractBlocks } = require('./lint-embedded-compat.cjs');

const MOTION_TARGET_SELECTOR_RE = /\[data-motion-reveal(?:=['"][^'"]*['"])?\]/;
const MOTION_RUNTIME_STATE_SELECTOR_RE =
    /\[data-motion-(?:state|resetting|staging|critical-runtime)(?:=|]|$)/;
const MOTION_HIDING_DECL_RE =
    /\b(?:opacity\s*:\s*0\b|visibility\s*:\s*hidden\b|display\s*:\s*none\b)/;

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

function collectMotionActivationFailures(cssText, file, failures, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;

    for (const rule of splitCssRules(cssText)) {
        if (!MOTION_TARGET_SELECTOR_RE.test(rule.selector)) {
            continue;
        }

        if (!MOTION_HIDING_DECL_RE.test(rule.decls)) {
            continue;
        }

        if (MOTION_RUNTIME_STATE_SELECTOR_RE.test(rule.selector)) {
            continue;
        }

        failures.push({
            file,
            line: lineAt(lineText, baseOffset + rule.offset),
            message:
                'Motion targets must not be hidden without a runtime state attribute in the selector. ' +
                'Require [data-motion-state], [data-motion-resetting], [data-motion-staging], or [data-motion-critical-runtime].',
        });
    }
}

function collectSvgTextLengthFailures(text, file, failures) {
    const masked = maskNonExecutableLiquid(text);

    for (const match of masked.matchAll(SVG_TEXT_LENGTH_RE)) {
        if (!/<tspan\b/i.test(match[1])) continue;

        failures.push({
            file,
            line: lineAt(text, match.index ?? 0),
            message:
                'Do not nest <tspan> inside SVG <text textLength>; WebKit can ignore the requested text length. Apply whole-text styling on <text>.',
        });
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
        collectSvgTextLengthFailures(text, file, failures);
        collectTabFailures(ast, text, file, failures);

        for (const block of extractBlocks(text, 'stylesheet')) {
            collectMotionActivationFailures(block.code, file, failures, {
                baseOffset: block.offset,
                lineText: text,
            });
        }
    }

    const cssFiles = await fg(CSS_GLOBS, { cwd: root, dot: false, onlyFiles: true });

    for (const file of cssFiles.map(formatPath)) {
        const text = await fs.readFile(path.join(root, file), 'utf8');
        collectMotionActivationFailures(text, file, failures);
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
    collectSvgTextLengthFailures,
    collectTabFailures,
    collectMotionActivationFailures,
    splitCssRules,
    stripCssComments,
};
