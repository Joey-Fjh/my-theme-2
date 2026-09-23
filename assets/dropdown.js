import { define } from 'alpine-adapter';

define('dropdown', () => ({
    openEls: [],

    onHeaderFocusIn() {},

    onHeaderFocusOut(event) {
        if (this.$el.contains(event?.relatedTarget)) return;
    },

    closeAndDeactivate(from = 0) {
        this.close(from);
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
}));
