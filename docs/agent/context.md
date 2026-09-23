# Project Context

Holds the plan currently under execution and its status. Nothing else. The Alpine-rule batch waits on review by another session; batch E runs after it. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-23.

## Plan: restore the Alpine-expression rule and its check

**Status:** executed; independent review PASS (review 4, 2026-09-23); waiting on the user's browser pass (acceptance check 3; add the quantity selector's error description).

**Authorization:** the user authorized this batch on 2026-09-23 ("授权"), after confirming the rule is a standing project rule (`docs/agent/board.md`, rule history: removed by `66338cd` and `15dff78`).

**Review tier:** Ask (agent rules and validator changes; `assets/*.js`; Liquid markup).

**Outcome:** the rule is back in `AGENTS.md` and `docs/references/architecture/javascript-runtime.md`, `lint:theme` enforces it with tests, and the theme has no violation.

**Dependencies:** none.

### Rule

Alpine attributes hold simple expressions: component method calls, state reads, and object or ternary expressions for bindings. Statements (`;`, `let` / `const` / `var`, `if` / `for` / `while` / `switch`), arrow functions, and `function` belong in the registered component. Liquid values never appear inside an Alpine attribute; they reach the component through `data-*` (the existing rule).

### Implementation surface

- `AGENTS.md`: one line under "Hard implementation rules", next to the `data-*` rule.
- `docs/references/architecture/javascript-runtime.md`: the rule with a short don't/do example using the current `define` adapter.
- `.agents/skills/check-theme-architecture/scripts/lint-theme.js` and `theme-architecture.test.js`: the check and its tests; `.agents/skills/check-theme-architecture/SKILL.md`: list the check.
- Violations found by the scan (2026-09-23): `sections/blog.liquid` and `sections/collection.liquid` pagination `@click` (move into `sectionPagination`, `assets/alpine.components.pagination.js`); `snippets/localization-switcher.liquid` `@keydown.escape.window` (move into `localizationSwitcher`, `assets/alpine.components.ui.js`); `sections/cart.liquid` `x-show` / `x-text` with `errors['{{ … }}']` (pass the key through `data-*`).

Forbidden: everything else.

### Acceptance checks

1. `npm.cmd run lint:theme` fails on a fixture for each statement form and for Liquid inside an Alpine attribute, and passes on multi-line `:class` objects and ternaries (tests in `theme-architecture.test.js`).
2. `npm.cmd run lint:theme` passes on the theme.
3. Pagination links in blog and collection still load through section refresh; the localization menu still closes on Escape and returns focus to its trigger; cart line errors still show for the right line (source review; browser pass by the user).
4. `npm.cmd run lint`, `npm.cmd test`, and `npm.cmd run doctor:agent` pass; prettier passes on every changed file.

## Progress (Alpine-rule batch)

- Rule: `AGENTS.md` hard rules gain "Keep Alpine attributes to simple expressions (method calls, state reads, binding objects or ternaries); put logic in the registered component. `lint:theme` enforces this." `docs/references/architecture/javascript-runtime.md` "Module Discovery Contract" gains the rule and a don't/do example; `.agents/skills/check-theme-architecture/SKILL.md` lists it as rule 5.
- Check: `collectAlpineExpressionFailures` in `lint-theme.js` inspects `@*`, `:*`, `x-on:*`, `x-bind:*`, and value-taking `x-*` attributes; it fails on Liquid output or tags, `;`, `let` / `const` / `var`, `if` / `for` / `while` / `switch (`, `=>`, and `function`, after replacing string literals. Multi-line binding objects and ternaries pass: a pre-implementation scan showed three of them (`snippets/buy-buttons.liquid`, `snippets/product-variant-picker.liquid` twice), so line breaks are not a criterion. Seven fixture tests (six failing forms, one passing set).
- Violations fixed: `sectionPagination.onNavClick(event)` (`assets/alpine.components.pagination.js`) replaces the inline `@click` in `sections/blog.liquid` and `sections/collection.liquid`; `localizationSwitcher.onEscape()` (`assets/alpine.components.ui.js`) replaces the inline Escape handler in `snippets/localization-switcher.liquid`; `sections/cart.liquid` passes the line key as `data-line-key` and reads `errors[$el.dataset.lineKey]`.
- Check 1: `npm.cmd run test:theme-architecture`: 44 tests, 44 pass, including the seven new ones.
- Check 2: `npm.cmd run lint:theme` passes on the theme. Run against a `git archive HEAD` copy, it reports exactly the five former violations (blog, cart x2, collection, localization switcher).
- Check 4: `npm.cmd run lint` exit 0; `npm.cmd test` exit 0; `npm.cmd run doctor:agent` exit 0; prettier passes on every changed file.

### Review 1 (2026-09-23): FAIL, validator gaps; corrected by the coordinator

1. False negatives: bare `x-bind`, plugin directives such as `x-intersect`, and attributes inside Liquid conditional branches (`{% if %}@click="…"{% endif %}`, whose AST attributes sit in `LiquidTag` children) were not checked; code inside template-literal `${…}` was stripped with the string.
2. False positives: HTML entities such as `&quot;` and `&#34;` produced a "semicolon" failure.

