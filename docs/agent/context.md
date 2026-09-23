# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-23.

## Plan: batch E, theme content to the simplest use of the frame

**Status:** complete (user acceptance 2026-09-24).

**Authorization and decisions (user, 2026-09-23):** the template's value is its external frame, which is strict; theme content has few business constraints. Official Skeleton is an abstract reference only: a file there shows that a capability may exist here, not what its code looks like ("官方只是参考，并不是以官方为基点"). Section frame: one element with one class ("One element, one class"). Snippets: delete `link` and `rte-compact-prose`; keep `loading`. Header cart count badge: delete it ("购物车角标这个也干掉把 … 有文档架构就可以了"); the cart link keeps its accessible name, and `$store.cart.item_count` stays (read by `assets/alpine.components.product.js`).

**Review tier:** Ask (Liquid markup and schema; deletions; external execution prompt).

**Outcome:** every section, snippet, block, layout, and the gift card template is the simplest implementation that uses the retained frame correctly. Nothing carried over from the earlier theme's layout or styling remains.

**Dependencies:** none (the Alpine-rule batch is committed).

### The standard

Keep (the frame):

- The page's function: the Liquid data, Shopify forms, `paginate`, `content_for`, app blocks, `block.shopify_attributes`, SEO and structured data, and platform requirements.
- Accepted primitives (`docs/project.md`) through `render`, with only the parameters a consumer passes.
- Runtime contracts: `data-module-id`, `x-data` names, `data-*` hooks, `id`s, and the ARIA and state bindings the components read (`docs/references/architecture/javascript-runtime.md`).
- Section settings kept by batch D, applied through the section frame.
- Style system: typography tiers on text, scheme tokens, `btn` and `field` on controls, `sr-only`, state classes.
- Accessibility (landmarks, heading order, labels, visible unclipped focus, the mobile 16px input floor) and locale keys.

Remove (earlier-theme content): layout grids, column spans, widths, max-widths, alignment and centering, spacing beyond one `gap` or block separation where content would otherwise touch, breakpoint variants (`pc:`, `fw:`), decorative wrappers and borders, per-section `{% stylesheet %}` rules that only style, and parameters, modes, and branches that no consumer uses.

A list of repeated items (product cards, articles, collections, search results) may keep one simple responsive grid; a row of controls may keep one flex row. Nothing else is layout.

