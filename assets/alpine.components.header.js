import { useDisposable } from 'utils';
import ThemeEvents from 'events';

const components = {
    mobileMenuDrawer() {
        return {
            activeTopIndex: -1,
            thirdLevelParentTitle: '',
            thirdLevelLinks: [],

            init() {
                const menu = this.$refs.topMenu;
                if (!menu) return;

                const firstWithChildren = Array.from(menu.children).findIndex(
                    (item) => item.dataset.hasChildren === 'true',
                );
                this.activeTopIndex = firstWithChildren >= 0 ? firstWithChildren : -1;
            },

            openTop(index) {
                this.thirdLevelParentTitle = '';
                this.thirdLevelLinks = [];
                this.activeTopIndex = this.activeTopIndex === index ? -1 : index;
            },

            openThirdLevel(title, links) {
                this.thirdLevelParentTitle = title || '';
                this.thirdLevelLinks = Array.isArray(links) ? links : [];
            },

            openThirdLevelFromButton(button) {
                if (!button) return;
                const payload = button.getAttribute('data-third-payload');
                if (!payload) return;

                try {
                    const parsed = JSON.parse(payload);
                    this.openThirdLevel(parsed.title, parsed.links);
                } catch (_) {
                    this.openThirdLevel('', []);
                }
            },

            backToSecondLevel() {
                this.thirdLevelParentTitle = '';
                this.thirdLevelLinks = [];
            },
        };
    },

    stickyHeader() {
        return {
            ...useDisposable(),
            lastY: window.scrollY,
            isHidden: false,
            isTop: true,
            isMenuActive: false,

            init() {
                const headerMenuActiveEvent = ThemeEvents?.events?.HEADER_MENU_ACTIVE_CHANGED;

                this.on(window, 'scroll', this.onScroll.bind(this), false);
                if (!headerMenuActiveEvent) return;

                this.on(window, headerMenuActiveEvent, (event) => {
                    this.isMenuActive = Boolean(event?.detail?.active);
                });
            },

            onScroll() {
                requestAnimationFrame(() => {
                    const y = window.scrollY;

                    if (y < 10) {
                        // Top
                        this.isTop = true;
                        this.isHidden = false;
                    } else if (y > this.lastY) {
                        // Scroll Down
                        this.isTop = false;
                        this.isHidden = true;
                    } else if (y < this.lastY) {
                        // Scroll Up
                        this.isTop = false;
                        this.isHidden = false;
                    }

                    this.lastY = y <= 0 ? 0 : y;
                });
            },

            destroy() {
                this.dispose();
            },
        };
    },
};

export const { mobileMenuDrawer, stickyHeader } = components;
