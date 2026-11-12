/**
 * Raw colours: markup and CSS use role tokens only.
 * Token files named in the check configuration are exempt.
 */

const { pushFailure } = require('./lint-allow');
const { classCandidateTokens, lineAt, maskNonMarkup, splitVariants } = require('./class-tokens');

const CHECK_ID = 'raw-colour';
const SYNC_CHECK_ID = 'colour-role-sync';
const HINT = 'Use a colour role or shadow-sm / -md / -lg (css-architecture.md, Colour layers).';
const ROLE_SOURCE = 'tailwind/tailwind.input.css';
const ROLE_RUNTIME = 'snippets/css-variables.liquid';
const ROLE_DECLARATION_RE = /^[ \t]*(--(?:color|shadow)-[a-z0-9-]+)\s*:\s*([^;]+);/gm;
const SCHEME_DEPENDENT_RE = /var\(--(?:color-(?:foreground|border|background)|alpha-shadow-[a-z]+)\)/;
const ROLE_STEP_RE = /var\(--alpha-/;
const STYLE_ATTRIBUTE_RE = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const NAMED_COLOURS = new Set(
    (
        'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
        'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
        'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
        'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
        'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
        'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
        'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
        'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
        'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
        'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen ' +
        'mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace ' +
        'olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
        'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
        'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey ' +
        'snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
        'yellowgreen'
    ).split(' '),
);
const COLOUR_PROPERTY_RE =
    /(?:^|-)(?:color|colour|background|border|outline|fill|stroke|shadow|decoration|caret|accent|rule|scrollbar)(?:-|$)/i;
const WORD_RE = /(?:^|[\s,(])([a-z]+)(?=$|[\s,)])/gi;
const SHADOW_PROPERTIES = new Set(['box-shadow', 'text-shadow', '-webkit-box-shadow']);

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patternsFrom(data) {
    const prefixes = (data.colourPrefixes ?? [])
        .map((prefix) => (prefix === 'border' ? 'border(?:-[xytrblse])?' : escapeRegExp(prefix)))
        .join('|');
    const colourPrefix = prefixes ? `(?:${prefixes})` : '(?!)';
    const alpha = [...(data.alphaSteps ?? []), ...(data.shadowSteps ?? []).map((step) => `shadow-${step}`)].join('|');
    const bridges = (data.bridgeTokens ?? []).map(escapeRegExp).join('|');
    return {
        opacity: new RegExp(`^${colourPrefix}-[a-z][a-z0-9-]*\\/(?:\\d+(?:\\.\\d+)?|\\[[^\\]]+\\]|\\([^)]+\\))?$`),
        blackWhite: new RegExp(`^${colourPrefix}-(?:black|white)$`),
        shadow: /^(?:inset-|drop-)?shadow(?:-.+)?$/,
        allowedShadows: new Set(data.allowedShadowUtilities ?? []),
        values: [
            {
                re: /rgba?\(\s*var\(\s*--color-[a-z0-9-]+\s*\)\s*,\s*(?!\s|var\()/i,
                reason: 'scheme colour with a non-variable alpha',
            },
            { re: /color-mix\(/i, reason: 'color-mix()' },
            { re: /#[0-9a-f]{3,8}\b/i, reason: 'hex colour' },
            { re: /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(\s*[\d.]/i, reason: 'literal colour function' },
            { re: /\bcolor\(\s*[a-z-]+\s/i, reason: 'color() function' },
            alpha
                ? {
                      re: new RegExp(`var\\(\\s*--alpha-(?:${alpha})\\s*[,)]`),
                      reason: 'direct colour step',
                  }
                : null,
            bridges
                ? {
                      re: new RegExp(`var\\(\\s*--color-(?:${bridges})\\s*[,)]`),
                      reason: 'Tailwind bridge token in CSS (resolves at :root; use rgb(var(--color-<scheme triplet>)) or a role)',
                  }
                : null,
        ].filter(Boolean),
    };
}

function rawColourUtilityReason(token, patterns) {
    const { utility } = splitVariants(token);
    if (patterns.opacity.test(utility)) return `opacity modifier ${utility}`;
    if (patterns.blackWhite.test(utility)) return `black/white utility ${utility}`;
    if (patterns.shadow.test(utility) && !patterns.allowedShadows.has(utility)) return `shadow utility ${utility}`;
    return null;
}

function rawColourValueReason(property, value, patterns) {
    const checked = value.replace(/url\([^)]*\)/gi, 'url()').replace(/"[^"]*"|'[^']*'/g, '""');
    const found = patterns.values.find(({ re }) => re.test(checked));
    if (found) return found.reason;
    const prop = property.toLowerCase();
    if (SHADOW_PROPERTIES.has(prop) && /currentcolor/i.test(checked)) return 'currentColor shadow';
    if (prop.startsWith('--') && NAMED_COLOURS.has(checked.trim().toLowerCase())) return `named colour ${checked.trim()}`;
    if (COLOUR_PROPERTY_RE.test(prop)) {
        for (const match of checked.matchAll(WORD_RE)) {
            const word = match[1].toLowerCase();
            if (NAMED_COLOURS.has(word)) return `named colour ${word}`;
        }
    }
    return null;
}

function maskComments(cssText) {
    return cssText.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n\r]/g, ' '));
}

function collectMarkupRawColourFailures(text, file, failures, allowsByLine, data) {
    if ((data.exemptFiles ?? []).includes(file)) return;
    const patterns = patternsFrom(data);
    for (const { value, line } of classCandidateTokens(text)) {
        const reason = rawColourUtilityReason(value, patterns);
        if (!reason) continue;
        pushFailure(failures, allowsByLine, file, line, CHECK_ID, `Raw colour: ${reason}. ${HINT}`);
    }
    const masked = maskNonMarkup(text);
    for (const match of masked.matchAll(STYLE_ATTRIBUTE_RE)) {
        const css = match[1] ?? match[2] ?? '';
        const offset = match.index + match[0].indexOf(css);
        collectCssRawColourFailures(css, file, failures, allowsByLine, data, { baseOffset: offset, lineText: text });
    }
}

function collectCssRawColourFailures(cssText, file, failures, allowsByLine, data, options = {}) {
    if ((data.exemptFiles ?? []).includes(file)) return;
    const { baseOffset = 0, lineText = cssText } = options;
    const patterns = patternsFrom(data);
    const stripped = maskComments(cssText);

    for (const match of stripped.matchAll(/(^|[;{\s])(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;{}]+)/gi)) {
        const property = match[2];
        const value = match[3];
        if (property.startsWith('@')) continue;
        const reason = rawColourValueReason(property, value, patterns);
        if (!reason) continue;
        const offset = match.index + match[0].indexOf(value);
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + offset),
            CHECK_ID,
            `Raw colour: ${reason} in ${property}. ${HINT}`,
        );
    }

    for (const match of stripped.matchAll(/@apply\s+([^;]+);/g)) {
        const reasons = match[1].split(/\s+/).map((token) => rawColourUtilityReason(token, patterns)).filter(Boolean);
        if (!reasons.length) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            CHECK_ID,
            `Raw colour: ${reasons.join(', ')} in @apply. ${HINT}`,
        );
    }
}

