import { define } from 'alpine-adapter';
import ThemeEvents from 'events';

define('frameGeometry', () => ({
    activeIndex: 0,
    ready: false,
    _scope: null,

    init() {
        const tabs = Array.from(this.$root.querySelectorAll('[role="tab"]'));
        const parsed = Number.parseInt(this.$root.dataset.initialIndex || '0', 10);
        let initial = Number.isNaN(parsed) ? 0 : parsed;
        if (tabs.length > 0 && (initial < 0 || initial >= tabs.length)) {
            initial = 0;
        }
        this.activeIndex = initial;

        this._scope?.dispose();
        this._scope = ThemeEvents.createScope({ target: this.$root });
        this._scope.on(ThemeEvents.events.SHOPIFY_BLOCK_SELECT, (event) => {
            const blockId = event.detail?.blockId;
            if (!blockId) return;
            const tab = this.$root.querySelector(
                `[role="tab"][data-block-id="${CSS.escape(blockId)}"]`,
            );
            if (tab && tab.dataset.panelIndex !== undefined) {
                this.select(tab.dataset.panelIndex);
            }
        });

        this.ready = true;
    },

    isSelected(index) {
        return Number.parseInt(String(index), 10) === this.activeIndex;
    },

    select(index) {
        const next = Number.parseInt(String(index), 10);
        if (!Number.isNaN(next)) {
            this.activeIndex = next;
        }
    },

    onKeydown(event) {
        const tabs = Array.from(this.$root.querySelectorAll('[role="tab"]'));
        if (tabs.length < 2) return;

        const currentTab = event.target?.closest?.('[role="tab"]') || event.currentTarget;
        const currentIndex = tabs.indexOf(currentTab);
        if (currentIndex === -1) return;

        let targetIndex = -1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            targetIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
            targetIndex = 0;
        } else if (event.key === 'End') {
            targetIndex = tabs.length - 1;
        }

        if (targetIndex === -1) return;

        event.preventDefault();
        const targetTab = tabs[targetIndex];
        if (targetTab && targetTab.dataset.panelIndex !== undefined) {
            this.select(targetTab.dataset.panelIndex);
            targetTab.focus();
        }
    },

    destroy() {
        this._scope?.dispose();
        this._scope = null;
        this.ready = false;
    },
}));