Corrections in `lint-theme.js`: every `x-*` attribute is checked except the non-expression directives `x-cloak`, `x-ignore`, `x-ref`, `x-teleport`, and `x-transition*`; `flattenAttributes` descends into Liquid branch children; `decodeHtmlEntities` runs before analysis; `stripJsStringLiterals` is a small tokenizer that drops quoted and template text but keeps `${…}` code. Four failing fixtures (bare `x-bind`, `x-intersect`, conditional attribute, template interpolation) and passing cases (entities, template literals without logic, escaped quotes, `x-cloak` / `x-ref` / `x-transition:enter`) were added: 48 tests, 48 pass. The wider check found one more violation, now fixed: `snippets/quantity-selector.liquid` `:aria-describedby` embedded `{{ qty_feedback_id }}`; it now reads `$el.dataset.feedbackId` from a new `data-feedback-id` on the same input (no other `feedbackId` consumer). Against the `git archive HEAD` copy the check reports six violations (the five before plus this one); on the theme it passes. `SKILL.md` rule 5 describes the widened coverage.

### Review 2 (2026-09-23): FAIL, regex edge cases; the check now parses JavaScript

Review 2 found a false negative (`@click="if/*x*/(open) close()"` passed, because the control-flow regex allowed only whitespace before `(`), false positives for valid entities (`&nbsp;`, `&NewLine;`), a crash on `&#x110000;`, and an unterminated string hiding a semicolon. The user chose (2026-09-23) to replace the regex patterns with a JavaScript parser: `espree` (already installed by ESLint at 10.4.0) is now a declared devDependency (`package.json`, `package-lock.json`). `describeAlpineExpressionProblem` parses each value as `(value
)`; a parse failure means statements or invalid JavaScript, and an AST walk fails on functions, arrow functions, classes, and comma sequences (allowed in `x-for`). Comments, strings, and template literals are handled by the parser. `decodeHtmlEntities` decodes numeric entities and `amp`, `apos`, `gt`, `lt`, `nbsp`, `newline`, `quot`, `tab`; an out-of-range code point or any other named entity is reported as an entity the check cannot read instead of throwing. Tests: 54, all passing, including the review's cases. The theme passes; the `git archive HEAD` copy still reports the same six violations. `SKILL.md` rule 5 describes the parser-based check.

### Review 3 (2026-09-23): FAIL, two parser findings; corrected by the coordinator

1. Wrapper escape: `@click="a); if (open) close(); (b"` passed, because only `program.body[0]` was examined. `parseSingleExpression` now requires one `ExpressionStatement` and, from the parser's tokens, that the wrapper's opening parenthesis closes only at the last token; `a) + (b` fails too.
2. Valid `await` failed (`x-text="await getLabel()"`, `x-init="await load()"`, both in Alpine's docs). Values are now parsed as module code, which allows top-level `await`.
3. Limitation fixed: the comma-sequence exception now covers only the left binding of `x-for` (`(item, index)`); the source after `in` / `of` is checked normally.
4. `package-lock.json`: `npm install` had rewritten espree's `resolved` URL to the machine's registry mirror (`registry.npmmirror.com`); it is restored to `registry.npmjs.org`, so the lockfile diff only adds `espree` to the root devDependencies.

Tests: 57, all passing (new failing fixtures: two wrapper escapes, an x-for source sequence; new passing forms: `await`, `i in 10`, parenthesized operands). The theme passes; the `git archive HEAD` copy still reports six violations.

### Review 4 (2026-09-23): PASS

No findings under the stated bar. The verifier confirmed statement, wrapper-escape, function, and x-for source checks; valid bindings, assignments, optional chaining, template literals, comments, `$event`, `$nextTick(focus)`, `await`, and the documented x-for forms pass. Lockfile: only the root `espree` devDependency is added (10.4.0, `registry.npmjs.org`, same integrity). 57 tests pass; removing the check fails all 19 violation tests; the HEAD copy reports exactly six violations; `lint`, `test` (65 files, 0 offenses), `doctor:agent`, prettier, and `git diff --check` pass. Limitations accepted: a contrived nested comma in the x-for left binding (`(item, (index, other)) in items`) passes; unknown named HTML entities are rejected. Remaining: the user's browser pass.

## Plan: batch E, theme content to the simplest use of the frame

**Status:** planned and authorized; not started. Execute after the Alpine-rule batch above passes review, because both touch `sections/blog.liquid`, `sections/collection.liquid`, `sections/cart.liquid`, and `snippets/localization-switcher.liquid`.

**Authorization and decisions (user, 2026-09-23):** the template's value is its external frame, which is strict; theme content has few business constraints. Official Skeleton is an abstract reference only: a file there shows that a capability may exist here, not what its code looks like ("官方只是参考，并不是以官方为基点"). Section frame: one element with one class ("One element, one class"). Snippets: delete `link` and `rte-compact-prose`; keep `loading`. Header cart count badge: delete it ("购物车角标这个也干掉把 … 有文档架构就可以了"); the cart link keeps its accessible name, and `$store.cart.item_count` stays (read by `assets/alpine.components.product.js`).

**Review tier:** Ask (Liquid markup and schema; deletions; external execution prompt).

**Outcome:** every section, snippet, block, layout, and the gift card template is the simplest implementation that uses the retained frame correctly. Nothing carried over from the earlier theme's layout or styling remains.

**Dependencies:** the Alpine-rule batch passes review.

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
