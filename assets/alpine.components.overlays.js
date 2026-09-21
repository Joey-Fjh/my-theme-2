const components = {
    cartPage() {
        return {
            _unregisterCartSection: null,

            init() {
                const sectionId = this.$el?.dataset?.sectionId || '';
                this._unregisterCartSection =
                    this.$store?.cart?.registerSection?.(sectionId) || null;
            },

            destroy() {
                this._unregisterCartSection?.();
                this._unregisterCartSection = null;
            },
        };
    },
};

export const { cartPage } = components;
