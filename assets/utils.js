class Utils {
    static throttle(func, delay = 300) {
        let timeoutId;
        let lastExecTime = 0;

        return function (...args) {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);

                timeoutId = setTimeout(
                    () => {
                        func.apply(this, args);
                        lastExecTime = Date.now();
                    },
                    delay - (currentTime - lastExecTime),
                );
            }
        };
    }

    static prefersReducedMotion() {
        return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }

    static getPageScrollBehavior() {
        if (document.body?.dataset?.motionEnabled === 'false') return 'auto';
        if (Utils.prefersReducedMotion()) return 'auto';
        return 'smooth';
    }

    static getMicroScrollBehavior() {
        if (Utils.prefersReducedMotion()) return 'auto';
        return 'smooth';
    }

    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: Utils.getPageScrollBehavior() });
    }

    static debounce(func, wait = 300, immediate = false) {
        let timeout;

        const wrapper = function (...args) {
            const context = this;

            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };

            const callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);

            if (callNow) func.apply(context, args);
        };

        wrapper.dispose = () => {
            clearTimeout(timeout);
            timeout = null;
        };

        return wrapper;
    }
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

export { Utils };
export default Utils;
