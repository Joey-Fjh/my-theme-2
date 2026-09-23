# Project Context

Holds the plan currently under execution and its status. Nothing else. Batch C stays only as an executed, reviewed plan waiting on the user's combined A–D browser pass. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-23.

## Plan: batch D, section settings to Skeleton minimal

**Status:** executed; independent review accepted (review 2, 2026-09-23; one pre-existing accordion finding deferred by the user); waiting on the combined A–D browser pass by the user.

**Authorization:** the user authorized this batch on 2026-09-23 ("开始吧。授权，基本上把。其余项也没必要，对于skeleton而言"), including removing the removed settings' values from `templates/*.json` and `sections/*-group.json`.

**Decision (user, 2026-09-23; `docs/agent/board.md`, "theme content goes to official-Skeleton minimal practice", item 5):** section settings keep only color scheme, font, and padding; everything else goes. The coordinator applied the official Skeleton baseline (fetched 2026-09-23 from `raw.githubusercontent.com/Shopify/skeleton-theme/main`): its sections have `"settings": []` except `header` and `footer` (`menu`), and its theme blocks keep their content and layout settings. So a setting also stays when the section or block renders nothing useful without it (a menu, custom Liquid, a theme block's own content). No section has a font setting today.

**Review tier:** Ask (deletions; Liquid markup and schema; merchant JSON; external execution prompt).

**Outcome:** every section schema holds only the Keep list below; the storefront renders what the removed settings' schema defaults rendered, with copy from resource data or locale keys; no Liquid, CSS, locale key, or merchant JSON value is left for a removed setting.

**Dependencies:** none. Batch C is reviewed; its browser pass joins the combined A–D pass after this batch.

### Keep

- Every section: `color_scheme`, `padding_top`, `padding_bottom` where present.
- `sections/header.liquid`: `menu`. `sections/footer.liquid`: `link_column` block `heading`, `menu`.
- `sections/custom-liquid.liquid`: `custom_liquid`. `sections/product.liquid` blocks: `custom_liquid` `custom_liquid`; `collapsible_tab` `collapsible_tab_heading`, `collapsible_tab_text`.
- `blocks/*.liquid`: unchanged (`text`, `heading` with `semantic_level`, `button` `label` and `link`, `group` `direction`, `alignment`, `gap`).

### Remove

| Section | Settings |
| --- | --- |
| `404` | `heading_line1`, `heading_line2`, `description`, `show_button`, `button_text`, `button_link` |
| `article` | `image`, `image_alt`, `heading` |
| `blog` | `header`, `description`, `articles_per_page`, `link_text` |
| `collection` | `header`, `description`, `products_per_page` |
| `collections` | `heading`, `description`, `collections_per_page` |
| `custom-liquid` | `section_width` |
| `footer` | `enable_follow_on_shop` |
| `header` | `enable_country_selector`, `enable_language_selector` |
| `main-page-contact` | `heading`, `description`, `button_text`, `success_message` |
| `password` | `heading`, `message`, `placeholder` |
| `product` | `desktop_media_width`, `media_aspect_ratio`; blocks: `variant_picker` `picker_type`, `swatch_shape`; `inventory_notice` `low_stock_threshold`, `show_stock_number`; `buy_buttons` `show_dynamic_checkout`; `collapsible_tab` `open_by_default` |
| `search` | `search_per_page` |

Replacement rule, per removed setting:

- Behavior settings (counts, ratios, widths, selects, checkboxes): hardcode the value of the setting's schema `default`, so the storefront keeps its default behavior. Then remove the Liquid branches, CSS, and locale keys that only a non-default value reached. JavaScript is out of scope: if a JS path becomes dead, record it for the JS leftover cleanup instead of editing it.
- Copy settings (headings, descriptions, button and link text, messages, placeholders): use the resource's own data where it exists (`collection.title`, `collection.description`, `blog.title`, `page.title`, `page.content`, `article.title`, `article.image`, `shop.password_message`); otherwise use an existing locale key or add one to `locales/en.default.json`, with the schema default's text as the English value. (Amended by the user on 2026-09-23 after coordinator review, below: descriptions and intros come only from resource data and render nothing without it; locale text is used only where a page needs copy to work, and it is written for shoppers, never merchant instructions.) Non-empty merchant text in `templates/*.json` is dropped with the setting (authorized).
- A snippet whose only consumer was a removed setting (for example `snippets/rte-compact-prose.liquid`, which reads `section.settings.description`) is deleted after `git grep` finds no other consumer.

### Implementation surface

- `sections/*.liquid` (schema and the Liquid, markup, and `{% stylesheet %}` driven by removed settings); `snippets/*.liquid` that read removed settings or become unused (`buy-buttons`, `product-variant-picker`, `rte-compact-prose`, and any found by grep).
- `locales/en.default.json`, `locales/en.default.schema.json`: remove keys used only by removed settings or removed branches; add storefront keys for moved copy.
- `templates/*.json`, `sections/header-group.json`, `sections/footer-group.json`: delete only the keys of removed settings; every other value stays byte-identical.
- `docs/references/**`: only where a statement becomes untrue; content-neutral.
- `assets/tailwind.output.css`: regenerate with `npm.cmd run build:tw` if class usage changes.

Forbidden: `config/*`, `blocks/*`, `assets/*.js`, `layout/*`, `tailwind/*`, vendor assets, hand edits to `assets/tailwind.output.css`, and any change to schema IDs, block types, section types, or preset names that stay.

### Acceptance checks

1. A schema inventory (every `settings` entry with an `id` in each section schema and its blocks) prints exactly the Keep list; the implementer records the command and output.
2. `git grep -n -E "settings\.(heading_line1|heading_line2|show_button|button_text|button_link|image_alt|articles_per_page|link_text|products_per_page|collections_per_page|section_width|enable_follow_on_shop|enable_country_selector|enable_language_selector|success_message|desktop_media_width|media_aspect_ratio|picker_type|swatch_shape|low_stock_threshold|show_stock_number|show_dynamic_checkout|open_by_default|search_per_page)\b" -- sections snippets blocks layout` prints nothing; the removed `header`, `heading`, `description`, `message`, `placeholder`, and `image` ids are shown gone by the inventory in check 1, and `git grep -n -E "section\.settings\.(header|heading|description|message|placeholder|image)\b" -- sections snippets` prints nothing.
3. `templates/*.json` and `sections/*-group.json` parse as JSON; their diff deletes only removed-setting keys (plus comma fixes); the implementer lists each deleted key and value.
4. Progress records, per removed setting, its schema default and what now renders (hardcoded value, resource data, or locale key).
5. No locale key is left that nothing references, and every new `t` call resolves: `npm.cmd run lint:i18n` passes.
6. Every deleted snippet has no remaining `render` or `include` consumer (`git grep` output recorded).
7. `npm.cmd run lint` and `npm.cmd test` pass; `npx prettier --check` passes on every changed file; `git diff --stat` stays inside the surface (record files excepted); `assets/tailwind.output.css` matches a fresh build.

### Browser pass

Combined A–D pass after this batch (user). This batch adds: 404, article, blog, collection, collections list, contact, password, product (gallery layout, variant picker, inventory notice, buy buttons with dynamic checkout, collapsible tab), search, header localization selectors, and footer; and in the theme editor, each section shows only the kept settings.

## Progress (batch D)

### Per-setting decisions (schema default → what renders now)

| Section | Setting | Schema default | Now renders |
| --- | --- | --- | --- |
| `404` | `heading_line1` | `"404"` | locale `404.title` |
| `404` | `heading_line2` | `t:sections.404.defaults.heading_line_2` ("Not Found") | locale `404.heading_line_2` |
| `404` | `description` | `t:sections.404.defaults.description_html` | locale `404.description_html` (English updated to schema default text) |
| `404` | `show_button` | `true` | button always shown |
| `404` | `button_text` | `t:sections.404.defaults.button_text` ("Back to Home") | locale `404.button_text` |
| `404` | `button_link` | `"/"` | `routes.root_url` |
| `article` | `image` | none | `article.image` only |
| `article` | `image_alt` | `t:sections.article.defaults.image_alt` | `image.alt` |
| `article` | `heading` | none | removed (title override branch deleted; `article.title` is the sole h1) |
| `blog` | `header` | `t:sections.blog.defaults.header` ("Blog") | `blog.title` (replacement rule: resource data) |
| `blog` | `description` | `t:sections.blog.defaults.description` | locale `blog.description_html` (English updated to schema default text) |
| `blog` | `articles_per_page` | `12` | hardcoded `12` in `{% paginate %}` |
| `blog` | `link_text` | `t:sections.blog.defaults.link_text` ("Read more") | locale `blog.read_more` |
| `collection` | `header` | `t:sections.collection.defaults.header` | `collection.title` |
| `collection` | `description` | `t:sections.collection.defaults.description` | `collection.description`, else locale `collections.description_html` |
| `collection` | `products_per_page` | `12` | hardcoded `12` |
| `collections` | `heading` | `t:sections.collections.defaults.heading` | locale `collections.list_heading` |
| `collections` | `description` | `t:sections.collections.defaults.description` | locale `collections.list_description` |
| `collections` | `collections_per_page` | `12` | hardcoded `12` |
| `custom-liquid` | `section_width` | `"fixed"` | always `layout container-page` wrapper |
| `footer` | `enable_follow_on_shop` | `true` | always shown when `shop.features.follow_on_shop?` |
| `header` | `enable_country_selector` | `true` | localization snippets always rendered (mobile + desktop) |
| `header` | `enable_language_selector` | `true` | localization snippets always rendered (mobile + desktop) |
| `main-page-contact` | `heading` | `t:sections.main-page-contact.defaults.heading` | `page.title` |
| `main-page-contact` | `description` | `t:sections.main-page-contact.defaults.description` | `page.content` if present, else locale `contact.description_html` |
| `main-page-contact` | `button_text` | `t:sections.main-page-contact.defaults.button_text` | locale `sections.main-page-contact.defaults.button_text` |
| `main-page-contact` | `success_message` | `t:sections.main-page-contact.defaults.success_message` | locale `sections.main-page-contact.defaults.success_message` |
| `password` | `heading` | `t:sections.password.defaults.heading` | locale `password.title` |
| `password` | `message` | `t:sections.password.defaults.message` | `shop.password_message` if present, else locale `password.message_html` |
| `password` | `placeholder` | `t:sections.password.defaults.placeholder` ("Email") | locale `password.email_placeholder` |
| `product` | `desktop_media_width` | `60` | hardcoded `60` / `40` grid split |
| `product` | `media_aspect_ratio` | `portrait_3_4` | hardcoded gallery `3/4` |
| `product` / `variant_picker` | `picker_type` | `button` | hardcoded button mode in `snippets/product-variant-picker.liquid` (dropdown branch removed) |
| `product` / `variant_picker` | `swatch_shape` | `circle` | hardcoded circle swatches |
| `product` / `inventory_notice` | `low_stock_threshold` | `5` | hardcoded `5` |
| `product` / `inventory_notice` | `show_stock_number` | `true` | always shows `products.product.only_in_stock_html` |
| `product` / `buy_buttons` | `show_dynamic_checkout` | `true` | `show_dynamic_checkout: true` on `{% render 'buy-buttons' %}`; snippet default `true` |
| `product` / `collapsible_tab` | `open_by_default` | `false` | hardcoded `initial_active: false` |
| `search` | `search_per_page` | `12` | hardcoded `12` |

### Deleted merchant JSON keys

| File | Key | Value |
| --- | --- | --- |
| `templates/index.json` | `sections.main.settings.section_width` | `"page"` |
| `templates/product.json` | `sections.main.blocks.variant_picker.settings.picker_type` | `"button"` |
| `templates/product.json` | `sections.main.blocks.buy_buttons.settings.show_dynamic_checkout` | `true` |
| `sections/header-group.json` | `sections.header.settings.enable_country_selector` | `true` |
| `sections/header-group.json` | `sections.header.settings.enable_language_selector` | `true` |

No keys deleted from `sections/footer-group.json` or other templates (they already held only kept settings).

### Snippet audit

`git grep -n "rte-compact-prose" -- sections snippets` → consumers remain in `sections/blog.liquid`, `sections/collection.liquid`; snippet kept (not deleted).

`snippets/buy-buttons.liquid` and `snippets/product-variant-picker.liquid` updated in surface; still consumed by `sections/product.liquid`.

### JS leftovers (record only; `assets/*.js` out of scope)

None found in `assets/*.js` for `picker_type`, `swatch_shape`, or `show_dynamic_checkout`. `VariantPicker` has no setting-specific branches; dropdown markup removal is Liquid/CSS only.

### Check 1 (schema inventory)

Command:

```powershell
node -e "const fs=require('fs');const path=require('path');const dir='sections';const keep={};const files=fs.readdirSync(dir).filter(f=>f.endsWith('.liquid'));for(const file of files){const text=fs.readFileSync(path.join(dir,file),'utf8');const m=text.match(/\{% schema %\}([\s\S]*?)\{% endschema %\}/);if(!m) continue;const schema=JSON.parse(m[1]);const ids=[];for(const s of schema.settings||[]) if(s.id) ids.push(s.id);for(const b of schema.blocks||[]){for(const s of b.settings||[]) if(s.id) ids.push(b.type+'.'+s.id);}keep[file]=ids.sort();}console.log(JSON.stringify(keep,null,2));"
```

Output matches Keep list: every section has only `color_scheme` + padding where applicable; `header` has `menu`; `footer` blocks have `link_column.heading` / `link_column.menu`; `custom-liquid` has `custom_liquid`; `product` blocks keep `custom_liquid.custom_liquid` and `collapsible_tab.collapsible_tab_heading` / `collapsible_tab.collapsible_tab_text` only.

### Check 2 (removed-setting grep)

```powershell
git grep -n -E "settings\.(heading_line1|heading_line2|show_button|button_text|button_link|image_alt|articles_per_page|link_text|products_per_page|collections_per_page|section_width|enable_follow_on_shop|enable_country_selector|enable_language_selector|success_message|desktop_media_width|media_aspect_ratio|picker_type|swatch_shape|low_stock_threshold|show_stock_number|show_dynamic_checkout|open_by_default|search_per_page)\b" -- sections snippets blocks layout assets
git grep -n -E "section\.settings\.(header|heading|description|message|placeholder|image)\b" -- sections snippets
```

Both: *(empty — exit 1)*.

### Check 3

All `templates/*.json` and `sections/*-group.json` parse; diffs delete only the keys listed above.

### Check 5

```powershell
npm.cmd run lint:i18n
```

Exit 0 — i18n lint passed; unused locale key lint passed.

### Check 6

No snippets deleted. `git grep` output recorded under Snippet audit.

### Check 7

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build:tw
```

- `npm.cmd run lint` — exit 0 (includes `format:check` pass).
- `npm.cmd test` — exit 0 (Theme Check: 65 files, 0 offenses).
- `npm.cmd run build:tw` — exit 0; removed unused `variant-picker__swatch--square` output; second run hash unchanged (idempotent).
- `git diff --stat` — only implementation-surface paths plus `docs/agent/board.md`, `docs/agent/context.md`, and `assets/tailwind.output.css`.

```powershell
git diff --stat
git status --short
```

```
 docs/agent/board.md                    |   5 +-
 docs/agent/context.md                  | ...
 locales/en.default.json                |  16 +-
 locales/en.default.schema.json         | 107 +-----------
 sections/*.liquid (12 files)          | ...
 snippets/*.liquid (3 files)           | ...
 templates/index.json, product.json     |   9 +-
 sections/header-group.json             |   4 +-
 assets/tailwind.output.css             |  54 deletions
```

### Blockers

None.

### Coordinator review and correction (2026-09-23)

The coordinator reviewed the implementation diff before the independent review and found two defects, both caused by the plan's own rules. The user decided both on 2026-09-23.

1. Merchant instructions rendered on the storefront. The copy rule ("the schema default's text as the English value") turned editor guidance into shopper copy: the 404 description became "Explain that the page could not be found…", and blog and collections-list intros read "Introduce your journal…" and "Introduce the collections…". Collection and contact also fell back to "Describe the products…" and "Tell customers how…" (as before this batch). User decision: resource data only. Corrected: `sections/blog.liquid` renders no intro; `sections/collection.liquid` renders `collection.description` only when it is not blank; `sections/collections.liquid` renders its heading only; `sections/main-page-contact.liquid` renders `page.content` only when present; `sections/404.liquid` goes back to its previous storefront copy (`404.description_html` "The page you're looking for has moved…" and `404.back_to_shopping` "Back to shopping"). Deleted locale keys: `blog.description_html`, `collections.description_html`, `collections.list_description`, `contact.description_html`, `404.button_text`. Kept: `password.message_html` as the storefront fallback for a blank `shop.password_message`. The `snippets/rte-compact-prose.liquid` example now uses `collection.description`; its only consumer is `sections/collection.liquid`.
2. The variant picker's dropdown mode was removed, while `docs/project.md` Accepted Scope named "variant picker with shared dropdown". User decision: keep buttons with swatches (the former default) and change the Accepted Scope entry to "variant picker (buttons with swatches)"; the user approved this `docs/project.md` change. `field-select` in `tailwind/tailwind.elements.css` now has no consumer; `tailwind/` is outside this surface, so it is recorded on `docs/agent/board.md`.

- Correction validation: `npm.cmd run build:tw` exit 0; `npm.cmd run lint:i18n` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on the five corrected sections, `snippets/rte-compact-prose.liquid`, `locales/en.default.json`, and `docs/project.md`.

### Review 1 (2026-09-23): FAIL, one default-behavior defect; corrected by the coordinator

The verifier confirmed the Keep list exactly, the other removed behavior settings, copy, picker semantics, deletions, merchant JSON, and references. One defect: `sections/product.liquid` passed `initial_active: false` to `snippets/accordion.liquid`, whose `initial_active | default: 0` turns `false` into `0`, so collapsible tabs opened on load instead of matching `open_by_default`'s default (closed). The same path existed at HEAD. Fixed by passing the snippet's documented closed value, `initial_active: 'null'`, which renders `data-initial-active="null"`; `assets/alpine.components.ui.js` then sets `active = null`. The snippet and JS are unchanged.

- Correction validation: `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on `sections/product.liquid`.
- Review 2 (2026-09-23): FAIL on one pre-existing item, below.

### Review 2 (2026-09-23): batch items pass; one pre-existing finding deferred by the user

The verifier confirmed the review 1 fix (tabs start closed with JavaScript), traced every falsy value and `| default:` path in the batch to its HEAD schema default, and re-ran acceptance checks 1–7 and the correction spot-checks; all pass. Validators: `build:tw` (hash unchanged), `lint:i18n`, `lint`, `test` (65 files, 0 offenses), `lint:doc-paths`, prettier, `git diff --check`, all passing.

FAIL item (asked by the coordinator's review prompt, not by the plan): without JavaScript, `snippets/accordion.liquid` panels stay collapsed (`.accordion__panel` is `grid-template-rows: 0fr; opacity: 0` until Alpine adds `is-active`), so collapsible tab content is unreachable. This was already true at HEAD, and `snippets/accordion.liquid` is outside this batch's surface. User decision (2026-09-23): defer it to the small-items batch with the accordion's nested clear link (`docs/agent/board.md`), and accept batch D with this finding recorded.

## Plan: batch C, section layer to Skeleton minimal practice

**Status:** executed; independent review PASS (review 5, 2026-09-23); waiting on the combined A–D browser pass by the user after batch D.

**Authorization:** the user authorized this batch on 2026-09-23 ("授权"). Section schema convergence, decided in the same message, is batch D, not this batch.

**Decision (user, 2026-09-23; `docs/agent/board.md`, "theme content goes to official-Skeleton minimal practice", item 4):** section class names and `{% stylesheet %}` blocks go to minimal practice, together with the `tailwind/tailwind.utilities.css` surfaces. Transferred accessibility launch blockers (batch A reviews 2 and 3) and the `link-underline` leftover (batch B review 1) close here. Theme-block architecture is a later discussion: this batch changes styling only, not section or block structure.

**Review tier:** Ask (deletions; Liquid markup; external execution prompt).

**Outcome:** sections, layouts, the gift card template, and theme blocks carry only the classes and CSS their structure, states, and accessibility need; section layout never clips focus rings; `utilities.css` holds only consumed utilities.

**Dependencies:** none. No merchant-owned file changes; section `{% schema %}` settings stay unchanged (whether section settings shrink is a separate board decision).

### Minimal-practice rule for this batch

Keep:

- Structure: `layout`, `container-page`, `full-width`, `surface-section`, `color-{{ scheme }}`, display, flex or grid, gap, alignment, positioning, sizes and aspect ratios the layout needs, and spacing that separates content blocks.
- The typography tiers (`heading-*`, `body-*`) and the minimal `btn` and `field`.
- Behavior states and state indicators: `x-show`, `x-cloak`, `:class` bindings, `sr-only`, loading and disabled states, current and selected markers, error and success feedback through scheme tokens.
- Accessibility: visible, unclipped focus on every focusable element; the mobile 16px input floor.
- Color only through scheme tokens and their bridge utilities.

Remove:

- Decorative color tints and opacity on text or surfaces (for example `text-theme-text/80`, `/60`, `/50`, `bg-theme-bg/50`), unless it marks a state.
- Letter-case and tracking styling (`uppercase`, `tracking-*`), decorative borders, radii, shadows, and hover or group-hover styling other than `hover:underline` on links.
- Classes with no CSS definition (for example `link-underline` in `sections/search.liquid`), and BEM hook classes that neither CSS nor JavaScript uses.
- Stale comments; keep one short role comment per `{% stylesheet %}` block.

### Implementation surface

- `sections/*.liquid` (all 15), `layout/theme.liquid`, `layout/password.liquid`, `templates/gift_card.liquid`, `blocks/*.liquid`: apply the rule to markup classes and `{% stylesheet %}` blocks. Do not change `{% schema %}`, block types, settings, Liquid logic, text, or JavaScript hooks (`x-*`, `@*`, `:*`, `data-*`, `id`).
- `assets/base.css`: remove `overflow: hidden` from `.layout` (section layout must not clip focus rings; this also closes the zero-top-padding case from batch A review 2). Keep the rest.
- Image frames: where a frame uses `overflow-hidden` only to crop its image, remove it and let the image crop with `object-fit` inside a sized frame, so linked-image focus rings are not clipped (closes batch A review 3 case 1: `sections/blog.liquid`, `sections/cart.liquid`; apply the same to every section with the pattern).
- `sections/header.liquid` mobile menu: its links' focus rings must not be clipped by the `overflow-y-auto` nav (closes batch A review 3 case 3); for example inline padding on the list that fits the 4px ring, or no scroll container.
- `sections/search.liquid`: replace the undefined `link-underline` with `underline underline-offset-4` or remove it.
- `tailwind/tailwind.utilities.css`: keep `container-page`, `surface-section`, and the `z-layer-dropdown` / `z-layer-popover` scale; keep `surface-component` only if it still has a consumer after this batch; delete `surface-inverted` if nothing uses it (markup, `@apply`, or `{% stylesheet %}`), and rewrite the surface comment to the role only.
- `docs/references/style-system/css-architecture.md`: only if a statement becomes untrue; keep it content-neutral.
- Regenerate `assets/tailwind.output.css` with `npm.cmd run build:tw`.

Forbidden: `config/*`, `templates/*.json`, `sections/*-group.json`, `locales/*`, vendor assets, JavaScript files, hand edits to `assets/tailwind.output.css`, `snippets/*` (batch B), `tailwind/tailwind.elements.css`, `tailwind/tailwind.components.css`, `tailwind/tailwind.typography.css`, and `tailwind/tailwind.input.css`.

### Acceptance checks

1. `git grep -n -E "(text|bg|border)-theme-(text|bg|border)/[0-9]+|uppercase|tracking-|shadow-|rounded|group-hover|hover:(bg|text|opacity|scale|border)|link-underline" -- sections layout templates/gift_card.liquid blocks` prints only lines listed in Progress with a Keep reason (a state marker, a structural need, or a required separator).
2. No `sections/`, `layout/`, `templates/`, or `blocks/` diff changes a `{% schema %}`, Liquid logic, visible text, or a JavaScript hook (`x-*`, `@*`, `:*`, `data-*`, `id`); inside `{% render %}` tags only styling arguments (`class`, `img_class`, `placeholder_class`, `wrapper_class`) may change. The implementer records the command used to prove it. (Wording clarified by the coordinator after review 2: the original "a Liquid tag" contradicted the batch purpose, which changes class arguments passed to snippets.)
3. `assets/base.css` `.layout` has no `overflow` rule; no image frame or container in the edited files clips a focusable child's 2px ring at 2px offset, including `sections/blog.liquid`, `sections/cart.liquid`, `sections/collection.liquid`, and the header mobile menu.
4. Every class left in the edited markup has a CSS definition (Tailwind utility, layer class, or `{% stylesheet %}`) or a JavaScript consumer; the implementer records the usage-check command and output.
5. `tailwind/tailwind.utilities.css` defines only consumed utilities plus the kept z-layer scale.
6. Behavior states still work by source review: cart loading overlay, form errors and success messages, search results, pagination placement, header menus, password form, gift card QR and copy.
7. `git diff --stat` stays inside the surface (record files excepted); `assets/tailwind.output.css` matches a fresh build.
8. These pass: `npm.cmd run lint` and `npm.cmd test`.

### Browser pass

The combined pass after batch D covers batches A, B, C, and D (list on `docs/agent/board.md`). This batch adds: every section at mobile and desktop widths (404, article with comments, blog, cart, collection, collections list, custom Liquid, custom section with blocks, footer, header with mobile menu, contact page, page, password page, product page, search), the gift card page, and keyboard focus on blog and cart image links and on the mobile menu.

## Progress (batch C)

### Per-file summary (removed → kept)

- `assets/base.css` — removed `.layout { overflow: hidden }`; kept padding and the rest of base rules.
- `layout/theme.liquid` — removed `shadow-none`; kept `relative`, `id`, `role`, `tabindex`.
- `layout/password.liquid` — no markup/stylesheet edits (already minimal).
- `templates/gift_card.liquid` — no edits (gift-card.css owns styling).
- `sections/404.liquid`, `page.liquid`, `custom-section.liquid`, `custom-liquid.liquid` — no pattern violations; unchanged.
- `sections/article.liquid` — removed opacity tints, `rounded-sm`, `bg-theme-text/5`, `/20` border opacities; kept structure, form roles, `border border-theme-border` feedback boxes.
- `sections/blog.liquid` — removed `group`, `overflow-hidden`, `rounded-sm`, `text-theme-text/80`; kept `aspect-4/3`, `object-cover` via image render, pagination hooks.
- `sections/cart.liquid` — removed opacity tints, `uppercase`, `overflow-hidden`, `bg-theme-bg/50`, `hover:opacity-100`; kept `:class` loading state, `hover:underline` links, `line-through` sale markers, `opacity-50` on remove control.
- `sections/collection.liquid` — removed `overflow-clip!`, unused `group`; kept pagination and grid structure.
- `sections/collections.liquid` — removed link/frame `overflow-hidden`; kept `aspect-square`, added `object-cover` on collection images.
- `sections/footer.liquid` — removed `border-theme-border/50`; kept `border-t border-theme-border` separator.
- `sections/header.liquid` — removed mobile `max-h-[70vh] overflow-y-auto`, open-dropdown `box-shadow`, `rounded-full` badge; kept mobile nav with `px-1` list padding, cart count positioning in `{% stylesheet %}`.
- `sections/main-page-contact.liquid` — removed `rounded` on status boxes; kept `text-error-text` alert and `role` attributes.
- `sections/password.liquid` — removed `/20` border opacities, `tracking-[0.14em] uppercase`, status `border-radius`; kept inline-submit join rules and status borders.
- `sections/product.liquid` — removed gallery `overflow-hidden`, info-block `overflow: hidden`, rgba tints, custom vendor tracking, scrollbar thumb radius; kept product-info block layout CSS and tax note structure.
- `sections/search.liquid` — removed `link-underline`, `placeholder:text-theme-text/50`; kept mobile input floor in `{% stylesheet %}`, replaced link with `underline underline-offset-4`.
- `blocks/button.liquid`, `blocks/heading.liquid` — removed rgba placeholder tints; kept editor placeholder layout.
- `blocks/text.liquid`, `blocks/group.liquid` — unchanged.
- `tailwind/tailwind.utilities.css` — removed `surface-inverted` and long comment; kept `container-page`, `surface-section`, `surface-component` (consumer in `snippets/header-dropdown-menu.liquid`), z-layer scale.
- `docs/references/style-system/css-architecture.md` — removed `surface-inverted` from surface-role list.
- `assets/tailwind.output.css` — regenerated via `npm.cmd run build:tw` (removed `surface-inverted` output).

### Check 1 (decorative-pattern grep)

Command:

```powershell
git grep -n -E "(text|bg|border)-theme-(text|bg|border)/[0-9]+|uppercase|tracking-|shadow-|rounded|group-hover|hover:(bg|text|opacity|scale|border)|link-underline" -- sections layout templates/gift_card.liquid blocks
```

Output: *(empty — exit 0)*.

Check 1 lines kept: none required (grep is clean).

Related state markers not matched by the grep pattern: cart root `:class="{ 'opacity-50 pointer-events-none': $store.cart.loading }"` (loading state); cart remove `opacity-50` (muted control affordance).

### Check 2 (non-styling surface diff)

Commands (throwaway, `$env:TEMP`):

```powershell
$d = git -C "D:\fjh\shopify\my-skeleton-theme" diff -- sections layout templates/gift_card.liquid blocks
($d | Select-String -Pattern '^[+-].*\{%\s*(schema|endschema)').Count   # → 0
$d | Select-String -Pattern '^[+-].*\{%\s*(if|unless|for|case|when|render|assign|liquid|form|paginate)' | Where-Object { $_.Line -notmatch 'class:|placeholder_class:|img_class:' }   # → no output
```

Hook/id lines in diff change only `class` values (`layout/theme.liquid` `<main>`; cart line-item borders). No schema, Liquid tag, visible text, or hook attribute value changes.

### Check 3 (focus clipping)

- `assets/base.css` `.layout` — no `overflow` rule.
- Removed image-frame `overflow-hidden` / `overflow-clip!` from `blog.liquid`, `cart.liquid`, `collections.liquid`, `collection.liquid`, `product.liquid` (gallery panel); collections images crop with `object-cover`.
- Header mobile menu — removed scroll container; added `px-1` on `<ul>` for ring clearance.

Remaining overflow in surface (not image-frame clipping): `header.liquid` stylesheet `overflow: hidden` on `.header-logo__text` (ellipsis); `product.liquid` description `overflow-y: auto` (scroll region). Recorded as open items.

### Check 4 (class consumers)

Command (throwaway `$env:TEMP\batch-c-check4-markup.cjs`): scan `class="..."` tokens in surface Liquid files; verify each against `assets/tailwind.output.css`, `assets/base.css`, `assets/gift-card.css`, section `{% stylesheet %}` blocks, or `assets/*.js`.

Result: Tailwind utilities, layer classes, and stylesheet-defined BEM in `header`, `password`, `product`, and theme blocks all resolve. Open items below list section-root and comment BEM hooks without dedicated CSS (kept per “neither list” rule).

### Check 5

`tailwind/tailwind.utilities.css` defines only `container-page`, `surface-section`, `surface-component`, and `.z-layer-dropdown` / `.z-layer-popover`.

### Check 6 (source review)

Cart loading `:class` overlay, article/contact/password form status and alert roles, search results list and pagination, collection/blog pagination `data-pagination-*` hooks, header dropdown + mobile nav structure, gift card `data-gift-card-*` hooks — unchanged.

### Check 7

```powershell
npm.cmd run build:tw
$h1 = (Get-FileHash assets/tailwind.output.css).Hash
npm.cmd run build:tw
$h2 = (Get-FileHash assets/tailwind.output.css).Hash
# $h1 -eq $h2 → True (idempotent)
```

`git diff --stat` touches only implementation-surface paths plus record files (`docs/agent/context.md`, `docs/references/style-system/css-architecture.md`).

### Check 8 (validators)

```powershell
npm.cmd run lint    # exit 0
npm.cmd test        # exit 0 (Theme Check: 65 files, no offenses)
npx prettier --check assets/base.css layout/theme.liquid sections/article.liquid sections/blog.liquid sections/cart.liquid sections/collection.liquid sections/collections.liquid sections/footer.liquid sections/header.liquid sections/main-page-contact.liquid sections/password.liquid sections/product.liquid sections/search.liquid blocks/button.liquid blocks/heading.liquid tailwind/tailwind.utilities.css docs/references/style-system/css-architecture.md
# exit 0 — All matched files use Prettier code style!
```

### Open items (neither Keep nor Remove list — kept, pending batch D or follow-up)

- (Resolved by the coordinator, below) Section-root and other BEM hooks without CSS or JS.
- (Resolved by the coordinator, below) `.header-logo__text` overflow.
- Password `{% stylesheet %}` inline-submit corner zeroing — compound control join, not standalone decoration.
- Browser pass for focus rings and section layouts — deferred to combined A–D pass after batch D.

### Blockers

None.

### Coordinator correction before review (2026-09-23)

- Unused BEM hooks: the plan's Remove list covers "BEM hook classes that neither CSS nor JavaScript uses"; the implementer kept them as "identity hooks until batch D", but batch D is schema settings, not class names. The coordinator removed the 23 hooks from `class` attributes only: `404-section`, `article-section`, `article-content`, `article-comments`, `article-comments__list`, `article-comments__item`, `article-comments__pagination`, `article-comments__form`, `blog-section`, `cart-section`, `cart__product-link`, `collection-section`, `collections-section`, `custom-liquid-section`, `custom-section`, `footer-section`, `header-search__right`, `main-page-contact-section`, `page-section`, `password-section__field-group`, `product-section`, `product-info-blocks__price`, `search-section`. Before removal, `git grep -w` found no consumer in `assets/*.js`, `.agents/`, `AGENTS.md`, or `docs/` (the two `custom-section` hits in `theme-blocks.md` name the file `sections/custom-section.liquid`). A throwaway scan (`$TEMP/unused-class.cjs`: section, layout, block, and gift-card class tokens against the compiled CSS, `base.css`, `gift-card.css`, every `{% stylesheet %}`, and `assets/*.js`) now reports none. One wrapper in `sections/article.liquid` keeps no class (`<div>` around pagination).
- `.header-logo__text`: the class sits on the link itself (`render 'link', class: 'header-logo__text'`); an element's own `overflow: hidden` clips its content, not its own outline, so the ring is not clipped. No change.
- Validation after the correction: `npm.cmd run build:tw` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on every changed section (a stray `<div >` in `sections/article.liquid` fixed by hand).

### Review 1 (2026-09-23): FAIL, two regressions; corrected by the coordinator

1. Wide RTE tables (and `pre`, whose scroll rule batch B removed) could overflow the page once `.layout` stopped clipping. The user approved widening the surface to two rules in `tailwind/tailwind.components.css` (2026-09-23, "同意"): `.rte table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }` and `.rte pre { max-width: 100%; overflow-x: auto; }`. Wide content now scrolls inside the text instead of being cut off. A narrow table no longer stretches to full width (the `width: 100%` rule went with `display: block`).
2. `header-menu` in `sections/header.liquid` lost its only CSS selector. Removed. The coordinator's earlier unused-class scan had filtered names by pattern, so it was rerun on every class token (`$TEMP/unused-class-all.cjs`): four more unused section classes were removed (`blog-articles-grid`, `blog-pagination-wrapper`, `collection-pagination-wrapper`, `product-info-blocks--form`). Remaining unmatched tokens: `additional-checkout-buttons` (kept: Shopify's dynamic-checkout styles target this wrapper class) and `theme-block-button`, `theme-block-heading`, `theme-block-text` (kept: `docs/references/architecture/theme-blocks.md` names the text wrapper, and block structure waits for the theme-block discussion; recorded on the board).

Pre-existing, recorded on the board: `snippets/product-media.liquid` receives `aspect_ratio` from the gallery but does not pass it to `image`.

- Correction validation: `npm.cmd run build:tw` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on `tailwind/tailwind.components.css` and the four edited sections (a whitespace-only line left by a removed class attribute in `sections/blog.liquid` was deleted by hand).
- Review 2 (2026-09-23): FAIL, below.

### Review 2 (2026-09-23): FAIL, two regressions and one check-wording issue; corrected by the coordinator

1. Blog AJAX pagination broke: `data-pagination-selectors` in `sections/blog.liquid` targets `.blog-articles-grid` and `.blog-pagination-wrapper`, which the coordinator's unused-class removal deleted (its scan searched CSS and `assets/*.js`, not selector strings in `data-*` attributes). Both classes are restored on their elements, as at HEAD. A search for `.<class>` of every removed class across `sections/`, `snippets/`, `blocks/`, `layout/`, `templates/`, and `assets/*.js` finds no other selector reference; `sections/collection.liquid` uses `[data-collection-dynamic-content]`.
2. RTE iframes could widen the page. Fixed in `tailwind/tailwind.components.css` (within the approved RTE widening): `.rte :is(iframe, embed, object) { max-width: 100%; }`.
3. Check 2 said "a Liquid tag", but the batch changes styling arguments inside five `{% render %}` tags (`sections/cart.liquid`, `sections/collections.liquid`, `sections/product.liquid`). The check now allows only `class`, `img_class`, `placeholder_class`, and `wrapper_class` arguments to change; the review found all other Liquid unchanged.

Pre-existing, already on the board: `snippets/product-media.liquid` does not pass `aspect_ratio`.

- Correction validation: `npm.cmd run build:tw` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on `docs/agent/context.md`, `sections/blog.liquid`, and `tailwind/tailwind.components.css`.
- Review 3 (2026-09-23): FAIL, below.

### Review 3 (2026-09-23): FAIL, one focus-clipping defect; corrected by the coordinator

1. `sections/product.liquid` gave `.product-info-blocks__description` `overflow-y: auto` at desktop widths with only right padding. `overflow-y: auto` also computes `overflow-x` to `auto`, so a description link at the left edge lost the left side of its 2px ring at 2px offset. The rule was dead scroll-panel scaffolding: `.product-info-blocks` got `max-height: 100%`, but its parent (`self-start` wrapper) has no definite height, so the description never scrolled. It was a leftover of the sticky side-panel design, which `docs/project.md` leaves to derived themes. The coordinator removed the scroll set: the description's `overflow-y`, `overscroll-behavior`, `padding-right`, and scrollbar styling, and the `.product-info-blocks` `max-height` / `min-height` / child `flex-shrink: 0` rules. `git grep` found no JS or doc consumer of `data-product-info-panel` or `product-info-blocks` sizing.
2. Same root cause: `overflow-visible!` on `.layout` in `sections/product.liquid` (1) and `sections/search.liquid` (2) only overrode the removed `.layout { overflow: hidden }`, so they were removed.

- Remaining `overflow` in the surface: `sections/header.liquid` `.header-logo__text` (on the link itself, which does not clip its own outline; see the earlier coordinator correction) and `overflow-wrap` in `assets/base.css`.
- Correction validation: `npm.cmd run build:tw` exit 0 (drops `overflow-visible!` from the output); `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on `sections/product.liquid` and `sections/search.liquid`.
- Review 4 (2026-09-23): FAIL, below.

### Review 4 (2026-09-23): FAIL, one focus-clipping defect; corrected by the coordinator

1. The review 1 fix made `.rte table` and `.rte pre` `overflow-x: auto` scroll containers, which clip a descendant link's 2px ring at 2px offset at their edges (article, page, and product description content). Fixed in `tailwind/tailwind.components.css` with the inset-ring pattern already used by `snippets/pagination.liquid` and `snippets/localization-switcher.liquid`: `.rte :is(table, pre) :focus-visible { outline-offset: -2px; }`. The ring stays inside the focused element's box, so the scroll container cannot clip it. Cascade: `assets/base.css` is imported `layer(base)` in `tailwind/tailwind.input.css`, so the components-layer rule overrides the global `outline-offset: 2px`.

- Correction validation: `npm.cmd run build:tw` exit 0 (output contains the rule); `npm.cmd run scan:compat` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; prettier passes on `tailwind/tailwind.components.css` and this file.
- Status: waiting on fifth independent review (step 7). Scope: commit 026ecf0 plus the uncommitted working-tree changes.
- Review 5 (2026-09-23): PASS, below.

### Review 5 (2026-09-23): PASS

No blocking findings. The verifier re-ran `npm.cmd run build:tw` (hash unchanged), `scan:compat`, `lint`, `test`, prettier on the 24 changed non-generated files, and `git diff --check 026ecf0~1`; all passed (Theme Check: 65 files, 0 offenses). It confirmed the `.rte :is(table, pre) :focus-visible` inset wins by layer order, and its exhaustive clipping sweep found no clipped focus ring: `.rte table` / `.rte pre` (inset ring), `.header-logo__text` (clips its own content only), `.sr-only` (sibling indicators), `.accordion__panel-inner` (4px inset), `.theme-image` / `.media-placeholder-frame` (linked image is the clipping element), `.localization-menu` and `.pagination__pages-wrap` (inset rings), `.variant-picker__swatch` (no focusable child). Outside the surface, `assets/gift-card.css` clips no focusable descendant.

- Remaining verification: the combined A–D browser pass (user) after batch D, with this batch's list under "Browser pass" above.
