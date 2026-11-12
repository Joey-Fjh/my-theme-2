const fs = require('node:fs/promises');
const { __unstable__loadDesignSystem } = require('tailwindcss');
const { parseCss, compact, cssComponents } = require('./css-syntax');
const { lineAt } = require('./class-tokens');
const { pushFailure } = require('./lint-allow');

const CHECK = 'forbidden-viewport-unit';
const UNKNOWN = '\uFFF0';
const CONDITIONS = new Set(['media', 'supports', 'container', 'custom-media', 'import']);
let themePromise;
let compilerKey;
let compilerPromise;

async function forbiddenUnits(nodes) {
    const result = [];
    for (const node of nodes) {
        // Quoted strings and unquoted url() are atomic tokenizer nodes; quoted
        // url() and supports selector() must not be treated as size expressions.
        if (node.type === 'function-token' && ['url', 'selector'].includes(node.value.toLowerCase())) continue;
        if (node.type === 'dimension-token' && /^(?:l?vh)$/i.test(node.unit)) result.push(node.raw);
        // Re-tokenize only an already identified CSS value token containing an
        // unresolved fragment. A numeric stand-in preserves signs/fragments and
        // escaped literal suffixes, but cannot invent an absent unit or turn a
        // word-prefixed/escaped identifier into a dimension.
        if (['ident-token', 'dimension-token'].includes(node.type) && node.raw.includes(UNKNOWN)) {
            const projected = await cssComponents(node.raw.replaceAll(UNKNOWN, '0'));
            if (projected.length === 1 && projected[0].type === 'dimension-token' && /^(?:l?vh)$/i.test(projected[0].unit)) result.push(node.raw);
        }
        if (node.children) result.push(...await forbiddenUnits(node.children));
    }
    return result;
}

async function usesInSheet(sheet) {
    const uses = [];
    for (const declaration of sheet.declarations) {
        const units = await forbiddenUnits(declaration.value);
        if (units.length) uses.push({ start: declaration.start, units });
    }
    for (const rule of sheet.rules) {
        for (const prelude of [rule.prelude, ...(rule.statements ?? [])]) {
            const parts = compact(prelude);
            if (parts[0]?.type !== 'at-keyword-token' || !CONDITIONS.has(parts[0].value.toLowerCase())) continue;
            const units = await forbiddenUnits(parts.slice(1));
            if (units.length) uses.push({ start: parts[0].start, units });
        }
    }
    return uses;
}

async function candidateCompiler(sheets) {
    // Use the installed compiler with actual first-party theme/utility/variant
    // definitions. Imports, source directives and ordinary selectors are not
    // compiler inputs here; candidate CSS is inspected, never written to assets.
    const definitions = [];
    for (const sheet of sheets) {
        for (const rule of sheet.rules) {
            const parts = compact(rule.prelude);
            if (parts[0]?.type !== 'at-keyword-token' || !['theme', 'utility', 'custom-variant'].includes(parts[0].value)) continue;
            definitions.push(rule.code.slice(parts[0].start, rule.end + 1));
        }
        for (const prelude of sheet.root.statements ?? []) {
            const parts = compact(prelude);
            if (parts[0]?.value === 'custom-variant') definitions.push(sheet.root.code.slice(parts[0].start, parts.at(-1).end + 1) + ';');
        }
    }
    const key = definitions.join('\n');
    themePromise ??= fs.readFile(require.resolve('tailwindcss/theme.css'), 'utf8');
    if (!compilerPromise || compilerKey !== key) {
        compilerKey = key;
        compilerPromise = themePromise.then((theme) => __unstable__loadDesignSystem(theme + '\n' + key));
    }
    return compilerPromise;
}

async function collectViewportUnitFailures(cssSheets, styleBlocks, sinks, failures) {
    const seen = new Set();
    const metrics = { viewportCssDocuments: cssSheets.length + styleBlocks.length, viewportStyleSinks: 0, viewportClassCandidates: 0, viewportUnitFindings: 0 };
    function report(document, start, units, candidate) {
        const position = document.positions ? (document.positions[start] ?? document.start) : start + (document.offset ?? 0);
        const line = lineAt(document.text, position);
        const key = `${document.file}:${line}:${candidate ?? 'style'}`;
        if (seen.has(key)) return;
        seen.add(key);
        const before = failures.length;
        pushFailure(failures, document.allowsByLine, document.file, line, CHECK, `${CHECK}: ${candidate ? `Tailwind candidate ${candidate} emits` : 'style uses'} prohibited vh/lvh units (${[...new Set(units)].join(', ')}).`);
        metrics.viewportUnitFindings += failures.length - before;
    }
    const sheets = [...cssSheets];
    for (const document of styleBlocks) sheets.push(await parseCss(document.code, document));
    const compiler = await candidateCompiler(cssSheets);
    const candidateCache = new Map();
    async function candidateUnits(candidate) {
        if (candidate.includes(UNKNOWN)) return [];
        if (!candidateCache.has(candidate)) {
            const css = compiler.candidatesToCss([candidate])[0];
            candidateCache.set(candidate, css ? (await usesInSheet(await parseCss(css))).flatMap((use) => use.units) : []);
        }
        return candidateCache.get(candidate);
    }
    for (const sheet of sheets) {
        for (const use of await usesInSheet(sheet)) report(sheet.root, use.start, use.units);
        for (const rule of sheet.rules) for (const candidate of rule.applyCandidates ?? []) {
            const units = await candidateUnits(candidate.value);
            if (units.length) report(sheet.root, candidate.start, units, candidate.value);
        }
    }
    for (const sink of sinks) {
        for (const value of sink.viewportStyles ?? []) {
            if (!value.code || value.code === UNKNOWN) continue;
            metrics.viewportStyleSinks++;
            const document = { ...sink, ...value };
            for (const use of await usesInSheet(await parseCss(value.code))) report(document, use.start, use.units);
        }
        for (const value of sink.viewportClasses ?? []) {
            for (const match of value.code.matchAll(/\S+/g)) {
                if (match[0].includes(UNKNOWN)) continue;
                metrics.viewportClassCandidates++;
                const units = await candidateUnits(match[0]);
                if (units.length) report({ ...sink, ...value }, match.index, units, match[0]);
            }
        }
    }
    return metrics;
}

module.exports = { collectViewportUnitFailures };
