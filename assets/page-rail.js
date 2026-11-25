import { define } from 'alpine-adapter';

define('pageRail', () => ({
    _observer: null,

    init() {
        this.sync();

        if (typeof ResizeObserver === 'function') {
            this._observer = new ResizeObserver(() => this.sync());
            this._observer.observe(this.$el);
        }
    },

    sync() {
        const track = this.$el.querySelector('.page-rail__track');
        if (!track) return;

        const firstMark = track.querySelector('.page-rail__mark');
        const firstNumber = firstMark?.querySelector('.page-rail__num');
        if (!firstNumber) return;

        const rail = this.$el.getBoundingClientRect();
        const unit = firstNumber.querySelector('.page-rail__unit');
        if (unit && rail.width > 0) {
            track.removeAttribute('data-rail-hide-unit');
            const numWithUnit = firstNumber.getBoundingClientRect();
            const overflowsInline =
                numWithUnit.width > 0 &&
                (numWithUnit.left < rail.left || numWithUnit.right > rail.right);
            track.toggleAttribute('data-rail-hide-unit', overflowsInline);
        }

        const number = firstNumber.getBoundingClientRect();
        const step = firstMark.getBoundingClientRect().height;
        const visibleCount =
            rail.width > 0 && number.height > 0 && step > 0
                ? Math.max(0, Math.floor((rail.bottom - number.bottom) / step) + 1)
                : 0;

        // Keep the first mark as a measuring point when no numerals fit.
        const needed = Math.max(1, visibleCount);
        const currentCount = track.children.length;

        if (currentCount < needed) {
            const fragment = document.createDocumentFragment();
            for (let i = currentCount; i < needed; i++) {
                const mark = document.createElement('span');
                mark.className = 'page-rail__mark';

                const num = document.createElement('span');
                num.className = 'page-rail__num';
                num.textContent = String(i * 10);

                mark.appendChild(num);
                fragment.appendChild(mark);
            }
            track.appendChild(fragment);
        } else if (currentCount > needed) {
            while (track.children.length > needed) {
                track.lastElementChild.remove();
            }
        }

        for (const mark of track.children) {
            const num = mark.querySelector('.page-rail__num');
            if (!num) continue;

            const rect = num.getBoundingClientRect();
            const overflows =
                rail.width > 0 &&
                rect.width > 0 &&
                (rect.left < rail.left || rect.right > rail.right);
            num.toggleAttribute('data-rail-overflow', overflows);
        }

        track.toggleAttribute('data-rail-labels-ready', visibleCount > 0);
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    },
}));
