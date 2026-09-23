import { useDisposable } from 'utils';
import { store } from 'alpine-adapter';
import ThemeEvents from 'events';

const components = {
    dropdown() {
        const headerMenuActiveEvent = ThemeEvents?.events?.HEADER_MENU_ACTIVE_CHANGED;

        return {
            openEls: [],

            emitHeaderMenuActive(active) {
                if (!headerMenuActiveEvent || typeof ThemeEvents?.emit !== 'function') return;

                ThemeEvents.emit(headerMenuActiveEvent, { active: Boolean(active) });
            },

            onHeaderFocusIn() {
                this.emitHeaderMenuActive(true);
            },

            onHeaderFocusOut(event) {
                if (this.$el.contains(event?.relatedTarget)) return;

                this.emitHeaderMenuActive(false);
            },

            closeAndDeactivate(from = 0) {
                this.close(from);
                this.emitHeaderMenuActive(false);
            },

            onMenuTriggerClickEvent(event) {
                const target = event?.target;

                if (!(target instanceof Element)) return;

                const trigger = target.closest('summary.dropdown-trigger');
                if (!trigger || !this.$el.contains(trigger)) return;

                event.preventDefault();
                event.stopPropagation();

                this.toggle(trigger.parentElement);
            },

            onMenuKeydown(event) {
                if (event?.key !== 'Escape') return;

                const openDetails = this.openEls.filter(Boolean).pop();
                if (!openDetails) return;

                const trigger = openDetails.querySelector('summary.dropdown-trigger');

                event.preventDefault();
                this.closeAndDeactivate(0);

                if (trigger instanceof HTMLElement) {
                    trigger.focus();
                }
            },

            toggle(target) {
                const current = target.closest('[data-dropdown]');

                if (!current) return;

                const deep = Number(current.dataset.deep);

                if (this.openEls[deep] === current) {
                    this.close(deep);
                    return;
                }

                this.open(current, deep);
            },

            open(current, deep) {
                if (this.openEls[deep] !== current) {
                    this.closeFromDepth(deep);
                }

                current.setAttribute('open', '');

                this.openEls[deep] = current;
            },

            close(from = 0) {
                this.closeFromDepth(from);
            },

            closeFromDepth(from) {
                for (let i = from; i < this.openEls.length; i++) {
                    const el = this.openEls[i];

                    if (el) {
                        el.removeAttribute('open');
                    }
                }

                this.openEls.length = from;
            },
        };
    },

    localizationSwitcher() {
        return {
            ...useDisposable(),
            open: false,
            alignEnd: false,
            _viewportGap: 8,
            _fitRetries: 0,
            _maxFitRetries: 8,

            init() {
                this.on(window, 'resize', () => {
                    if (this.open) this.fitMenuToViewport();
                });
            },

            toggle() {
                if (this.open) {
                    this.close();
                    return;
                }

                // Predict before show so the first paint does not overflow and
                // create a one-frame horizontal scrollbar.
                this._fitRetries = 0;
                this.alignEnd = this.shouldPreferAlignEnd();
                this.open = true;
                this.scheduleFitMenuToViewport();
            },

            close() {
                this.open = false;
                this.alignEnd = false;
                this._fitRetries = 0;
            },

            /** Escape closes an open menu and returns focus to its trigger. */
            onEscape() {
                if (!this.open) return;
                this.close();
                this.$nextTick(() => this.$refs.localizationTrigger?.focus());
            },

            shouldPreferAlignEnd() {
                const trigger = this.$refs.localizationTrigger;
                if (!trigger) return false;

                const triggerRect = trigger.getBoundingClientRect();
                const viewportWidth =
                    document.documentElement.clientWidth || window.innerWidth || 0;
                return triggerRect.left > viewportWidth * 0.5;
            },

            scheduleFitMenuToViewport() {
                this.$nextTick(() => {
                    requestAnimationFrame(() => this.fitMenuToViewport());
                });
            },

            /**
             * Prefer start alignment; flip to end when the panel would overflow the
             * viewport edge when the panel would overflow.
             */
            fitMenuToViewport() {
                const menu = this.$refs.localizationMenu;
                const trigger = this.$refs.localizationTrigger;
                if (!menu || !trigger || !this.open) return;

                const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width;
                if (menuWidth <= 0) {
                    if (this._fitRetries >= this._maxFitRetries) return;
                    this._fitRetries += 1;
                    this.scheduleFitMenuToViewport();
                    return;
                }

                this._fitRetries = 0;

                const triggerRect = trigger.getBoundingClientRect();
                const viewportWidth =
                    document.documentElement.clientWidth || window.innerWidth || 0;
                const gap = this._viewportGap;
                const startRight = triggerRect.left + menuWidth;
                const endLeft = triggerRect.right - menuWidth;

                if (startRight <= viewportWidth - gap) {
                    this.alignEnd = false;
                    return;
                }

                if (endLeft >= gap) {
                    this.alignEnd = true;
                    return;
                }

                this.alignEnd = this.shouldPreferAlignEnd();
            },

            destroy() {
                this.dispose();
            },
        };
    },

    accordion() {
        return {
            active: null,
            titleActiveClass: 'accordion__title--active',
            titleInactiveClass: 'accordion__title--inactive',

            init() {
                const ds = this.$el?.dataset;
                if (!ds) return;

                this.titleActiveClass = ds.titleActiveClass || this.titleActiveClass;
                this.titleInactiveClass = ds.titleInactiveClass || this.titleInactiveClass;

                if (ds.initialActive === 'null') {
                    this.active = null;
                } else {
                    this.active = Number(ds.initialActive);
                }
            },

            normalizeIndex(index) {
                return Number(index);
            },

            toggle(index) {
                const i = this.normalizeIndex(index);
                this.active = this.active === i ? null : i;
            },

            isActive(index) {
                return this.active === this.normalizeIndex(index);
            },

            titleClass(index) {
                return this.isActive(index) ? this.titleActiveClass : this.titleInactiveClass;
            },
        };
    },
};

export const { dropdown, localizationSwitcher, accordion } = components;
