/**
 * Batch-scoped stagger for ordinary section reveal.
 * Indices are assigned per intersection batch, not per root DOM order.
 */
export const MAX_BATCH_STAGGER_INDEX = 4;

const DOCUMENT_POSITION_FOLLOWING = 4;
const DOCUMENT_POSITION_PRECEDING = 2;

export function clampedBatchStaggerIndex(batchPosition) {
    return Math.min(batchPosition, MAX_BATCH_STAGGER_INDEX);
}

export function sortTargetsByDomOrder(targets) {
    return [...targets].sort((left, right) => {
        if (left === right) return 0;

        const position = left.compareDocumentPosition(right);

        if (position & DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
    });
}

export function assignBatchStaggerIndices(targets) {
    sortTargetsByDomOrder(targets).forEach((target, batchPosition) => {
        target.style.setProperty(
            '--motion-index',
            String(clampedBatchStaggerIndex(batchPosition)),
        );
    });
}
