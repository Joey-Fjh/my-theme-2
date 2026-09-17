import ThemeEvents from 'events';
import * as adapter from 'alpine-adapter';
import { createCartContract } from 'cart-contract';
import { toastStore } from './alpine.store.toast.js';
import { dialogStore } from './alpine.store.dialog.js';
import { createCartUiStore } from './alpine.store.cart.js';

/**
 * Coalesce repeated calls into one animation frame.
 * Lives in the core because layout measurement is the core's own concern.
 */
export function rafThrottle(fn) {
    let ticking = false;
    let lastArgs = null;
    let rafId = null;

    const wrapper = function (...args) {
        lastArgs = args;
        if (!ticking) {
            ticking = true;
            rafId = requestAnimationFrame(() => {
                fn.apply(this, lastArgs);
                ticking = false;
            });
        }
    };

    wrapper.dispose = () => {
        if (rafId) cancelAnimationFrame(rafId);
        ticking = false;
        lastArgs = null;
    };

    return wrapper;
}

class Base {
    static resizeObserver = null;
    static rafUpdateLayout = null;
    static bindOnShopifySectionLayout = null;
    static initialized = false;

    static announcementBar = null;
    static header = null;

    static setCSSVar(name, value) {
        document.documentElement.style.setProperty(name, value);
    }

    static init() {
        if (this.initialized) return;

        this.initialized = true;
        this.rafUpdateLayout = rafThrottle(this.updateLayout.bind(this));
        this.bindOnShopifySectionLayout = this.onShopifySectionLayout.bind(this);

        if (typeof ResizeObserver !== 'undefined') {
            this.bindResizeTargets();
        }

        window.addEventListener('scroll', this.rafUpdateLayout, { passive: true });

        this.updateLayout();

        ['shopify:section:load', 'shopify:section:reorder', 'shopify:section:unload'].forEach(
            (evt) => document.addEventListener(evt, this.bindOnShopifySectionLayout),
        );
    }

    static bindResizeTargets() {
        if (typeof ResizeObserver === 'undefined') return;

        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(this.rafUpdateLayout);
        }

        this.resizeObserver.disconnect();
        this.refreshElements();

        if (this.announcementBar) this.resizeObserver.observe(this.announcementBar);
        if (this.header) this.resizeObserver.observe(this.header);
    }

    static onShopifySectionLayout() {
        this.bindResizeTargets();
        this.rafUpdateLayout();
    }

    static refreshElements() {
        this.announcementBar = document.querySelector('.announcement-bar');
        this.header = document.querySelector('.site-header > header');
    }

    static updateLayout() {
        this.refreshElements();
        this.updateAnnouncementBarHeight();
        this.updateHeaderHeight();
    }

    static updateAnnouncementBarHeight() {
        if (!this.announcementBar) return this.setCSSVar('--announcement-bar-height', `0px`);

        const rect = this.announcementBar.getBoundingClientRect();
        const announcementHeight = Math.max(
            0,
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
        );

        this.setCSSVar('--announcement-bar-height', `${announcementHeight}px`);
    }

    static updateHeaderHeight() {
        const headerHeight = this.header ? this.header.offsetHeight : 0;

        this.setCSSVar('--header-height', `${headerHeight}px`);
    }

    static destroy() {
        if (!this.initialized) return;

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        if (this.rafUpdateLayout) {
            this.rafUpdateLayout.dispose();

            window.removeEventListener('scroll', this.rafUpdateLayout);
            this.rafUpdateLayout = null;
        }

        ['shopify:section:load', 'shopify:section:reorder', 'shopify:section:unload'].forEach(
            (evt) => document.removeEventListener(evt, this.bindOnShopifySectionLayout),
        );

        this.initialized = false;
        this.bindOnShopifySectionLayout = null;
    }
}

