# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-23.

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

## Progress

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