function roleDeclarations(text, onlySchemeDependent) {
    const roles = new Map();
    for (const match of text.matchAll(ROLE_DECLARATION_RE)) {
        const value = match[2].replace(/\s+/g, ' ').trim();
        if (value.includes('{{')) continue;
        const isRole = ROLE_STEP_RE.test(value);
        if (onlySchemeDependent && !(SCHEME_DEPENDENT_RE.test(value) && isRole)) continue;
        const offset = match.index + match[0].indexOf(match[1]);
        roles.set(match[1], {
            value,
            line: lineAt(text, offset),
            offset,
            count: (roles.get(match[1])?.count ?? 0) + 1,
        });
    }
    return roles;
}

function collectColourRoleSyncFailures(root, failures) {
    const fs = require('node:fs');
    const path = require('node:path');
    const sourcePath = path.join(root, ROLE_SOURCE);
    const runtimePath = path.join(root, ROLE_RUNTIME);
    if (!fs.existsSync(sourcePath) || !fs.existsSync(runtimePath)) return;
    const source = roleDeclarations(fs.readFileSync(sourcePath, 'utf8'), true);
    const runtimeText = fs.readFileSync(runtimePath, 'utf8');
    const loop = runtimeText.match(/{%-?\s*for scheme in settings\.color_schemes\s*-?%}[\s\S]*?{%-?\s*endfor\s*-?%}/);
    const runtime = roleDeclarations(loop ? loop[0] : '', false);
    const loopOffsetLine = loop ? lineAt(runtimeText, loop.index) - 1 : 0;
    const loopText = loop ? loop[0] : '';
    const conditionDepthAt = (offset) => {
        let depth = 0;
        for (const tag of loopText.slice(0, offset).matchAll(/{%-?\s*(if|unless|case|endif|endunless|endcase)\b/g)) {
            depth += tag[1].startsWith('end') ? -1 : 1;
        }
        return depth;
    };
    for (const [name, { line, offset, count }] of runtime) {
        if (conditionDepthAt(offset) > 0) {
            failures.push({
                file: ROLE_RUNTIME,
                line: loopOffsetLine + line,
                checkId: SYNC_CHECK_ID,
                message: `${name} is declared inside a Liquid condition; every scheme must get it unconditionally.`,
            });
        }
        if (count > 1) {
            failures.push({
                file: ROLE_RUNTIME,
                line: loopOffsetLine + line,
                checkId: SYNC_CHECK_ID,
                message: `${name} is declared ${count} times in the scheme loop; declare it once.`,
            });
        }
    }
    for (const [name, { value, line }] of source) {
        const copy = runtime.get(name);
        if (!copy) {
            failures.push({
                file: ROLE_SOURCE,
                line,
                checkId: SYNC_CHECK_ID,
                message: `${name} depends on the scheme but is not re-declared in the ${ROLE_RUNTIME} scheme loop.`,
            });
        } else if (copy.value !== value) {
            failures.push({
                file: ROLE_RUNTIME,
                line: loopOffsetLine + copy.line,
                checkId: SYNC_CHECK_ID,
                message: `${name} differs from ${ROLE_SOURCE}: "${copy.value}" vs "${value}".`,
            });
        }
    }
    for (const [name, { line }] of runtime) {
        if (source.has(name)) continue;
        failures.push({
            file: ROLE_RUNTIME,
            line: loopOffsetLine + line,
            checkId: SYNC_CHECK_ID,
            message: `${name} is re-declared per scheme but is not a scheme-dependent role in ${ROLE_SOURCE}.`,
        });
    }
}

module.exports = {
    CHECK_ID,
    SYNC_CHECK_ID,
    collectColourRoleSyncFailures,
    collectCssRawColourFailures,
    collectMarkupRawColourFailures,
};
