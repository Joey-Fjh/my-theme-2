# JavaScript Runtime Reference

This reference stores JavaScript runtime public contracts that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file when implementing or reviewing JavaScript runtime behavior, module loading, lifecycle code, Alpine components or stores, ThemeEvents, ShopifyHttp, SectionRefresher, or script load order.

Inspect current source for exact method lists, tuning constants, and implementation internals.

## Architecture

The Skeleton runtime is a no-bundler ES module graph. Liquid markup declares behaviour; the core discovers roots from the DOM and loads modules on demand. Third-party UI libraries are touched only through the adapter.

| Layer | Files | Responsibility |
| --- | --- | --- |
| Core (always loaded) | `base.js`, `events.js` | Layout measurement, legacy `Components` lifecycle for `{%- javascript -%}` sections, module scanning, store bootstrap |
| Adapter | `alpine.adapter.js` | Sole Alpine touchpoint: `ready`, `define`, `defer`, `mount`, `unmount`, `store`, `useDisposable` |
| On-demand modules | `utils.js`, `https.js`, component entry files, `alpine.components.*.js` groups | Shared utilities, HTTP/section refresh, Alpine factories registered through the adapter |
| Platform state | `cart.contract.js` | Cart API ownership, hydrated from `body.dataset.initialCart` |
| UI state bridges | `alpine.store.toast.js`, `alpine.store.dialog.js`, `alpine.store.cart.js` | Toast, dialog, and cart UI stores registered by the core through the adapter |

The core does not import component names. It reads `data-module-id` on DOM roots, resolves the identifier through the import map in `layout/theme.liquid`, and calls dynamic `import()`.

## Script Load Order

`layout/theme.liquid` loads, in order:

