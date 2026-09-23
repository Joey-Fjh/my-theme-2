import { define } from 'alpine-adapter';

define('cartPage', () => ({
    errors: {},
    _unregisterCartSection: null,

    init() {
        const sectionId = this.$el?.dataset?.sectionId || '';
        this._unregisterCartSection = this.$store?.cart?.registerSection?.(sectionId) || null;
    },

    async changeLine(itemKey, quantity, sectionId) {
        const key = itemKey || 'global';
        this.errors[key] = '';

        try {
            await this.$store.cart.change(itemKey, quantity, [sectionId]);
        } catch (err) {
            this.errors[key] = this.$store.cart.messageFromError(err);
        }
    },

    destroy() {
        this._unregisterCartSection?.();
        this._unregisterCartSection = null;
    },
}));
