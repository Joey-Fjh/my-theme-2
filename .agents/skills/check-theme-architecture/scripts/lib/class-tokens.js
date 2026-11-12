/**
 * Class-token extraction shared by the colour and font-weight checks.
 * Schema, stylesheet, javascript, comments and doc blocks are not class usage.
 */

const QUOTED_RE = /"([^"]*)"|'([^']*)'/g;
const LIQUID_REGION_RE = /{{[\s\S]*?}}|{%[\s\S]*?%}/g;
const HTML_TAG_RE = /<[a-zA-Z](?:[^>"']|"[^"]*"|'[^']*')*>/g;
const ATTRIBUTE_VALUE_RE = /=\s*(?:"([^"]*)"|'([^']*)')/g;
const CLASS_CAPTURE_RE = /{%-?\s*capture\s+([\w-]*class[\w-]*)\s*-?%}([\s\S]*?){%-?\s*endcapture\s*-?%}/gi;
const ALWAYS_SPLIT_RE = /[\s"'`]/;
const SPLIT_OUTSIDE_BRACKETS_RE = /[{},()]/;
const TAILWIND_BRACKET_AFTER = new Set(['-', '/', ':']);
const ARBITRARY_START_RE = /^\[(?:[&@]|-{0,2}[a-z][a-z-]*:)/;

function blank(match) {
    return match.replace(/[^\n\r]/g, ' ');
}

function maskNonMarkup(text) {
    let masked = text;
    for (const tag of ['schema', 'stylesheet', 'javascript', 'comment', 'doc']) {
        const re = new RegExp(`{%-?\\s*${tag}\\s*-?%}[\\s\\S]*?{%-?\\s*end${tag}\\s*-?%}`, 'gi');
        masked = masked.replace(re, blank);
    }
    masked = masked.replace(/{%-?\s*#[\s\S]*?-?%}/g, blank);
    masked = masked.replace(/<!--[\s\S]*?-->/g, blank);
    masked = masked.replace(/{%-?\s*liquid\b[\s\S]*?-?%}/g, (tag) => tag.replace(/^([ \t]*)#.*$/gm, blank));
    return masked;
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function opensTailwindBracket(content, index, start) {
    if (start === index) return ARBITRARY_START_RE.test(content.slice(index, index + 64));
    return TAILWIND_BRACKET_AFTER.has(content[index - 1]);
}

function splitClassTokens(content) {
    const tokens = [];
    let start = -1;
    let depth = 0;
    const end = (index) => {
        if (start !== -1) tokens.push({ value: content.slice(start, index), index: start });
        start = -1;
        depth = 0;
    };
    for (let index = 0; index < content.length; index++) {
        const ch = content[index];
        if (ALWAYS_SPLIT_RE.test(ch) || (depth === 0 && SPLIT_OUTSIDE_BRACKETS_RE.test(ch))) {
            end(index);
            continue;
        }
        if (start === -1) start = index;
        if (ch === '[' && (depth > 0 || opensTailwindBracket(content, index, start))) depth++;
        else if (ch === ']' && depth > 0) depth--;
    }
    end(content.length);
    return tokens;
}

function pushQuotedContents(text, baseOffset, regex, regions) {
    for (const match of text.matchAll(regex)) {
        const group = match[1] !== undefined ? 1 : 2;
        const content = match[group];
        if (!content) continue;
        regions.push({ content, offset: baseOffset + match.index + match[0].indexOf(content) });
    }
}

function classCandidateTokens(text) {
    const masked = maskNonMarkup(text);
    const regions = [];
    for (const match of masked.matchAll(LIQUID_REGION_RE)) {
        pushQuotedContents(match[0], match.index, QUOTED_RE, regions);
    }
    const htmlOnly = masked.replace(LIQUID_REGION_RE, blank);
    for (const tag of htmlOnly.matchAll(HTML_TAG_RE)) {
        pushQuotedContents(tag[0], tag.index, ATTRIBUTE_VALUE_RE, regions);
    }
    for (const match of masked.matchAll(CLASS_CAPTURE_RE)) {
        const bodyStart = match.index + match[0].indexOf(match[2]);
        regions.push({ content: match[2].replace(LIQUID_REGION_RE, blank), offset: bodyStart });
    }
    const tokens = [];
    for (const { content, offset } of regions) {
        for (const { value, index } of splitClassTokens(content)) {
            if (value.includes('{')) continue;
            tokens.push({ value, offset: offset + index, line: lineAt(masked, offset + index) });
        }
    }
    return tokens;
}

function splitVariants(token) {
    const parts = token.split(':');
    const utility = parts.pop().replace(/^!|!$/g, '');
    return { variants: parts, utility };
}

module.exports = {
    classCandidateTokens,
    lineAt,
    maskNonMarkup,
    splitVariants,
};