/**
 * Components
 * ----------------------------------------
 * A lightweight Vue-like component runtime for Shopify themes.
 *
 * Responsibilities:
 * - Register component types
 * - Create/destroy instances bound to DOM nodes
 * - Handle Theme Editor lifecycle events
 * - Support lazy initialization via IntersectionObserver
 * - Auto-cleanup when DOM nodes are removed
 *
 * Each component instance is bound to:
 *   data-component-type
 *   data-component-id
 *
 * Optional:
 *   data-component-kind="section|block"
 */
class Components {
    /** Registered component */
    static registry = new Map();
    /** Active component instances */
    static instances = new Map();
    /** Ensure lifecycle hooks are only installed once */
    static lifecycleSetup = false;

    /** DOM mutation observer for auto cleanup */
    static observer = null;
    /** IntersectionObserver for lazy init */
    static io = null;
    /** Global lazy loading switch */
    static lazyLoad = true;

    static ATTR = {
        type: 'data-component-type',
        id: 'data-component-id',
        kind: 'data-component-kind',
    };

    static get SELECTOR() {
        return `[${this.ATTR.type}][${this.ATTR.id}]`;
    }

    static sectionSelector() {
        return `[${this.ATTR.kind}="section"]${this.SELECTOR}`;
    }

    static blockSelector() {
        return `[${this.ATTR.kind}="block"]${this.SELECTOR}`;
    }

    /**
     * Register a component type.
     * Called once per component.
     */
    static register(type, handlers = {}, options = {}) {
        if (typeof type !== 'string' || !type.trim()) return;

        const key = type.trim();

        if (this.registry.has(key)) return;

        this.registry.set(key, {
            init: typeof handlers.init === 'function' ? handlers.init : null,
            destroy: typeof handlers.destroy === 'function' ? handlers.destroy : null,
            select: typeof handlers.select === 'function' ? handlers.select : null,
            deselect: typeof handlers.deselect === 'function' ? handlers.deselect : null,
            lazy: options.lazy !== undefined ? !!options.lazy : true,
        });
    }

    static _getMetaFromEl(el) {
        if (!el) return null;

        const type = el.getAttribute(this.ATTR.type);
        const id = el.getAttribute(this.ATTR.id);

        if (!type || !id) return null;

        const trimmedType = type.trim();

        return {
            type: trimmedType,
            id,
            instanceKey: `${trimmedType}:${id}`,
        };
    }

    /** Initialize one component instance */
    static initElement(el) {
        if (!el) return;

        const meta = this._getMetaFromEl(el);

        if (!meta) return;

        const handlers = this.registry.get(meta.type);

        if (!handlers || !handlers.init) return;
        if (this.instances.has(meta.instanceKey)) {
            const existing = this.instances.get(meta.instanceKey);
            if (existing.el === el) return;
            this.destroyElement(existing.el);
        }

        if (el.__componentInited) {
            delete el.__componentInited;
        }

        const result = handlers.init(el);
        const state = result === undefined ? {} : result;

        el.__componentInited = true;
        this.instances.set(meta.instanceKey, {
            el,
            type: meta.type,
            id: meta.id,
            state,
            destroy: handlers.destroy,
            select: handlers.select,
            deselect: handlers.deselect,
        });
    }

    /** Destroy a single component instance */
    static destroyElement(el) {
        if (!el) return;

        const meta = this._getMetaFromEl(el);

        if (!meta) return;

        const record = this.instances.get(meta.instanceKey);

        if (!record) return;
        if (record.el !== el) return;

        try {
            if (typeof record.destroy === 'function') {
                record.destroy(record.el, record.state);
            }
        } catch (e) {
            console.error('Component destroy error:', e);
        }

        /**
         * Important:
         * Stop observing element if it was waiting for lazy init.
         * Prevents memory leaks during Theme Editor reload cycles.
         */
        if (this.io && el.__componentObserved) {
            try {
                this.io.unobserve(el);
            } catch (_) {
                /* ignore */
            }
            delete el.__componentObserved;
        }

        delete el.__componentInited;
        this.instances.delete(meta.instanceKey);
    }

