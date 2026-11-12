// Bounded structural CSS analysis. The tokenizer owns escapes, comments and dimensions;
// this module groups components and declarations, rather than executing the cascade.
let tokenizerPromise;

async function cssComponents(css) {
    tokenizerPromise ??= import('@csstools/css-tokenizer');
    const { tokenize } = await tokenizerPromise;
    const tokens = tokenize({ css });
    let index = 0;
    function read(close) {
        const nodes = [];
        while (index < tokens.length) {
            const token = tokens[index++];
            const [type, raw, start, end, data] = token;
            if (type === close || type === 'EOF-token') break;
            if (type === 'comment') continue;
            const node = { type, raw, start, end, value: data?.value, unit: data?.unit };
            const closing = { 'function-token': ')-token', '(-token': ')-token', '[-token': ']-token', '{-token': '}-token' }[type];
            if (closing) {
                node.children = read(closing);
                node.end = tokens[index - 1]?.[3] ?? end;
            }
            nodes.push(node);
        }
        return nodes;
    }
    return read();
}

function compact(nodes) {
    return nodes.filter((node) => node.type !== 'whitespace-token');
}

function splitNodes(nodes, type = 'comma-token') {
    const groups = [[]];
    for (const node of nodes) {
        if (node.type === type) groups.push([]);
        else groups.at(-1).push(node);
    }
    return groups;
}

function descendants(nodes) {
    return nodes.flatMap((node) => [node, ...descendants(node.children ?? [])]);
}

function componentText(nodes) {
    return nodes.map((node) => {
        if (!node.children) return node.raw;
        const close = { 'function-token': ')', '(-token': ')', '[-token': ']', '{-token': '}' }[node.type];
        return node.raw + componentText(node.children) + close;
    }).join('');
}

async function parseCss(css, metadata = {}) {
    const root = { prelude: [], declarations: [], children: [], parent: null, ...metadata };
    const rules = [root];
    function body(nodes, owner) {
        let pending = [];
        const finish = () => {
            const parts = compact(pending);
            if (parts[0]?.type === 'ident-token' && parts[1]?.type === 'colon-token') {
                const property = parts[0].value.startsWith('--') ? parts[0].value : parts[0].value.toLowerCase();
                owner.declarations.push({ property, value: parts.slice(2), start: parts[0].start, owner });
            } else if (parts[0]?.type === 'at-keyword-token' && parts[0].value === 'apply') {
                const candidates = splitNodes(pending.slice(pending.indexOf(parts[0]) + 1), 'whitespace-token')
                    .filter((nodes) => nodes.length)
                    .map((nodes) => ({ value: componentText(nodes), start: nodes[0].start }));
                owner.apply = (owner.apply ?? []).concat(candidates.map((item) => item.value));
                owner.applyCandidates = (owner.applyCandidates ?? []).concat(candidates);
            } else if (parts[0]?.type === 'at-keyword-token') {
                owner.statements = (owner.statements ?? []).concat([pending]);
            }
            pending = [];
        };
        for (const node of nodes) {
            if (node.type === 'semicolon-token') finish();
            else if (node.type === '{-token') {
                const rule = { prelude: pending, declarations: [], children: [], parent: owner, end: node.end, ...metadata };
                owner.children.push(rule);
                rules.push(rule);
                pending = [];
                body(node.children, rule);
            } else pending.push(node);
        }
        finish();
    }
    body(await cssComponents(css), root);
    return { root, rules, declarations: rules.flatMap((rule) => rule.declarations) };
}

function utilityName(rule) {
    const parts = compact(rule.prelude);
    return parts[0]?.type === 'at-keyword-token' && parts[0].value === 'utility' ? parts[1]?.value : null;
}

// Only the final compound is a subject. :not/:has, earlier compounds and
// sibling anchors are conditions, not ownership declarations.
function selectorSubjects(rule) {
    if (!rule) return [];
    if (compact(rule.prelude)[0]?.type === 'at-keyword-token') return selectorSubjects(rule.parent);
    function subjects(prelude) {
        return splitNodes(prelude).flatMap((selector) => {
        let tail = [];
        let hasAncestor = false;
        const trimmed = [...selector];
        while (trimmed.at(-1)?.type === 'whitespace-token') trimmed.pop();
        while (trimmed[0]?.type === 'whitespace-token') trimmed.shift();
        for (const node of trimmed) {
            if (node.type === 'whitespace-token' || (node.type === 'delim-token' && ['>', '+', '~'].includes(node.raw))) {
                if (tail.length || node.type === 'delim-token') hasAncestor = true;
                tail = [];
            } else tail.push(node);
        }
        let candidates = [{ classes: new Set(), tag: null, hasAncestor, nesting: false }];
        let pseudoElement = false;
        function combine(other) {
            candidates = candidates.flatMap((candidate) => other.map((subject) => ({
                classes: new Set([...candidate.classes, ...subject.classes]),
                tag: subject.tag ?? candidate.tag,
                hasAncestor: candidate.hasAncestor || subject.hasAncestor,
                nesting: candidate.nesting || subject.nesting,
            })));
        }
        for (let i = 0; i < tail.length; i++) {
            const node = tail[i];
            if (node.raw === '.' && tail[i + 1]?.type === 'ident-token') {
                const name = tail[++i].value;
                for (const candidate of candidates) candidate.classes.add(name);
            } else if (node.raw === '&') {
                const parents = selectorSubjects(rule.parent);
                combine((parents.length ? parents : [{ classes: new Set(), tag: null, hasAncestor: false }]).map((subject) => ({ ...subject, nesting: true })));
            }
            else if (node.type === 'function-token' && ['where', 'is'].includes(node.value)) combine(subjects(node.children));
            else if (node.type === 'colon-token' && tail[i + 1]?.type === 'colon-token') pseudoElement = true;
            else if (i === 0 && node.type === 'ident-token') {
                for (const candidate of candidates) candidate.tag = node.value;
            }
        }
        let qualifiedParent = rule.parent;
        while (qualifiedParent && compact(qualifiedParent.prelude)[0]?.type === 'at-keyword-token') qualifiedParent = qualifiedParent.parent;
        if (qualifiedParent?.prelude.length) {
            candidates = candidates.map((candidate) => ({ ...candidate, hasAncestor: candidate.hasAncestor || !candidate.nesting }));
        }
        return pseudoElement ? [] : candidates;
        });
    }
    return subjects(rule.prelude);
}

function allSubjectClasses(rule) {
    return new Set(selectorSubjects(rule).flatMap((subject) => [...subject.classes]));
}

function isZeroValue(nodes) {
    const parts = compact(nodes).filter((node) => node.raw !== '!' && node.value !== 'important');
    function zero(node) {
        if (['number-token', 'dimension-token', 'percentage-token'].includes(node.type)) return node.value === 0;
        if (node.type === 'function-token' && node.value === 'calc') {
            const expression = compact(node.children);
            return expression.length === 3 && expression[1].raw === '*' && (zero(expression[0]) || zero(expression[2]));
        }
        return false;
    }
    return parts.length > 0 && parts.every(zero);
}

module.exports = { cssComponents, compact, splitNodes, descendants, componentText, parseCss, utilityName, selectorSubjects, allSubjectClasses, isZeroValue };
