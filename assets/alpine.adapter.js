/**
 * Alpine adapter.
 *
 * The only place in the theme that is allowed to talk to Alpine's API. The core
 * runtime (`base.js`) and the component entry modules depend on this surface, never
 * on `window.Alpine`.
 */

import ThemeEvents from 'events';

let alpineRef = null;
let resolveReady = null;
const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
});

const pendingTasks = [];
const definedNames = new Set();

function resolveAlpine() {
    if (typeof window === 'undefined') return null;
    return window.Alpine || null;
}

function flushPendingTasks() {
    alpineRef = resolveAlpine();
    if (!alpineRef) return;

    while (pendingTasks.length > 0) {
        const task = pendingTasks.shift();
        try {
            task(alpineRef);
        } catch (error) {
            console.error('[ThemeAdapter] queued task failed', error);
        }
    }

    resolveReady(alpineRef);
}

if (typeof document !== 'undefined') {
    if (resolveAlpine()) {
        flushPendingTasks();
    } else {
        document.addEventListener('alpine:init', flushPendingTasks, { once: true });
    }
}

/**
 * Run `task` against the adapter library, queueing it until the library is available.
 * Tasks queued before startup are flushed synchronously, before the library walks the DOM.
 */
function withAlpine(task) {
    const alpine = alpineRef || resolveAlpine();

    if (alpine) {
        alpineRef = alpine;
        return task(alpine);
    }

    pendingTasks.push(task);
    return undefined;
}

/**
 * Resolves once the adapter library is available.
 * @returns {Promise<object>}
 */
export function ready() {
    return readyPromise;
}

/**
 * Wrap a component factory so a `destroy`/`dispose` handler also runs when the theme
 * runtime reports the root element was removed from the DOM.
 */
function withUnmountTeardown(factory) {
    return function componentFactory(...args) {
        const definition = factory.apply(this, args);
        const unmountEvent = ThemeEvents.events.COMPONENT_UNMOUNTED;

        const hasDestroy = typeof definition?.destroy === 'function';
        const hasDispose = typeof definition?.dispose === 'function';

        if (!definition || (!hasDestroy && !hasDispose)) return definition;

        const originalInit = definition.init;

        definition.init = function init() {
            if (this.$el && unmountEvent) {
                const teardown = () => {
                    if (typeof this.destroy === 'function') {
                        this.destroy();
                    } else if (typeof this.dispose === 'function') {
                        this.dispose();
                    }
                };

                if (typeof this.on === 'function') {
                    this.on(this.$el, unmountEvent, teardown);
                } else if (typeof this.$el.addEventListener === 'function') {
                    this.$el.addEventListener(unmountEvent, teardown);
                }
            }

            if (originalInit) originalInit.apply(this, arguments);
        };

        return definition;
    };
}

/**
 * Register a component factory under the name its markup declares.
 * @param {string} name
 * @param {Function} factory
 */
export function define(name, factory) {
    const key = typeof name === 'string' ? name.trim() : '';

    if (!key) throw new Error('Adapter define requires a non-empty name');
    if (typeof factory !== 'function') throw new Error('Adapter define requires a factory function');
    if (definedNames.has(key)) return;

    definedNames.add(key);
    withAlpine((alpine) => alpine.data(key, withUnmountTeardown(factory)));
}

/**
 * Hold an element back from automatic initialization until its module has been defined.
 * Must run before the adapter library walks the DOM.
 * @param {Element} el
 */
export function defer(el) {
    if (!el || el.nodeType !== 1) return;
    if (el._x_marker !== undefined) return;

    el.setAttribute('x-ignore', '');
    el._x_ignore = true;
}

/**
 * Initialize `el` and its subtree. Safe to call on already-initialized trees.
 * @param {Element} el
 */
export function mount(el) {
    if (!el) return;

    withAlpine((alpine) => {
        if (!el.isConnected) return;

        if (el.removeAttribute) el.removeAttribute('x-ignore');
        delete el._x_ignore;

        if (typeof alpine.initTree === 'function') alpine.initTree(el);
    });
}

/**
 * Tear down `el` and its subtree.
 * @param {Element} el
 */
export function unmount(el) {
    if (!el) return;

    withAlpine((alpine) => {
        if (typeof alpine.destroyTree === 'function') alpine.destroyTree(el);
    });
}

/**
 * Register a global UI store. Queued registrations run before the first DOM walk.
 * @param {string} name
 * @param {object} value
 */
export function store(name, value) {
    const key = typeof name === 'string' ? name.trim() : '';
    if (!key || !value) return;

    withAlpine((alpine) => {
        if (typeof alpine.store === 'function') alpine.store(key, value);
    });
}

/**
 * Collect listener and observer registrations so a component can release them in one call.
 */
export function useDisposable() {
    const disposers = [];

    return {
        on(target, event, handler, options) {
            if (!target || typeof target.addEventListener !== 'function') return;

            target.addEventListener(event, handler, options);
            disposers.push(() => target.removeEventListener(event, handler, options));
        },

        observe(observer, el) {
            if (!el || !observer?.observe) return;

            observer.observe(el);
            disposers.push(() => observer.unobserve(el));
        },

        dispose() {
            disposers.forEach((disposer) => disposer());
            disposers.length = 0;
        },
    };
}
