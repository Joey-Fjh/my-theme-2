# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-23.

## Plan: small-items batch

**Status:** executed; independent review PASS (2026-09-23); waiting on the user's browser pass (acceptance check 6).

**Authorization:** the user authorized this batch on 2026-09-23 ("2 的话直接改"), after the IDE's bundled Theme Check reported two warnings the CLI Theme Check does not run (`MissingRenderSnippetArguments`, `ValidRenderSnippetArgumentTypes`). The JS leftover cleanup is postponed.

**Review tier:** Ask (Liquid markup; deletions).

**Outcome:** the board's small items are fixed, and the IDE Theme Check reports no warning for them.

**Dependencies:** none.

### Items

1. `snippets/accordion.liquid`: panels stay readable without JavaScript. Only an Alpine-bound `is-collapsed` class collapses a panel, so server markup renders every panel open. Remove the unused `show_clear` / `clear_url` / `clear_label` clear link (the only consumer, `sections/product.liquid`, never passes it; it was an interactive element nested in the trigger button) and its locale key `accessibility.clear_item` if nothing else uses it. Replace the `'null'` string for `initial_active` with a boolean `collapsed` parameter, so the declared `{number}` type holds; `sections/product.liquid` passes `collapsed: true`.
2. `snippets/image.liquid`: document `image` as optional, because the snippet renders a placeholder without it (`sections/cart.liquid` placeholder call).
3. `snippets/product-media.liquid`: pass `aspect_ratio` on to `snippets/image.liquid` for image and video previews.
4. `snippets/header-dropdown-menu.liquid`: the parent item inside `<summary>` renders its title as plain text, not `<a href="">`.
5. `tailwind/tailwind.elements.css`: delete the unused `field-select` utility.

### Implementation surface

`snippets/accordion.liquid`, `snippets/image.liquid`, `snippets/product-media.liquid`, `snippets/header-dropdown-menu.liquid`, `sections/product.liquid` (accordion call only), `tailwind/tailwind.elements.css`, `locales/en.default.json` (only a key left unused), `assets/tailwind.output.css` (regenerated only), and the record files. Forbidden: `assets/*.js`, merchant-owned files, and everything else.

### Acceptance checks

1. With JavaScript, a product collapsible tab starts closed and toggles; `aria-expanded`, `inert`, and `aria-hidden` follow its state. Without JavaScript, its content is visible (server markup has no `is-collapsed`).
2. `git grep -n -E "show_clear|clear_url|clear_label|clear_item|field-select" -- . ':!assets/tailwind.output.css'` prints nothing.
3. No `<summary>` in `snippets/header-dropdown-menu.liquid` contains an `<a>`; the dropdown still opens and closes by click and keyboard.
4. The product gallery images receive the gallery `aspect_ratio`.
5. `npm.cmd run build:tw`, `npm.cmd run lint`, and `npm.cmd test` pass; prettier passes on every changed file; `git diff --stat` stays inside the surface.
6. Browser (user): product page tabs with and without JavaScript, gallery ratio, header dropdown by mouse and keyboard, and the IDE Problems panel after a window reload.

## Progress

- Item 1: `snippets/accordion.liquid` panels are open in server markup; `:class="!isActive(...) && 'is-collapsed'"` collapses them once Alpine runs (CSS: `.accordion__panel` is `1fr`, `.accordion__panel.is-collapsed` is `0fr` with `opacity: 0`). The clear link and its three parameters are gone, and so is `accessibility.clear_item` (no other consumer). `collapsed` (boolean) replaces the `'null'` string; `data-initial-active` is `null` when `collapsed`, else `0` in single-item mode, else `initial_active`. `sections/product.liquid` passes `collapsed: true`. Found while editing, same snippet: each trigger `<button>` contained an `<h2>` (and, in single-item mode, a `<div>`), which is invalid inside a button and hides the heading from heading navigation. All three modes now render `<h2><button>…<span class="accordion__title">…</span>…</button></h2>`; title classes and the Alpine `titleClass` binding moved to the span unchanged. `assets/alpine.components.ui.js` does not query the title element (unchanged).
- Item 2: `snippets/image.liquid` documents `[image]` as optional.
- Item 3: `snippets/product-media.liquid` passes `aspect_ratio` to all four `image` renders (image, video, external video, and model previews).
- Item 4: `snippets/header-dropdown-menu.liquid` renders the top-level parent title as a `<span>` inside `<summary>`; the nested `<summary>` at the second level already had no link.
- Item 5: `field-select` deleted from `tailwind/tailwind.elements.css`; `assets/tailwind.output.css` is unchanged, because Tailwind never emitted the unused utility.
- Board: the four finished items are removed from `docs/agent/board.md`.
- Check 2: `git grep -n -E "show_clear|clear_url|clear_label|clear_item|field-select" -- . ':!assets/tailwind.output.css' ':!docs/agent'` prints nothing.
- Validation: `npm.cmd run build:tw` exit 0; `npm.cmd run lint` exit 0; `npm.cmd test` exit 0 (the CLI Theme Check does not run `MissingRenderSnippetArguments` or `ValidRenderSnippetArgumentTypes`; the IDE Problems panel confirms those after a window reload); prettier passes on every changed file.

### Review (2026-09-23): PASS

No defects in the authorized diff. The verifier traced all three accordion modes through the Alpine component (initial state, toggling, ARIA, `inert`, no-JS open panels, valid `<h2><button>`), confirmed the removed parameters, locale key, and `field-select` have no consumer, checked the LiquidDoc types of every render call, the gallery ratio path (frame mode, 3/4, `object-cover`; at HEAD each preview derived its ratio from the image), and the dropdown `<summary>` markup, JS, and CSS. It re-ran `build:tw` (hash unchanged), `lint`, `test` (65 files, 0 offenses), prettier on all 9 changed files, and `git diff --check`, all passing. Remaining: the user's browser pass.
