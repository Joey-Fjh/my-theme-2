const CF_RETURN = '__CF_RETURN__';

const HTTPS_SIGNATURE = /static carryInnerSectionStylesheet\s*\([^)]*\)\s*\{/;
const LIB_SIGNATURE = /function carryInnerSectionStylesheet\s*\([^)]*\)\s*\{/;

function extractFunctionBody(source, signaturePattern) {
    const match = source.match(signaturePattern);
    if (!match) {
        throw new Error(`Could not find function matching ${signaturePattern}`);
    }

    const openBraceIndex = match.index + match[0].lastIndexOf('{');
    let depth = 0;

    for (let index = openBraceIndex; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') depth += 1;
        if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(openBraceIndex + 1, index);
            }
        }
    }

    throw new Error('Unbalanced braces while extracting function body');
}

/**
 * Normalise carryInnerSectionStylesheet bodies for sync comparison.
 * Control-flow returns map to CF_RETURN; only the lib's trailing
 * `return { action: 'inserted' }` is stripped (shape-only; production falls off).
 */
function normalizeCarryBody(body) {
    let normalized = body.replace(/\/\*[\s\S]*?\*\//g, '').trim();

    normalized = normalized.replace(
        /if\s*\(\s*!sectionStyle\s*\)\s*\{[\s\S]*?return\s*\{\s*action:\s*'none'\s*\}\s*;?\s*\}/g,
        `if (!sectionStyle) { ${CF_RETURN} }`,
    );
    normalized = normalized.replace(
        /if\s*\(\s*!sectionStyle\s*\)\s*return\s*;?/g,
        `if (!sectionStyle) { ${CF_RETURN} }`,
    );

    normalized = normalized.replace(/return\s*\{\s*action:\s*'replaced'\s*\}\s*;?/g, CF_RETURN);
    normalized = normalized.replace(/return\s*;/g, CF_RETURN);
    normalized = normalized.replace(/\s*return\s*\{\s*action:\s*'inserted'\s*\}\s*;?\s*$/, '');

    return normalized.replace(/\s+/g, ' ').trim();
}

function compareCarrySources(httpsSource, libSource) {
    const httpsBody = normalizeCarryBody(extractFunctionBody(httpsSource, HTTPS_SIGNATURE));
    const libBody = normalizeCarryBody(extractFunctionBody(libSource, LIB_SIGNATURE));

    return {
        equal: httpsBody === libBody,
        httpsBody,
        libBody,
    };
}

module.exports = {
    CF_RETURN,
    extractFunctionBody,
    normalizeCarryBody,
    compareCarrySources,
};
