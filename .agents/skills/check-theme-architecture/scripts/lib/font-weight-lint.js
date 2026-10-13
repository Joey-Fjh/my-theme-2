/**
 * Unloaded font weights: markup and CSS use only the numeric weights the
 * configuration allows, and not the named utilities it rejects.
 */

const { pushFailure } = require('./lint-allow');
const { classCandidateTokens, lineAt, splitVariants } = require('./class-tokens');

const CHECK_ID = 'unloaded-font-weight';
const MESSAGE =
    'Only loaded faces may be used. A weight without a loaded face falls back to the nearest one.';

function isUnloadedWeightToken(token, data) {
    const rejected = (data.rejectedUtilities ?? []).join('|');
    if (!rejected) return false;
    return new RegExp(`^font-(?:${rejected})$`).test(splitVariants(token).utility);
}

function collectMarkupFontWeightFailures(text, file, failures, allowsByLine, data) {
    for (const { value, line } of classCandidateTokens(text)) {
        if (!isUnloadedWeightToken(value, data)) continue;
        pushFailure(failures, allowsByLine, file, line, CHECK_ID, `${MESSAGE} Found: ${value}.`);
    }
}

function collectCssFontWeightFailures(cssText, file, failures, allowsByLine, data, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const allowed = new Set(data.allowedNumericWeights ?? []);
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n\r]/g, ' '));
    for (const match of stripped.matchAll(/font-weight\s*:\s*(\d+(?:\.\d+)?|\.\d+)/g)) {
        if (allowed.has(match[1])) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            CHECK_ID,
            `${MESSAGE} Found: font-weight: ${match[1]}.`,
        );
    }
    for (const match of stripped.matchAll(/@apply\s+([^;]+);/g)) {
        const bad = match[1].split(/\s+/).filter((token) => isUnloadedWeightToken(token, data));
        if (!bad.length) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            CHECK_ID,
            `${MESSAGE} Found: @apply ${bad.join(' ')}.`,
        );
    }
}

module.exports = {
    collectCssFontWeightFailures,
    collectMarkupFontWeightFailures,
};
