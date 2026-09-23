# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-23.

## Plan: batch E, theme content to the simplest use of the frame

**Status:** planned and authorized; not started. The Alpine-rule batch it depended on is committed.

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

Not started.
