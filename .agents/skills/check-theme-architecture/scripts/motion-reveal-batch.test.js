const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');

const BATCH_MODULE_URL = pathToFileURL(
    path.join(__dirname, '../../../../assets/motion-reveal-batch.js'),
).href;

const DOCUMENT_POSITION_FOLLOWING = 4;
const DOCUMENT_POSITION_PRECEDING = 2;

function createTarget() {
    const style = new Map();

    return {
        style: {
            setProperty(name, value) {
                style.set(name, value);
            },
            removeProperty(name) {
                style.delete(name);
            },
        },
        getMotionIndex() {
            return style.get('--motion-index');
        },
        compareDocumentPosition() {
            return 0;
        },
    };
}

function createOrderedTargets(count) {
    const targets = Array.from({ length: count }, () => createTarget());

    targets.forEach((target, index) => {
        target.compareDocumentPosition = (other) => {
            const otherIndex = targets.indexOf(other);

            if (otherIndex > index) return DOCUMENT_POSITION_FOLLOWING;
            if (otherIndex < index) return DOCUMENT_POSITION_PRECEDING;
            return 0;
        };
    });

    return targets;
}

test('maximum stagger index is capped for 3, 12 and 24 targets in one batch', async () => {
    const { MAX_BATCH_STAGGER_INDEX, assignBatchStaggerIndices } = await import(BATCH_MODULE_URL);

    const maxIndices = [3, 12, 24].map((count) => {
        const targets = createOrderedTargets(count);
        assignBatchStaggerIndices(targets);
        return Math.max(...targets.map((target) => Number(target.getMotionIndex())));
    });

    assert.ok(maxIndices.every((maxIndex) => maxIndex <= MAX_BATCH_STAGGER_INDEX));
    assert.equal(maxIndices[1], MAX_BATCH_STAGGER_INDEX);
    assert.equal(maxIndices[2], MAX_BATCH_STAGGER_INDEX);
    assert.equal(maxIndices[1], maxIndices[2]);
});

test('page size does not change lone-target stagger index', async () => {
    const { assignBatchStaggerIndices } = await import(BATCH_MODULE_URL);

    for (const count of [3, 12, 24]) {
        const targets = createOrderedTargets(count);

        for (const target of targets) {
            assignBatchStaggerIndices([target]);
            assert.equal(target.getMotionIndex(), '0');
        }
    }
});

test('a lone late target in a batch receives index 0, not its document-order position', async () => {
    const { assignBatchStaggerIndices } = await import(BATCH_MODULE_URL);
    const targets = createOrderedTargets(12);
    const lateTarget = targets[11];

    assignBatchStaggerIndices([lateTarget]);

    assert.equal(lateTarget.getMotionIndex(), '0');
});

test('batch positions clamp at MAX_BATCH_STAGGER_INDEX', async () => {
    const { MAX_BATCH_STAGGER_INDEX, clampedBatchStaggerIndex } = await import(BATCH_MODULE_URL);

    assert.equal(clampedBatchStaggerIndex(0), 0);
    assert.equal(clampedBatchStaggerIndex(MAX_BATCH_STAGGER_INDEX), MAX_BATCH_STAGGER_INDEX);
    assert.equal(clampedBatchStaggerIndex(MAX_BATCH_STAGGER_INDEX + 6), MAX_BATCH_STAGGER_INDEX);
});
