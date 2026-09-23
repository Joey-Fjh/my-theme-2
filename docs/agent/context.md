# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-24.

## Plan: batch F, JavaScript by feature and leftover cleanup

**Status:** complete (user acceptance 2026-09-24).

**Authorization:** the user authorized this batch on 2026-09-24 ("可以"), after agreeing to the direction and asking that the scan run in the external execution ("这个扫描的话，交给执行prompt吧").

**Decision (user, 2026-09-24):** organize theme JavaScript by feature, as in the user's earlier theme and in Horizon's organization: one feature, one file, named after the feature, so a page's behavior maps to one file ("这个页面可能对应一个文件的功能"). Alpine stays. Checked against shopify.dev "Performance best practices" (fetched 2026-09-24; Shopify Dev MCP unavailable): import maps with bare specifiers instead of bundlers, dynamic `import()` so a page loads only the components it uses, and removing unused theme scripts. Shopify's docs set no file-naming rule; `assets/` stays flat.

**Review tier:** Ask (assets/*.js; import map in `layout/theme.liquid`; deletions; reference changes; external execution prompt).

**Outcome:** each interactive feature has one file under `assets/` holding its Alpine factory and its `define()` call; the `alpine.components.*.js` group files and their `components/*` import-map keys are gone; shared logic lives only in shared modules; JavaScript with no consumer is gone; behavior is unchanged.

**Dependencies:** none.

### Implementation surface

`assets/*.js` except `vendor-alpine.min.js`; the import map and module-related markup in `layout/theme.liquid`; Liquid `data-*` attributes and the quantity-constraints Liquid in `snippets/buy-buttons.liquid`, `snippets/quantity-selector.liquid`, `snippets/quantity-constraints.liquid`, and `snippets/css-variables.liquid` (`--announcement-bar-height` only); `docs/references/architecture/javascript-runtime.md`; `docs/agent/board.md` and `docs/agent/context.md`.

Forbidden: `vendor-alpine.min.js`, `THIRD_PARTY_NOTICES.md`, schema settings, `config/*`, `templates/*.json`, `sections/*-group.json`, locale keys other than ones left unused, CSS other than the announcement variable, and any change to Alpine component names, `data-module-id` values, or behavior.

### Acceptance checks

1. `git ls-files assets` shows no `alpine.components.*.js`; the import map has no `components/*` key; every import-map entry points to an existing asset, and every `import` specifier in `assets/*.js` resolves (a script that parses each module and checks its specifiers, recorded).
2. Every `data-module-id` in Liquid has an import-map key whose file calls `define()` with every `x-data` name that module's markup uses; every `x-data` name in Liquid is defined by exactly one module.
3. No duplicated logic: a comparison of function bodies across feature files finds no copied helper; shared code is imported.
4. Progress lists every removed method, property, event, export, CSS variable, and `data-*` attribute with its no-consumer evidence, and every kept item that looked dead with the reason.
5. Per page type (product, collection, cart, blog, search, header only): the modules loaded before and after, from `data-module-id` usage and the import graph; the cart page no longer loads the variant picker or buy buttons.
6. `npm.cmd run lint` (includes `lint:compat` for `assets/*.js` and the Alpine-expression check), `npm.cmd test`, `npm.cmd run doctor:agent`, `npm.cmd run lint:doc-paths`, and `shopify.cmd theme check --fail-level suggestion` pass; prettier passes on every changed file; `git diff --stat` stays inside the surface.

### Browser pass (user)

Header dropdown menus (mouse and keyboard), localization menus (open, Escape, align at the viewport edge), product page (variant change updates price, image, availability, and URL; quantity rules; add to cart with success and error states; dynamic checkout), cart page (change quantity, remove, line errors), collection and blog pagination with back and forward, product gallery, product collapsible tabs, gift card copy button, and the browser console free of errors on each page.

## Progress (batch F)

### (a) Import graph — `assets/*.js` and import map (`layout/theme.liquid`)

**Import map keys (15):** `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, `accordion`, `buy-buttons`, `cart-page`, `dropdown`, `localization-switcher`, `product-gallery`, `quantity-selector`, `section-pagination`, `variant-picker`. No `components/*` keys.

**Static and dynamic imports per file:**

| File | Imports |
| --- | --- |
| `accordion.js` | `alpine-adapter` |
| `alpine.adapter.js` | (none) |
| `alpine.store.cart.js` | (none) |
| `base.js` | `events`, `alpine-adapter`, `cart-contract`, `./alpine.store.cart.js`; dynamic `import('./performance.js')` |
| `buy-buttons.js` | `alpine-adapter`, `utils`, `events`, `./quantity-constraints.js` |
| `cart-page.js` | `alpine-adapter` |
| `cart.contract.js` | `https` |
| `dropdown.js` | `alpine-adapter` |
| `events.js` | (none) |
| `gift-card.js` | (none; classic defer, not in import map) |
| `https.js` | `alpine-adapter`, `base` |
| `localization-switcher.js` | `alpine-adapter`, `utils` |
| `performance.js` | (none) |
| `product-gallery.js` | `alpine-adapter`, `utils`, `events` |
| `quantity-constraints.js` | (none) |
| `quantity-selector.js` | `alpine-adapter`, `utils`, `events`, `./quantity-constraints.js` |
| `section-pagination.js` | `alpine-adapter`, `utils`, `https` |
| `utils.js` | (none) |
| `variant-picker.js` | `alpine-adapter`, `utils`, `events` |

**Deleted group files (no longer in graph):** `alpine.components.ui.js`, `alpine.components.product.js`, `alpine.components.overlays.js`, `alpine.components.pagination.js`, `alpine.components.product-media.js`.

### (b) Factory → feature file → Liquid usage

| Factory | Feature file | `define()` name | `data-module-id` | Liquid `x-data` | Markup location |
| --- | --- | --- | --- | --- | --- |
| `accordion` | `accordion.js` | `accordion` | `accordion` | `accordion` | `snippets/accordion.liquid` |
| `dropdown` | `dropdown.js` | `dropdown` | `dropdown` | `dropdown` | `snippets/header-dropdown-menu.liquid` |
| `localizationSwitcher` | `localization-switcher.js` | `localizationSwitcher` | `localization-switcher` | `localizationSwitcher` | `snippets/localization-switcher.liquid` |
| `cartPage` | `cart-page.js` | `cartPage` | `cart-page` | `cartPage()` | `sections/cart.liquid` |
| `productGallery` | `product-gallery.js` | `productGallery` | `product-gallery` | `productGallery` | `snippets/product-gallery.liquid` |
| `sectionPagination` | `section-pagination.js` | `sectionPagination` | `section-pagination` | `sectionPagination()` | `sections/collection.liquid`, `sections/blog.liquid` |
| `VariantPicker` | `variant-picker.js` | `VariantPicker` | `variant-picker` | `VariantPicker()` | `snippets/product-variant-picker.liquid` |
| `QuantitySelector` | `quantity-selector.js` | `QuantitySelector` | `quantity-selector` | `QuantitySelector()` | `snippets/quantity-selector.liquid` |
| `BuyButtons` | `buy-buttons.js` | `BuyButtons` | `buy-buttons` | `BuyButtons()` | `snippets/buy-buttons.liquid` |

### (c) Dead-code inventory

**Removed (dead — no consumer evidence):**

| Item | Evidence |
| --- | --- |
| Five `alpine.components.*.js` files | Replaced by feature files; `git ls-files` / disk: deleted |
| Import-map `components/*` keys | Removed from `layout/theme.liquid` |
| `ThemeEvents.events.HEADER_MENU_ACTIVE_CHANGED` | Emitted only in deleted `alpine.components.ui.js`; no `ThemeEvents.on` listener in `assets/*.js` or Liquid |
| `ThemeEvents.events.PRODUCT_VARIANT_SET_REQUEST` | Listener only in deleted `alpine.components.product.js`; no emitter in retained code |
| `buyNow()`, `showBuyNow`, `requestSections` (BuyButtons) | `snippets/buy-buttons.liquid` never enabled buy-now; removed `data-show-buy-now`, `data-request-sections` |
| `fromCartItem` export (`quantity-constraints.js`) | No import in `assets/*.js` after grep |
| `base.js` announcement-bar measurement, `updateAnnouncementBarHeight()` | No `.announcement-bar` in theme Liquid; removed `--announcement-bar-height` from `snippets/css-variables.liquid` |
| `productGallery` thumbnail carousel methods (`_thumbnailMediaQuery`, `scrollThumbnailIntoView`, `onThumbnailKeydown`, etc.) | Grid-only gallery markup; no `[data-gallery-thumbnail]` in `snippets/product-gallery.liquid` |
| `sectionPagination.isUrlMatch()` | No Liquid or JS caller |
| `qty_cart_quantity` assign (`snippets/quantity-selector.liquid`) | Unused after single-constraint render; Theme Check `UnusedAssign` |

**Kept (looked dead but still consumed):**

| Item | Reason |
| --- | --- |
| `dropdown.onHeaderFocusIn()` / `onHeaderFocusOut()` | Called from `@focusin` / `@focusout` in `snippets/header-dropdown-menu.liquid`; stubs kept for markup contract |
| `productGallery.activeIndex` | Set by `PRODUCT_GALLERY_SLIDE_TO_REQUEST` listener; pauses video on slide change |
| `ThemeEvents.events.SHOPIFY_*` (5 editor events) | Emitted by `base.js` `setupThemeEditorForwarding()`; infrastructure for theme editor (see unclear) |

**Unclear (left in place — user to confirm):**

| Item | Notes |
| --- | --- |
| `ThemeEvents.events.SHOPIFY_SECTION_SELECT` … `SHOPIFY_BLOCK_DESELECT` | Forwarded from Shopify editor DOM events; no feature component listens yet |
| `productGallery.activeIndex` UI binding | No visible thumbnail UI; only used internally for video pause on slide-to request |

### File layout — before and after (line counts)

| File | Before | After | Defines |
| --- | ---: | ---: | --- |
| `alpine.components.ui.js` | 193 | deleted | was `dropdown`, `localizationSwitcher`, `accordion` |
| `alpine.components.product.js` | 671 | deleted | was `VariantPicker`, `QuantitySelector`, `BuyButtons` |
| `alpine.components.overlays.js` | 27 | deleted | was `cartPage` |
| `alpine.components.pagination.js` | 165 | deleted | was `sectionPagination` |
| `alpine.components.product-media.js` | 117 | deleted | was `productGallery` |
| `accordion.js` | 3 | 30 | `accordion` factory + `define()` |
| `dropdown.js` | 3 | 60 | `dropdown` factory + `define()` |
| `localization-switcher.js` | 3 | 77 | `localizationSwitcher` factory + `define()` |
| `cart-page.js` | 3 | 22 | `cartPage` factory + `define()` |
| `product-gallery.js` | 3 | 45 | `productGallery` factory + `define()` |
| `section-pagination.js` | 3 | 113 | `sectionPagination` factory + `define()` |
| `variant-picker.js` | 3 | 145 | `VariantPicker` factory + `define()` |
| `quantity-selector.js` | 3 | 234 | `QuantitySelector` factory + `define()` |
| `buy-buttons.js` | 3 | 200 | `BuyButtons` factory + `define()` |
| `quantity-constraints.js` | 178 | 142 | shared `resolve`, `fromVariant`, `cartQuantityForVariant` |
| `base.js` | 306 | 290 | entry, module loader (announcement code removed) |
| `events.js` | 84 | 82 | two constants removed |

**Quantity path:** `snippets/quantity-selector.liquid` now renders `quantity-constraints` once (JSON), derives HTML attrs via string split ( `parse_json` unavailable in Theme Check). `buy-buttons.liquid` removed dead `data-show-buy-now`, `data-request-sections`.

### (5) Per-page `data-module-id` modules — before vs after

Shared on most pages (header): `dropdown`, `localization-switcher`.

| Page type | `data-module-id` on page | Before (entry → fetched module graph) | After (entry → fetched module graph) |
| --- | --- | --- | --- |
| **Product** | `variant-picker`, `buy-buttons`, `quantity-selector` (inside buy-buttons), `product-gallery`, `accordion` + header | Each product stub imported `alpine.components.product.js` (671 lines, all three product factories) when any of variant-picker / buy-buttons / quantity-selector loaded; gallery stub imported `alpine.components.product-media.js`; accordion stub imported `alpine.components.ui.js` | `variant-picker.js`, `buy-buttons.js`, `quantity-selector.js` each self-contained; `product-gallery.js`, `accordion.js` self-contained |
| **Cart** | `cart-page`, `quantity-selector` + header | `quantity-selector` stub pulled entire `alpine.components.product.js` (variant picker + buy buttons code) | `quantity-selector.js` only (+ shared `quantity-constraints.js`); **does not load** `variant-picker` or `buy-buttons` |
| **Collection** | `section-pagination` + header | `section-pagination` stub → `alpine.components.pagination.js` | `section-pagination.js` |
| **Blog** | `section-pagination` + header | same as collection | `section-pagination.js` |
| **Search** | (none beyond header) | header modules only | header modules only |
| **Header only** | `dropdown`, `localization-switcher` | stubs → `alpine.components.ui.js` | `dropdown.js`, `localization-switcher.js` |

Core always loads: `base.js` → `events`, `alpine-adapter`, `cart-contract`, `alpine.store.cart.js`; `performance.js` dynamic.

### Validation (acceptance checks 1–6)

**AC1** — `%TEMP%\batch-f-validate.cjs` (2026-09-24):

```
PASS: no alpine.components.*; no components/* keys; all imports resolve
```

**AC2** — script output: all nine `data-module-id` values have import-map keys; `x-data` names match `define()` registrations (recorded in table above).

**AC3** — shared helpers (`quantity-constraints`, `utils`, `events`, `https`, `alpine-adapter`) imported, not copied across feature files.

**AC4** — dead-code inventory above.

**AC5** — per-page table above; cart page isolation confirmed.

**AC6** — commands and results (2026-09-24):

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | PASS (liquid-syntax, i18n, theme, compat, doc-paths, format:check) |
| `npm.cmd test` | PASS (32 i18n + 57 theme-architecture + 3 section-stylesheet + 7 doc-paths tests; theme-check 63 files, no offenses) |
| `npm.cmd run doctor:agent` | PASS |
| `npm.cmd run lint:doc-paths` | PASS |
| `shopify.cmd theme check --fail-level suggestion` | PASS — 63 files, no offenses |
| `npx.cmd prettier --check` (all changed files) | PASS |
| `git diff --stat HEAD` | 24 files, +1142 / −1490 (inside surface) |

**Material corrections:** `parse_json` filter rejected by Theme Check; quantity attrs use JSON string splitting instead. Removed unused `qty_cart_quantity` assign after Theme Check `UnusedAssign` warning.

**Blockers:** none.

**Browser pass:** not run by implementer; user step 8.

### Coordinator check (2026-09-24)

- Every `x-data` name in Liquid (`sectionPagination`, `cartPage`, `accordion`, `BuyButtons`, `dropdown`, `localizationSwitcher`, `productGallery`, `VariantPicker`, `QuantitySelector`) is passed to exactly one `define()` in its feature file.
- Every identifier used in a Liquid Alpine attribute exists in `assets/*.js`, except `variantInput`, an `x-ref` in `snippets/buy-buttons.liquid` that no JavaScript read at HEAD either (harmless leftover; for the reviewer to judge).
- `git grep` over `assets/`, `layout/`, `sections/`, `snippets/`, and `docs/references/` finds no reference to `HEADER_MENU_ACTIVE_CHANGED`, `PRODUCT_VARIANT_SET_REQUEST`, `announcement-bar`, `buyNow`, `showBuyNow`, `requestSections`, or a `components/` import key.

### Review 1 (2026-09-24): FAIL, two behavior changes; corrected by the coordinator

1. `snippets/quantity-selector.liquid` read each constraint with `split: '"key":' | last`. The single constraints JSON puts the computed fields first and the nested `quantity_rule` (which has its own `min` and `max`) later, so `last` picked the rule's raw values: with a rule of min 6, increment 2, max 10 and 6 already in the cart, the input got `min="6" max="10"` instead of the additional range 2-4. The JavaScript read the correct top-level JSON; the initial HTML and the no-JS form did not. Each key is now read from its first occurrence (`split` then index `[1]`); `"absolute_max"` cannot match `"max":` because no quote precedes `max` there.
2. `assets/buy-buttons.js`: at HEAD `data-request-sections=""` parsed to `[]`, so add-to-cart requested no section; after the attribute was removed, `_getSections()` returned `[sectionId]`, and the product section refresh could replace the buy-buttons root before its success state showed. `_getSections()` is removed and add-to-cart calls `cart.add([item])`, whose `sections` defaults to `[]` in both `assets/alpine.store.cart.js` and `assets/cart.contract.js`, as at HEAD.

Suggestions taken: `assets/product-gallery.js` assigned `activeIndex` but never read it, and `mediaCount` only clamped that index; both and `setActive()` are removed, and a slide-to request carrying a numeric `index` pauses playing video as before; `data-media-count` in `snippets/product-gallery.liquid` lost its only reader and is removed. The unread `x-ref="variantInput"` in `snippets/buy-buttons.liquid` is removed.

- Validation: `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; strict Theme Check: 63 files, no offenses; prettier passes on the five edited files.

### Review 2 (2026-09-24): PASS

No findings. The verifier traced the quantity constraints for rule, cart, and inventory cases against HEAD, confirmed add-to-cart passes no sections as at HEAD, the gallery pause keeps its checks, the removed hooks have no reader, all nine Alpine names and every import resolve, the cart page does not load the variant picker or buy buttons, no helper is copied, and the reference matches. `lint`, `test`, `doctor:agent`, `lint:doc-paths`, strict Theme Check (63 files, 0 offenses), prettier, and `git diff --check` pass. Remaining: the user's browser pass.

### Acceptance (user, 2026-09-24)

The browser pass found no theme error. The console showed three preload warnings: two from Shopify-owned resources (the compiled `{% stylesheet %}` bundle through Early Hints, and the Shop sign-in sprite), and one for `tailwind.output.css`, which `layout/theme.liquid` preloads with `stylesheet_tag: preload: true` (the same pattern as official Skeleton); the platform's Early Hints preload carries `crossorigin=anonymous` while the stylesheet link does not. None is in batch F's scope. The one console error was not from theme code. Batch F is complete.