Remove also (added 2026-09-23 after the coordinator's review of the first pass; user: "可以"): logic the capability does not need. For each Liquid block, parameter, and branch, ask whether the accepted capability needs it or whether it is an earlier theme's extra handling; extra handling goes and the platform's ordinary form replaces it. Example: `sections/cart.liquid` validates line-item property upload URLs in about 80 lines (schemes, `..`, `%2e`, backslashes); the ordinary form links a value that contains `/uploads/` and prints every other value escaped. Keep what Shopify requires (for example `form` tags, selling-plan and unit-price display, quantity rules the Cart API enforces) and what accessibility needs.

### Section frame

- Every section renders exactly one outer element: `<div class="section color-{{ section.settings.color_scheme }}" style="--section-padding-top: …px; --section-padding-bottom: …px;">` (sections without padding settings omit the style). Its content flows inside it with no further page-width wrapper.
- `assets/base.css`: `.section` spans the `.shopify-section` grid (`grid-column: 1 / -1`) and sets `padding-block` from the padding variables, `padding-inline: max(var(--page-margin), (100% - var(--page-width)) / 2)`, and the scheme background (`var(--gradient-background)`). Delete `.layout`, the `main > section:first-child .layout:first-child` announcement-bar rule, and whatever of the `.shopify-section` grid rules no longer has a use.
- Schemas: remove the `section` token from every `"class"` (it would put `.section` on Shopify's own wrapper too). Keep `site-header` (read by `assets/base.js`); drop `footer` and `password` class tokens if nothing reads them. No other schema change.
- `tailwind/tailwind.utilities.css`: delete `container-page` and `surface-section`; keep `surface-component` while `snippets/header-dropdown-menu.liquid` uses it; keep the z-layer scale.

### Snippets

- Delete `snippets/link.liquid` (7 consumers) and `snippets/rte-compact-prose.liquid` (2 consumers): consumers render a plain `<a>` (or `<div class="rte">`) with the same `href`, text, accessible name, and hooks.
- Keep `snippets/loading.liquid`, reduced to the minimal loading indicator.
- `sections/header.liquid`: delete the cart count `<span>` (`x-show` / `x-text` on `$store.cart.item_count`) and its `.header__cart-count` rules; the cart link stays with `aria-label`.
- `snippets/accordion.liquid`: keep only single-item mode (the only one consumed) and the parameters `sections/product.liquid` passes.
- Every other snippet: apply the standard; cut parameters and branches that no consumer uses. `snippets/image.liquid` keeps its documented display contract (`docs/references/style-system/image-display-contract.md`).

### Implementation surface

`sections/*.liquid` (markup, `{% stylesheet %}`, schema `"class"` only); `snippets/*.liquid`; `blocks/*.liquid` (markup classes and `{% stylesheet %}` only; block structure waits for the theme-block discussion); `layout/theme.liquid` and `layout/password.liquid` (markup classes only); `templates/gift_card.liquid`; `assets/base.css`; `assets/gift-card.css`; `tailwind/*.css` (delete classes left without a consumer); `locales/en.default.json` and `locales/en.default.schema.json` (keys left unused only); `docs/references/**` where a statement becomes untrue (known: `css-architecture.md` surface roles, `theme-blocks.md` Container wrapper); `assets/tailwind.output.css` (regenerated only).

Forbidden: `assets/*.js`, schema settings and block types, `config/*`, `templates/*.json`, `sections/*-group.json`, vendor assets, and hand edits to generated CSS. If a change seems to need JavaScript, record it and leave the hook in place.

### Acceptance checks

1. Per file, Progress lists the frame usages kept (from the standard) and what was removed. The reviewer checks each kept item against the standard and looks for leftovers.
2. `git grep -n -E "container-page|surface-section|class=\"layout|\bpc:|\bfw:" -- sections snippets blocks layout templates/gift_card.liquid` prints only lines Progress justifies; every section has exactly one element with class `section`.
3. Behavior hooks are unchanged: a script compares, per file, the set of `x-*`, `@*`, `:*`, `data-*`, `id`, `role`, and `aria-*` attributes before and after (hooks moved from a deleted snippet into its consumer count as unchanged); the implementer records the command and the differences with reasons.
4. Every class left in markup has a definition (Tailwind, a layer class, `base.css`, a `{% stylesheet %}`) or a JavaScript consumer, including selector strings in `data-*` attributes; no `render 'link'` or `render 'rte-compact-prose'` remains.
5. Section spacing comes only from the padding settings; the 16px input floor and unclipped focus rings still hold.
6. `npm.cmd run build:tw`, `npm.cmd run lint`, and `npm.cmd test` pass; prettier passes on every changed file; `git diff --stat` stays inside the surface.

### Browser pass (user)

Every page at mobile and desktop widths (home, product, collection, collections list, blog, article with comments, page, contact, search with and without results, cart with items and empty, 404, password, gift card), header menus and dropdowns, localization, pagination, keyboard focus through header, product, and cart, and each color scheme on a section.

## Progress (batch E)

**Pre-check:** `git log` contains `28b0661`; worktree was clean at batch start.

**Hook snapshot (acceptance 3):** scanner `%TEMP%\batch-e-hooks-v2.cjs`; HEAD baseline via `git show HEAD:<path>` in `%TEMP%\batch-e-hook-diff.cjs` (commit `bbfe1ee`); post-change `%TEMP%\batch-e-hooks-after-v2.json`. Command: `node %TEMP%\batch-e-hook-diff.cjs .` — **17 removed, 6 added** (23 total). Every difference listed below with reason.

| File | Diff | Reason |
| --- | --- | --- |
| `sections/header.liquid` | removed `x-show=$store.cart && $store.cart.item_count > 0`, `x-text=$store.cart.item_count` | Cart count badge deleted per plan; `$store.cart.item_count` remains in JS store |
| `sections/header.liquid` | added `role=list` on mobile nav `<ul>` | Plain markup after `link` removal |
| `sections/password.liquid` | added `data-section-id={{ section.id }}` | Frame wrapper gained section id hook |
| `sections/cart.liquid` | removed `aria-hidden=true` | Decorative separator span removed with layout strip |
| `snippets/accordion.liquid` | removed multi-item `data-index`, `id`, `aria-controls` variants; removed parameterized `data-initial-active` / title-class data attrs | Single-item mode only (only consumer: product collapsible tab) |
| `snippets/accordion.liquid` | added fixed `data-initial-active={% if collapsed %}null{% else %}0{% endif %}`, `data-title-active-class=accordion__title--active`, `data-title-inactive-class=accordion__title--inactive` | Equivalent single-item values; accordion JS reads these hooks |
| `snippets/header-dropdown-menu.liquid` | (no hook diff) | `aria-current=page` moved from deleted `link` snippet in first pass; hook set unchanged vs HEAD |
| `snippets/link.liquid` | file deleted; removed `aria-label={{ aria_label \| escape }}`, `id={{ id \| escape }}` | Snippet deleted; consumers use plain `<a>` without those optional params |
| `snippets/loading.liquid` | removed `aria-hidden=true` | Accessibility fix (first pass): spinner `role=status` must not be hidden from AT |
| `snippets/product-media.liquid` | removed literal `data-media-type=video\|external_video\|model`; added `data-media-type={{ media_type }}` | Consolidated non-image branch; runtime value unchanged; no JS consumer of `data-media-type` in `assets/*.js` |

### Base CSS and Tailwind

- **`assets/base.css`:** Added `.section` frame (padding-inline, padding-block, scheme background). Removed `.layout`, announcement-bar `.layout` rule, and `.shopify-section` grid. Kept `.shopify-section { position: relative; width: 100%; }`.
- **`tailwind/tailwind.utilities.css`:** Deleted `container-page` and `surface-section`; kept `surface-component` and z-layer utilities.
- **`tailwind/tailwind.components.css`:** Deleted unused `.rte.rte--compact` rules (no consumer after `rte-compact-prose` deletion).
- **`assets/tailwind.output.css`:** Regenerated via `npm.cmd run build:tw`.
- **`assets/gift-card.css`:** Reduced to minimal page shell, main width, image/QR sizing, print hide checkout button.

### Sections (15 files)

Each section: one outer element with `class="section color-{{ scheme }}"` (+ padding `style` where settings exist). Removed `full-width`, `surface-section`, `layout`, `container-page`, schema `"class": "section"`, and decorative `{% stylesheet %}` blocks except where functional (password inline-submit-field, search 16px input floor).

| File | Kept | Removed / judgment |
| --- | --- | --- |
| `404.liquid` | form function, `btn`, locale keys | `render 'link'` → plain `<a class="btn">` |
| `article.liquid` | paginate, comment form, ids, ARIA, `rte` | Grid/width/spacing classes, section stylesheet |
| `blog.liquid` | pagination hooks, one `grid gap-8` list, `loading` | Blog description block (`rte-compact-prose`); added `relative` wrapper for loading overlay |
| `cart.liquid` | `cartPage()` hooks, quantity-selector, forms, ordinary property display | Cart grid/columns, `render 'link'`, upload URL validator (second pass), spacing/flex layout classes |
| `collection.liquid` | `sectionPagination`, `data-collection-dynamic-content`, product grid | `rte-compact-prose` → `<div class="rte">`; `relative` on dynamic content for loading |
| `collections.liquid` | `data-collection-grid`, collection links | Layout wrappers and decorative classes |
| `custom-section.liquid` | `content_for 'blocks'`, padding settings | `layout` / `container-page` wrapper |
| `custom-liquid.liquid` | `section.settings.custom_liquid` | Layout wrapper |
| `footer.liquid` | blocks, menus, follow-on-shop, locale keys | `render 'link'` → plain `<a>`; schema class tokens |
| `header.liquid` | `site-header` schema class, dropdown render, icons, JSON-LD, cart link `aria-label` | Cart count badge + `.header__cart-count` stylesheet; responsive header grid; `render 'link'` |
| `main-page-contact.liquid` | contact form, fields, `btn`, captcha | Layout/spacing wrappers |
| `page.liquid` | title, `rte` content | Layout wrapper |
| `password.liquid` | `#MainContent`, inline-submit-field stylesheet (functional) | `password-section` flex stretch rules; `#MainContent` inside `.section` |
| `product.liquid` | all block types, variant/gallery/buy hooks, accordion render | Product grid/stylesheet; media and info stack vertically (visible change) |
| `search.liquid` | search form, results list, 16px input floor stylesheet | Layout/alignment classes |

### Snippets

| File | Kept | Removed / judgment |
| --- | --- | --- |
| `header-dropdown-menu.liquid` | dropdown Alpine hooks, `surface-component` panels, `data-dropdown` | `render 'link'` (3×) → plain `<a>`; decorative flex/gap/padding classes on triggers |
| `accordion.liquid` | single-item mode, `collapsed` / `id_prefix` / `icon_type`, accordion stylesheet | blocks and pipe-delimited modes; unused class params |
| `loading.liquid` | `x-show="isLoading"`, spinner `role="status"` | overlay/size/color params; fixed large overlay implementation |
| `product-variant-picker.liquid` | variant hooks, swatch/pill stylesheet | `pc:gap-5` (first pass); `context`/color-heuristic swatches (second pass) |
| `link.liquid` | — | **Deleted** |
| `rte-compact-prose.liquid` | — | **Deleted** |
| Other snippets | image contract, buy-buttons, pagination, localization, etc. | First pass: layout classes only; second pass: see **Second pass (logic)** table below |

### Blocks

| File | Kept | Removed |
| --- | --- | --- |
| `heading.liquid` | semantic level, `heading-h2`, editor placeholder text | `theme-block-heading` classes and placeholder stylesheet |
| `button.liquid` | `btn`, url/label | wrapper classes and placeholder stylesheet |
| `text.liquid` | `body-base`, richtext | `theme-block-text` class |
| `group.liquid` | flex settings-driven stylesheet (functional) | unchanged |

### Layout and gift card

| File | Kept | Removed |
| --- | --- | --- |
| `layout/theme.liquid` | import map, skip link, `#MainContent`, cart data attrs | `relative` on `<main>` |
| `layout/password.liquid` | skip link, css-variables | `flex min-h-dvh flex-col` on `<body>` |
| `templates/gift_card.liquid` | all `data-gift-card-*` hooks, QR/copy/wallet flows | Decorative BEM layout classes; semantic structure only |

### Docs

- `docs/references/style-system/css-architecture.md`: surface roles updated (no `surface-section`).
- `docs/references/architecture/theme-blocks.md`: Container host uses section frame; text block no longer names `theme-block-text`.

### Locales

No keys removed; `npm.cmd run lint:i18n` and unused-key lint passed.

### Coordinator review of the first pass (2026-09-23)

- Hook diff rerun against a `git archive HEAD` copy (the implementer's baseline was taken after partial edits): differences are the cart badge `x-show` / `x-text` / `x-cloak`, the accordion's removed multi-item modes and fixed title-class values, `aria-current="page"` moved from the deleted `link` snippet into `snippets/header-dropdown-menu.liquid`, the deleted `link` snippet's unused `id` / `aria-label`, `role="list"` added in the header, `data-section-id` added in `sections/password.liquid`, and `aria-hidden` removed from a decorative separator in `sections/cart.liquid`. All are expected.
- Corrected by the coordinator (pre-existing, in surface): `snippets/loading.liquid` had no `x-cloak`, so without JavaScript its opaque overlay covered blog and collection content, and its wrapper's `aria-hidden="true"` hid the `role="status"` spinner from assistive technology. It now has `x-cloak` and no `aria-hidden` (a hidden `x-show` element is already out of the accessibility tree). A scan for `x-show` without `x-cloak` finds only `snippets/buy-buttons.liquid` `x-show="false"`, the intentional no-JS fallback.
- Returned for a second pass: the first pass removed layout and styling but kept earlier-theme logic and structure. Sections went from 2634 to 2071 lines; only 4 of 23 snippets changed. Untouched: `snippets/buy-buttons.liquid` (508 lines), `snippets/quantity-selector.liquid` (316; still has `text-theme-text/80`), `snippets/product-variant-picker.liquid` (291), `snippets/pagination.liquid` (173), `snippets/quantity-constraints.liquid` (160), and the cart property-URL validator. Cause: the plan's Remove list named only layout and styling; the "Remove also" paragraph above closes that gap.

### Second pass (logic)

Applied the "Remove also" paragraph to every named file and finished first-pass Remove misses. **JS-cleanup items:** none — every retained hook still matches a component contract; no simplification required a JavaScript edit.

| File | Logic removed | Logic kept (why) |
| --- | --- | --- |
| `sections/cart.liquid` (396→257 lines) | ~80-line upload URL validator (scheme/backslash/`%2e`/space checks); rotating `product-N` placeholder index | Shopify cart form, `cartPage()` hooks, quantity-selector, selling-plan and unit-price display; line-item properties: skip blank/`_` keys, link values containing `/uploads/`, else escaped text (accepted capability + platform ordinary form) |
| `sections/article.liquid` (284→237 lines) | `case`/`assign` for error-summary field IDs (replaced with inline `if`/`elsif`); redundant `image` assign | Comment `form`, paginate, `role=alert` error summary with field links, per-field `aria-invalid`/`aria-describedby` (accessibility + Shopify requirement) |
| `sections/product.liquid` (354→256 lines) | Redundant `context`/`update_url` args on variant-picker render (only PDP consumer) | All block types, gallery/buy/variant hooks unchanged (capability) |
| `snippets/buy-buttons.liquid` (478→471 lines) | Unused `show_quantity` param; `quantity_wrapper_class` / `quantity_button_class` / `quantity_input_class` forwards to quantity-selector | Gift-card checkout guard, `x-show="false"` no-JS fallbacks, pickup availability, `$store.cart.add()`, dynamic checkout (hooks + Shopify requirement) |
| `snippets/quantity-selector.liquid` (292→289 lines) | Unused `wrapper_class`, `button_class`, `input_class` params (no callers) | `quantitySelector()` hooks, min/max/step rules, cart vs product modes (hook + capability) |
| `snippets/quantity-constraints.liquid` (149 lines, unchanged) | — | Quantity-rule math is the accepted capability; no extra branches found |
| `snippets/product-variant-picker.liquid` (266→200 lines) | `context`/`featured` default and derived `update_url`; color-name heuristic swatches; fake swatch when no Shopify swatch data | `VariantPicker()` hooks, `data-variants*`, swatches only when `value.swatch` exists, `role=radiogroup` (hook + capability) |
| `snippets/pagination.liquid` (155 lines, unchanged) | `py-10` removed in first pass | `sectionPagination` hooks unchanged (hook) |
| `snippets/image.liquid` (260→256 lines) | Breakpoint `:object-*` token check in `has_object_fit` loop (first-pass leftover outside display contract) | Documented frame/natural modes, focal point, placeholder contract (`docs/references/style-system/image-display-contract.md`) |
| `snippets/product-media.liquid` (114→47 lines) | Per-type case branches and positioned overlay icon wrappers | `data-media-type` / `data-media-id` on non-image media; play/3D icons (capability) |
| `snippets/product-gallery.liquid` (37→28 lines) | `images` fallback param and layout classes | Gallery `id`, `data-gallery-id` consumer hooks (hook) |
| `snippets/country-localization.liquid` (85→70 lines) | `current_country` assign; separate `is_current` variable per option | Localization Alpine hooks, popular-countries split (capability) |
| `snippets/language-localization.liquid` (42→31 lines) | `current_locale` assign; separate `is_current` variable | Same pattern as country (capability) |
| `snippets/meta-tags.liquid` (134 lines, unchanged) | — | Already minimal SEO/OG output (Shopify requirement) |
| `snippets/localization-option.liquid`, `localization-switcher.liquid`, `localization-selected-icon.liquid` | — | No extra logic beyond accepted localization capability |

**Line counts (HEAD `bbfe1ee` → working tree):**

| Surface | HEAD lines | After lines | Delta |
| --- | ---: | ---: | ---: |
| Sections (15 `.liquid`) | 2564 | 1947 | −617 |
| Snippets (21 at HEAD; 19 after deletions) | 2762 | 2353 | −409 |
| **Combined sections + snippets** | **5326** | **4300** | **−1026** |

Largest per-file drops: `sections/cart.liquid` −139, `sections/product.liquid` −98, `sections/header.liquid` −98, `snippets/accordion.liquid` −130, `snippets/product-media.liquid` −67, `snippets/product-variant-picker.liquid` −66.

### Validation (acceptance 6, both passes)

| Command | Result |
| --- | --- |
| `npm.cmd run build:tw` | PASS |
| `npm.cmd run lint` | PASS (liquid-syntax, i18n, theme architecture incl. Alpine-expression check, compat, doc-paths, format:check) |
| `npm.cmd test` | PASS validators; Theme Check 63 files, **4 warnings** (info): `OrphanedSnippet` + `ValidScopedCSSClass` on `localization-option.liquid` and `localization-selected-icon.liquid` — false positives (snippets rendered via `{% render %}` capture) |
| `npm.cmd run lint:i18n` | PASS |
| `npx.cmd prettier --check` on every changed file except `assets/tailwind.output.css` | PASS (deleted `link.liquid` / `rte-compact-prose.liquid` skipped as expected) |
| `git diff --stat HEAD` | 43 files, +1324 / −3238 (includes this record file) |

**Acceptance 2:** `rg` on surface paths — no `container-page`, `surface-section`, `class="layout`, `pc:`, or `fw:` matches. Fifteen section files each have exactly one outer `section` class.

**Acceptance 4:** No `render 'link'` or `render 'rte-compact-prose'`. `surface-component` retained for dropdown panels.

**Acceptance 5:** Section spacing via padding settings + `.section` in `base.css`; search/password retain 16px input floor; focus rings unchanged in Tailwind/base.

### Unverified (step 8 — user)

Browser pass not run. Visible merchant-facing changes expected: flat header (no cart badge; unstyled nav), product PDP stacks media above info, cart line items stack, gift card page minimal CSS, blog no intro description. Second pass adds: cart property links use ordinary `/uploads/` rule only; variant picker shows swatches only when Shopify provides swatch data; product media play/3D icons no longer in positioned overlays.

### Risks (updated)

- Header: no cart count badge (first pass); dropdown/menus lack previous spacing.
- Product/collection grids simplified; list pages may look sparse.
- Cart property display: less defensive than the removed validator — malicious `javascript:` URLs in non-upload values are escaped as text, not linkified (same as Shopify's ordinary pattern).
- Variant picker: options without Shopify swatch data render as text pills only (no fake color circles).
- Password `#MainContent` inside section wrapper — verify skip-link target on password template.
- Loading overlay requires `relative` parent (added on blog/collection).

### Coordinator review of the second pass (2026-09-23)

- Defect found and corrected: `snippets/country-localization.liquid` (twice) and `snippets/language-localization.liquid` passed a comparison as a `render` argument (`is_current: country.iso_code == localization.country.iso_code`). Liquid `render` arguments take values, not expressions, so the current-country and current-language markers would break on Shopify. Theme Check could not resolve those render tags and reported `localization-option` and `localization-selected-icon` as `OrphanedSnippet`, plus two `ValidScopedCSSClass` warnings. The implementer dismissed them as false positives; `npm.cmd test` passed because `shopify theme check` fails only on errors by default. Each call now assigns `is_current_country` / `is_current_language` in a `{%- liquid %}` block first. A scan of every `render` tag for `==`, `!=`, `<`, `>`, `and`, `or`, or `contains` in its arguments finds none. `shopify theme check --fail-level suggestion`: 63 files, no offenses.
- Accepted with a follow-up: the quantity path (`snippets/buy-buttons.liquid` renders `quantity-constraints` seven times; `snippets/quantity-selector.liquid` renders it eight times) stays, because `assets/*.js` reads its output through `data-qty-constraints` and this batch may not change JavaScript. Simplifying it needs the JS leftover cleanup; recorded on `docs/agent/board.md`. The implementer's "no JS-cleanup items" was therefore incomplete.
- Validation after the corrections: `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on the changed snippets.

### Review 1 (2026-09-23): FAIL, two control-layout leftovers; corrected by the coordinator

1. `snippets/buy-buttons.liquid`: the quantity and submit row used a grid with fixed column widths and a 48rem breakpoint. It is now one flex row (`.buy-buttons__primary-row { display: flex; gap }`, the last child takes the rest). While there, the coordinator found the `context == 'featured'` branch unreachable (both callers in `sections/product.liquid` pass `context: 'product'`) and removed it, the `context` parameter, and the two call arguments. That branch was the only caller of `quantity-selector` with `interactive: false`, so `snippets/quantity-selector.liquid` lost its static mode (`interactive` parameter, `qty_interactive` branches, `.quantity-selector--static` rules); the interactive markup and hooks are unchanged. The class tokens `buy-buttons__actions--with-quantity` and `buy-buttons__quantity` lost their CSS and had no JS consumer, so they were removed.
2. `sections/password.liquid`: the email and submit controls used a two-column grid, radius joins, and a breakpoint. They are now a flex row with a small gap, so the input's focus ring is not covered by the button, and the `z-index` focus rule went with the radius rules; `inline-submit-field__button` was removed.
3. Suggestion taken in part: `assets/gift-card.css` hardcoded `--color-background`, `--color-foreground`, and `--color-border` over the scheme variables that `templates/gift_card.liquid` already renders through `snippets/css-variables.liquid`; the overrides were removed. The `max-width: 48rem` on `main` stays: the gift card page uses `{% layout none %}` and no `.section` frame, so that rule is its page frame.

- Hook diff against the HEAD archive, new differences: `aria-hidden="true"` x2 in `snippets/buy-buttons.liquid` and x1 in `snippets/quantity-selector.liquid`, both from the removed static preview. `data-media-id` in `snippets/product-media.liquid` now sits on one wrapper for every media type (no JS consumer).
- Validation: `npm.cmd run build:tw` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; `shopify.cmd theme check --fail-level suggestion`: 63 files, no offenses; prettier passes on the edited files.

### Review 2 (2026-09-23): FAIL, pagination; corrected by the coordinator

1. The pagination `<nav>` had no accessible name (also true at HEAD; `docs/agent/board.md` had deferred it with the icon-only disabled previous/next spans). 2. `.pagination__inner` kept earlier-theme sizing and centering; the snippet also kept a 13px font variable, radii, and fit-content centering.

`snippets/pagination.liquid` is rewritten to the standard: `<nav class="pagination" aria-label="{{ 'pagination.label' | t }}" data-pagination-nav>` (new key `pagination.label`, "Pagination"; the redundant `role="navigation"` and inline style variables are gone); previous and next render only when they exist, so no unnamed disabled element remains (the ordinary Shopify pattern); page parts are links, the current page is a span with `aria-current="page"`, and ellipsis parts are plain spans. The stylesheet keeps one flex row, a sideways-scrolling page list with inset focus rings, and the current-page state colors. `assets/alpine.components.pagination.js` reads only `[data-pagination-nav] a`, which still matches; no JS or section reads the removed `pagination__*` classes or `aria-disabled`. The board's deferred pagination item is closed.

- Validation: `npm.cmd run build:tw` exit 0; `npm.cmd run lint` exit 0 (includes `lint:i18n`); `npm.cmd test` exit 0; `shopify.cmd theme check --fail-level suggestion`: 63 files, no offenses; prettier passes on `snippets/pagination.liquid` and `locales/en.default.json`.

### Review 3 (2026-09-23): FAIL, exhaustive pass; returned for a third implementation pass

The verifier read every file in one pass and reported ten findings (full text in the review; summarized here with the required fix):

1. `sections/header.liquid`: the rule applying the logo-width setting (`--header-logo-width`) was removed with the stylesheet, so a configured logo can fill the header. Restore one rule that sizes the logo image from that variable. The header passes `class: 'xl'` to `icons`, which has no rule; use the snippet's `size` parameter or nothing.
2. Image `sizes` and `widths` still describe removed columns (`sections/blog.liquid` 33vw, `sections/collection.liquid` 25vw, `sections/collections.liquid` 25vw, `snippets/product-gallery.liquid` 50vw). Lists and the gallery are one column inside the section frame now: declare sizes for that width and request widths that cover it.
3. `tailwind/tailwind.components.css`: the dropdown panel's `min-width: max-content` has no bound and can widen a mobile page. Bound it to the viewport minus the page margins.
4. `sections/footer.liquid`: an empty menu renders four fake underlined links. Render nothing when a column has no menu links.
5. Layout-only wrappers with no CSS or JS consumer: product media and info column and panel wrappers in `sections/product.liquid`; image, details, and action grouping wrappers in cart line items in `sections/cart.liquid`. Remove them; hooked elements stay.
6. `sections/collection.liquid` eager-loads two cards and `sections/collections.liquid` four, as a "first row", and `collections` rotates six placeholders. Eager-load only the first card; use one placeholder.
7. Snippet parameters with no caller: `snippets/buy-buttons.liquid` `show_buy_now` (and its branch), `success_message`, `request_sections`; `snippets/quantity-selector.liquid` `min`, `max`, `step`, `cart_quantity` (and the no-variant branches that exist only for them); `snippets/product-variant-picker.liquid` `update_url` (and its false branch); `snippets/product-media.liquid` `widths`. Where a `data-*` value that JavaScript reads came from one of them, output its current default directly.
8. Uncalled modes: `snippets/accordion.liquid` chevron mode (the caller passes `plus`), `snippets/icons.liquid` `fill`, `lg`, and `xl` size cases, and the popular-country split in `snippets/country-localization.liquid` (render one country list).
9. Decorative borders in `snippets/localization-option.liquid` (and the item wrapper that exists only to carry it) and `snippets/localization-switcher.liquid`.
10. Stale references: `docs/references/architecture/theme-blocks.md` (the removed `theme-block-text` wrapper), `docs/references/style-system/css-architecture.md` (removed `--pagination-*` variables; the header's removed layout classes).

Suggestions kept as decided: the gift card's `max-width: 48rem` stays as its page frame; the quantity-constraint computation stays because unchanged JavaScript reads its output.

### Third pass (2026-09-23)

1. `sections/header.liquid:25,81-83`: the inline `--header-logo-width` from `settings.logo_width` now sizes `.theme-image` with one section stylesheet rule. Removed the unmatched `class: 'xl'` icon argument; header icons use the existing default size. `snippets/image.liquid:246` supplies the former full-width rule.
2. `sections/blog.liquid:23-27`, `sections/collection.liquid:22,43-48`, `sections/collections.liquid:15-19`, and `snippets/product-gallery.liquid:21-25` now declare `(min-width: {{ settings.page_width }}px) {{ settings.page_width }}px, 100vw`, with image widths through 1500px; `snippets/product-media.liquid:15,22-28,39-45` requests the same range. These one-column render trees sit in the `.section` width frame (`assets/base.css:159`).
3. `tailwind/tailwind.components.css:15-20`: `.dropdown-panel` now uses `width: max-content`, `max-width: calc(100vw - 2 * var(--page-margin))`, and `overflow-wrap: anywhere`. `snippets/header-dropdown-menu.liquid:38,78` applies that class to both panel depths.
4. `sections/footer.liquid:7-24`: a column with no menu links now renders nothing, including its heading and empty list; the four fake links are gone. Removed unused `footer.default_link` from `locales/en.default.json`.
5. `sections/product.liquid:26-33,131-132`: removed the two media wrappers and two info wrappers, including the unconsumed `ProductInfo-…-form` ID. `sections/cart.liquid:23-41,127-167`: removed only the image, details, and action grouping wrappers. The cart item key/section ID/event wrapper and product gallery ID remain. `rg` across `assets/*.js`, sections, snippets, blocks, and layout found no consumer of the removed product wrapper attributes or ID.
6. `sections/collection.liquid:38` and `sections/collections.liquid:22,32`: only the first card is eager; every missing collection image uses `collection-1`.
7. `git grep -n -E "render '(buy-buttons|quantity-selector|product-variant-picker|product-media)'" -- sections snippets blocks layout` found the calls in product/cart/buy-buttons/product-gallery; inspection found none passes the removed arguments. `snippets/buy-buttons.liquid:10-16,60-66,147-160` removes the unused custom Buy now branch and parameters; JS-consumed defaults remain as `data-success-message` (localized), `data-show-buy-now="false"`, and `data-request-sections=""`. `snippets/quantity-selector.liquid:4-13,18-30,34-63,91` removes `min`, `max`, `step`, and `cart_quantity` parameters and their alternate branches, while preserving the no-variant default JSON and caller-provided `value`. `snippets/product-variant-picker.liquid:8-16,31` removes `update_url` and writes `data-update-url="true"`. `snippets/product-media.liquid:4-16` removes its unused `widths` parameter. `assets/alpine.components.product.js:27,287,523-533,622-625` reads these attributes and their values remain the prior defaults. Removed the now unused `products.product.buy_it_now` locale key.
8. `snippets/accordion.liquid:3-10,34-42,75-84`: the sole plus icon replaces the chevron mode and unused parameter; `sections/product.liquid:124-129` no longer passes it. `snippets/icons.liquid:4-24` keeps only `xs`, `sm`, and default sizes; no caller passed `fill`, `lg`, or `xl`. `snippets/country-localization.liquid:2-10,35-55` renders one complete country list; removed the unused `collections.popular_countries` locale key.
9. `snippets/localization-option.liquid:21-40` renders the button without its border wrapper; `snippets/localization-switcher.liquid:48-76` removes only the menu/item borders and their first-child rule. The localization form and Alpine hooks remain.
10. `docs/references/architecture/theme-blocks.md:58` now names `body-base`. `docs/references/style-system/css-architecture.md:38,149` drops the removed pagination variable example and cites the real quantity-selector stylesheet owner.

Hook comparison: a temporary read-only script parsed `git archive HEAD sections snippets blocks layout templates/gift_card.liquid` and compared per-file sets of `x-*`, `@*`, `:*`, `data-*`, `id`, `role`, `name`, `for`, `form`, and `aria-*` attributes, including text inside Liquid branches, to the worktree. It reported 36 set differences across the whole batch. New in this pass: product `ProductInfo-…-form` ID removed (no JS selector); buy-buttons' three `data-*` expressions changed to the same defaults and the unreachable custom Buy now button removed (`@click.prevent="buyNow()"`, `x-show="available && canPurchaseQuantity"`); variant picker's `data-update-url` expression became its true default. Earlier-pass differences remain documented above: cart/loading/quantity `aria-hidden`, header cart badge bindings and `role=list`, password `data-section-id`, accordion mode attributes, pagination role/label, and product-media type expression. The attribute comparison is lexical; Theme Check and the JavaScript consumer search supplement it.

Validation: `npm.cmd run build:tw` passed (Tailwind v4.1.18, 57 ms); `npm.cmd run lint` passed (Liquid syntax, i18n plus unused keys, architecture, CSS/JS/embedded compatibility, doc paths, repository Prettier); `npm.cmd test` passed (validator suites and Theme Check: 63 files, zero offenses); `shopify.cmd theme check --fail-level suggestion` passed (63 files, zero offenses); `npx.cmd prettier --check` on every changed existing file except generated CSS passed; `git diff --check` passed. Browser behavior remains for the user's page-by-page pass. Merchant-visible changes from this pass: configured logo width restored, responsive full-width images, empty footer columns no longer show fake links, country menu has one ungrouped list, and menus/controls have simpler styling.

### Coordinator check of the third pass (2026-09-23)

- New hook differences against the HEAD archive: `id="ProductInfo-{{ section.id }}-form"` removed from `sections/product.liquid` (no consumer in `assets/`, `sections/`, `snippets/`, `layout/`, or `blocks/`); `@click.prevent="buyNow()"` removed with the uncalled Buy-now button; `data-show-buy-now` and `data-request-sections` now output their former defaults (`"false"`, `""`) directly, and `data-success-message` outputs the former default translation. `assets/alpine.components.product.js` reads these datasets unchanged; `buyNow()` is now unreachable and is recorded for the JS cleanup on `docs/agent/board.md`.

### Review 4 (2026-09-23): PASS

All ten Review 3 items are fixed with file:line evidence; no finding at the stated bar. The verifier's AST hook comparison (x-*, @*, :*, data-*, id, role, name, for, form, aria-*, including Liquid branches) found 42 attribute-set differences against the HEAD archive; the implementer's lexical comparison had counted 36, because it skipped boolean attributes and attributes that moved out of the deleted `link` snippet. Every difference is explained in this record, and no consumer in `assets/*.js` lost what it reads. An AST audit found 75 render calls with no missing snippet, undocumented argument, or expression argument; section settings, block types, and block schemas match HEAD apart from the schema `class` change. `build:tw` (hash unchanged), `lint`, `test`, `shopify.cmd theme check --fail-level suggestion` (63 files, 0 offenses), prettier, and `git diff --check` pass; 48 files changed, all in scope. Remaining: the user's browser pass.

### Browser pass 1 (user, 2026-09-23): four issues; corrected by the coordinator

1. Header: the former mobile menu lost its breakpoint classes and rendered next to the desktop menu, with a second country and language selector; header items stacked. Removed the duplicate `<nav>` (and the now unused `accessibility.mobile_menu` key) and the mobile localization pair; `.header` and the top-level dropdown menu list are one wrapping flex row; the logo rule now targets `.header .theme-image`.
2. Password page: the section no longer filled the viewport, so the body's scheme showed below it. `.shopify-section:has(> .password)` grows in the body's flex column and the `.password` frame fills it.
3. Collection page with many products: product images overflowed their cards and covered the footer. Cause: cards were stretched grid items, so the frame-mode image wrapper's `height: 100%` (`snippets/image.liquid`) resolved against the whole card; the old section clipping had hidden it. Images were also full page width in one column. Added one `grid-list` utility (`tailwind/tailwind.utilities.css`: auto-fill columns of at least 28rem, `align-items: start` so items are not stretched, 2rem gap), used by the blog, collection, and collections lists and the product gallery; `sizes` are `(min-width: 1200px) 25vw, (min-width: 600px) 50vw, 100vw` with widths up to 1200.
4. IDE Problems panel: the entries were stale (for example `pagination.label` exists, and the reported lines no longer hold render calls). A script checking every `render` call against its target's `{% doc %}` found no unknown or missing argument; `shopify.cmd theme check --fail-level suggestion` reports none. Reload the VS Code window to refresh the panel.

Also: `assets/base.css` gave `body` text `rgba(var(--color-foreground), 0.8)`, a decorative tint; it is now the plain scheme foreground.

- Validation: `npm.cmd run build:tw` exit 0 (`.grid-list` emitted); `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; strict Theme Check: 63 files, no offenses.

### Snippet styles pass (2026-09-23)

User scope: remove earlier-theme styling from snippet `{% stylesheet %}` blocks and decorative class tokens; keep behavior, state, accessibility, and JS-read hooks only.

| Snippet | Rules / tokens removed | Rules / tokens kept (reason) |
| --- | --- | --- |
| `localization-switcher.liquid` | `display: inline-block`, `font-family`, `.localization-toggle` (padding, flex, cursor, gap), menu `margin-top`, `overflow-x`, `overscroll-behavior`, `inset-inline-end: auto`, `min(24rem,…)` max-width, `--announcement-bar-height`, `.localization-link` (padding, cursor, justify, `white-space`) | `.localization-switcher { position: relative }` (popup anchor); `.localization-menu` absolute positioning, `z-index: var(--z-layer-dropdown)`, bounded `max-width`/`max-height`, `overflow-y: auto`, scheme background (popup behavior); `.localization-menu--align-end` (JS `alignEnd`); `.localization-option` flex row + `width: 100%` + gap; `:focus-visible { outline-offset: -2px }` (inset ring inside scrolling menu) |
| `localization-option.liquid` | `localization-link`, `w-full` | `localization-option` class (styled by switcher stylesheet) |
| `localization-selected-icon.liquid` | `shrink-0` | decorative check icon only; selection via parent `aria-current` |
| `country-localization.liquid`, `language-localization.liquid` | `localization-toggle` class on trigger buttons | Alpine `x-ref`, `@click`, `:aria-expanded`, `aria-haspopup`, `aria-controls`, menu hooks unchanged |
| `accordion.liquid` | trigger `padding-block`, `cursor`, `.accordion__title` token and rule, collapsed `opacity`, icon flex-shrink/align extras | trigger flex row + `text-align: start` (control row); `.accordion__icon` + `is-active` rotation (state); panel `grid-template-rows` collapse (behavior); `.accordion__panel-inner` 4px focus-safe inset (unclipped focus); `:class` + `data-title-*-class` values `accordion__title--active` / `--inactive` (JS `titleClass()`) |
| `quantity-selector.liquid` | `.quantity-selector` root layout rule, `.quantity-selector__feedback` token and max-width, button `cursor`, input font/color resets, focus `z-index`, `text-theme-text` on feedback | `.quantity-selector` class on root (JS `.closest('.quantity-selector')`); `.quantity-selector__controls` row; `.quantity-selector__button` 2.5rem touch targets; disabled `opacity: 0.4` (state); input `width`/`border-bottom`/`text-align`/spin removal; 16px mobile floor (accessibility) |
| `buy-buttons.liquid` | `.buy-buttons__submit--unavailable` rule and token (fallback buttons now `btn`); `.buy-buttons__label` display rule; `.buy-buttons__error` rule and token; `shopify-payment-button-wrapper` class and width rules; gift-card summary utilities; selling-plan fieldset/legend utilities | purchase-group stack + primary flex row (control layout); `.buy-buttons__label.is-loading` (loading state); `.buy-buttons__submit--success` (success state); `data-unavailable-class="btn"` (Alpine `:class` hook); `text-error-text` on error alert |
| `product-variant-picker.liquid` | `variant-picker__swatch--circle` token and `border-radius`; rgba border/tint colors; cursor rules; double-layer unavailable slash (`::after`) | swatch size/position/overflow + 1px `rgb(var(--color-border))` border (visible boundary); selected ring; single unavailable slash; pill padding + `currentColor` border; selected pill scheme colors; unavailable `line-through`; peer `:focus-visible` outlines including larger offset on selected swatch |
| `header-dropdown-menu.liquid` | `font-medium` on current child/grandchild links | `dropdown` / `dropdown-trigger` / `dropdown-panel` / `dropdown-open` / `data-dropdown` hooks; link underlines; `aria-current` |

**Class-consumer check:** `git grep` in `assets/*.js` confirms readers for `.quantity-selector`, `summary.dropdown-trigger`, `[data-dropdown]`, and accordion `data-title-*-class` string defaults. Remaining snippet classes each have a matching rule in the same snippet's `{% stylesheet %}` or in `tailwind/tailwind.components.css` (dropdown panels).

**Hook comparison (acceptance 3):** `%TEMP%\batch-e-hooks-v3.cjs` against `git show HEAD:<path>` (`bbfe1ee`). **No new differences** in this pass's ten snippets — localization and header-dropdown markup hooks unchanged. Earlier-pass differences in `accordion`, `buy-buttons`, `product-variant-picker`, and `quantity-selector` remain as documented above.

**Validation:** `npm.cmd run build:tw` PASS; `npm.cmd run lint` PASS; `npm.cmd test` PASS; `shopify.cmd theme check --fail-level suggestion` PASS (63 files, 0 offenses); `npx.cmd prettier --check` PASS on all changed snippets and this record (except `assets/tailwind.output.css`).

**JS-cleanup items:** none in this pass.

**Browser recheck (user):** localization menu position and scroll clipping; accordion trigger/panel collapse and focus inside panel; quantity selector touch targets and 16px input on mobile; buy-button loading/success/disabled states and dynamic checkout visibility; variant swatch selected ring and unavailable slash; header dropdown panels and keyboard focus.

### Coordinator check of the snippet styles pass (2026-09-23)

- A scan of `snippets/` for alpha tints, font and cursor rules, radii, shadows, and letter-case styling found one missed decorative rule: `snippets/css-variables.liquid` set `color: rgba(var(--color-foreground), 0.8)` on `body` and every `color-*` scheme class, so text stayed tinted after the `base.css` fix. It is now `rgb(var(--color-foreground))`. Kept: the framed placeholder border and fill in `snippets/image.liquid` (documented in `docs/references/style-system/image-display-contract.md`) and `--announcement-bar-height` (set by `assets/base.js`; JS cleanup).

### Review 5 (2026-09-23): FAIL, image sizes; corrected by the coordinator

The `sizes` declared `50vw` from 600px, but `grid-list` (columns of at least 28rem, that is 280px) can still be one column below 800px when the page margin is large (up to 100px), so a 2x display could pick a source too small. With `page_width` 1000-2000 and `page_margin` 10-100 (`config/settings_schema.json`), columns are at most 100vw below 800px, at most about 419px (under 50vw) from 800px, and at most about 373px (under 33vw) from 1200px. `sections/blog.liquid`, `sections/collection.liquid`, `sections/collections.liquid`, and `snippets/product-gallery.liquid` now declare `(min-width: 1200px) 33vw, (min-width: 800px) 50vw, 100vw`, so the declared size never undershoots; `widths` gain 1600 (and `snippets/product-media.liquid` and the collection card request width 1600) to cover a one-column list on a 2x display. Everything else in review 5 passed. Validation: `npm.cmd run lint` exit 0; `npm.cmd test` exit 0.

### Browser pass 2 (user, 2026-09-23): gift card colors

The user preferred the earlier light gift card page. The earlier look came from a hardcoded palette in `assets/gift-card.css`, which the coordinator had removed (review 1), so the page fell back to scheme 1. User decision (2026-09-23, "选颜色2吧"): `templates/gift_card.liquid` puts `color-scheme-2` on `<body>`, so the page uses a light scheme through scheme tokens. The earlier layout is not restored; the gift card page follows the same simplest-implementation standard.

### Review 6 (2026-09-23) and the image sizes rule (user, 2026-09-24)

Review 6 found a trailing blank line in this file (fixed) and that `sizes` can undershoot when a visitor enlarges the browser's default font, because `grid-list` columns and page margins are in rem. The user accepted it as a known limitation after the coordinator explained the trade-off, and approved recording the rule, which the references lacked (user, 2026-09-24: "可以啊"; "可以" to the `auto` prefix).

- `docs/references/style-system/image-display-contract.md` gains "Sizes and widths": derive `sizes` from the layout across the setting ranges, never smaller than the rendered width at the default font; `widths` cover about 2x the largest rendered width; the known limitation; reference values for `grid-list` items.
- `snippets/image.liquid` prefixes `auto, ` to the `sizes` of every lazy image (MDN: `sizes="auto"` is valid only with `loading="lazy"`, with fallback values after `auto`; caniuse, fetched 2026-09-24: Chrome and Edge 126+, Firefox 150+, Safari and iOS Safari no support). Eager images keep the given value. Its `{% doc %}` for `sizes` says so.

### Review 7 (2026-09-24): FAIL, doc wording; corrected by the coordinator

The code, the rule, the sources, and the gift card scheme passed. The `sizes` line in the `snippets/image.liquid` `{% doc %}` said "never smaller than the rendered width" without the reference's default-font qualification; it now says "at the browser's default font size" and points to `docs/references/style-system/image-display-contract.md`. No behavior changed.

### Acceptance (user, 2026-09-24)

The user accepted the review 7 wording correction without another review ("可以") and passed the final browser check, including the light gift card ("没啥问题了"). Batch E is complete.