    static initAll(container = document) {
        container.querySelectorAll(this.SELECTOR).forEach((el) => {
            const meta = this._getMetaFromEl(el);

            if (!meta) return;

            const record = this.registry.get(meta.type);

            const shouldLazy = this.io && this.lazyLoad && record && record.lazy !== false;

            if (shouldLazy) {
                if (!el.__componentObserved) {
                    this.io.observe(el);
                    el.__componentObserved = true;
                }
            } else {
                this.initElement(el);
            }
        });
    }

    static destroyAll(container = document) {
        container.querySelectorAll(this.SELECTOR).forEach((el) => this.destroyElement(el));
    }

    static _handleSelect(event, selector) {
        const root = event.target.closest?.(selector);

        if (!root) return;

        this.initElement(root);
        const meta = this._getMetaFromEl(root);

        if (!meta) return;

        const inst = this.instances.get(meta.instanceKey);

        if (inst && typeof inst.select === 'function') {
            inst.select(inst.el, inst.state);
        }
    }

    static _handleDeselect(event, selector) {
        const root = event.target.closest?.(selector);

        if (!root) return;

        this.initElement(root);
        const meta = this._getMetaFromEl(root);

        if (!meta) return;

        const inst = this.instances.get(meta.instanceKey);
        if (inst && typeof inst.deselect === 'function') {
            inst.deselect(inst.el, inst.state);
        }
    }

    static handleSectionSelect(e) {
        this._handleSelect(e, this.sectionSelector());
    }

    static handleSectionDeselect(e) {
        this._handleDeselect(e, this.sectionSelector());
    }

    static handleBlockSelect(e) {
        this._handleSelect(e, this.blockSelector());
    }

    static handleBlockDeselect(e) {
        this._handleDeselect(e, this.blockSelector());
    }

    /**
     * Observe DOM removal to auto destroy components
     * Works for section reload and dynamic DOM updates.
     */
    static setupMutationObserver() {
        if (this.observer || !document.body) return;

        this.observer = new MutationObserver((mutations) => {
            const toDestroy = new Set();
            const eventNames = ThemeEvents.events;
            const unmountEvent = new CustomEvent(eventNames.COMPONENT_UNMOUNTED, {
                bubbles: false,
            });

            mutations.forEach((m) => {
                m.removedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;

                    if (node.matches?.(this.SELECTOR)) {
                        toDestroy.add(node);
                    }
                    node.querySelectorAll?.(this.SELECTOR).forEach((el) => toDestroy.add(el));

                    node.querySelectorAll?.('[x-data]').forEach((el) => {
                        el.dispatchEvent(unmountEvent);
                    });
                    if (node.hasAttribute?.('x-data')) {
                        node.dispatchEvent(unmountEvent);
                    }

                    releaseModuleRoots(node);
                });
            });

            toDestroy.forEach((el) => this.destroyElement(el));
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * Lazy-load components when visible.
     * Similar to Vue async component mounting.
     */
    static setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        this.io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;

                    this.initElement(el);
                    this.io.unobserve(el);
                    delete el.__componentObserved;
                });
            },
            { rootMargin: '200px' },
        );
    }

    /**
     * Install Shopify lifecycle listeners.
     * Runs only once.
     */
    static setupLifecycle() {
        if (this.lifecycleSetup) return;

        this.lifecycleSetup = true;
        this.setupIntersectionObserver();

        document.addEventListener('DOMContentLoaded', () => {
            this.setupMutationObserver();
            this.initAll(document);
        });

        document.addEventListener('shopify:section:load', (e) => {
            this.initAll(e.target || document);
        });

        document.addEventListener('shopify:section:reorder', (e) => {
            this.initAll(e.target || document);
        });

        document.addEventListener('shopify:section:unload', (e) => {
            this.destroyAll(e.target || document);
        });

        document.addEventListener('shopify:section:select', this.handleSectionSelect.bind(this));
        document.addEventListener(
            'shopify:section:deselect',
            this.handleSectionDeselect.bind(this),
        );
        document.addEventListener('shopify:block:select', this.handleBlockSelect.bind(this));
        document.addEventListener('shopify:block:deselect', this.handleBlockDeselect.bind(this));
    }
}

