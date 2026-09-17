# JS1 Stage 1 — Preflight Manifest

Read-only inventory recorded 2026-09-17 before JavaScript module migration. Source: `assets/base.js` `initAlpine()` registrations (lines 491–540), factory definitions in `assets/alpine.components.*.js`, and Liquid `x-data` consumers in `sections/`, `snippets/`, and `blocks/`.

Disposition derives from the D24 keep list in `docs/agent/context.md` (accepted runtime contract and Skeleton inventory): retained main sections are `404`, `article`, `blog`, `cart`, `collection`, `collections`, `page`, `password`, `product`, `search`, `header`, `footer`, `custom-liquid`, and `main-page-contact`, plus retained snippet clusters (`filters-field`, `filter-vertical`, `sort-by-dropdown`, `product-media`, `product-gallery`, `media-video`, `header-dropdown-menu`, and Tier 1 product/localization snippets). Cut-list sections still referenced by `templates/*.json` or `sections/*.json` stay on the classic path per the JS1 gate.

## Component Registry

| registered constant | factory function | defining file | Liquid consumers | owning section | disposition | proposed module id | load trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DROPDOWN` | `dropdown` | `assets/alpine.components.ui.js` | `snippets/header-dropdown-menu.liquid`; `snippets/header-dropdown-super-menu.liquid`; `snippets/sort-by-dropdown.liquid` | `header` | convert | `dropdown` | interaction |
| `MOBILEMENUDRAWER` | `mobileMenuDrawer` | `assets/alpine.components.header.js` | `snippets/header-mobile-menu-drawer.liquid` | `header` | convert | `mobile-menu-drawer` | interaction |
| `DRAGSCROLL` | `dragScroll` | `assets/alpine.components.ui.js` | `sections/collection.liquid`; `snippets/header-dropdown-super-menu.liquid`; `snippets/product-card-variant-panel.liquid`; `snippets/product-card.liquid`; `snippets/product-gallery-thumbnails.liquid` | multiple | convert | `drag-scroll` | interaction |
| `STICKY_HEADER` | `stickyHeader` | `assets/alpine.components.header.js` | `sections/header.liquid` | `header` | convert | `sticky-header` | immediate |
| `TABCONTROL` | `tabControl` | `assets/alpine.components.ui.js` | `snippets/tab-control.liquid`; `snippets/search-results-tabs.liquid`; `sections/blog.liquid`; `sections/featured-products.liquid`; `sections/search-overlay.liquid`; `snippets/header-dropdown-super-menu.liquid`; `snippets/search-predictive-panel.liquid` | multiple | convert | `tab-control` | interaction |
| `BEFOREAFTERCOMPARISON` | `beforeAfterComparison` | `assets/alpine.components.product-media.js` | `sections/before-after-comparison.liquid` | `before-after-comparison` | classic-retain | `before-after-comparison` | interaction |
| `COUNTDOWNTIMER` | `countdownTimer` | `assets/alpine.components.ui.js` | `sections/promotion-countdown.liquid` | `promotion-countdown` | classic-retain | `countdown-timer` | immediate |
| `SECTIONPAGINATION` | `sectionPagination` | `assets/alpine.components.pagination.js` | `sections/blog.liquid` | `blog` | convert | `section-pagination` | interaction |
| `COLLECTIONFILTERS` | `collectionFilters` | `assets/alpine.components.filters.js` | `sections/collection.liquid` | `collection` | convert | `collection-filters` | immediate |
| `SEARCHFILTERS` | `searchFilters` | `assets/alpine.components.filters.js` | `snippets/search-results-tabs.liquid` | `search` | convert | `search-filters` | immediate |
| `COLLECTIONNAVIGATIONCATALOG` | `collectionNavigationCatalog` | `assets/alpine.components.filters.js` | `sections/collection.liquid` | `collection` | convert | `collection-navigation-catalog` | interaction |
| `COLLECTIONFILTERFIELD` | `collectionFilterField` | `assets/alpine.components.filters.js` | `snippets/filters-field.liquid` | `collection` | convert | `collection-filter-field` | interaction |
| `PROGRESSIVELIST` | `progressiveList` | `assets/alpine.components.ui.js` | `snippets/filters-field.liquid` | `collection` | convert | `progressive-list` | viewport |
| `PRODUCTGALLERY` | `productGallery` | `assets/alpine.components.product-media.js` | `snippets/product-gallery.liquid` | `product` | convert | `product-gallery` | immediate |
| `PRODUCTPRICE` | `ProductPrice` | `assets/alpine.components.product.js` | `snippets/product-info-blocks.liquid`; `snippets/product-purchase-stack.liquid` | `product` | convert | `product-price` | immediate |
| `PRODUCTPAYMENTTERMS` | `ProductPaymentTerms` | `assets/alpine.components.product.js` | `snippets/product-info-blocks.liquid`; `snippets/product-purchase-stack.liquid` | `product` | convert | `product-payment-terms` | immediate |
| `VARIANTPICKER` | `VariantPicker` | `assets/alpine.components.product.js` | `snippets/product-variant-picker.liquid` | `product` | convert | `variant-picker` | immediate |
| `QUANTITYSELECTOR` | `QuantitySelector` | `assets/alpine.components.product.js` | `snippets/quantity-selector.liquid`; `sections/cart.liquid` | multiple | convert | `quantity-selector` | immediate |
| `BUYBUTTONS` | `BuyButtons` | `assets/alpine.components.product.js` | `snippets/buy-buttons.liquid` | `product` | convert | `buy-buttons` | immediate |
| `SELLINGPLANPICKER` | `SellingPlanPicker` | `assets/alpine.components.product.js` | `snippets/selling-plan-picker.liquid` | `product` | convert | `selling-plan-picker` | immediate |
| `GIFTCARDRECIPIENT` | `GiftCardRecipient` | `assets/alpine.components.product.js` | `snippets/gift-card-recipient-form.liquid` | `product` | convert | `gift-card-recipient` | immediate |
| `PICKUPAVAILABILITY` | `PickupAvailability` | `assets/alpine.components.product.js` | `snippets/pickup-availability-inline.liquid` | `product` | convert | `pickup-availability` | immediate |
| `PREDICTIVESEARCH` | `predictiveSearch` | `assets/alpine.components.search.js` | `sections/search.liquid`; `sections/search-overlay.liquid` | multiple | convert | `predictive-search` | interaction |
| `RELATEDPRODUCTS` | `relatedProducts` | `assets/alpine.components.product-cards.js` | `snippets/product-recommendations-section.liquid` | `product-recommendations` | classic-retain | `related-products` | viewport |
| `NEWSLETTERBANNER` | `newsletterBanner` | `assets/alpine.components.overlays.js` | `sections/newsletter-banner.liquid` | `newsletter-banner` | classic-retain | `newsletter-banner` | interaction |
| `NEWSLETTEROVERLAY` | `newsletterOverlay` | `assets/alpine.components.overlays.js` | `sections/newsletter-overlay.liquid` | `newsletter-overlay` | classic-retain | `newsletter-overlay` | interaction |
| `CARTPAGE` | `cartPage` | `assets/alpine.components.overlays.js` | `sections/cart.liquid` | `cart` | convert | `cart-page` | immediate |
| `CARTOVERLAY` | `cartOverlay` | `assets/alpine.components.overlays.js` | `sections/cart-overlay.liquid` | `cart-overlay` | classic-retain | `cart-overlay` | interaction |
| `CARDGALLERY` | `cardGallery` | `assets/alpine.components.product-cards.js` | `snippets/predictive-search-product-card.liquid` | `search` | convert | `card-gallery` | interaction |
| `PRODUCTCARD` | `productCard` | `assets/alpine.components.product-cards.js` | `snippets/product-card.liquid` | multiple | convert | `product-card` | viewport |
| `IMAGELIGHTBOX` | `imageLightbox` | `assets/alpine.components.product-media.js` | `snippets/image-lightbox.liquid`; `snippets/product-gallery.liquid` | `product` | convert | `image-lightbox` | interaction |
| `IMAGEMAGNIFIER` | `imageMagnifier` | `assets/alpine.components.product-media.js` | `snippets/image-magnifier.liquid`; `snippets/product-gallery-thumbnails.liquid`; `snippets/product-gallery-carousel.liquid`; `snippets/product-gallery-grid.liquid`; `snippets/product-gallery-stacked.liquid`; `snippets/product-media.liquid`; `sections/scroll-categories.liquid` | multiple | convert | `image-magnifier` | interaction |
| `PRODUCTLAYOUT` | `productLayout` | `assets/alpine.components.product.js` | `sections/product.liquid`; `sections/featured-product.liquid` | multiple | convert | `product-layout` | immediate |
| `ACCORDION` | `accordion` | `assets/alpine.components.ui.js` | `snippets/accordion.liquid`; `snippets/cart-summary-accordion.liquid`; `snippets/filters-groups.liquid`; `sections/promise-section.liquid` | multiple | convert | `accordion` | interaction |
| `LOCALIZATIONSWITCHER` | `localizationSwitcher` | `assets/alpine.components.ui.js` | `snippets/localization-switcher.liquid` | `announcement-bar` | classic-retain | `localization-switcher` | interaction |
| `SORTBYDROPDOWN` | `sortByDropdown` | `assets/alpine.components.ui.js` | `snippets/sort-by-dropdown.liquid` | `collection` | convert | `sort-by-dropdown` | interaction |
| `FLIPDIGIT` | `flipDigit` | `assets/alpine.components.ui.js` | `snippets/flip-digit.liquid` | `promotion-countdown` | classic-retain | `flip-digit` | immediate |
| `TOASTCONTAINER` | `toastContainer` | `assets/alpine.components.ui.js` | `snippets/ui-toast.liquid` | `layout/theme.liquid` | convert | `toast-container` | immediate |
| `MOTIONREVEALSECTION` | `motionRevealSection` | `assets/alpine.components.ui.js` | `sections/404.liquid`; `sections/about-stats.liquid`; `sections/article.liquid`; `sections/before-after-comparison.liquid`; `sections/blog-stories.liquid`; `sections/blog.liquid`; `sections/brand-statement.liquid`; `sections/category-grid.liquid`; `sections/collection.liquid`; `sections/collections.liquid`; `sections/featured-product.liquid`; `sections/featured-products.liquid`; `sections/footer.liquid`; `sections/icon-with-text.liquid`; `sections/main-page-about.liquid`; `sections/main-page-contact.liquid`; `sections/newsletter-banner.liquid`; `sections/page.liquid`; `sections/philosophy-section.liquid`; `sections/product-comparison-table.liquid`; `sections/promo-bannder.liquid`; `sections/promotion-countdown.liquid`; `sections/promise-section.liquid`; `sections/routine-showcase.liquid`; `sections/scroll-categories.liquid`; `sections/slides-show.liquid`; `sections/testimonial-featured.liquid`; `sections/video-banner.liquid`; `snippets/product-recommendations-section.liquid`; `snippets/search-results-tabs.liquid` | multiple | convert | `motion-reveal-section` | viewport |
| `PRODUCTMEDIAMODAL` | `productMediaModal` | `assets/alpine.components.product-media.js` | `snippets/product-media-modal.liquid` | `product` | convert | `product-media-modal` | interaction |
| `MEDIAVIDEO` | `mediaVideo` | `assets/alpine.components.product-media.js` | `snippets/media-video.liquid` | multiple | convert | `media-video` | interaction |

## Counts

| disposition | count |
| --- | --- |
| `convert` | 33 |
| `classic-retain` | 8 |
| `orphan` | 0 |

Total rows: **41** (matches `Factory.register` call count in `assets/base.js`).

## Anomalies

### Factory defined but never registered

| factory function | defining file | Liquid consumer | notes |
| --- | --- | --- | --- |
| `stickyViewportPanel` | `assets/alpine.components.ui.js` | `sections/article.liquid`; `sections/collection.liquid` | `x-data="stickyViewportPanel"` with no matching `Factory.register()` in `initAlpine()` |

### Registered constant with no defining file

None.

### Duplicate proposed module id

None. Sorted `proposed module id` values are all unique (41 distinct kebab-case strings).

### Components with multiple owning sections

| registered constant | owning sections |
| --- | --- |
| `DRAGSCROLL` | `collection`, `header`, `product` (via cards/gallery snippets) |
| `TABCONTROL` | `blog`, `search`, `featured-products`, `search-overlay`, `header` |
| `QUANTITYSELECTOR` | `product`, `cart` |
| `PREDICTIVESEARCH` | `search`, `search-overlay` |
| `PRODUCTCARD` | `collection`, `featured-products`, `product-recommendations`, `search`, and other cut-list sections via `product-card` snippet |
| `IMAGEMAGNIFIER` | `product`, `scroll-categories` |
| `PRODUCTLAYOUT` | `product`, `featured-product` |
| `ACCORDION` | `cart`, `collection`, `promise-section` |
| `MEDIAVIDEO` | `product` (via `product-media`), `video-banner` |
| `MOTIONREVEALSECTION` | 27 section files plus 2 snippets; spans both keep-list and cut-list sections |

### Liquid `x-data` without a registered factory (not in the 41-row table)

These inline Alpine scopes are not `initAlpine()` registrations:

| x-data pattern | Liquid files |
| --- | --- |
| `x-data="{ index: null }"` | `sections/blog.liquid`; `sections/featured-products.liquid`; `sections/search-overlay.liquid`; `snippets/header-dropdown-super-menu.liquid`; `snippets/search-predictive-panel.liquid`; `snippets/search-results-tabs.liquid` |
| `x-data="{ hover: false }"` / `x-data="{hover:false}"` | `sections/routine-showcase.liquid`; `sections/scroll-categories.liquid` |
| `x-data="{ activeFilter: null }"` | `snippets/filter-horizontal.liquid` |
| `x-data="{ inView: false }"` | `snippets/rotating-badge.liquid` |
| `x-data="{ activeImage: 'primary' }"` | `sections/about-stats.liquid` |
| `x-data="{ playing: false }"` | `sections/video-banner.liquid` |
| `x-data="{}"` | `snippets/ui-dialog.liquid` |

### UNKNOWN columns

None. Every table cell is populated.

## Store and Adapter Surface

Every distinct use of `window.Alpine`, `$store`, `Alpine.store`, `initTree`, and `destroyTree` under `assets/` (including vendor Alpine plugins). Line numbers refer to the working tree at manifest time.

### `window.Alpine`

| file | line | usage |
| --- | --- | --- |
| `assets/base.js` | 469 | `window.Alpine.store('toast', Stores.toast)` |
| `assets/base.js` | 470 | `window.Alpine.store('dialog', Stores.dialog)` |
| `assets/base.js` | 480 | `window.Alpine.store('cart', Stores.cart)` |
| `assets/base.js` | 481 | `window.Alpine.store('cart').hydrate(initialCartData)` |
| `assets/base.js` | 490 | `Factory.init?.(window.Alpine)` |
| `assets/https.js` | 230 | `const alpine = window.Alpine` |
| `assets/alpine.components.filters.js` | 48 | `window.Alpine?.$data?.(componentRoot)` |
| `assets/alpine.components.filters.js` | 473 | `window.Alpine?.store?.('dialog')` |
| `assets/alpine.components.product.js` | 399 | `window.Alpine?.store?.('cart')?.items` |
| `assets/alpine.components.product.js` | 526 | `window.Alpine?.store?.('cart')` |
| `assets/alpine.components.product.js` | 530 | `window.Alpine.store('cart')` |
| `assets/alpine.components.product.js` | 616 | `window.Alpine?.store('toast')?.show?.(...)` |
| `assets/alpine.components.product.js` | 1084 | `window.Alpine?.store?.('cart')?.items` |
| `assets/alpine.components.product.js` | 1133 | `typeof window.Alpine?.$data !== 'function'` |
| `assets/alpine.components.product.js` | 1134 | `window.Alpine.$data(root)` |
| `assets/alpine.components.product.js` | 1193 | `window.Alpine?.store('cart')` |
| `assets/alpine.components.product.js` | 1209 | `window.Alpine?.store('toast')?.show?.(...)` |
| `assets/alpine.components.product.js` | 1217 | `window.Alpine?.store('dialog')?.open?.(...)` |
| `assets/alpine.components.product.js` | 1221 | `window.Alpine?.store('toast')?.show?.(...)` |
| `assets/alpine.components.product.js` | 1260 | `window.Alpine?.store('cart')` |
| `assets/alpine.components.product-media.js` | 88 | `window.Alpine.store('dialog').open(dialogId)` |
| `assets/alpine.components.product-media.js` | 830 | `window.Alpine?.store?.('dialog')` |
| `assets/alpine.components.product-media.js` | 834 | `window.Alpine?.store?.('dialog')` |
| `assets/alpine.components.search.js` | 322 | `window.Alpine?.store?.('toast')` |
| `assets/alpine.components.ui.js` | 993 | `window.Alpine?.$data?.(dropdown)` |
| `assets/alpine.components.overlays.js` | 17 | `window.Alpine?.store('toast')?.show?.(...)` |
| `assets/alpine.components.overlays.js` | 653 | `window.Alpine?.store('toast')` |
| `assets/alpine.store.cart.js` | 265 | `window.Alpine?.store('toast')` |
| `assets/vendor-alpine-intersect.min.js` | 1 | `window.Alpine.plugin(o)` on `alpine:init` |

### `$store`

| file | line | usage |
| --- | --- | --- |
| `assets/alpine.components.ui.js` | 1063 | `this.$store.toast.configure({...})` |
| `assets/alpine.components.ui.js` | 1067 | `this.$store.cart.configure({...})` |
| `assets/alpine.components.ui.js` | 1082 | `this.$store.toast.show(...)` |
| `assets/alpine.components.filters.js` | 724 | `this.$watch('$store.dialog.active', ...)` |
| `assets/alpine.components.product-cards.js` | 311 | `this.$store?.dialog?.open?.(...)` |
| `assets/alpine.components.product-cards.js` | 325 | `this.$store?.cart` |
| `assets/alpine.components.product-cards.js` | 336 | `this.$store?.toast?.show?.(...)` |
| `assets/alpine.components.product-cards.js` | 348 | `this.$store?.dialog?.open?.(...)` |
| `assets/alpine.components.product-cards.js` | 354 | `this.$store?.toast?.show?.(...)` |
| `assets/alpine.components.search.js` | 322 | `this.$store?.toast` |
| `assets/alpine.components.overlays.js` | 141 | `this.$store?.dialog?.open?.(...)` |
| `assets/alpine.components.overlays.js` | 145 | `this.$store?.dialog?.close?.()` |
| `assets/alpine.components.overlays.js` | 184 | `this.$store?.cart?.registerSection?.(...)` |
| `assets/alpine.components.overlays.js` | 455 | `this.$store?.cart \|\| {...}` |
| `assets/alpine.components.overlays.js` | 533 | `this.$store?.dialog?.active === this.dialogId` |
| `assets/alpine.components.overlays.js` | 654 | `this.$store?.cart?._errorMessages?.generic` |

### `Alpine.store` (via `window.Alpine.store` / optional chaining)

Covered by the `window.Alpine` table rows that call `.store(...)`. Distinct store names touched: `toast`, `dialog`, `cart`.

Store registration occurs only in `assets/base.js` lines 469–481 inside `initAlpine()`.

### `initTree`

| file | line | usage |
| --- | --- | --- |
| `assets/https.js` | 238 | `alpine.initTree(nextTarget)` after Section Rendering HTML replacement |

### `destroyTree`

| file | line | usage |
| --- | --- | --- |
| `assets/https.js` | 232 | `alpine.destroyTree(target)` before Section Rendering HTML replacement |
