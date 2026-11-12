const espree = require('espree');
const { walk } = require('./liquid-ast');
const { parseCss } = require('./css-syntax');

const UNKNOWN = '\uFFF0';
const unique = (values) => [...new Set(values)].slice(0, 128);
const join = (left, right) => unique(left.flatMap((a) => right.map((b) => a + b)));
const literalText = (nodes) => typeof nodes === 'string' ? nodes : (nodes ?? []).map((node) => node.value ?? '').join('');

// B4 projections are separate from B3's class alternatives and inline margin inputs.
// Each emitted character retains a source offset, including decoded attributes.
function mappedText(code, start, fixed = false) {
    return { code, positions: Array.from({ length: code.length }, (_, index) => fixed ? start : start + index) };
}

function decodeAttribute(value) {
    const names = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', Tab: '\t', NewLine: '\n', colon: ':', semi: ';', lpar: '(', rpar: ')', sol: '/', bsol: '\\', period: '.', num: '#', percnt: '%' };
    const pattern = /&(?:#(x[\da-f]+|\d+);?|([A-Za-z]+);)/gi;
    let code = '';
    const positions = [];
    let cursor = 0;
    for (const match of value.code.matchAll(pattern)) {
        code += value.code.slice(cursor, match.index);
        positions.push(...value.positions.slice(cursor, match.index));
        const point = match[1] ? Number.parseInt(match[1].replace(/^x/i, ''), /^x/i.test(match[1]) ? 16 : 10) : null;
        const decoded = point !== null ? (point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '\uFFFD') : names[match[2]] ?? match[0];
        code += decoded;
        positions.push(...Array.from({ length: decoded.length }, () => value.positions[match.index]));
        cursor = match.index + match[0].length;
    }
    code += value.code.slice(cursor);
    positions.push(...value.positions.slice(cursor));
    return { code, positions };
}

function styleValues(nodes, env, text, start, end) {
    let values = [mappedText('', start)];
    let cursor = start;
    function append(additions) {
        values = values.flatMap((left) => additions.map((right) => ({ code: left.code + right.code, positions: [...left.positions, ...right.positions] }))).slice(0, 128);
    }
    for (const node of nodes ?? []) {
        append([mappedText(text.slice(cursor, node.position.start), cursor)]);
        if (node.type === 'TextNode') append([mappedText(node.value, node.position.start)]);
        else if (node.type === 'LiquidVariableOutput') append(liquidValues(node.markup, env).map((value) => mappedText(value, node.position.start, true)));
        else if (node.type === 'LiquidTag' && ['if', 'unless', 'case'].includes(node.name)) {
            const scopes = [];
            const alternatives = node.children.flatMap((branch) => {
                const branchScope = new Map(env);
                scopes.push(branchScope);
                return styleValues(branch.children, branchScope, text, branch.blockStartPosition.end, branch.blockEndPosition.start);
            });
            if (!node.children.some((branch) => branch.name === 'else')) { alternatives.push(mappedText('', node.position.start)); scopes.push(new Map(env)); }
            for (const name of new Set(scopes.flatMap((scope) => [...scope.keys()]))) env.set(name, unique(scopes.flatMap((scope) => scope.get(name) ?? [UNKNOWN])));
            append(alternatives);
        } else if (node.type === 'LiquidTag' && node.name === 'assign' && typeof node.markup === 'object') env.set(node.markup.name, liquidValues(node.markup.value, env));
        else if (node.type === 'LiquidTag' && node.name === 'liquid' && Array.isArray(node.markup)) {
            for (const statement of node.markup) {
                if (statement.name === 'assign' && typeof statement.markup === 'object') env.set(statement.markup.name, liquidValues(statement.markup.value, env));
                else if (!['#', 'comment', 'doc'].includes(statement.name)) append([mappedText(UNKNOWN, statement.position.start, true)]);
            }
        } else if (node.type === 'LiquidRawTag' && node.name === 'raw') {
            // Nested raw body positions in the parser may be relative to the
            // containing raw block; the tag's absolute start plus opener length
            // gives the original literal CSS location without parsing its body.
            const bodyStart = node.position.start + node.blockStartPosition.end - node.blockStartPosition.start;
            append([mappedText(node.body.value, bodyStart)]);
        }
        else if (node.type === 'LiquidTag' && ['for', 'tablerow'].includes(node.name)) {
            const loop = new Map(env);
            loop.set(node.markup.variableName, liquidValues(node.markup.collection, env));
            append(styleValues(node.children, loop, text, node.blockStartPosition.end, node.blockEndPosition.start));
        } else if (node.type === 'LiquidBranch') {
            append(styleValues(node.children, env, text, node.blockStartPosition.end, node.blockEndPosition.start));
        } else if (!['comment', 'doc', '#'].includes(node.name)) append([mappedText(UNKNOWN, node.position.start, true)]);
        cursor = node.position.end;
    }
    append([mappedText(text.slice(cursor, end), cursor)]);
    return values;
}

function alpineStyles(source, start) {
    let expression;
    try { expression = espree.parse(`(${source})`, { ecmaVersion: 'latest' }).body[0].expression; } catch { return []; }
    function strings(node) {
        if (node.type === 'Literal' && typeof node.value === 'string') return [node.value];
        if (node.type === 'ConditionalExpression') {
            if (node.test.type === 'Literal') return strings(node.test.value ? node.consequent : node.alternate);
            return [...strings(node.consequent), ...strings(node.alternate)].slice(0, 128);
        }
        return [];
    }
    function visit(node) {
        if (node.type === 'ObjectExpression') return node.properties.flatMap((item) => {
            if (item.type !== 'Property' || item.computed || item.method) return [];
            const key = item.key.value ?? item.key.name;
            const property = String(key).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
            return strings(item.value).map((value) => mappedText(`${property}:${value}`, start, true));
        });
        if (node.type === 'ConditionalExpression') {
            if (node.test.type === 'Literal') return visit(node.test.value ? node.consequent : node.alternate);
            return [...visit(node.consequent), ...visit(node.alternate)].slice(0, 128);
        }
        return strings(node).map((value) => mappedText(value, start, true));
    }
    return visit(expression);
}

function liquidValues(node, env) {
    if (!node) return [UNKNOWN];
    if (node.type === 'String' || node.type === 'Number') return [String(node.value)];
    if (node.type === 'VariableLookup') return node.lookups.length ? [UNKNOWN] : env.get(node.name) ?? [UNKNOWN];
    if (node.type !== 'LiquidVariable') return [UNKNOWN];
    let values = liquidValues(node.expression, env);
    for (const filter of node.filters) {
        const args = filter.args.map((arg) => liquidValues(arg, env));
        if (filter.name === 'default') values = unique([...values, ...(args[0] ?? [])]);
        else if (filter.name === 'append') values = join(values, args[0] ?? [UNKNOWN]);
        else if (filter.name === 'prepend') values = join(args[0] ?? [UNKNOWN], values);
        else if (filter.name === 'split' && args[0]?.length === 1) values = unique(values.flatMap((value) => value.split(args[0][0])));
        else if (['strip', 'strip_newlines', 'escape', 'escape_once'].includes(filter.name)) values = values.map((value) => value.trim());
        else if (filter.name === 'replace' && args.every((arg) => arg.length === 1)) values = values.map((value) => value.replaceAll(args[0][0], args[1][0]));
        else values = [UNKNOWN];
    }
    return values;
}

function attributeValues(nodes, env) {
    let values = [''];
    for (const node of nodes ?? []) {
        let addition = node.type === 'TextNode' ? [node.value] : node.type === 'LiquidVariableOutput' ? liquidValues(node.markup, env) : [UNKNOWN];
        if (node.type === 'LiquidTag' && ['if', 'unless', 'case'].includes(node.name)) {
            addition = node.children.flatMap((branch) => attributeValues(branch.children, env));
            if (!node.children.some((branch) => branch.name === 'else')) addition.push('');
        }
        values = join(values, addition);
    }
    return values;
}

function alpineValues(source) {
    let expression;
    try {
        expression = espree.parse(`(${source})`, { ecmaVersion: 'latest' }).body[0].expression;
    } catch {
        return ['']; // The existing Alpine-expression checker reports unsupported syntax.
    }
    const atoms = new Set();
    function key(node) {
        if (node.type === 'Identifier') return node.name;
        if (node.type === 'MemberExpression' && !node.computed) return `${key(node.object)}.${node.property.name}`;
        return source.slice(node.start - 1, node.end - 1);
    }
    function conditions(node) {
        if (node.type === 'Literal') return;
        if (node.type === 'UnaryExpression' && node.operator === '!') return conditions(node.argument);
        if (node.type === 'LogicalExpression') { conditions(node.left); conditions(node.right); return; }
        atoms.add(key(node));
    }
    function discover(node) {
        if (node.type === 'ConditionalExpression') { conditions(node.test); discover(node.consequent); discover(node.alternate); }
        else if (node.type === 'LogicalExpression') { conditions(node.left); discover(node.right); }
        else if (node.type === 'ObjectExpression') {
            for (const item of node.properties) if (!item.computed && item.value) conditions(item.value);
        } else if (node.type === 'ArrayExpression') {
            for (const item of node.elements) if (item) discover(item);
        }
    }
    discover(expression);
    function truth(node, state) {
        if (node.type === 'Literal') return Boolean(node.value);
        if (node.type === 'UnaryExpression' && node.operator === '!') return !truth(node.argument, state);
        if (node.type === 'LogicalExpression') return node.operator === '&&' ? truth(node.left, state) && truth(node.right, state) : truth(node.left, state) || truth(node.right, state);
        return state.get(key(node)) ?? false;
    }
    function visit(node, state) {
        if (node.type === 'Literal') return typeof node.value === 'string' ? [node.value] : [''];
        if (node.type === 'ConditionalExpression') return visit(truth(node.test, state) ? node.consequent : node.alternate, state);
        if (node.type === 'LogicalExpression') return visit(truth(node.left, state) === (node.operator === '&&') ? node.right : node.left, state);
        if (node.type === 'ArrayExpression') return node.elements.filter(Boolean).reduce((values, item) => join(values, visit(item, state).map((value) => ` ${value}`)), ['']);
        if (node.type === 'ObjectExpression') return [node.properties.filter((item) => !item.computed && item.value && truth(item.value, state)).map((item) => item.key.value ?? item.key.name ?? '').join(' ')];
        return [''];
    }
    const names = [...atoms];
    // Existing Alpine lint keeps expressions simple; cap state enumeration rather
    // than pretending arbitrary runtime expressions have been executed.
    if (names.length > 10) return [''];
    const alternatives = Array.from({ length: 2 ** names.length }, (_, bits) => {
        const state = new Map(names.map((name, i) => [name, Boolean(bits & (1 << i))]));
        return visit(expression, state);
    });
    return unique(alternatives.flat());
}

function classTokens(value) {
    return value.split(/\s+/).filter((token) => token && !token.includes(UNKNOWN));
}

function literalRenderArguments(documents) {
    const bySnippet = new Map();
    for (const { ast } of documents) {
        walk(ast, (node) => {
            if (node.type !== 'LiquidTag' || node.name !== 'render' || node.markup?.snippet?.type !== 'String') return;
            const key = `snippets/${node.markup.snippet.value}.liquid`;
            const values = bySnippet.get(key) ?? new Map();
            for (const arg of node.markup.args) {
                if (arg.value.type !== 'String') continue;
                values.set(arg.name, unique([...(values.get(arg.name) ?? [UNKNOWN]), arg.value.value]));
            }
            bySnippet.set(key, values);
        });
    }
    return bySnippet;
}

async function collectMarkupSinks(documents, layoutPrimitives = [], viewport = false) {
    const sinks = [];
    const styleBlocks = [];
    const dimensions = new Map();
    const argumentsBySnippet = literalRenderArguments(documents);
    for (const document of documents) {
        const { ast, file, text } = document;
        const contentFile = /^(blocks|snippets)\//.test(file) && !layoutPrimitives.includes(file);
        const env = new Map(argumentsBySnippet.get(file));
        const captures = new Map();
        const rootDeclarationOffsets = new Set();
        if (file === 'snippets/css-variables.liquid') {
            for (const node of ast.children.filter((item) => item.type === 'LiquidRawTag' && item.name === 'style')) {
                const blank = (match) => match.replace(/[^\r\n]/g, ' ');
                const source = node.body.value
                    .replace(/{%-?\s*(comment|doc)\b[\s\S]*?{%-?\s*end\1\s*-?%}/g, blank)
                    .replace(/{%[\s\S]*?%}/g, blank)
                    .replace(/{{[\s\S]*?}}/g, (match) => 'x'.repeat(match.length));
                const css = await parseCss(source);
                for (const rule of css.rules) {
                    if (rule.prelude.map((part) => part.raw).join('').trim() !== ':root') continue;
                    for (const declaration of rule.declarations) rootDeclarationOffsets.add(node.body.position.start + declaration.start);
                }
            }
        }
        function merge(target, branches) {
            const names = new Set(branches.flatMap((branch) => [...branch.keys()]));
            for (const name of names) target.set(name, unique(branches.flatMap((branch) => branch.get(name) ?? [UNKNOWN])));
        }
        function recordDimensions(source, variables, offset = 0) {
            // Only literal names (or finite literal loop-key expansions) and one
            // numeric Liquid output with an explicit unit form a source proof.
            for (const match of source.matchAll(/(--[\w-]+(?:{{-?\s*\w+\s*-?}}[\w-]*)?)\s*:\s*({{-?\s*[^{}]+?\s*-?}})(rem|px)?\s*;/g)) {
                const position = offset + match.index;
                if (!rootDeclarationOffsets.has(position)) continue;
                let names = [match[1]];
                const key = match[1].match(/{{-?\s*(\w+)\s*-?}}/);
                if (key) {
                    const keys = variables.get(key[1]);
                    if (!keys || keys.some((value) => value.includes(UNKNOWN))) continue;
                    names = keys.map((value) => match[1].replace(key[0], value));
                }
                let dimension = match[3] ?? (/\|\s*(?:divided_by|times|plus|minus|round)\b/.test(match[2]) ? 'number' : 'unknown');
                const literal = match[2].match(/^{{-?\s*(-?\d+(?:\.\d+)?)\s*-?}}$/);
                if (literal && ['rem', 'number'].includes(dimension)) dimension += `@${Number(literal[1])}`;
                for (const name of names) dimensions.set(name, new Set([...(dimensions.get(name) ?? []), dimension]));
            }
        }
        function traverse(nodes, scope, ancestors = [], captured = false) {
            for (const node of nodes ?? []) {
                if (node.type === 'LiquidTag') {
                    if (node.name === 'assign' && typeof node.markup === 'object') scope.set(node.markup.name, liquidValues(node.markup.value, scope));
                    else if (node.name === 'liquid') traverse(node.markup, scope, ancestors, captured);
                    else if (node.name === 'capture') {
                        const before = sinks.length;
                        traverse(node.children, new Map(scope), [], true);
                        captures.set(node.markup.name, sinks.slice(before).filter((sink) => sink.ancestors.length === 0));
                        scope.set(node.markup.name, [UNKNOWN]);
                    } else if (['if', 'unless', 'case'].includes(node.name)) {
                        const branches = node.children.map((branch) => {
                            const branchScope = new Map(scope);
                            traverse(branch.children, branchScope, ancestors, captured);
                            return branchScope;
                        });
                        if (!node.children.some((branch) => branch.name === 'else')) branches.push(new Map(scope));
                        merge(scope, branches);
                    } else if (node.name === 'for' || node.name === 'tablerow') {
                        const loopScope = new Map(scope);
                        loopScope.set(node.markup.variableName, liquidValues(node.markup.collection, scope));
                        recordDimensions(text.slice(node.blockStartPosition.end, node.blockEndPosition.start), loopScope, node.blockStartPosition.end);
                        traverse(node.children, loopScope, ancestors, captured);
                        merge(scope, [scope, loopScope]);
                    } else if (node.name === 'form') {
                        const args = Array.isArray(node.markup) ? node.markup : [];
                        const value = (name) => liquidValues(args.find((arg) => arg.name === name)?.value, scope);
                        const sink = { ...document, start: node.position.start, tag: 'form', alternatives: value('class').map(classTokens), styles: value('style'), ancestors, root: contentFile && ancestors.length === 0 && !captured, generated: true };
                        if (viewport) {
                            sink.viewportClasses = value('class').map((code) => decodeAttribute(mappedText(code, args.find((arg) => arg.name === 'class')?.position.start ?? sink.start, true)));
                            sink.viewportStyles = value('style').map((code) => decodeAttribute(mappedText(code, args.find((arg) => arg.name === 'style')?.position.start ?? sink.start, true)));
                        }
                        sinks.push(sink);
                        traverse(node.children, scope, [...ancestors, sink], captured);
                    } else if (node.children && !['comment', 'doc'].includes(node.name)) traverse(node.children, scope, ancestors, captured);
                    continue;
                }
                if (node.type === 'LiquidRawTag' && ['style', 'stylesheet'].includes(node.name)) {
                    if (viewport) for (const value of styleValues(node.body.nodes, new Map(scope), text, node.body.position.start, node.body.position.end)) styleBlocks.push({ ...document, ...value, start: node.body.position.start });
                    if (node.name === 'style' && file === 'snippets/css-variables.liquid') traverse(node.body.nodes, scope, ancestors, captured);
                } else if (['HtmlElement', 'HtmlVoidElement', 'HtmlSelfClosingElement'].includes(node.type)) {
                    const attributes = [];
                    function attrs(items) {
                        if (!Array.isArray(items)) return;
                        for (const attr of items ?? []) {
                            if (attr.type.startsWith('Attr')) attributes.push(attr);
                            else attrs(attr.children ?? attr.markup);
                        }
                    }
                    attrs(node.attributes);
                    let values = [''];
                    const styles = [];
                    const viewportClasses = [];
                    const viewportStyles = [];
                    for (const attr of attributes) {
                        const name = literalText(attr.name);
                        if (name === 'class') values = join(values, attributeValues(attr.value, scope).map((value) => ` ${value}`));
                        if ([':class', 'x-bind:class'].includes(name)) values = join(values, alpineValues(literalText(attr.value)).map((value) => ` ${value}`));
                        if (name === 'style') styles.push(...attributeValues(attr.value, scope));
                        if (!viewport || !attr.attributePosition) continue;
                        const viewportName = name.toLowerCase();
                        if (viewportName === 'class') viewportClasses.push(...styleValues(attr.value, new Map(scope), text, attr.attributePosition.start, attr.attributePosition.end).map(decodeAttribute));
                        if ([':class', 'x-bind:class'].includes(viewportName)) viewportClasses.push(...alpineValues(decodeAttribute(mappedText(literalText(attr.value), attr.position.start)).code).map((code) => mappedText(code, attr.position.start, true)));
                        if (viewportName === 'style') viewportStyles.push(...styleValues(attr.value, new Map(scope), text, attr.attributePosition.start, attr.attributePosition.end).map(decodeAttribute));
                        if ([':style', 'x-bind:style'].includes(viewportName)) viewportStyles.push(...alpineStyles(decodeAttribute(mappedText(literalText(attr.value), attr.position.start)).code, attr.position.start));
                    }
                    const tag = literalText(node.name) || UNKNOWN;
                    const contentTag = !['meta', 'title', 'link', 'base', 'style', 'script'].includes(tag.toLowerCase());
                    const sink = { ...document, start: node.position.start, tag, alternatives: values.map(classTokens), styles, viewportClasses, viewportStyles, ancestors, root: contentFile && contentTag && ancestors.length === 0 && !captured, generated: false };
                    sinks.push(sink);
                    traverse(node.children, scope, [...ancestors, sink], captured);
                } else if (node.type === 'LiquidVariableOutput') {
                    const filter = node.markup?.filters?.find((item) => item.name === 'image_tag');
                    const argument = filter?.args.find((arg) => arg.name === 'class');
                    if (filter) {
                        const style = filter.args.find((arg) => arg.name === 'style');
                        sinks.push({ ...document, start: node.position.start, tag: 'img', alternatives: liquidValues(argument?.value, scope).map(classTokens), styles: [], ancestors, root: contentFile && ancestors.length === 0 && !captured, generated: true,
                            viewportClasses: viewport ? liquidValues(argument?.value, scope).map((code) => decodeAttribute(mappedText(code, argument?.position.start ?? node.position.start, true))) : [],
                            viewportStyles: viewport ? liquidValues(style?.value, scope).map((code) => decodeAttribute(mappedText(code, style?.position.start ?? node.position.start, true))) : [],
                        });
                    }
                    const capture = captures.get(node.markup?.expression?.name);
                    if (capture && !captured && ancestors.length === 0) {
                        for (const sink of capture) sink.root = contentFile && !['meta', 'title', 'link', 'base', 'style', 'script'].includes(sink.tag.toLowerCase());
                    }
                } else if (node.children) traverse(node.children, scope, ancestors, captured);
            }
        }
        traverse(ast.children, env);
        // Non-loop declarations: do not accidentally treat unresolved loop keys
        // as global facts. Finite loop instances were collected during traversal.
        const masked = text.replace(/{%-?\s*(comment|doc)\b[\s\S]*?{%-?\s*end\1\s*-?%}/g, (match) => match.replace(/[^\r\n]/g, ' '));
        recordDimensions(masked, new Map());
    }
    return { sinks, dimensions, styleBlocks };
}

module.exports = { collectMarkupSinks, liquidValues, classTokens };