/**
 * Module loader
 * ----------------------------------------
 * Markup declares which behaviour a root needs through `data-module-id`; the import map
 * turns that identifier into an asset URL. The core holds no component manifest: it reads
 * the DOM, imports each identifier once, and hands the root to the adapter.
 */
const MODULE_ATTR = 'data-module-id';
const MODULE_SELECTOR = `[${MODULE_ATTR}]`;
const LAZY_MODULE_IDS = new Set([
    'motion-reveal-section',
    'progressive-list',
    'section-pagination',
]);

const moduleRequests = new Map();
const loadedModules = new Set();
let lazyObserver = null;

function getLazyObserver() {
    if (lazyObserver || !('IntersectionObserver' in window)) return lazyObserver;

    lazyObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                lazyObserver.unobserve(entry.target);
                delete entry.target.__themeModuleObserved;
                activateModuleRoot(entry.target);
            });
        },
        { rootMargin: '200px' },
    );

    return lazyObserver;
}

function importModule(moduleId) {
    if (!moduleRequests.has(moduleId)) {
        moduleRequests.set(
            moduleId,
            import(moduleId).then((mod) => {
                loadedModules.add(moduleId);
                return mod;
            }),
        );
    }

    return moduleRequests.get(moduleId);
}

function activateModuleRoot(el) {
    const moduleId = el.getAttribute(MODULE_ATTR);
    if (!moduleId) return;

    if (loadedModules.has(moduleId)) {
        adapter.mount(el);
        return;
    }

    importModule(moduleId)
        .then(() => adapter.mount(el))
        .catch((error) => {
            console.error(`[Theme] Failed to load module "${moduleId}"`, error);
            adapter.mount(el);
        });
}

function claimModuleRoot(el) {
    if (!el || el.__themeModuleClaimed) return;

    const moduleId = el.getAttribute(MODULE_ATTR);
    if (!moduleId) return;

    el.__themeModuleClaimed = true;
    adapter.defer(el);

    const observer = !loadedModules.has(moduleId) && LAZY_MODULE_IDS.has(moduleId)
        ? getLazyObserver()
        : null;

    if (observer) {
        observer.observe(el);
        el.__themeModuleObserved = true;
        return;
    }

    activateModuleRoot(el);
}

/**
 * Claim every module root inside `container` (and `container` itself). Idempotent.
 * @param {Document|Element} [container]
 */
function scanModules(container) {
    const root = container || document;

    if (root.nodeType === 1 && root.matches?.(MODULE_SELECTOR)) claimModuleRoot(root);
    root.querySelectorAll?.(MODULE_SELECTOR).forEach(claimModuleRoot);
}

/** Stop observing module roots that left the document. */
function releaseModuleRoots(node) {
    if (!lazyObserver || !(node instanceof HTMLElement)) return;

    const stop = (el) => {
        if (!el.__themeModuleObserved) return;
        lazyObserver.unobserve(el);
        delete el.__themeModuleObserved;
    };

    if (node.matches?.(MODULE_SELECTOR)) stop(node);
    node.querySelectorAll?.(MODULE_SELECTOR).forEach(stop);
}

function setupStores() {
    adapter.store('toast', toastStore);
    adapter.store('dialog', dialogStore);

    const contract = createCartContract();
    const cartStore = createCartUiStore(contract);

    contract.hydrate();
    adapter.store('cart', cartStore);
}

function main() {
    if (window.location.search.includes('debug=true') || window.Shopify?.designMode) {
        import('./performance.js')
            .then(({ ThemePerformance }) => ThemePerformance.init())
            .catch(() => {});
    }

    Components.setupLifecycle();
    Base.init();

    setupStores();
    scanModules(document);

    document.addEventListener('shopify:section:load', (e) => scanModules(e.target || document));
    document.addEventListener('shopify:section:reorder', (e) => scanModules(e.target || document));
}

main();

export { Base, Components, scanModules };
