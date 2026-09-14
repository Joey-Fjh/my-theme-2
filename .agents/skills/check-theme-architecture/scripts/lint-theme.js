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
        collectSvgTextLengthFailures(text, file, failures);
        collectTabFailures(ast, text, file, failures);
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
    collectSvgTextLengthFailures,
    collectTabFailures,
};
