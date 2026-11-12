/**
 * Dead settings: section and block schema ids, and global settings_schema ids,
 * must appear in Liquid usage. A dynamic settings[variable] read counts when
 * the variable is a for-loop over a quoted, comma-separated list of ids
 * (sections/header.liquid organization social links).
 */

const fs = require('node:fs');
const path = require('node:path');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');
const { maskNonMarkup } = require('./class-tokens');
const { matchSchemaBlock } = require('./schema-block');

const SETTINGS_SCHEMA = 'config/settings_schema.json';
const CHECK_ID = 'dead-setting';
const CHECK_UNPROVABLE = 'dead-setting-unprovable';
const DYNAMIC_SETTINGS_RE = /\b(?:section\.)?settings\s*\[\s*(?!['"][\w-]+['"])/;

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function parseSchemaJson(schemaText) {
    try {
        const tree = parseTree(schemaText);
        if (tree.errors?.length) return null;
        return getNodeValue(tree);
    } catch {
        return null;
    }
}

function idsFromSettingsArray(settings) {
    const ids = [];
    if (!Array.isArray(settings)) return ids;
    for (const entry of settings) {
        if (entry && typeof entry.id === 'string' && entry.id) ids.push(entry.id);
    }
    return ids;
}

function extractSectionSchema(sectionText) {
    const match = matchSchemaBlock(sectionText);
    if (!match) return { sectionIds: [], blockIds: [], schemaLine: null };
    const schema = parseSchemaJson(match[1]);
    if (!schema) return { sectionIds: [], blockIds: [], schemaLine: lineAt(sectionText, match.index ?? 0) };
    const sectionIds = idsFromSettingsArray(schema.settings);
    const blockIds = [];
    if (Array.isArray(schema.blocks)) {
        for (const block of schema.blocks) {
            for (const id of idsFromSettingsArray(block.settings)) blockIds.push(id);
        }
    }
    return { sectionIds, blockIds, schemaLine: lineAt(sectionText, match.index ?? 0) };
}

function extractStaticRenderNames(text) {
    const names = [];
    const re = /{%-?\s*render\s+['"]([\w-]+)['"]/g;
    for (const match of text.matchAll(re)) names.push(match[1]);
    return names;
}

function reachableSnippetMarkup(root, sectionMarkup) {
    const seen = new Set();
    const queue = extractStaticRenderNames(sectionMarkup);
    const parts = [sectionMarkup];
    while (queue.length) {
        const name = queue.shift();
        if (seen.has(name)) continue;
        seen.add(name);
        const file = path.join(root, 'snippets', `${name}.liquid`);
        if (!fs.existsSync(file)) continue;
        const markup = maskNonMarkup(fs.readFileSync(file, 'utf8'));
        parts.push(markup);
        for (const child of extractStaticRenderNames(markup)) queue.push(child);
    }
    return parts.join('\n');
}

function escapeId(id) {
    return id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function settingAccessRe(receiver, id) {
    const escaped = escapeId(id);
    return new RegExp(`${receiver}\\.settings(?:\\.${escaped}\\b|\\s*\\[\\s*['"]${escaped}['"]\\s*\\])`);
}

function usesSectionSetting(markup, id) {
    return settingAccessRe('(?<![\\w.])section', id).test(markup);
}

function usesGlobalSetting(markup, id, dynamicIds) {
    if (dynamicIds.has(id)) return true;
    return new RegExp(`(?<![\\w.])settings(?:\\.${escapeId(id)}\\b|\\s*\\[\\s*['"]${escapeId(id)}['"]\\s*\\])`).test(
        markup,
    );
}

function usesBlockSetting(markup, id) {
    return settingAccessRe('(?<![\\w.])(?!(?:section|scheme)\\b)[a-z_][a-z0-9_]*', id).test(markup);
}

/**
 * settings[loopVar] counts as a use of every id in `assign list = 'a,b' | split`
 * when the loop is `for loopVar in list`. Any other dynamic read stays unprovable.
 */
function explainedDynamicIds(markup) {
    const ids = new Set();
    let unexplained = false;
    const dynamicRe = /\bsettings\s*\[\s*([A-Za-z_][\w]*)\s*\]/g;
    for (const match of markup.matchAll(dynamicRe)) {
        const varName = match[1];
        const forMatch = markup.match(new RegExp(`\\bfor\\s+${varName}\\s+in\\s+([A-Za-z_][\\w]*)`));
        const listMatch = forMatch
            ? markup.match(new RegExp(`\\bassign\\s+${forMatch[1]}\\s*=\\s*(['"])([^'"]+)\\1`))
            : null;
        if (!listMatch) {
            unexplained = true;
            continue;
        }
        for (const id of listMatch[2].split(',')) {
            const trimmed = id.trim();
            if (trimmed) ids.add(trimmed);
        }
    }
    return { ids, unexplained };
}

function readGlobalSettingIds(root) {
    const file = path.join(root, SETTINGS_SCHEMA);
    if (!fs.existsSync(file)) return [];
    const schema = parseSchemaJson(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(schema)) return [];
    const ids = [];
    for (const group of schema) ids.push(...idsFromSettingsArray(group.settings));
    return [...new Set(ids)];
}

function readAllLiquidMarkup(root, globs) {
    const files = fg.sync(globs, { cwd: root, onlyFiles: true }).map(formatPath);
    const byFile = new Map();
    let combined = '';
    for (const file of files) {
        const markup = maskNonMarkup(fs.readFileSync(path.join(root, file), 'utf8'));
        byFile.set(file, markup);
        combined += `\n${markup}`;
    }
    return { byFile, combined };
}

function collectDeadSettingFailures(root, failures, notes, data) {
    const globs = data.liquidGlobs ?? [];
    const { byFile, combined } = readAllLiquidMarkup(root, globs);
    const dynamic = explainedDynamicIds(combined);
    const sectionFiles = fg.sync('sections/**/*.liquid', { cwd: root, onlyFiles: true }).map(formatPath);

    for (const file of sectionFiles) {
        const fullText = fs.readFileSync(path.join(root, file), 'utf8');
        const schemaBlock = matchSchemaBlock(fullText);
        const sectionMarkup = maskNonMarkup(schemaBlock ? fullText.slice(0, schemaBlock.index) : fullText);
        const { sectionIds, blockIds, schemaLine } = extractSectionSchema(fullText);
        if (!sectionIds.length && !blockIds.length) continue;
        const closure = reachableSnippetMarkup(root, sectionMarkup);
        const localDynamic = explainedDynamicIds(closure);
        if (localDynamic.unexplained || (DYNAMIC_SETTINGS_RE.test(closure) && localDynamic.ids.size === 0)) {
            notes.push(
                `[${CHECK_UNPROVABLE}] ${file}: dynamic settings[…] access; dead-setting analysis may miss usages in this file.`,
            );
            continue;
        }
        for (const id of sectionIds) {
            if (!usesSectionSetting(closure, id)) {
                failures.push({
                    file,
                    line: schemaLine ?? 1,
                    checkId: CHECK_ID,
                    message: `[${CHECK_ID}] unused section setting "${id}".`,
                });
            }
        }
        for (const id of blockIds) {
            if (!usesBlockSetting(closure, id)) {
                failures.push({
                    file,
                    line: schemaLine ?? 1,
                    checkId: CHECK_ID,
                    message: `[${CHECK_ID}] unused block setting "${id}".`,
                });
            }
        }
    }

    for (const [file, markup] of byFile) {
        if (explainedDynamicIds(markup).unexplained) {
            notes.push(
                `[${CHECK_UNPROVABLE}] ${file}: dynamic settings[…] access; dead-setting analysis may miss usages in this file.`,
            );
        }
    }

    for (const id of readGlobalSettingIds(root)) {
        if (!usesGlobalSetting(combined, id, dynamic.ids)) {
            failures.push({
                file: SETTINGS_SCHEMA,
                line: 1,
                checkId: CHECK_ID,
                message: `[${CHECK_ID}] unused global setting "${id}".`,
            });
        }
    }
}

module.exports = {
    CHECK_ID,
    CHECK_UNPROVABLE,
    collectDeadSettingFailures,
};
