import { define, store } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import QuantityConstraints from './quantity-constraints.js';

define('BuyButtons', () => ({
    ...useDisposable(),
    sectionId: '',
    productFormId: '',
    available: true,
    variantId: null,
    successMessage: '',
    isLoading: false,
    isSuccess: false,
    errorMessage: '',
    canPurchaseQuantity: true,
    _eventScope: null,
    _successTimeout: null,
    _buttonLabels: {
        addToCart: '',
        soldOut: '',
        maximumInCart: '',
        unavailable: '',
    },

    get buttonText() {
        if (this.isSuccess) return this.successMessage || '';
        const labels = this._buttonLabels || {};
        if (!this.variantId) return labels.unavailable || '';
        if (!this.available) return labels.soldOut || '';
        if (!this.canPurchaseQuantity) {
            return labels.maximumInCart || labels.addToCart || '';
        }
        return labels.addToCart || '';
    },

    init() {
        const dataset = this.$el?.dataset || {};
        this._buttonLabels = {
            addToCart: dataset.addToCartText || '',
            soldOut: dataset.soldOutText || '',
            maximumInCart: dataset.maximumInCartText || '',
            unavailable: dataset.unavailableText || '',
        };

        this.sectionId = this.sectionId || dataset.sectionId || '';
        this.productFormId = this.productFormId || dataset.productFormId || '';

        if (dataset.available !== undefined && dataset.available !== '') {
            this.available = dataset.available === 'true';
        }

        if (dataset.variantId !== undefined && dataset.variantId !== '') {
            this.variantId = Number(dataset.variantId) || null;
        }

        if (dataset.successMessage !== undefined) {
            this.successMessage = dataset.successMessage || '';
        }

        const Events = ThemeEvents;
        const events = Events.events;
        this._eventScope = Events.createScope();

        const onVariantChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            const variant = e.detail.variant;
            this.variantId = variant?.id || null;
            this.available = variant?.available || false;
            this._syncQuantityPurchaseState(variant);
        };

        const onQuantityChange = (e) => {
            const root = e.target?.closest?.('.quantity-selector') || e.target;
            const rootSection = root?.dataset?.qtySectionId;
            if (rootSection && rootSection !== String(this.sectionId)) return;
            if (!rootSection && !this.$el?.contains?.(e.target)) return;
            if (typeof e.detail?.canPurchase === 'boolean') {
                this.canPurchaseQuantity = e.detail.canPurchase;
            }
        };

        this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
        this._eventScope.on(events.PRODUCT_QUANTITY_CHANGED, onQuantityChange);
        this.$nextTick(() => this._syncQuantityPurchaseState());
    },

    _quantityRoot() {
        return (
            this.$el?.querySelector?.('.quantity-selector') ||
            document.querySelector(
                `.quantity-selector[data-qty-section-id="${CSS.escape(this.sectionId || '')}"]`,
            )
        );
    },

    _syncQuantityPurchaseState(variant) {
        const root = this._quantityRoot();
        if (root?.dataset?.qtyCanPurchase === 'false') {
            this.canPurchaseQuantity = false;
            return;
        }

        if (!variant) {
            this.canPurchaseQuantity = root?.dataset?.qtyCanPurchase !== 'false';
            return;
        }

        const cartItems = store('cart')?.items || [];
        const cartQuantity = QuantityConstraints.cartQuantityForVariant(variant.id, cartItems);
        const resolved = QuantityConstraints.fromVariant(variant, {
            surface: 'product',
            cartQuantity,
        });
        this.canPurchaseQuantity = resolved.canPurchase !== false;
    },

    _getQuantity() {
        const form = document.getElementById(this.productFormId);
        const qtyInput =
            form?.querySelector('input[name="quantity"]') ||
            document.querySelector(`input[name="quantity"][form="${this.productFormId}"]`);
        return qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
    },

    _quantityAllowsSubmit() {
        if (!this.canPurchaseQuantity) return false;
        const root = this._quantityRoot();
        if (!root) return true;
        if (root.dataset?.qtyCanPurchase === 'false') return false;
        const input = root.querySelector('input[name="quantity"]');
        if (!input) return true;
        const qty = parseInt(input.value, 10);
        const min = input.min !== '' ? Number(input.min) : 1;
        const max = input.max !== '' ? Number(input.max) : null;
        if (!Number.isFinite(qty) || qty < min) return false;
        if (Number.isFinite(max) && qty > max) return false;
        return true;
    },

    _collectLineItemProperties() {
        const form = document.getElementById(this.productFormId);
        if (!form) return null;

        const formData = new FormData(form);
        const properties = {};
        let hasProperties = false;

        formData.forEach((value, key) => {
            const match = /^properties\[(.*)\]$/.exec(key);
            if (!match) return;
            properties[match[1]] = value;
            hasProperties = true;
        });

        return hasProperties ? properties : null;
    },

    _buildCartItem() {
        const item = {
            id: this.variantId,
            quantity: this._getQuantity(),
        };
        const properties = this._collectLineItemProperties();
        if (properties) item.properties = properties;

        const sellingPlanInput = this.$el?.querySelector?.(
            'input[name="selling_plan"]:not(:disabled)',
        );
        const sellingPlanId = sellingPlanInput?.value;
        if (sellingPlanId) {
            item.selling_plan = Number(sellingPlanId) || sellingPlanId;
        }

        return item;
    },

    addToCart() {
        if (!this.available || !this.variantId || this.isLoading || !this._quantityAllowsSubmit())
            return;

        this.isLoading = true;
        this.errorMessage = '';
        this._clearSuccessState();

        const cart = store('cart');
        if (!cart) {
            this.isLoading = false;
            return;
        }

        cart.add([this._buildCartItem()])
            .then(() => {
                this._showSuccessState();
            })
            .catch((err) => {
                this.errorMessage = cart.messageFromError(err);
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    _showSuccessState() {
        this.isSuccess = true;
        if (this._successTimeout) clearTimeout(this._successTimeout);
        this._successTimeout = setTimeout(() => {
            this.isSuccess = false;
            this._successTimeout = null;
        }, 3000);
    },

    _clearSuccessState() {
        this.isSuccess = false;
        if (this._successTimeout) {
            clearTimeout(this._successTimeout);
            this._successTimeout = null;
        }
    },

    destroy() {
        this._clearSuccessState();
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this.dispose();
    },
}));
