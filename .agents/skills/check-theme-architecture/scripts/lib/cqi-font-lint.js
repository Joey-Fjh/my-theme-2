const { compact, splitNodes, descendants, componentText } = require('./css-syntax');

function createFontAnalysis(sheets, sourceDimensions) {
    const globals = new Map();
    const scopes = new Map();
    const globalRules = new Set();
    function scopeKey(rule) {
        const path = [];
        for (let item = rule; item; item = item.parent) {
            const selector = componentText(item.prelude).trim();
            if (selector) path.unshift(selector);
        }
        return path.join(' / ');
    }
    function conditionsFor(rule) {
        const conditions = [];
        for (let item = rule; item; item = item.parent) {
            const parts = compact(item.prelude);
            if (parts[0]?.type === 'at-keyword-token' && ['media', 'supports'].includes(parts[0].value)) conditions.unshift(componentText(item.prelude).trim());
        }
        return conditions;
    }
    for (const sheet of sheets) {
        for (const rule of sheet.rules) {
            const key = scopeKey(rule);
            scopes.set(key, [...(scopes.get(key) ?? []), ...rule.declarations]);
            const prelude = compact(rule.prelude);
            const isRoot = splitNodes(rule.prelude).some((selector) => [':root', 'html:root'].includes(componentText(selector).trim()));
            const isTheme = prelude[0]?.type === 'at-keyword-token' && prelude[0].value === 'theme';
            let globalContext = true;
            for (let parent = rule.parent; parent; parent = parent.parent) {
                const parts = compact(parent.prelude);
                if (parts.length && !(parts[0].type === 'at-keyword-token' && ['layer', 'media', 'supports'].includes(parts[0].value))) globalContext = false;
            }
            if ((!isRoot && !isTheme) || !globalContext) continue;
            globalRules.add(rule);
            for (const declaration of rule.declarations) {
                if (!declaration.property.startsWith('--')) continue;
                const list = globals.get(declaration.property) ?? [];
                list.push(declaration);
                globals.set(declaration.property, list);
            }
        }
    }

    function localDefinitions(name, owner) {
        for (let scope = owner; scope; scope = scope.parent) {
            // A root alias is resolved against all possible root definitions,
            // not just declarations in the block that happened to define it.
            if (globalRules.has(scope)) continue;
            const declarations = (scopes.get(scopeKey(scope)) ?? []).filter((item) => item.property === name);
            if (declarations.length) return declarations;
        }
        return null;
    }

    function potentialDefinitions(name, owner) {
        return localDefinitions(name, owner) ?? globals.get(name) ?? [];
    }

    function floorDefinitions(name, owner, conditions) {
        const local = localDefinitions(name, owner);
        if (local) return { declarations: local, available: true, source: false };
        const declarations = globals.get(name) ?? [];
        const source = sourceDimensions.has(name);
        // Availability proves a floor exists here. Every possible override must
        // still retain a positive rem value; an available default cannot hide a
        // conditional px/zero/negative replacement. Conditions are not solved.
        const available = source || declarations.some((item) => conditionsFor(item.owner).every((condition) => conditions.includes(condition)));
        return { declarations, available, source };
    }

    function variable(node) {
        const groups = splitNodes(node.children);
        return { name: compact(groups[0])[0]?.value, fallback: groups.slice(1).flat() };
    }

    const unknown = () => ({ unit: 'unknown', signs: new Set([-1, 0, 1]) });
    const exact = (unit, value) => ({ unit, value, signs: new Set([Math.sign(value)]) });
    const positive = (unit) => ({ unit, signs: new Set([1]) });
    function mergeProofs(proofs) {
        if (!proofs.length || proofs.some((proof) => proof.unit !== proofs[0].unit)) return unknown();
        const result = { unit: proofs[0].unit, signs: new Set(proofs.flatMap((proof) => [...proof.signs])) };
        if (proofs.every((proof) => proof.value !== undefined && proof.value === proofs[0].value)) result.value = proofs[0].value;
        return result;
    }
    function arithmetic(left, operator, right) {
        let unit = 'unknown';
        if (operator === '*') unit = left.unit === 'number' ? right.unit : right.unit === 'number' ? left.unit : 'unknown';
        else if (operator === '/') unit = right.unit === 'number' ? left.unit : 'unknown';
        else if (left.unit === right.unit) unit = left.unit;
        if (unit === 'unknown' || (operator === '/' && right.signs.has(0))) return unknown();
        if (left.value !== undefined && right.value !== undefined) {
            const value = operator === '*' ? left.value * right.value : operator === '/' ? left.value / right.value : operator === '+' ? left.value + right.value : left.value - right.value;
            return Number.isFinite(value) ? exact(unit, value) : unknown();
        }
        const signs = new Set();
        for (const a of left.signs) for (let b of right.signs) {
            if (operator === '*' || operator === '/') signs.add(a * b);
            else {
                if (operator === '-') b *= -1;
                if (a === 0 || b === 0 || a === b) signs.add(Math.sign(a + b));
                else for (const sign of [-1, 0, 1]) signs.add(sign);
            }
        }
        return { unit, signs };
    }

    // Bounded unit/sign algebra, not general CSS math. Known nonpositive floors
    // and arithmetic that cannot retain a positive rem lower bound fail closed.
    function proof(nodes, owner, seen = new Set(), conditions = conditionsFor(owner)) {
        const parts = compact(nodes).filter((node) => node.value !== 'important' && node.raw !== '!');
        if (!parts.length) return unknown();
        const values = [];
        const operators = [];
        for (const node of parts) {
            if (['+', '-', '*', '/'].includes(node.raw)) {
                operators.push(node.raw);
                continue;
            }
            let value = unknown();
            if (node.type === 'number-token') value = exact('number', node.value);
            else if (node.type === 'dimension-token') value = node.unit.toLowerCase() === 'rem' ? exact('rem', node.value) : unknown();
            else if (node.type === '(-token') value = proof(node.children, owner, seen, conditions);
            else if (node.type === 'function-token') {
                if (node.value.toLowerCase() === 'var') {
                    const { name, fallback } = variable(node);
                    if (!seen.has(name)) {
                        const next = new Set([...seen, name]);
                        const definitions = floorDefinitions(name, owner, conditions);
                        // Defined replacements and the missing-definition path
                        // are separate branches. A fallback covers only the
                        // latter; it never makes an unproven replacement safe.
                        const proofs = definitions.declarations.map((item) => proof(item.value, item.owner, next, [...new Set([...conditions, ...conditionsFor(item.owner)])]));
                        if (!definitions.available && !fallback.length) proofs.push(unknown());
                        if (definitions.source) proofs.push(...[...sourceDimensions.get(name)].map((kind) => {
                            const [unit, numeric] = kind.split('@');
                            if (!['rem', 'number'].includes(unit)) return unknown();
                            return numeric === undefined ? positive(unit) : exact(unit, Number(numeric));
                        }));
                        // The cycle stack tracks declaration expansion, not
                        // finite nested fallback syntax such as var(--x,var(--x,1rem)).
                        if (fallback.length) proofs.push(proof(fallback, owner, seen, conditions));
                        value = mergeProofs(proofs);
                    }
                } else if (node.value.toLowerCase() === 'calc') value = proof(node.children, owner, seen, conditions);
                else if (['min', 'max', 'clamp'].includes(node.value.toLowerCase())) {
                    const proofs = splitNodes(node.children).map((group) => proof(group, owner, seen, conditions));
                    value = mergeProofs(proofs);
                    if (proofs.every((item) => item.unit === 'rem' && item.value !== undefined)) {
                        const numbers = proofs.map((item) => item.value);
                        const number = node.value.toLowerCase() === 'min' ? Math.min(...numbers) : node.value.toLowerCase() === 'max' ? Math.max(...numbers) : numbers.length === 3 ? Math.max(numbers[0], Math.min(numbers[1], numbers[2])) : NaN;
                        value = Number.isFinite(number) ? exact('rem', number) : unknown();
                    }
                }
            }
            values.push(value);
        }
        if (values.length !== operators.length + 1) return unknown();
        for (let i = 0; i < operators.length; i++) {
            if (!['*', '/'].includes(operators[i])) continue;
            values.splice(i, 2, arithmetic(values[i], operators[i], values[i + 1]));
            operators.splice(i--, 1);
        }
        while (operators.length) {
            values.splice(0, 2, arithmetic(values[0], operators.shift(), values[1]));
        }
        return values[0];
    }

    function dimension(nodes, owner, conditions = conditionsFor(owner)) {
        const result = proof(nodes, owner, new Set(), conditions);
        return result.unit === 'rem' && result.signs.size === 1 && result.signs.has(1) ? 'rem' : 'unknown';
    }

    function trace(nodes, owner, protectedByClamp = false, seen = new Set(), conditions = conditionsFor(owner)) {
        const result = { cqi: false, unsafe: false };
        function add(child) {
            result.cqi ||= child.cqi;
            result.unsafe ||= child.unsafe;
        }
        for (const node of nodes) {
            if (node.type === 'dimension-token' && node.unit.toLowerCase() === 'cqi') {
                result.cqi = true;
                result.unsafe ||= !protectedByClamp;
            } else if (node.type === 'function-token' && node.value.toLowerCase() === 'var') {
                const { name, fallback } = variable(node);
                if (!seen.has(name)) {
                    const next = new Set([...seen, name]);
                    for (const declaration of potentialDefinitions(name, owner)) {
                        const branchConditions = [...new Set([...conditions, ...conditionsFor(declaration.owner)])];
                        add(trace(declaration.value, declaration.owner, protectedByClamp, next, branchConditions));
                    }
                }
                if (fallback.length) add(trace(fallback, owner, protectedByClamp, new Set([...seen, name]), conditions));
            } else if (node.type === 'function-token' && node.value.toLowerCase() === 'clamp') {
                const groups = splitNodes(node.children);
                const safeFloor = groups.length === 3 && dimension(groups[0], owner, conditions) === 'rem';
                for (const group of groups) add(trace(group, owner, protectedByClamp || safeFloor, seen, conditions));
            } else if (node.children) add(trace(node.children, owner, protectedByClamp, seen, conditions));
        }
        return result;
    }

    return {
        trace,
        dimension,
        recipes: sheets.flatMap((sheet) => sheet.declarations).filter((item) => item.property.startsWith('--') && descendants(item.value).some((node) => node.type === 'dimension-token' && node.unit.toLowerCase() === 'cqi')),
    };
}

module.exports = { createFontAnalysis };
