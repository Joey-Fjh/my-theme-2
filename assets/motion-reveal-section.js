import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import Utils from 'utils';
import { assignBatchStaggerIndices } from 'motion-reveal-batch';

const REVEAL_TARGET_SELECTOR = '[data-motion-reveal]';
const OBSERVER_ROOT_MARGIN = '0px 0px -15% 0px';
const STATE_PENDING = 'pending';
const STATE_REVEALED = 'revealed';

function shouldSkipAnimation() {
    if (document.body?.dataset?.motionEnabled === 'false') return true;
    if (Utils.prefersReducedMotion()) return true;
    if (!('IntersectionObserver' in window)) return true;
    return false;
}

function ownsTarget(root, target) {
    return target instanceof Element && target.closest('[data-motion-section]') === root;
}

function queryOwnedTargets(root) {
    return Array.from(root.querySelectorAll(REVEAL_TARGET_SELECTOR)).filter((target) =>
        ownsTarget(root, target),
    );
}

function clearTargetState(target) {
    target.removeAttribute('data-motion-state');
    target.removeAttribute('data-motion-critical-runtime');
    target.style.removeProperty('--motion-index');
}

function revealTarget(target, observer) {
    target.setAttribute('data-motion-state', STATE_REVEALED);
    target.removeAttribute('data-motion-critical-runtime');
    if (observer) observer.unobserve(target);
}

function primeTarget(target, skipAnimation) {
    if (skipAnimation) {
        revealTarget(target, null);
        return;
    }

    if (target.hasAttribute('data-motion-critical')) {
        target.setAttribute('data-motion-critical-runtime', '');
        target.setAttribute('data-motion-state', STATE_PENDING);
        return;
    }

    target.setAttribute('data-motion-state', STATE_PENDING);
}

function revealIntersectingBatch(entries, observer) {
    const pendingTargets = entries
        .filter(
            (entry) =>
                entry.isIntersecting &&
                entry.target.getAttribute('data-motion-state') === STATE_PENDING,
        )
        .map((entry) => entry.target);

    if (pendingTargets.length === 0) return;

    assignBatchStaggerIndices(pendingTargets);
    pendingTargets.forEach((target) => revealTarget(target, observer));
}

function createMotionRevealController(root) {
    let observer = null;
    let destroyed = false;

    function disconnectObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
    }

    function mount() {
        if (destroyed) return;

        disconnectObserver();
        const targets = queryOwnedTargets(root);
        const skipAnimation = shouldSkipAnimation();

        targets.forEach((target) => clearTargetState(target));
        targets.forEach((target) => primeTarget(target, skipAnimation));

        if (skipAnimation || targets.length === 0) return;

        observer = new IntersectionObserver(
            (entries) => revealIntersectingBatch(entries, observer),
            { rootMargin: OBSERVER_ROOT_MARGIN, threshold: 0 },
        );

        targets.forEach((target) => {
            if (target.getAttribute('data-motion-state') === STATE_PENDING) {
                observer.observe(target);
            }
        });
    }

    function unmount() {
        destroyed = true;
        disconnectObserver();
        queryOwnedTargets(root).forEach(clearTargetState);
    }

    return { mount, unmount };
}

define('motionRevealSection', () => ({
    ...useDisposable(),
    _controller: null,

    init() {
        this._controller = createMotionRevealController(this.$el);
        this._controller.mount();
    },

    destroy() {
        this._controller?.unmount();
        this._controller = null;
        this.dispose();
    },
}));
