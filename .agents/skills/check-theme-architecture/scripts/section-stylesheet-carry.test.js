const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { carryInnerSectionStylesheet } = require('./lib/section-stylesheet-carry');
const { compareCarrySources } = require('./lib/carry-body-sync');

const ROOT = path.resolve(__dirname, '../../../..');
const HTTPS_PATH = path.join(ROOT, 'assets/https.js');
const LIB_PATH = path.join(__dirname, 'lib/section-stylesheet-carry.js');

function readCarrySources() {
    return {
        httpsSource: fs.readFileSync(HTTPS_PATH, 'utf8'),
        libSource: fs.readFileSync(LIB_PATH, 'utf8'),
    };
}

function createStyleNode(text) {
    const node = {
        tagName: 'STYLE',
        textContent: text,
        attributes: { 'data-section-stylesheet': '' },
        cloneNode() {
            const clone = createStyleNode(text);
            clone.attributes = { ...node.attributes };
            return clone;
        },
    };

    return node;
}

function attachChild(parent, child) {
    child.parentNode = parent;
    child.replaceWith = (next) => {
        const index = parent.childNodes.indexOf(child);
        parent.childNodes[index] = next;
        attachChild(parent, next);
        if (parent.firstChild === child) {
            parent.firstChild = next;
        }
    };
}

function createElement({ children = [], querySelectorImpl } = {}) {
    const el = {
        tagName: 'DIV',
        childNodes: [...children],
        firstChild: children[0] ?? null,
        querySelector(sel) {
            if (typeof querySelectorImpl === 'function') {
                return querySelectorImpl(sel, this);
            }

            if (sel === 'style[data-section-stylesheet]') {
                return findStyle(this);
            }

            return null;
        },
        querySelectorAll(sel) {
            if (sel !== 'style[data-section-stylesheet]') return [];
            const matches = [];
            collectStyles(this, matches);
            return matches;
        },
        insertBefore(child) {
            this.childNodes.unshift(child);
            this.firstChild = child;
            attachChild(this, child);
        },
    };

    for (const child of children) {
        attachChild(el, child);
    }

    return el;
}

function findStyle(node) {
    if (node.tagName === 'STYLE' && node.attributes?.['data-section-stylesheet'] !== undefined) {
        return node;
    }

    for (const child of node.childNodes ?? []) {
        const match = findStyle(child);
        if (match) return match;
    }

    return null;
}

function collectStyles(node, matches) {
    if (node.tagName === 'STYLE' && node.attributes?.['data-section-stylesheet'] !== undefined) {
        matches.push(node);
    }

    for (const child of node.childNodes ?? []) {
        collectStyles(child, matches);
    }
}

test('carryInnerSectionStylesheet inserts when target has no section stylesheet', () => {
    const style = createStyleNode('.ok { color: red; }');

    const doc = {
        querySelector(sel) {
            if (sel === 'style[data-section-stylesheet]') return style;
            return null;
        },
    };

    const targetEl = createElement();
    const result = carryInnerSectionStylesheet(doc, targetEl);

    assert.equal(result.action, 'inserted');
    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 1);
    assert.equal(targetEl.firstChild.textContent, '.ok { color: red; }');
});

test('carryInnerSectionStylesheet replaces on repeated refresh without accumulation', () => {
    const firstStyle = createStyleNode('.v1 { color: red; }');

    const secondStyle = createStyleNode('.v2 { color: blue; }');

    const targetEl = createElement({
        children: [firstStyle],
    });

    const doc = {
        querySelector(sel) {
            if (sel === 'style[data-section-stylesheet]') return secondStyle;
            return null;
        },
    };

    const result = carryInnerSectionStylesheet(doc, targetEl);

    assert.equal(result.action, 'replaced');
    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 1);
    assert.equal(targetEl.querySelector('style[data-section-stylesheet]').textContent, '.v2 { color: blue; }');

    const thirdStyle = createStyleNode('.v3 { color: green; }');
    doc.querySelector = (sel) => (sel === 'style[data-section-stylesheet]' ? thirdStyle : null);

    carryInnerSectionStylesheet(doc, targetEl);

    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 1);
    assert.equal(targetEl.querySelector('style[data-section-stylesheet]').textContent, '.v3 { color: green; }');
});

test('production and validator carryInnerSectionStylesheet bodies stay in sync', () => {
    const { httpsSource, libSource } = readCarrySources();
    const { equal, httpsBody, libBody } = compareCarrySources(httpsSource, libSource);

    assert.equal(
        equal,
        true,
        `assets/https.js and lib/section-stylesheet-carry.js diverged; sync carryInnerSectionStylesheet before committing.\n` +
            `https: ${httpsBody}\n` +
            `lib:   ${libBody}`,
    );
});

test('sync guard detects deleted return after replaceWith', () => {
    const { httpsSource, libSource } = readCarrySources();
    const mutatedHttps = httpsSource.replace(
        /existingStyle\.replaceWith\(nextStyle\);\s*\r?\n\s*return;/,
        'existingStyle.replaceWith(nextStyle);',
    );
    const candidateHttps = mutatedHttps === httpsSource ? httpsSource : mutatedHttps;

    const { equal } = compareCarrySources(candidateHttps, libSource);
    assert.equal(
        equal,
        false,
        'deleted return after replaceWith should report divergence',
    );
});

test('sync guard detects deleted early exit when sectionStyle is missing', () => {
    const { httpsSource, libSource } = readCarrySources();
    const mutatedHttps = httpsSource.replace(
        /\r?\n\s*if \(!sectionStyle\) return;/,
        '',
    );

    assert.notEqual(mutatedHttps, httpsSource, 'mutation did not change https source');

    const { equal } = compareCarrySources(mutatedHttps, libSource);
    assert.equal(equal, false, 'deleted early exit should report divergence');
});

test('sync guard detects insertBefore changed to appendChild', () => {
    const { httpsSource, libSource } = readCarrySources();
    const mutatedHttps = httpsSource.replace(
        /targetEl\.insertBefore\(nextStyle, targetEl\.firstChild\);/,
        'targetEl.appendChild(nextStyle);',
    );

    assert.notEqual(mutatedHttps, httpsSource, 'mutation did not change https source');

    const { equal } = compareCarrySources(mutatedHttps, libSource);
    assert.equal(equal, false, 'insertBefore -> appendChild should report divergence');
});

test('carryInnerSectionStylesheet is a no-op when response has no section stylesheet', () => {
    const targetEl = createElement();
    const result = carryInnerSectionStylesheet({ querySelector: () => null }, targetEl);

    assert.equal(result.action, 'none');
    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 0);
});
