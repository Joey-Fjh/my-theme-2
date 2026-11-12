/**
 * Rejects color / color_background settings outside the scheme group.
 * The allowlist lives in theme-checks.config.json and is empty unless a global
 * colour setting is explicitly accepted.
 */

const fs = require('node:fs');
const path = require('node:path');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');
const { matchSchemaBlock } = require('./schema-block');

const CHECK_ID = 'colour-setting';
const SETTINGS_SCHEMA = 'config/settings_schema.json';
const COLOUR_SETTING_TYPES = new Set(['color', 'color_background']);

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

function walkSettings(settings, file, lineOffset, failures, allowlist, inSchemeGroupDefinition) {
    if (!Array.isArray(settings)) return;
    for (const entry of settings) {
        if (!entry || typeof entry !== 'object') continue;
        if (entry.type === 'color_scheme_group' && Array.isArray(entry.definition)) {
            walkSettings(entry.definition, file, lineOffset, failures, allowlist, true);
            continue;
        }
        if (COLOUR_SETTING_TYPES.has(entry.type) && typeof entry.id === 'string') {
            const allowed = inSchemeGroupDefinition || (file === SETTINGS_SCHEMA && Object.hasOwn(allowlist, entry.id));
            if (!allowed) {
                failures.push({
                    file,
                    line: lineOffset,
                    checkId: CHECK_ID,
                    message: `Colour setting "${entry.id}" is not allowlisted. Use a scheme role or add an allowlist reason in theme-checks.config.json.`,
                });
            }
        }
        if (Array.isArray(entry.settings)) {
            walkSettings(entry.settings, file, lineOffset, failures, allowlist, inSchemeGroupDefinition);
        }
        if (Array.isArray(entry.blocks)) {
            for (const block of entry.blocks) {
                walkSettings(block.settings, file, lineOffset, failures, allowlist, inSchemeGroupDefinition);
            }
        }
    }
}

function collectColourSettingFailures(root, failures, data) {
    const allowlist = data.allowlist ?? {};
    const schemaPath = path.join(root, SETTINGS_SCHEMA);
    if (fs.existsSync(schemaPath)) {
        const text = fs.readFileSync(schemaPath, 'utf8');
        const schema = parseSchemaJson(text);
        if (Array.isArray(schema)) {
            for (const group of schema) {
                walkSettings(group.settings, SETTINGS_SCHEMA, 1, failures, allowlist, false);
            }
        }
    }

    const files = fg.sync(['sections/**/*.liquid', 'blocks/**/*.liquid'], { cwd: root, onlyFiles: true });
    for (const rel of files) {
        const file = formatPath(rel);
        const text = fs.readFileSync(path.join(root, rel), 'utf8');
        const match = matchSchemaBlock(text);
        if (!match) continue;
        const schema = parseSchemaJson(match[1]);
        if (!schema) continue;
        const schemaLine = lineAt(text, match.index ?? 0);
        walkSettings(schema.settings, file, schemaLine, failures, allowlist, false);
        if (Array.isArray(schema.blocks)) {
            for (const block of schema.blocks) {
                walkSettings(block.settings, file, schemaLine, failures, allowlist, false);
            }
        }
    }
}

module.exports = {
    CHECK_ID,
    collectColourSettingFailures,
};
