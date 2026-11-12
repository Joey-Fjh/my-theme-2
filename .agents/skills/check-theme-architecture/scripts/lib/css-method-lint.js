const fs = require('node:fs/promises');
const { __unstable__loadDesignSystem } = require('tailwindcss');
const { parseCss, compact, descendants, utilityName, selectorSubjects, allSubjectClasses, isZeroValue } = require('./css-syntax');
const { collectMarkupSinks } = require('./markup-sinks');
const { createFontAnalysis } = require('./cqi-font-lint');
const { collectViewportUnitFailures } = require('./viewport-unit-lint');
const { lineAt } = require('./class-tokens');
const { pushFailure, isAllowed } = require('./lint-allow');

const SPACING = /^(?:(?:margin|padding)(?:-(?:top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?|(?:row-|column-)?gap)$/;
const MARGIN = /^margin(?:-|$)/;
const ABSOLUTE_LENGTHS = new Set(['px', 'cm', 'mm', 'q', 'in', 'pc', 'pt']);
let designSystemPromise;

function baseCandidate(candidate) {
    let depth = 0;
    let start = 0;
    for (let i = 0; i < candidate.length; i++) {
        if (candidate[i] === '\\') i++;
        else if ('[('.includes(candidate[i])) depth++;
        else if ('])'.includes(candidate[i])) depth--;
        else if (candidate[i] === ':' && depth === 0) start = i + 1;
    }
    return candidate.slice(start).replace(/^!|!$/g, '');
}

async function collectCssMethodFailures(documents, cssDocuments, failures, config) {
    const sheets = await Promise.all(cssDocuments.map(async (document) => parseCss(document.code, document)));
    const declarations = sheets.flatMap((sheet) => sheet.declarations);
    const { sinks, dimensions, styleBlocks } = await collectMarkupSinks(documents, config['content-outer-margin']?.layoutPrimitives ?? [], config['forbidden-viewport-unit']?.enabled === true);
    const utilities = new Map();
    for (const sheet of sheets) for (const rule of sheet.rules) if (utilityName(rule)) utilities.set(utilityName(rule), rule);
    const enabled = (id) => config[id]?.enabled === true;
    const metrics = {
        spacingDeclarations: declarations.filter((item) => SPACING.test(item.property)).length,
        marginDeclarations: declarations.filter((item) => MARGIN.test(item.property)).length,
        markupSinks: sinks.length,
        contentRoots: sinks.filter((sink) => sink.root).length,
        mixedSinks: 0,
        allowedMixedSinks: 0,
        cqiRecipes: 0,
        cqiFontUses: 0,
        remSourceSymbols: [...dimensions.values()].filter((kinds) => kinds.size === 1 && kinds.has('rem')).length,
    };

    function report(document, offset, id, message) {
        const line = lineAt(document.text, offset + (document.offset ?? 0));
        pushFailure(failures, document.allowsByLine, document.file, line, id, `${id}: ${message}`);
    }

    if (enabled('stylesheet-spacing')) {
        for (const declaration of declarations) {
            if (!SPACING.test(declaration.property)) continue;
            const bad = descendants(declaration.value).filter((node) => node.type === 'dimension-token' && node.value !== 0 && ABSOLUTE_LENGTHS.has(node.unit.toLowerCase()));
            if (bad.length) report(declaration.owner, declaration.start, 'stylesheet-spacing', `${declaration.property} uses nonzero absolute length ${bad.map((node) => node.raw).join(', ')}; use a token or relative unit.`);
        }
    }

    designSystemPromise ??= fs.readFile(require.resolve('tailwindcss/theme.css'), 'utf8').then((source) => __unstable__loadDesignSystem(source));
    const designSystem = await designSystemPromise;
    const coreCache = new Map();
    function coreCss(candidate) {
        const base = baseCandidate(candidate);
        if (utilities.has(base)) return null;
        if (!coreCache.has(base)) coreCache.set(base, designSystem.candidatesToCss([base])[0]);
        return coreCache.get(base);
    }

    if (enabled('mixed-element')) {
        const ownedByFile = new Map();
        for (const sheet of sheets) {
            const file = sheet.root.file;
            if (!file.endsWith('.liquid')) continue;
            const owned = ownedByFile.get(file) ?? new Set();
            for (const rule of sheet.rules) for (const name of allSubjectClasses(rule)) owned.add(name);
            ownedByFile.set(file, owned);
        }
        for (const sink of sinks) {
            const owned = ownedByFile.get(sink.file) ?? new Set();
            const conflicts = sink.alternatives.filter((classes) => classes.some((name) => owned.has(name))).flatMap((classes) => classes.filter((name) => coreCss(name)));
            if (!conflicts.length) continue;
            metrics.mixedSinks++;
            if (isAllowed(sink.allowsByLine, lineAt(sink.text, sink.start), 'mixed-element')) metrics.allowedMixedSinks++;
            report(sink, sink.start, 'mixed-element', `a stylesheet-owned element also carries core utilities: ${[...new Set(conflicts)].join(', ')}.`);
        }
    }

    const marginCache = new Map();
    async function candidateMargins(candidate, seen = new Set()) {
        const base = baseCandidate(candidate);
        if (seen.has(base)) return [];
        if (marginCache.has(base)) return marginCache.get(base);
        const utility = utilities.get(base);
        const rules = utility ? [utility] : (await parseCss(coreCss(candidate) ?? '')).rules;
        const margins = [];
        async function inspect(rule, host = true) {
            if (host) {
                margins.push(...rule.declarations.filter((item) => MARGIN.test(item.property) && !isZeroValue(item.value)));
                for (const name of rule.apply ?? []) margins.push(...await candidateMargins(name, new Set([...seen, base])));
            }
            for (const child of rule.children) {
                const grouping = compact(child.prelude)[0]?.type === 'at-keyword-token';
                const subjectIsHost = selectorSubjects(child).some((subject) => subject.nesting && !subject.hasAncestor);
                await inspect(child, host && (grouping || rule.prelude.length === 0 || subjectIsHost));
            }
        }
        // parseCss already returns every rule; traverse only its root here.
        if (rules[0]) await inspect(rules[0]);
        marginCache.set(base, margins);
        return margins;
    }

    if (enabled('content-outer-margin')) {
        for (const sink of sinks.filter((item) => item.root)) {
            const classes = new Set(sink.alternatives.flat());
            const reasons = [];
            for (const name of classes) if ((await candidateMargins(name)).length) reasons.push(`class ${name}`);
            for (const style of sink.styles) {
                const parsed = await parseCss(style);
                if (parsed.declarations.some((item) => MARGIN.test(item.property) && !isZeroValue(item.value))) reasons.push('inline style');
            }
            for (const sheet of sheets) {
                for (const rule of sheet.rules) {
                    if (utilityName(rule)) continue;
                    const matches = selectorSubjects(rule).some((subject) => !subject.hasAncestor && (subject.classes.size > 0 || subject.tag) && (!subject.tag || subject.tag === sink.tag) && sink.alternatives.some((alternative) => [...subject.classes].every((name) => alternative.includes(name))));
                    if (!matches) continue;
                    const margins = rule.declarations.filter((item) => MARGIN.test(item.property) && !isZeroValue(item.value));
                    for (const name of rule.apply ?? []) margins.push(...await candidateMargins(name));
                    if (margins.length) reasons.push(`stylesheet subject in ${rule.file}`);
                }
            }
            if (reasons.length) report(sink, sink.start, 'content-outer-margin', `reusable content root has outer margin via ${[...new Set(reasons)].join(', ')}; parent layout owns spacing.`);
        }
    }

    const fontAnalysis = createFontAnalysis(sheets, dimensions);
    metrics.cqiRecipes = fontAnalysis.recipes.length;
    if (enabled('cqi-font-floor')) {
        for (const declaration of declarations.filter((item) => item.property === 'font-size')) {
            const result = fontAnalysis.trace(declaration.value, declaration.owner);
            if (result.cqi) metrics.cqiFontUses++;
            if (result.unsafe) report(declaration.owner, declaration.start, 'cqi-font-floor', 'reachable cqi font sizing requires a containing clamp with a proven rem floor.');
        }
    }
    if (enabled('forbidden-viewport-unit')) Object.assign(metrics, await collectViewportUnitFailures(sheets.filter((sheet) => !sheet.root.file.endsWith('.liquid')), styleBlocks, sinks, failures));
    return metrics;
}

module.exports = { collectCssMethodFailures, baseCandidate };
