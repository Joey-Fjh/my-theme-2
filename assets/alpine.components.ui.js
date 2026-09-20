import { useDisposable } from 'utils';
import { data, store } from 'alpine-adapter';
import ThemeEvents from 'events';
import Utils from 'utils';

const components = {
    stickyViewportPanel() {
        return {
            ...useDisposable(),
            _frame: 0,
            _resizeObserver: null,

            init() {
                this._resizeObserver = new ResizeObserver(() => this._sync());
                this.observe(this._resizeObserver, this.$el);
                this.on(window, 'resize', () => this._sync());
                this.on(window.visualViewport, 'resize', () => this._sync());
                this._sync();
            },

            _sync() {
                if (this._frame) cancelAnimationFrame(this._frame);

                this._frame = requestAnimationFrame(() => {
                    this._frame = 0;
                    const panelHeight = this.$el.getBoundingClientRect().height;

                    if (panelHeight <= 0) {
                        this.$el.style.removeProperty('top');
                        return;
                    }

                    this.$el.style.top = `min(var(--sticky-viewport-top, 1rem), calc(100dvh - ${Math.ceil(panelHeight)}px - var(--sticky-viewport-gap, 1rem)))`;
                });
            },

            destroy() {
                if (this._frame) cancelAnimationFrame(this._frame);
                if (this._resizeObserver) this._resizeObserver.disconnect();
                this.$el.style.removeProperty('top');
                this.dispose();
            },
        };
    },

    dropdown() {
        const headerMenuActiveEvent = ThemeEvents?.events?.HEADER_MENU_ACTIVE_CHANGED;

        return {
            openEls: [],
            hoverOpened: false,

            emitHeaderMenuActive(active) {
                if (!headerMenuActiveEvent || typeof ThemeEvents?.emit !== 'function') return;

                ThemeEvents.emit(headerMenuActiveEvent, { active: Boolean(active) });
            },

            onHeaderEnter() {
                this.cancelHoverClose();
                this.emitHeaderMenuActive(true);
            },

            onHeaderLeave() {
                this.emitHeaderMenuActive(false);
            },

            onHeaderFocusIn() {
                this.emitHeaderMenuActive(true);
            },

            onHeaderFocusOut(event) {
                if (this.$el.contains(event?.relatedTarget)) return;

                this.emitHeaderMenuActive(false);
            },

            closeAndDeactivate(from = 0) {
                this.cancelHoverOpen();
                this.close(from);
                this.emitHeaderMenuActive(false);
            },

            closeHoverAndDeactivate() {
                if (!this.canHoverOpen()) {
                    this.emitHeaderMenuActive(false);
                    return;
                }

                this.cancelHoverOpen();
                this.scheduleHoverClose();
            },

            cancelHoverClose() {
                clearTimeout(this._hoverCloseTimer);
            },

            scheduleHoverClose() {
                if (!this.canHoverOpen()) return;

                this.cancelHoverClose();
                this._hoverCloseTimer = window.setTimeout(() => {
                    if (this.hoverOpened) {
                        this.close(0);
                    }

                    this.emitHeaderMenuActive(false);
                }, 180);
            },

            onMenuTriggerClick(target) {
                if (!this.isDesktopClickTrigger()) return;

                this.toggle(target);
            },

            onMenuTriggerClickEvent(event) {
                const target = event?.target;

                if (!(target instanceof Element)) return;

                const trigger = target.closest('summary.dropdown-trigger');
                if (!trigger || !this.$el.contains(trigger)) return;

                event.preventDefault();
                event.stopPropagation();

                this.cancelHoverOpen();
                this.toggle(trigger.parentElement);
            },

            toggle(target) {
                this.cancelHoverOpen();

                const current = target.closest('[data-dropdown]');

                if (!current) return;

                const deep = Number(current.dataset.deep);

                if (this.openEls[deep] === current) {
                    this.close(deep);
                    return;
                }

                this.open(current, deep);

                if (this.isDesktopClickTrigger()) {
                    this.hoverOpened = false;
                }
            },

            scheduleHoverOpen(target, delay = 120) {
                if (!this.canHoverOpen()) return;

                const current = target?.matches?.('[data-dropdown]')
                    ? target
                    : target?.closest?.('[data-dropdown]');

                if (!current) return;

                const deep = Number(current.dataset.deep);
                const openedAtDeep = this.openEls[deep];

                if (openedAtDeep === current) {
                    this.cancelHoverOpen();
                    return;
                }

                this.cancelHoverOpen();
                this._pendingHoverTarget = current;

                this._hoverOpenTimer = window.setTimeout(() => {
                    if (this._pendingHoverTarget !== current) return;

                    this.cancelHoverClose();

                    const stillOpen = this.openEls[deep];

                    if (stillOpen && stillOpen !== current) {
                        this.switchOpen(current, deep, { replayMotion: false });
                    } else {
                        this.open(current, deep, { replayMotion: true });
                    }

                    this.hoverOpened = true;
                    this._pendingHoverTarget = null;
                    this._hoverOpenTimer = null;
                }, delay);
            },

            cancelHoverOpen() {
                clearTimeout(this._hoverOpenTimer);
                this._hoverOpenTimer = null;
                this._pendingHoverTarget = null;
            },

            openOnHoverEvent(event) {
                if (!this.canHoverOpen()) return;

                const target = event?.target;

                if (!(target instanceof Element)) return;

                const trigger = target.closest('summary.dropdown-trigger');

                if (!trigger || !this.$el.contains(trigger)) return;

                this.scheduleHoverOpen(trigger.parentElement);
            },

            open(current, deep, { replayMotion = true } = {}) {
                if (this.openEls[deep] !== current) {
                    this.closeFromDepth(deep);
                }

                current.setAttribute('open', '');

                if (replayMotion) {
                    this.replayLayeredPanelMotion(current);
                } else {
                    this.ensureLayeredPanelVisible(current);
                }

                this.openEls[deep] = current;
            },

            switchOpen(current, deep, { replayMotion = false } = {}) {
                const previous = this.openEls[deep];

                if (previous === current) return;

                for (let i = this.openEls.length - 1; i > deep; i--) {
                    const el = this.openEls[i];

                    if (el) {
                        this.resetLayeredPanelMotion(el);
                        el.removeAttribute('open');
                    }
                }

                this.openEls.length = Math.min(this.openEls.length, deep + 1);

                current.setAttribute('open', '');

                if (replayMotion) {
                    this.replayLayeredPanelMotion(current);
                } else {
                    this.ensureLayeredPanelVisible(current);
                }

                this.openEls[deep] = current;

                if (previous && previous !== current) {
                    this.resetLayeredPanelMotion(previous);
                    previous.removeAttribute('open');
                }
            },

            ensureLayeredPanelVisible(target) {
                const panel = target.querySelector(':scope > .panel-motion-layered');

                if (!panel) return;

                panel.removeAttribute('data-panel-motion');
            },

            canHoverOpen() {
                return (
                    window.matchMedia?.('(any-hover: hover) and (any-pointer: fine)')?.matches &&
                    this.$el.dataset.desktopMenuTrigger === 'hover'
                );
            },

            isDesktopClickTrigger() {
                return this.$el.dataset.desktopMenuTrigger === 'click';
            },

            replayLayeredPanelMotion(target) {
                const panel = target.querySelector(':scope > .panel-motion-layered');

                if (!panel) return;

                panel.removeAttribute('data-panel-motion');
                void panel.offsetWidth;
                panel.setAttribute('data-panel-motion', 'enter');
            },

            resetLayeredPanelMotion(target) {
                const panel = target.querySelector(':scope > .panel-motion-layered');

                if (!panel) return;

                panel.removeAttribute('data-panel-motion');
            },

            close(from = 0) {
                this.cancelHoverOpen();
                this.closeFromDepth(from);
                this.hoverOpened = false;
            },

            closeFromDepth(from) {
                for (let i = from; i < this.openEls.length; i++) {
                    const el = this.openEls[i];

                    if (el) {
                        this.resetLayeredPanelMotion(el);
                        el.removeAttribute('open');
                    }
                }

                this.openEls.length = from;
            },
        };
    },

    dragScroll({ axis = 'x', threshold = 6, clickGuardMs = 100 } = {}) {
        return {
            ...useDisposable(),
            axis,
            threshold,
            clickGuardMs,
            _pointerDown: false,
            _dragging: false,
            _startX: 0,
            _startY: 0,
            _startScrollLeft: 0,
            _startScrollTop: 0,
            _suppressClickUntil: 0,

            init() {
                this.on(this.$el, 'pointerdown', this.onPointerDown.bind(this));
                this.on(window, 'pointermove', this.onPointerMove.bind(this), {
                    passive: false,
                });
                this.on(window, 'pointerup', this.endDrag.bind(this));
                this.on(window, 'pointercancel', this.endDrag.bind(this));
                this.on(this.$el, 'click', this.onClickCapture.bind(this), true);
                this.on(this.$el, 'dragstart', this.onDragStart.bind(this));
            },

            onPointerDown(event) {
                if (event.button !== 0) return;

                this._pointerDown = true;
                this._dragging = false;
                this._startX = event.clientX;
                this._startY = event.clientY;
                this._startScrollLeft = this.$el.scrollLeft;
                this._startScrollTop = this.$el.scrollTop;
                this.$el.classList.add('is-pointer-down');
            },

            onPointerMove(event) {
                if (!this._pointerDown) return;

                const deltaX = event.clientX - this._startX;
                const deltaY = event.clientY - this._startY;
                const distance = this.axis === 'y' ? Math.abs(deltaY) : Math.abs(deltaX);

                if (!this._dragging && distance >= this.threshold) {
                    this._dragging = true;
                    this.$el.classList.add('is-dragging');
                }

                if (!this._dragging) return;

                if (this.axis === 'y') {
                    this.$el.scrollTop = this._startScrollTop - deltaY;
                } else {
                    this.$el.scrollLeft = this._startScrollLeft - deltaX;
                }

                event.preventDefault();
            },

            endDrag() {
                if (!this._pointerDown) return;

                this._pointerDown = false;
                this.$el.classList.remove('is-pointer-down');

                if (this._dragging) {
                    this._suppressClickUntil = performance.now() + this.clickGuardMs;
                }

                requestAnimationFrame(() => {
                    this._dragging = false;
                    this.$el.classList.remove('is-dragging');
                });
            },

            onClickCapture(event) {
                if (performance.now() < this._suppressClickUntil) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            },

            onDragStart(event) {
                event.preventDefault();
            },

            destroy() {
                this.$el.classList.remove('is-dragging');
                this.$el.classList.remove('is-pointer-down');
                this.dispose();
            },
        };
    },

    tabControl(initialStrategy = 'first', options = {}) {
        return {
            ...useDisposable(),
            tabs: [],
            panels: [],
            activeIndex: 0,
            focusIndex: 0,
            mobileQuery: '(max-width: 47.99rem)',
            scrollMode: options.scrollMode === 'always' ? 'always' : 'mobile',
            scroller: null,
            _pointerDown: false,
            _dragging: false,
            _startX: 0,
            _startY: 0,
            _startScrollLeft: 0,
            _suppressClickUntil: 0,
            _initialStrategy: initialStrategy,

            _hydrateFromDataset() {
                const ds = this.$el?.dataset;
                if (!ds) return;
                if (ds.tabInitialStrategy) this._initialStrategy = ds.tabInitialStrategy;
                if (ds.tabScrollMode)
                    this.scrollMode = ds.tabScrollMode === 'always' ? 'always' : 'mobile';
            },

            init() {
                this._hydrateFromDataset();
                this.$nextTick(() => {
                    this.scroller = this.getTabScroller();
                    if (this.scroller) {
                        this.on(this.scroller, 'dragstart', this.onDragStart.bind(this));
                        this.on(this.scroller, 'keydown', this.onTabKeydown.bind(this));
                        this.on(this.scroller, 'pointerdown', this.onPointerDown.bind(this));
                        this.on(this.scroller, 'touchstart', this.onTouchStart.bind(this), {
                            passive: true,
                        });
                        this.on(window, 'pointermove', this.onPointerMove.bind(this), {
                            passive: false,
                        });
                        this.on(window, 'touchmove', this.onTouchMove.bind(this), {
                            passive: false,
                        });
                        this.on(window, 'pointerup', this.endDrag.bind(this));
                        this.on(window, 'pointercancel', this.endDrag.bind(this));
                        this.on(window, 'touchend', this.endDrag.bind(this));
                        this.on(window, 'touchcancel', this.endDrag.bind(this));
                        this.on(this.scroller, 'click', this.onClickCapture.bind(this), true);
                        this.on(window, 'resize', this.onResize.bind(this));
                    }

                    const count = this.tabs.length;
                    if (count === 0) return;

                    const nextIndex = this._initialStrategy === 'first' ? 0 : Math.floor(count / 2);
                    this.setActive(nextIndex, { centerOnMobile: true, behavior: 'auto' });
                });
            },

            registerTab(tab) {
                this.tabs.push(tab);
                return this.tabs.length - 1;
            },

            registerPanel(panel) {
                this.panels.push(panel);
                return this.panels.length - 1;
            },

            setActive(index, options = {}) {
                if (index < 0 || index >= this.tabs.length) return;
                this.activeIndex = index;
                this.focusIndex = index;

                this.$nextTick(() => {
                    this.scrollActiveTabIntoView(index, options);
                });
            },

            isActive(index) {
                return this.activeIndex === index;
            },

            isFocusable(index) {
                return this.focusIndex === index;
            },

            next() {
                this.setActive((this.activeIndex + 1) % this.tabs.length);
            },

            prev() {
                this.setActive((this.activeIndex - 1 + this.tabs.length) % this.tabs.length);
            },

            focusTab(index) {
                const tab = this.tabs[index];
                if (!(tab instanceof HTMLElement)) return;

                this.focusIndex = index;
                this.$nextTick(() => {
                    tab.focus({ preventScroll: true });
                    this.scrollActiveTabIntoView(index, { centerOnMobile: true });
                });
            },

            onTabKeydown(event) {
                const currentTab = event.target?.closest?.('[role="tab"]');
                const currentIndex = this.tabs.indexOf(currentTab);
                if (currentIndex < 0) return;

                if (
                    (event.key === ' ' || event.key === 'Spacebar') &&
                    currentTab instanceof HTMLAnchorElement
                ) {
                    event.preventDefault();
                    currentTab.click();
                    return;
                }

                const orientation = this.scroller?.getAttribute('aria-orientation') || 'horizontal';
                let nextIndex = null;

                if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = this.tabs.length - 1;
                } else if (orientation === 'vertical' && event.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % this.tabs.length;
                } else if (orientation === 'vertical' && event.key === 'ArrowUp') {
                    nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
                } else if (orientation !== 'vertical' && event.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % this.tabs.length;
                } else if (orientation !== 'vertical' && event.key === 'ArrowLeft') {
                    nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
                }

                if (nextIndex === null) return;

                event.preventDefault();
                this.focusTab(nextIndex);
            },

            isMobileViewport() {
                if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
                    return false;
                return window.matchMedia(this.mobileQuery).matches;
            },

            shouldScrollActiveTabIntoView() {
                return this.scrollMode === 'always' || this.isMobileViewport();
            },

            canDragScroll() {
                return (
                    this.scroller &&
                    this.scroller.scrollWidth > this.scroller.clientWidth &&
                    (this.scrollMode === 'always' ||
                        this.isMobileViewport() ||
                        this.isHorizontalScroller(this.scroller))
                );
            },

            isHorizontalScroller(scroller) {
                const overflowX = window.getComputedStyle(scroller).overflowX;
                return overflowX === 'auto' || overflowX === 'scroll';
            },

            getTabScroller() {
                const tablist = this.$el?.querySelector('[role="tablist"]');
                return tablist instanceof HTMLElement ? tablist : null;
            },

            getHorizontalScrollParent(el) {
                if (!el) return null;

                let parent = el.parentElement;
                while (parent) {
                    if (parent.scrollWidth > parent.clientWidth) {
                        const style = window.getComputedStyle(parent);
                        const overflowX = style.overflowX;
                        if (overflowX === 'auto' || overflowX === 'scroll') return parent;
                    }
                    parent = parent.parentElement;
                }

                return null;
            },

            getMicroScrollBehavior() {
                if (typeof Utils?.getMicroScrollBehavior === 'function') {
                    return Utils.getMicroScrollBehavior();
                }
                if (
                    typeof window.matchMedia === 'function' &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ) {
                    return 'auto';
                }
                return 'smooth';
            },

            scrollActiveTabIntoView(index, options = {}) {
                if (!this.shouldScrollActiveTabIntoView()) return;

                const tab = this.tabs[index];
                if (!(tab instanceof HTMLElement)) return;

                const scroller = this.getHorizontalScrollParent(tab);
                if (!scroller) return;
                this.scroller = scroller;

                const { centerOnMobile = false, behavior } = options;
                const scrollBehavior = behavior ?? this.getMicroScrollBehavior();
                const isEdgeTab = index === 0 || index === this.tabs.length - 1;

                const tabLeft = tab.offsetLeft;
                const tabRight = tabLeft + tab.offsetWidth;
                const visibleLeft = scroller.scrollLeft;
                const visibleRight = visibleLeft + scroller.clientWidth;

                if (centerOnMobile && !isEdgeTab) {
                    const centered = tabLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
                    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                    const nextLeft = Math.min(Math.max(centered, 0), Math.max(maxScroll, 0));
                    scroller.scrollTo({ left: nextLeft, behavior: scrollBehavior });
                    return;
                }

                if (tabLeft < visibleLeft) {
                    scroller.scrollTo({ left: tabLeft, behavior: scrollBehavior });
                    return;
                }

                if (tabRight > visibleRight) {
                    scroller.scrollTo({
                        left: tabRight - scroller.clientWidth,
                        behavior: scrollBehavior,
                    });
                }
            },

            onPointerDown(event) {
                if (event.pointerType === 'touch') return;
                if (!this.canDragScroll()) return;
                if (event.pointerType === 'mouse' && event.button !== 0) return;

                this._pointerDown = true;
                this._dragging = false;
                this._startX = event.clientX;
                this._startY = event.clientY;
                this._startScrollLeft = this.scroller.scrollLeft;
            },

            onTouchStart(event) {
                if (!this.canDragScroll()) return;
                if (event.touches.length !== 1) return;

                const touch = event.touches[0];
                this._pointerDown = true;
                this._dragging = false;
                this._startX = touch.clientX;
                this._startY = touch.clientY;
                this._startScrollLeft = this.scroller.scrollLeft;
            },

            onDragStart(event) {
                if (event.target?.closest?.('[role="tab"]')) {
                    event.preventDefault();
                }
            },

            onPointerMove(event) {
                if (!this._pointerDown || !this.scroller) return;

                this.updateDrag(event.clientX, event.clientY, event);
            },

            onTouchMove(event) {
                if (!this._pointerDown || !this.scroller) return;
                if (event.touches.length !== 1) return;

                const touch = event.touches[0];
                this.updateDrag(touch.clientX, touch.clientY, event);
            },

            updateDrag(clientX, clientY, event) {
                const deltaX = clientX - this._startX;
                const deltaY = clientY - this._startY;

                if (!this._dragging) {
                    const absX = Math.abs(deltaX);
                    const absY = Math.abs(deltaY);

                    if (absY >= 6 && absY > absX) {
                        this._pointerDown = false;
                        return;
                    }

                    if (absX >= 6 && absX >= absY) {
                        this._dragging = true;
                    } else {
                        return;
                    }
                }

                this.scroller.scrollLeft = this._startScrollLeft - deltaX;
                event.preventDefault();
            },

            endDrag() {
                if (!this._pointerDown) return;

                this._pointerDown = false;
                if (this._dragging) {
                    this._suppressClickUntil = Date.now() + 100;
                }
                this._dragging = false;
            },

            onClickCapture(event) {
                if (Date.now() >= this._suppressClickUntil) return;

                event.preventDefault();
                event.stopPropagation();
            },

            onResize() {
                this.$nextTick(() => {
                    this.scrollActiveTabIntoView(this.activeIndex, {
                        centerOnMobile: true,
                        behavior: 'auto',
                    });
                });
            },

            destroy() {
                this.dispose();
            },
        };
    },

    countdownTimer(endDate = null) {
        return {
            ...useDisposable(),
            endDate: endDate || null,
            interval: null,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,

            getValue(key) {
                const val = this[key] ?? 0;
                return val.toString().padStart(2, '0');
            },

            init() {
                if (!this.endDate) {
                    this.endDate = this.$el?.dataset?.countdownEndDate || null;
                }
                if (!this.endDate) return;
                this.calculateTime();
                this.interval = setInterval(() => {
                    this.calculateTime();
                }, 1000);
            },

            calculateTime() {
                const end = new Date(this.endDate).getTime();
                const now = Date.now();
                const distance = end - now;

                if (distance <= 0) {
                    this.reset();
                    this.clear();
                    return;
                }

                this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
                this.hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
                this.minutes = Math.floor((distance / (1000 * 60)) % 60);
                this.seconds = Math.floor((distance / 1000) % 60);
            },

            reset() {
                this.days = 0;
                this.hours = 0;
                this.minutes = 0;
                this.seconds = 0;
            },

            clear() {
                if (this.interval) {
                    clearInterval(this.interval);
                    this.interval = null;
                }
            },

            destroy() {
                this.clear();
                this.dispose();
            },
        };
    },

    progressiveList() {
        return {
            initialVisibleCount: 6,
            stepCount: 6,
            visibleCount: 6,

            init() {
                const nextVisibleCount = Number(this.$el.dataset.visibleCount);
                const nextStepCount = Number(this.$el.dataset.stepCount);

                this.initialVisibleCount =
                    Number.isFinite(nextVisibleCount) && nextVisibleCount > 0
                        ? nextVisibleCount
                        : 6;
                this.stepCount =
                    Number.isFinite(nextStepCount) && nextStepCount > 0
                        ? nextStepCount
                        : this.initialVisibleCount;
                this.visibleCount = this.initialVisibleCount;
            },

            isVisible(index) {
                return Number(index) < this.visibleCount;
            },

            canShowMore(totalCount) {
                return this.visibleCount < Number(totalCount || 0);
            },

            canShowLess() {
                return this.visibleCount > this.initialVisibleCount;
            },

            showMore(totalCount) {
                const normalizedTotal = Math.max(0, Number(totalCount) || 0);
                this.visibleCount = Math.min(normalizedTotal, this.visibleCount + this.stepCount);
            },

            showLess() {
                this.visibleCount = this.initialVisibleCount;
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
             * viewport edge (same idea as image magnifier canPlaceRight).
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

    sortByDropdown() {
        return {
            sortBy: '',
            optionActiveClass: '',
            optionInactiveClass: '',
            formId: '',

            init() {
                const ds = this.$el?.dataset;
                if (!ds) return;

                this.sortBy = ds.currentSort || '';
                this.formId = ds.formId || '';
                this.optionActiveClass = ds.optionActiveClass || '';
                this.optionInactiveClass = ds.optionInactiveClass || '';
            },

            isSelected(value) {
                return this.sortBy === value;
            },

            syncPeers(value) {
                document.querySelectorAll('[data-sort-by-dropdown]').forEach((dropdown) => {
                    if (dropdown.dataset.formId !== this.formId) return;

                    const dataState = data(dropdown);
                    if (dataState) dataState.sortBy = value;

                    dropdown.querySelector('[data-sort-by-control]')?.setAttribute('value', value);
                });
            },

            select(value) {
                this.sortBy = value;

                if (this.formId) {
                    this.syncPeers(value);
                    this.$nextTick(() => {
                        document
                            .getElementById(this.formId)
                            ?.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                } else {
                    this.$dispatch('sort-change', this.sortBy);
                }
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

    toastContainer() {
        return {
            init() {
                const ds = this.$el.dataset;

                this.$store.toast.configure({
                    defaultDuration: Number(ds.toastDuration),
                });

                this.$store.cart.configure({
                    errorMessages: {
                        generic: ds.cartToastGeneric || '',
                        rateLimited: ds.cartToastRateLimited || '',
                        serverError: ds.cartToastServerError || '',
                        timeout: ds.cartToastTimeout || '',
                        networkError: ds.cartToastNetworkError || '',
                    },
                });

                if (ds.toastPreview === 'true') {
                    const previewDuration = ds.toastPreviewPersistent === 'true' ? 0 : undefined;

                    requestAnimationFrame(() => {
                        this.$store.toast.show(
                            ds.toastPreviewMessage,
                            ds.toastPreviewType,
                            previewDuration,
                        );
                    });
                }
            },
        };
    },

    flipDigit() {
        return {
            ...useDisposable(),
            prev: '',
            current: '',
            oldDigit: '',
            flipping: false,
            _timeout: null,

            init() {
                const digit = this.$el?.dataset?.digit || '';
                this.prev = digit;
                this.current = digit;
                this.oldDigit = digit;
            },

            updateDigit(digit) {
                const next = String(digit ?? '');

                if (this.oldDigit === '' && this.current === '' && this.prev === '') {
                    this.prev = next;
                    this.current = next;
                    this.oldDigit = next;
                    return;
                }

                if (next === this.oldDigit) return;

                this.current = next;
                this.oldDigit = next;
                this.flipping = true;

                if (this._timeout) clearTimeout(this._timeout);

                this._timeout = setTimeout(() => {
                    this.prev = this.current;
                    this.flipping = false;
                    this._timeout = null;
                }, 600);
            },

            destroy() {
                if (this._timeout) {
                    clearTimeout(this._timeout);
                    this._timeout = null;
                }
                this.dispose();
            },
        };
    },
};

export const {
    stickyViewportPanel,
    dropdown,
    dragScroll,
    tabControl,
    countdownTimer,
    progressiveList,
    localizationSwitcher,
    sortByDropdown,
    accordion,
    toastContainer,
    flipDigit,
} = components;