1. Import map — bare specifiers such as `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, `components/*`, and one specifier per component entry module.
2. One module entry — `<script type="module" src="{{ 'base.js' | asset_url }}">`.
3. Two classic vendor scripts — `vendor-alpine-intersect.min.js`, then `vendor-alpine.min.js` (Alpine MUST run after the module entry so the core can defer roots and queue store registration first).

There is no classic path for theme stores, utilities, or component definitions. Shopify injects the `es-module-shims` polyfill when needed; the theme ships none.

## Module Discovery Contract

Component roots declare a module identifier and an Alpine factory name:

```html
<footer
    x-data="motionRevealSection()"
    data-module-id="motion-reveal-section"
></footer>
```

Each component entry file (for example `buy-buttons.js`) imports factories from an `alpine.components.*.js` group, calls `define(name, factory)` from `alpine-adapter`, and exports nothing the core reads directly.

The core (`base.js`) scans `[data-module-id]`, imports each identifier once, and calls `adapter.mount(el)` after the module defines its factory. `motion-reveal-section`, `progressive-list`, and `section-pagination` may lazy-load through `IntersectionObserver` until they intersect the viewport.

Pass Liquid-driven runtime values through `data-*`, then read `this.$el.dataset` inside the component factory. Do not embed Liquid JSON or quote-heavy values directly in `x-data`.

## Adapter API

Only `alpine.adapter.js` may call `window.Alpine` APIs.

| Export | Purpose |
| --- | --- |
| `ready()` | Resolves when Alpine is available |
| `define(name, factory)` | Registers `alpine.data(name, …)` before or during startup |
| `defer(el)` | Sets `x-ignore` until the module has defined its factory |
| `mount(el)` | Removes deferral and calls `Alpine.initTree(el)` |
| `unmount(el)` | Calls `Alpine.destroyTree(el)` |
| `store(name, value)` | Registers a global Alpine store |
| `useDisposable()` | Helper for listener/observer cleanup in component factories |

Component modules call `define` themselves. The core never holds a manifest of component names.

## ThemeEvents

Cross-section and cross-component communication must use `ThemeEvents`. Import the default export from the `events` import-map specifier:

```javascript
import ThemeEvents from 'events';

ThemeEvents.emit(ThemeEvents.events.PRODUCT_VARIANT_CHANGED, { variant });

const off = ThemeEvents.on(ThemeEvents.events.PRODUCT_VARIANT_CHANGED, (e) => {
    console.log(e.detail.variant);
});

const scope = ThemeEvents.createScope({ target: el });
scope.on('click', handler);
scope.dispose();
```

Predefined event names live in `ThemeEvents.events` inside `events.js`. When adding new cross-component events, add them there.

Do not use bare `document` listeners in Liquid or ad-hoc globals for cross-component signalling.

## Legacy Components Engine

`base.js` still exports `Components` for `{%- javascript -%}` blocks that register section/block behaviour with `data-component-type` and `data-component-id`. That path is separate from the module system and remains for sections not yet converted to `data-module-id`.

`Components.register(type, handlers, options)` supports `init`, `destroy`, `select`, `deselect`, and optional lazy init via `IntersectionObserver`. Inspect `assets/base.js` and any section still using `{%- javascript -%}` for the current pattern.

New interactive behaviour should use `data-module-id` and a component entry module, not new `Components.register()` calls, unless the section is explicitly retained on the classic path.

## ShopifyHttp And SectionRefresher

Import from the `https` import-map specifier:

```javascript
import ShopifyHttp, { SectionRefresher, HttpError } from 'https';

const data = await ShopifyHttp.getJSON('/cart.js');
const result = await ShopifyHttp.postJSON('/cart/add.js', { items: [...] });

SectionRefresher.render(sectionHtmlMap, {
    cart: {
        targetSelector: '#shopify-section-cart',
        innerSelectors: ['.cart-items', '.cart-total'],
    },
});

SectionRefresher.updateText([{ selector: '.cart-count', text: '3' }]);
```

Application HTTP must use `ShopifyHttp`; raw `fetch()` belongs only in `assets/https.js` or vendor files. Section HTML replacement must use `SectionRefresher.render()`.

After a section refresh, `SectionRefresher` rescans module roots and re-inits legacy `Components` instances inside the updated region.

## Cart State Ownership

Platform cart state lives in `cart.contract.js`. The contract hydrates from `document.body.dataset.initialCart`, mutates through the Cart API, and notifies subscribers.

The Alpine `$store.cart` bridge in `alpine.store.cart.js` mirrors contract state into reactive UI properties and owns merchant-facing error copy and failure toasts. Storefront cart mutations must go through `$store.cart` (which delegates to the contract), not direct Cart API calls from component code.

## Global UI Stores

The core registers stores during startup:

| Store | Module | Role |
| --- | --- | --- |
| `toast` | `alpine.store.toast.js` | Transient notifications |
| `dialog` | `alpine.store.dialog.js` | Dialog/drawer open state, focus trap, scroll lock via `dialog-motion.js` / `drawer-motion.js` |
| `cart` | `alpine.store.cart.js` | UI bridge over `createCartContract()` |

Inspect the store modules for configure/init APIs instead of copying historical examples.

## Shared Modules

| Module | Import specifier | Role |
| --- | --- | --- |
| `utils.js` | `utils` | `debounce`, scroll-behavior helpers, `prefersReducedMotion`, `scrollToTop` |
| `quantity-constraints.js` | relative import from component groups | Pure quantity min/max/step math |
| `dialog-motion.js`, `drawer-motion.js` | relative import from store/component groups | Dialog and drawer transition helpers |
| `performance.js` | dynamic import from `base.js` when `?debug=true` or `Shopify.designMode` | Debug-only CWV logging |

## Motion Runtime Boundary

Ordinary motion uses semantic `data-motion-*` hooks, Alpine components such as `motionRevealSection()`, and CSS rules in `tailwind/tailwind.animates.css`.

The theme has no active GSAP runtime namespace. Do not add GSAP during ordinary motion work. Read `docs/references/architecture/motion-architecture.md` for classification and ownership.

## CSS / Alpine Boundary

- Alpine owns state and trigger behaviour through adapter-registered factories and stores.
- `tailwind.animates.css` owns animation capability and reveal CSS.
- GSAP is optional narrative choreography only and must not share `opacity` or `transform` ownership with Alpine/CSS on the same element.

## File Ownership

| Area | Location |
| --- | --- |
| Vendor runtime | `vendor-alpine*.min.js` (never edit) |
| Core | `base.js`, `events.js` |
| Adapter | `alpine.adapter.js` |
| Cart contract | `cart.contract.js` |
| Alpine component groups | `alpine.components.*.js` |
| Component entry modules | `accordion.js`, `buy-buttons.js`, … one file per import-map identifier |
| Alpine stores | `alpine.store.toast.js`, `alpine.store.dialog.js`, `alpine.store.cart.js` |
| HTTP and section refresh | `https.js` |
| Shared utilities | `utils.js`, `quantity-constraints.js`, motion helpers |

## Inspection Rule

For section lifecycle, cart flow, HTTP refresh, events, accessibility semantics, and script loading, inspect current `layout/theme.liquid`, `sections/`, `snippets/`, and `assets/` implementations instead of deleted pre-migration patterns.
