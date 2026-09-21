import { useDisposable } from 'utils';
import { data, store } from 'alpine-adapter';
import ThemeEvents from 'events';
import QuantityConstraints from './quantity-constraints.js';

const components = {
    VariantPicker() {
        return {
            ...useDisposable(),
            sectionId: '',
            productId: null,
            productFormId: '',
            galleryId: '',
            updateUrl: false,
            variants: [],
            selectedOptions: {},
            currentVariant: null,
            currentVariantId: null,
            _eventScope: null,

            init() {
                const dataset = this.$el?.dataset || {};
                this.sectionId = dataset.sectionId || this.sectionId || '';
                this.productId = Number(dataset.productId || this.productId || 0) || null;
                this.productFormId = dataset.productFormId || this.productFormId || '';
                this.galleryId = dataset.galleryId || this.galleryId || '';
                this.updateUrl = dataset.updateUrl === 'true';

                let variants = [];
                if (dataset.variants) {
                    try {
                        const parsed = JSON.parse(dataset.variants);
                        variants = Array.isArray(parsed) ? parsed : [];
                    } catch (_) {
                        variants = [];
                    }
                }

                let quantityMeta = {};
                if (dataset.variantsQuantityMeta) {
                    try {
                        const parsed = JSON.parse(dataset.variantsQuantityMeta);
                        quantityMeta =
                            parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                                ? parsed
                                : {};
                    } catch (_) {
                        quantityMeta = {};
                    }
                }

                this.variants = this._mergeQuantityMeta(variants, quantityMeta);

                const Events = ThemeEvents;
                const events = Events.events;
                this._eventScope = Events.createScope();

                this._buildOptionNames();
                this._setInitialSelection();
                this._resolveVariant();

                this.$nextTick(() => this._dispatchChange());

                const onVariantSetRequest = (e) => {
                    if (e.detail?.sectionId !== this.sectionId) return;
                    if (e.detail.options) {
                        Object.assign(this.selectedOptions, e.detail.options);
                        this._resolveVariant();
                        this._dispatchChange();
                    }
                };

                this._eventScope.on(events.PRODUCT_VARIANT_SET_REQUEST, onVariantSetRequest);
            },

            _mergeQuantityMeta(variants, quantityMeta) {
                return (variants || []).map((variant) => {
                    if (!variant || typeof variant !== 'object') return variant;
                    const meta = quantityMeta?.[String(variant.id)] || quantityMeta?.[variant.id];
                    if (!meta || typeof meta !== 'object') return { ...variant };
                    return {
                        ...variant,
                        inventory_management: meta.inventory_management,
                        inventory_policy: meta.inventory_policy,
                        inventory_quantity: meta.inventory_quantity,
                        quantity_rule: meta.quantity_rule,
                    };
                });
            },

            _optionNames: [],

            _buildOptionNames() {
                this._optionNames = [];
                const children = this.$el.children;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    const legend = child.querySelector('legend');
                    const label = child.querySelector('label');
                    const textEl = legend || label;
                    if (!textEl) continue;
                    this._optionNames.push(textEl.textContent.split(':')[0].trim());
                }
            },

            _setInitialSelection() {
                const first = this.variants.find((v) => v.available) || this.variants[0];
                if (!first) return;
                first.options.forEach((val, i) => {
                    const name = this._optionNameByPosition(i + 1);
                    if (name) this.selectedOptions[name] = val;
                });
                this.currentVariant = first;
                this.currentVariantId = first.id;
            },

            _optionNameByPosition(pos) {
                return this._optionNames[pos - 1] || null;
            },

            onVariantChange() {
                this._resolveVariant();
                this._dispatchChange();
            },

            _resolveVariant() {
                const match = this.variants.find((v) =>
                    v.options.every((val, i) => {
                        const name = this._optionNameByPosition(i + 1);
                        return name && this.selectedOptions[name] === val;
                    }),
                );

                this.currentVariant = match || null;
                this.currentVariantId = match?.id || null;
            },

            _dispatchChange() {
                const variant = this.currentVariant;
                const Events = ThemeEvents;
                const events = Events.events;
                const detail = {
                    sectionId: this.sectionId,
                    productId: this.productId,
                    variant,
                };

                Events.emit(events.PRODUCT_VARIANT_CHANGED, detail);

                if (variant?.featured_image?.position) {
                    const galleryDetail = {
                        index: variant.featured_image.position - 1,
                    };
                    if (this.galleryId) {
                        galleryDetail.id = this.galleryId;
                    }
                    Events.emit(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, galleryDetail);
                }

                this._updateUrl(variant);
            },

            _updateUrl(variant) {
                if (!variant || !this.updateUrl) return;
                const url = new URL(window.location);
                url.searchParams.set('variant', variant.id);
                window.history.replaceState({}, '', url);
            },

            isValueAvailable(optionName, value) {
                const test = {
                    ...this.selectedOptions,
                    [optionName]: value,
                };
                return this.variants.some((v) => {
                    if (!v.available) return false;
                    return v.options.every((val, i) => {
                        const name = this._optionNameByPosition(i + 1);
                        return !name || !(name in test) || test[name] === val;
                    });
                });
            },

            destroy() {
                this._eventScope?.dispose?.();
                this._eventScope = null;
                this.dispose();
            },
        };
    },

    QuantitySelector({ value = 1, min = 1, max = null, step = 1, sectionId = null } = {}) {
        return {
            ...useDisposable(),
            qty: value,
            min,
            max,
            step,
            canPurchase: true,
            surface: 'product',
            variantId: null,
            cartQuantity: 0,
            _eventScope: null,
            _sectionId: sectionId,
            _variant: null,
            _cartUnwatch: null,

            get canDecrement() {
                return this.canPurchase && this.qty > this.min;
            },
            get canIncrement() {
                if (!this.canPurchase) return false;
                if (this.max === null) return true;
                return this.qty + this.step <= this.max;
            },

            _constraintsApi() {
                return QuantityConstraints;
            },

            _cartItems() {
                return store('cart')?.items || [];
            },

            _parseConstraintsJson(raw) {
                if (!raw) return null;
                try {
                    const parsed = JSON.parse(raw);
                    return parsed && typeof parsed === 'object' ? parsed : null;
                } catch (_) {
                    return null;
                }
            },

            _applyResolved(resolved, { resetQty = false } = {}) {
                if (!resolved) return;
                this.min = resolved.min;
                this.max = resolved.max;
                this.step = resolved.step;
                this.canPurchase = resolved.canPurchase !== false;
                this.cartQuantity = resolved.cartQuantity || 0;

                if (!this.canPurchase) {
                    this.qty = this.max != null ? this.max : 0;
                } else if (resetQty || this.qty < this.min) {
                    this.qty = this.min;
                } else if (this.max !== null && this.qty > this.max) {
                    this.qty = this.max;
                }

                if (this.$el) {
                    this.$el.dataset.qtyCanPurchase = this.canPurchase ? 'true' : 'false';
                }
            },

            _resolveFromVariant(variant, { resetQty = false } = {}) {
                const api = this._constraintsApi();
                if (!api || !variant) return;

                let cartQuantity = this.cartQuantity;
                if (this.surface === 'product') {
                    cartQuantity = api.cartQuantityForVariant(variant.id, this._cartItems());
                }

                const resolved = api.fromVariant(variant, {
                    surface: this.surface,
                    cartQuantity,
                });
                this._variant = variant;
                this.variantId = variant.id || null;
                this._applyResolved(resolved, { resetQty });
            },

            _hydrateFromDataset() {
                const ds = this.$el?.dataset;
                if (!ds) return;

                this.surface = ds.qtySurface === 'cart' ? 'cart' : 'product';
                if (ds.qtySectionId) this._sectionId = ds.qtySectionId;
                if (ds.qtyVariantId) this.variantId = Number(ds.qtyVariantId) || null;
                if (ds.qtyMsgMax) this._msgMax = ds.qtyMsgMax;
                if (ds.qtyMsgMin) this._msgMin = ds.qtyMsgMin;
                if (ds.qtyMsgBelowMin) this._msgBelowMin = ds.qtyMsgBelowMin;
                if (ds.qtyMsgAboveMax) this._msgAboveMax = ds.qtyMsgAboveMax;

                const parsed = this._parseConstraintsJson(ds.qtyConstraints);
                if (parsed) {
                    this._applyResolved(
                        {
                            min: Number(parsed.min) || 1,
                            max: parsed.max == null ? null : Number(parsed.max),
                            step: Number(parsed.step) || 1,
                            cartQuantity: Number(parsed.cart_quantity) || 0,
                            canPurchase: parsed.can_purchase !== false,
                        },
                        { resetQty: true },
                    );
                    this.qty = Number(parsed.value);
                    if (!Number.isFinite(this.qty)) this.qty = this.min;
                    if (parsed.id || parsed.quantity_rule) {
                        this._variant = {
                            id: parsed.id || this.variantId,
                            quantity_rule: parsed.quantity_rule,
                            inventory_management: parsed.inventory_management,
                            inventory_policy: parsed.inventory_policy,
                            inventory_quantity: parsed.inventory_quantity,
                        };
                        this.variantId = this._variant.id || this.variantId;
                    }
                    return;
                }

                if (ds.qtyValue) this.qty = Number(ds.qtyValue) || 1;
                if (ds.qtyMin) this.min = Number(ds.qtyMin) || 1;
                if (ds.qtyMax && ds.qtyMax !== 'null') this.max = Number(ds.qtyMax);
                else this.max = null;
                if (ds.qtyStep) this.step = Number(ds.qtyStep) || 1;
                this.canPurchase = ds.qtyCanPurchase !== 'false';
                this.cartQuantity = Number(ds.qtyCartQuantity) || 0;
            },

            _syncFromCart() {
                if (this.surface !== 'product' || !this._variant) return;
                this._resolveFromVariant(this._variant, { resetQty: false });
                this._notify();
            },

            init() {
                this._hydrateFromDataset();

                const Events = ThemeEvents;
                const events = Events.events;
                this._eventScope = Events.createScope();

                const sectionId = this._sectionId;
                if (sectionId) {
                    const onVariantChange = (e) => {
                        if (e.detail?.sectionId !== sectionId) return;
                        const variant = e.detail.variant;
                        if (!variant) return;
                        this._resolveFromVariant(variant, { resetQty: true });
                        this._notify();
                    };
                    this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
                }

                if (this.surface === 'product') {
                    this.$nextTick(() => {
                        const cart = store('cart');
                        if (!cart || typeof this.$watch !== 'function') return;
                        this._cartUnwatch = this.$watch(
                            () => {
                                const current = store('cart');
                                return `${current?.item_count || 0}:${(current?.items || [])
                                    .map((item) => `${item.variant_id || item.id}:${item.quantity}`)
                                    .join(',')}`;
                            },
                            () => this._syncFromCart(),
                        );
                    });
                }
            },

            _snapToStep(raw) {
                const min = this.min;
                const step = this.step || 1;
                let next = raw;
                if (this.max !== null && next > this.max) next = this.max;
                if (next < min) next = min;
                const offset = next - min;
                const snapped = min + Math.round(offset / step) * step;
                next = snapped;
                if (this.max !== null && next > this.max) {
                    const floored = min + Math.floor((this.max - min) / step) * step;
                    next = Math.max(min, floored);
                }
                if (next < min) next = min;
                return next;
            },

            increment() {
                if (!this.canIncrement) {
                    this._toast(this._msgMax, '%%MAX%%', this.max);
                    return;
                }
                this.qty = this.qty + this.step;
                this._notify();
            },

            decrement() {
                if (!this.canDecrement) {
                    this._toast(this._msgMin, '%%MIN%%', this.min);
                    return;
                }
                this.qty = Math.max(this.min, this.qty - this.step);
                this._notify();
            },

            onInput() {
                const raw = parseInt(this.qty, 10);
                if (isNaN(raw) || raw < this.min) {
                    this._toast(this._msgBelowMin, '%%MIN%%', this.min);
                    this.qty = this.min;
                    this._notify();
                    return;
                }
                if (this.max !== null && raw > this.max) {
                    this._toast(this._msgAboveMax, '%%MAX%%', this.max);
                    this.qty = this.max;
                    this._notify();
                    return;
                }
                this.qty = this._snapToStep(raw);
                this._notify();
            },

            _notify() {
                const Events = ThemeEvents;
                const events = Events.events;
                const detail = {
                    value: this.qty,
                    min: this.min,
                    max: this.max,
                    step: this.step,
                    canPurchase: this.canPurchase,
                    variantId: this.variantId,
                };
                Events.emit(events.PRODUCT_QUANTITY_CHANGED, detail, {
                    target: this.$el,
                    bubbles: true,
                });
            },

            _toast(template, key, value) {
                const msg = template ? template.replace(key, String(value)) : '';
                if (msg) store('toast')?.show?.(msg, 'info');
            },

            destroy() {
                if (typeof this._cartUnwatch === 'function') this._cartUnwatch();
                this._cartUnwatch = null;
                this._eventScope?.dispose?.();
                this._eventScope = null;
                this._variant = null;
                this.dispose();
            },
        };
    },

    BuyButtons({
        sectionId,
        productFormId,
        available = true,
        variantId = null,
        successMessage = '',
        requestSections = '',
        showBuyNow = false,
        cartType = 'drawer',
        cartUrl = '',
    } = {}) {
        return {
            ...useDisposable(),
            sectionId,
            productFormId,
            available,
            variantId,
            successMessage,
            requestSections,
            showBuyNow,
            cartType,
            cartUrl,
            isLoading: false,
            canPurchaseQuantity: true,
            _eventScope: null,
            _buttonLabels: {
                addToCart: '',
                soldOut: '',
                maximumInCart: '',
                unavailable: '',
            },

            get buttonText() {
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

                if (dataset.showBuyNow !== undefined && dataset.showBuyNow !== '') {
                    this.showBuyNow = dataset.showBuyNow === 'true';
                }

                if (dataset.cartType !== undefined && dataset.cartType !== '') {
                    this.cartType = dataset.cartType;
                }

                if (dataset.cartUrl !== undefined && dataset.cartUrl !== '') {
                    this.cartUrl = dataset.cartUrl;
                }

                if (dataset.requestSections !== undefined) {
                    this.requestSections = dataset.requestSections
                        ? dataset.requestSections
                              .split(',')
                              .map((value) => value.trim())
                              .filter(Boolean)
                        : [];
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

                const api = QuantityConstraints;
                if (!api || !variant) {
                    this.canPurchaseQuantity = root?.dataset?.qtyCanPurchase !== 'false';
                    return;
                }

                const cartItems = store('cart')?.items || [];
                const cartQuantity = api.cartQuantityForVariant(variant.id, cartItems);
                const resolved = api.fromVariant(variant, {
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

            _getSections() {
                return Array.isArray(this.requestSections)
                    ? this.requestSections
                    : typeof this.requestSections === 'string' && this.requestSections.trim()
                      ? this.requestSections
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean)
                      : this.sectionId
                        ? [this.sectionId]
                        : [];
            },

            _getRecipientApi() {
                const root = this.$el?.querySelector?.('[data-gift-card-recipient]');
                if (!root) return null;
                return data(root);
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
                if (
                    !this.available ||
                    !this.variantId ||
                    this.isLoading ||
                    !this._quantityAllowsSubmit()
                )
                    return;

                const recipient = this._getRecipientApi();
                if (
                    recipient &&
                    typeof recipient.validate === 'function' &&
                    !recipient.validate()
                ) {
                    return;
                }

                this.isLoading = true;
                const cart = store('cart');
                if (!cart) {
                    this.isLoading = false;
                    return;
                }

                const sections = this._getSections();

                cart.add([this._buildCartItem()], sections)
                    .then(() => {
                        if (recipient && typeof recipient.resetAfterSuccess === 'function') {
                            recipient.resetAfterSuccess();
                        }

                        if (this.cartType === 'page') {
                            if (this.successMessage) {
                                store('toast')?.show?.(this.successMessage, 'success');
                            }
                            window.location.assign(this.cartUrl);
                        } else {
                            if (this.successMessage) {
                                store('toast')?.show?.(this.successMessage, 'success');
                            }
                        }
                    })
                    .catch((err) => {
                        if (recipient && typeof recipient.displayCartErrors === 'function') {
                            recipient.displayCartErrors(err);
                        }
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            },

            buyNow() {
                if (
                    !this.available ||
                    !this.variantId ||
                    this.isLoading ||
                    !this._quantityAllowsSubmit()
                )
                    return;

                const recipient = this._getRecipientApi();
                if (recipient?.enabled) {
                    return;
                }
                if (
                    recipient &&
                    typeof recipient.validate === 'function' &&
                    !recipient.validate()
                ) {
                    return;
                }

                this.isLoading = true;
                const cart = store('cart');
                if (!cart) {
                    this.isLoading = false;
                    return;
                }

                cart.add([this._buildCartItem()], [])
                    .then(() => {
                        window.location.assign(
                            (window.Shopify?.routes?.root || '/').replace(/\/+$/, '') + '/checkout',
                        );
                    })
                    .catch((err) => {
                        if (recipient && typeof recipient.displayCartErrors === 'function') {
                            recipient.displayCartErrors(err);
                        }
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            },

            destroy() {
                this._eventScope?.dispose?.();
                this._eventScope = null;
                this.dispose();
            },
        };
    },
};

export const { VariantPicker, QuantitySelector, BuyButtons } = components;
