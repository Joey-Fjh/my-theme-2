const { pushFailure } = require('./lint-allow');
const { lineAt } = require('./class-tokens');

const CHECK = {
    PAGE_TOKEN_SCOPE: 'page-token-scope',
    SCREEN_HEIGHT_LITERAL: 'screen-height-literal',
};

const PAGE_TOKEN_RE = /var\(\s*--page-(?:width|margin)\b/g;
const PAGE_WIDTH_ONLY_RE = /var\(\s*--page-width\b/g;
const SCREEN_HEIGHT_LITERAL_RE = /\b100(?:s|l|d)?vh\b/g;
const PAGE_TOKEN_SCOPE_MESSAGE =
    'Page frame tokens: sections, snippets and blocks must not read --page-width or --page-margin; use --page-inset for custom insets.';
const PAGE_WIDTH_COMPONENTS_MESSAGE =
    'Page frame tokens: tailwind/tailwind.components.css must not read --page-width (--page-margin remains allowed).';
const SCREEN_HEIGHT_LITERAL_MESSAGE =
    'One-screen height must use var(--screen-height), not a literal 100svh, 100vh, 100lvh, or 100dvh.';

function blank(match) {
    return match.replace(/[^\r\n]/g, ' ');
}

function maskLiquidComments(text) {
    return text
        .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, blank)
        .replace(/{%-?\s*#[\s\S]*?-?%}/g, blank)
        .replace(/{%-?\s*liquid\b[\s\S]*?-?%}/g, (tag) => tag.replace(/^[ \t]*#.*$/gm, blank));
}

function inRoots(file, roots) {
    return roots.some((root) => file.startsWith(root));
}

function collectPageFrameLiquidFailures(text, file, failures, allowsByLine, data) {
    // Each check scans its own roots; an empty list (the check is off) scans nothing.
    const checkPageToken = inRoots(file, data.pageTokenRoots ?? []);
    const checkScreenHeight = inRoots(file, data.liquidRoots ?? []);
    if (!checkPageToken && !checkScreenHeight) return;
    const masked = maskLiquidComments(text);
    if (checkPageToken) {
        for (const match of masked.matchAll(PAGE_TOKEN_RE)) {
            pushFailure(
                failures,
                allowsByLine,
                file,
                lineAt(masked, match.index),
                CHECK.PAGE_TOKEN_SCOPE,
                PAGE_TOKEN_SCOPE_MESSAGE,
            );
        }
    }
    if (!checkScreenHeight) return;
    for (const match of masked.matchAll(SCREEN_HEIGHT_LITERAL_RE)) {
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(masked, match.index),
            CHECK.SCREEN_HEIGHT_LITERAL,
            SCREEN_HEIGHT_LITERAL_MESSAGE,
        );
    }
}

function collectPageFrameCssFailures(text, file, failures, allowsByLine) {
    if (file !== 'tailwind/tailwind.components.css') return;
    for (const match of text.matchAll(PAGE_WIDTH_ONLY_RE)) {
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, match.index),
            CHECK.PAGE_TOKEN_SCOPE,
            PAGE_WIDTH_COMPONENTS_MESSAGE,
        );
    }
}

module.exports = {
    CHECK,
    collectPageFrameCssFailures,
    collectPageFrameLiquidFailures,
};
