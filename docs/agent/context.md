# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## BP-2 backport: runtime loader, entry scripts snippet, two framework defects

**Status:** direction accepted by the user on 2026-10-13 in the `my-theme-1` session: the skeleton stays thin (its own sections and Theme Blocks), and the backport brings the outer framework, not the derived theme's business organization. Recorded by that session's coordinator. **The user authorized this batch on 2026-10-13 by starting its execution prompt in this repository**; execution by the Implementer began on branch `backport/agent-layer`.

**Outcome:** the skeleton loads components the way the derived theme does after its batches 5-S and 5-H: the import map and entry scripts live in a snippet, and module roots are held by an init interceptor instead of the claim scan. Two defects found in the derived theme's framework pass are fixed here too. No new feature module arrives.

**Source:** `../my-theme-1` at commit `388f58e`. Read source files with `git -C ../my-theme-1 show <commit>:<path>`, never from its working tree, and never write to it. Source commits for single changes: `2e0cddd` (5-S), `2683402` (5-H), `528a715` (6-F1).

**Review tier:** Ask (Liquid markup, `assets/*.js`, validators, references, `AGENTS.md`).

**Branch:** continue on `backport/agent-layer` (BP-1 is committed there as `b676754`). No commit unless the user asks.

**Dependencies:** acceptance checks 9 and 10 need `npm.cmd run shopify:dev` running in this repository against a development store; the user starts it. Everything else needs nothing.

### Implementation surface

**A. Entry scripts snippet (5-S)**

1. `snippets/scripts.liquid` (new): the import map, the `base.js` module entry and the classic Alpine script, moved verbatim from this repository's `layout/theme.liquid`, in the same order, with their comments. The import map keeps exactly this repository's entries; no entry from the source is added. The file's header comment is taken from the source snippet.
2. `layout/theme.liquid`: the moved block is replaced by `{% render 'scripts' %}` at the same position (inside `<head>`, before `content_for_header`). Nothing else in the layout changes.
3. `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js` and `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`: the change of source commit `2e0cddd` to these two files, applied as a patch (`git -C ../my-theme-1 format-patch -1 2e0cddd --stdout -- <the two paths> | git apply`; `git apply --check` passed on 2026-10-13). No other validator change.

**B. Loader by init interception (5-H)**

4. `assets/alpine.adapter.js`: byte-identical to the source at `388f58e` (`defer` is replaced by `holdUntilReady` and `releaseHold`).
5. `assets/https.js`: byte-identical to the source at `388f58e`. First confirm that its difference from this repository's file is the one comment block; if anything else differs, stop and report.
6. `assets/base.js`: this repository's file with the loader changed as in the source at `388f58e`: `holdForModule` registered through `adapter.holdUntilReady`, `scanModules` as download-ahead only, `liveModuleRoots`, no mount after a failed import, the hold released for removed roots, and the moved-node fix in the mutation observer. **Not taken from the source:** the imports of `vendor-alpine-intersect.min.js`, `dialog.js` and `toast.js`; the announcement bar members; the `dialog` and `toast` stores; `showMutationErrorToast`.
7. `docs/references/architecture/javascript-runtime.md`, `docs/references/code-review/browser-compatibility.md`: every statement about where the import map lives, about `defer` / claiming, and about `scanModules` is brought in line with the code of this batch, using the source references' wording at `388f58e`. Nothing about the dialog layer, the toast store, the Intersect plugin or other modules this repository does not have.
8. `AGENTS.md`, Tech Stack: the adapter list (`define`, `holdUntilReady`, `mount`, `releaseHold`, `unmount`, `store`, `data`) and the sentence that the layout renders `snippets/scripts.liquid`, both in the source wording.

**C. Two framework defects (6-F1)**

9. **Menu `aria-expanded`.** `snippets/header-dropdown-menu.liquid` binds `:aria-expanded="$el.parentElement.open"` on two summaries, and `assets/dropdown.js` opens with a DOM attribute Alpine does not track, so the state stays `false`. As in source commit `528a715`: `dropdown.js` gets one helper that writes `aria-expanded` on a dropdown's own `summary.dropdown-trigger` (a no-op when there is none), called wherever `open` is set or removed, and an `init()` that writes the initial state; the two Liquid bindings are removed, and no static attribute is added. This repository's `dropdown.js` differs from the source's, so the change is written against this file, not copied.
10. **Spinner recipe timing.** `tailwind/tailwind.animates.css`: the `spinner` utility's animation becomes `spinner-turn 0.8s linear infinite` (it runs on the transition tokens today, a turn that decelerates to a stop each cycle). `assets/tailwind.output.css` is regenerated with `npm.cmd run build:tw`, never edited by hand. If a reference quotes the old timing, the quote is corrected.
11. This file and `docs/agent/board.md`.

**Not in this batch:** `assets/events.js` and `assets/utils.js` (the source's additions serve the derived theme's modules); the dialog layer, the toast store, the Intersect plugin, the Swiper and GSAP adapters and every other module this repository does not have (a module arrives with its first consumer); CSS and token changes other than item 10; the other validators.

**Forbidden:** `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, vendor files, `blocks/`, any file not listed above, commits, `prettier --write`, `git stash` / `checkout` / `reset` on the working tree, and any write to `../my-theme-1`.

### Acceptance checks

1. `git status --short` lists only surface files; state the count from the command.
2. `git diff -- layout/theme.liquid` removes the entry-scripts block and adds the one render tag, nothing else. The import map in `snippets/scripts.liquid` has the same entries, in the same order, as the block removed from the layout (show the comparison command).
3. `assets/alpine.adapter.js` and `assets/https.js` are identical to `git -C ../my-theme-1 show 388f58e:<path>`.
4. `assets/base.js`: none of these strings occurs: `vendor-alpine-intersect`, `dialog.js`, `toast.js`, `createDialogStore`, `createToastStore`, `announcementBar`, `showMutationErrorToast`, `adapter.defer`, `__themeModuleClaimed`. A diff against the source at `388f58e` shows only the "Not taken" parts.
5. `git grep -n "adapter.defer" -- assets` finds nothing, and `git grep -n ":aria-expanded=\"\$el.parentElement.open\"" -- snippets sections` finds nothing.
6. `npm.cmd run test:validators` passes; state the counts before (taken before the first edit) and after, from the command output, and explain the difference by the tests of `2e0cddd`.
7. `npm.cmd run lint` and `npm.cmd run test:theme-check` pass; `npm.cmd run doctor:agent` exits 0.
8. `assets/tailwind.output.css`: `git diff` shows the `spinner` animation line only (plus any utility Tailwind stops or starts generating because of this batch's markup; list them).
9. **Browser, Chrome DevTools MCP against `shopify theme dev`, 1440 and 390:** home, a product, a collection, cart and search load with no failed module import, no Alpine expression error and no theme-asset 4xx. On a product: variant change, quantity, add to cart. On a collection: pagination through the section refresh. A `data-module-lazy` root, if the skeleton has one, mounts when scrolled into view.
10. **Browser, menu:** for a first-level trigger (and a nested one if the store's menu has it): `aria-expanded` is `"false"` after load, `"true"` when open by pointer and by Enter, `"false"` after Escape and after a click outside.
11. `review-animations` (`SKILL.md` and `STANDARDS.md`) run on the motion diff of item 10; output recorded here.
12. `git diff --check` is clean; `npx prettier --check` passes on every changed file Prettier covers.
13. Independent review (Ask) reports PASS.

Checks 9 and 10 may be left to the independent review when the implementer's session has no browser tool; say so in the record.

### BP-2: executed

Executed on branch `backport/agent-layer` (HEAD `0372d44`, BP-1 committed as `b676754`) on 2026-10-13. Nothing committed. Source: `../my-theme-1` at `388f58e` (file contents) and `2e0cddd`, `528a715` (single changes), read with `git -C ../my-theme-1 show` / `format-patch`; that repository was not written to.

**Baseline** (before the first edit), `npm.cmd run test:validators`: i18n 32, theme-architecture 105, section-stylesheet-carry 3, doc-paths 7, ci-contract 18; 165 pass, 0 fail.

**Part A.**

- `snippets/scripts.liquid`: header comment from the source snippet; the import map comes from this repository's layout; the three entry scripts and their comments follow. `layout/theme.liquid`: lines for the moved block replaced by `{% render 'scripts' %}` at the same position.
- Validator: `git -C ../my-theme-1 format-patch -1 2e0cddd --stdout -- <theme-contracts.js> <theme-architecture.test.js> | git apply` (`git apply --check` passed first; applied cleanly).

**Part B.**

- `assets/alpine.adapter.js` and `assets/https.js`: written byte-identical to `388f58e`. Before copying, `git diff --no-index` showed that `https.js` differed from this repository's file by the one `replaceRegion` comment block only, and the adapter by `defer` replaced with `holdUntilReady` plus the new `releaseHold` only.
- `assets/base.js`: this repository's file; the loader section (`activateModuleRoot` through `releaseModuleRoots`) was replaced with the source's, plus the `node.isConnected` guard in the mutation observer. The remaining diff against the source is exactly the "Not taken" parts (imports of `vendor-alpine-intersect.min.js`, `dialog.js`, `toast.js`; `announcementBar` members; `dialog` and `toast` stores; `showMutationErrorToast`).
- `docs/references/architecture/javascript-runtime.md`: adapter row and table, import-map location, Script Load Order, Module Discovery Contract (interceptor, `scanModules` as download-ahead, correctness paragraph), lifecycle table, in the source wording. Two source sentences were shortened because they named modules this repository lacks: the `countdown-timer.js` / `flip-digit` example and the `data-motion-*` example.
- `docs/references/code-review/browser-compatibility.md`: the entry-scripts sentence.
- `AGENTS.md` Tech Stack: the adapter list and the sentence that the layout renders `snippets/scripts.liquid`.

**Part C.**

- `assets/dropdown.js`: `setExpanded(target, expanded)` writes `aria-expanded` on the dropdown's own `:scope > summary.dropdown-trigger` (no-op without one); `init()` writes the initial state from `open`; it is called at the two places that set or remove `open` (`open()` and `closeFromDepth()`). `git grep` for `setAttribute('open'` / `removeAttribute('open'` / `.open` across `assets`, `snippets`, `sections`, `blocks` found those two only; `localization-switcher.js` uses reactive `open` state and was left alone.
- `snippets/header-dropdown-menu.liquid`: the two `:aria-expanded` bindings removed; no static attribute added.
- `tailwind/tailwind.animates.css`: `spinner` animation is `spinner-turn 0.8s linear infinite`, with the source's one-line comment above the keyframes. `assets/tailwind.output.css` regenerated by `npm.cmd run build:tw`. `docs/references/style-system/css-architecture.md` quoted the old timing in its recipe example; the quote was corrected (item 10's allowance).

**Acceptance checks (command, result):**

1. `git status --short`: 16 lines (15 modified including `docs/agent/context.md`, 1 untracked `snippets/scripts.liquid`); all surface files.
2. `git diff -- layout/theme.liquid`: 38 lines removed, one added (`{% render 'scripts' %}`). Import map comparison: `diff <(sed -n '/<script type="importmap">/,/<\/script>/p' layout/theme.liquid | sed 's/^ *//') <(sed -n '/<script type="importmap">/,/<\/script>/p' snippets/scripts.liquid | sed 's/^ *//')` run before the layout edit: no difference.
3. `git -C ../my-theme-1 show 388f58e:<path>` piped to `cmp` for `assets/alpine.adapter.js` and `assets/https.js`: both identical.
4. `grep -E` of the nine listed strings in `assets/base.js`: 0 matches; diff against the source shows only the "Not taken" parts.
5. `git grep -n "adapter.defer" -- assets`: nothing. `git grep -n ':aria-expanded="$el.parentElement.open"' -- snippets sections`: nothing.
6. `npm.cmd run test:validators`: i18n 32, theme-architecture 109, section-stylesheet-carry 3, doc-paths 7, ci-contract 18; 169 pass, 0 fail. Difference from the baseline: +4, all in the theme-architecture suite, from the test file of `2e0cddd` (entry-scripts snippet contract).
7. `npm.cmd run lint`: exit 0 (including `lint:theme`, `lint:compat`, `lint:doc-paths`, `format:check`). `npm.cmd run test:theme-check`: 64 files, no offenses, exit 0. `npm.cmd run doctor:agent`: exit 0.
8. `git diff -- assets/tailwind.output.css`: one line changed, the `spinner` animation; no other utility changed.
9. **Not run.** This session has no Chrome DevTools MCP or other browser tool and `shopify theme dev` was not started. Left to the independent review (allowed by the plan).
10. **Not run**, same reason. Verified statically only: the two bindings are gone, `init()` and the two `setExpanded` calls exist. Escape and click outside both go through `closeFromDepth()`.
11. `review-animations` (`SKILL.md`, `STANDARDS.md` read by path) on the motion diff of item 10 (`file: tailwind/tailwind.animates.css`, `@utility spinner`):

    | Before | After | Why |
    | --- | --- | --- |
    | `spinner-turn var(--motion-duration-base) var(--motion-ease) infinite` | `spinner-turn 0.8s linear infinite` | Constant motion is `linear` (STANDARDS, Easing); the ease curve made each turn decelerate to a stop. Already applied; no further finding. |

    Verdict: **Approve.** Animates `transform` only; a looping state indicator, so the 300ms UI budget does not apply to its period; reduced motion is already handled by the existing `@media (prefers-reduced-motion: reduce)` rule (`animation: none; opacity: 0.65`). Optional, out of scope: that rule stops the indicator entirely, where STANDARDS asks for "gentler, not zero".
12. `git diff --check`: exit 0. `npx prettier --check` on every changed file: covered by `format:check` in `npm.cmd run lint` ("All matched files use Prettier code style").
13. Pending: independent review (Ask).

**Deviations and notes:**

- `snippets/scripts.liquid`, comment 2 ("Core entry"): the source wording replaces this repository's old sentence ("claim component roots"), because the old sentence would describe code that no longer exists. The import map and the three script tags are unchanged.
- `docs/references/style-system/css-architecture.md` was edited for the quoted timing, as plan item 10 allows; it is not in the item 7 list.
- Checks 9 and 10 are the open risk of this batch: the loader change is behavioural (hold-and-mount through `Alpine.interceptInit`), and only a browser pass shows it.

## BP-2: coordinator check

Coordinator of the `my-theme-1` session, 2026-10-13, read-only, before the independent review. Consistent with the implementer's record: `git status --short` shows surface files only; `assets/alpine.adapter.js` and `assets/https.js` compare equal to `388f58e` through `cmp`; the nine excluded strings give 0 matches in `assets/base.js`, and its diff against the source shows only the "Not taken" parts; the layout diff adds the one render tag; the import map has the same 15 entries; `assets/dropdown.js` gained the helper, `init()` and the calls, and the two Liquid bindings are gone.

## BP-2: independent review, round 1

External Verifier session, 2026-10-13, read-only, with Chrome DevTools MCP against `shopify theme dev`. The report was given in chat; its evidence is summarised here.

**Verdict: FAIL**, for one finding that is not a regression of this batch.

- **Finding, acceptance blocker, pre-existing.** `assets/https.js` sends `Accept: application/json` by default. For the collection's section request (`<page url>?sections=<id>`) the dev storefront answers 404, and `assets/section-pagination.js` then falls back to a full-page navigation. Same URL: default browser headers 200 JSON; `Accept: application/json` 404; `X-Requested-With: XMLHttpRequest` alone 200; both 404. The header and the fallback are unchanged from HEAD, so acceptance check 9 (pagination through the section refresh) could not pass.

**Proven by the Verifier:**

- **Scope:** 15 modified files and 1 new file, all authorized.
- **Entry scripts:** the import-map entries and their order equal the removed layout block; script order unchanged; the render precedes `content_for_header`; password and gift-card files untouched.
- **Loader:** adapter and HTTP files byte-identical to `388f58e`; no `adapter.defer`, no claim-scan consumer, no reference to an absent module. `assets/base.js` changes only the loader against HEAD; its differences from the source are the planned exclusions.
- **Validators:** applying `2e0cddd` to scratch HEAD files reproduces both changes exactly (apart from checkout line endings); scratch checks reject a missing render, a missing map and a malformed map.
- **References:** they match the code; the three recorded deviations are justified.
- **CSS:** only the spinner animation line changed; the recorded motion review (Approve) is appropriate.
- **Browser, 1440 and 390:** home, product, collection, cart and search roots initialize once, with no duplicate mount, no held root left in view, no failed theme-module request and no Alpine expression error. Variant selection, quantity and add to cart work. First-level and nested menus keep `aria-expanded` in step for pointer and Enter opening, Escape and outside click; server-rendered summaries carry no stale attribute. A diagnostic offscreen lazy root stays held and initializes once after scrolling. A successful response passed straight to `SectionRefresher` creates a replacement root that initializes once (a diagnostic, not a substitute for the pagination check).
- **Other console errors, not theme-module failures:** the Shopify account-menu API 400, a Shop account 403 and iframe CSP errors.
- **Fresh runs:** `npm.cmd run test:validators` 165 on HEAD and 169 on the working tree (architecture suite 105 → 109); `npm.cmd run lint` exit 0; `npm.cmd run test:theme-check` 64 files, no offenses; `npm.cmd run doctor:agent` exit 0; `npx prettier --check` exit 0; `git diff --check` clean.

**Correction (coordinator, 2026-10-13), an addition to the surface under part C (a third framework defect):**

- **Reproduced without a browser** against the running dev server: `curl` on `/collections/all?sections=main` gives 200 with no `Accept`, with `Accept: */*` and with `Accept: text/html`; 404 with `Accept: application/json` and with `Accept: application/json, text/javascript, */*; q=0.01`. So any `Accept` that names JSON for a page URL is answered 404.
- **Change:** `assets/section-pagination.js` passes `headers: { Accept: '*/*' }` on its one `?sections=` request (the request helper merges per-call headers over the defaults). `assets/https.js` stays byte-identical to the source, and the default header stays for the Ajax API calls, which use `.js` endpoints.
- **Why here and not in the defaults:** this is the only GET of a page URL with `sections=` in this repository (`git grep -n "sections=" -- assets`); changing the default would touch every cart call for no gain.
- **Not known:** whether the live storefront answers the same way as the dev proxy. The change is correct for both.
- **The derived theme has the same request** (`../my-theme-1`, `assets/section-pagination.js`), so the same defect; recorded on its board.

## BP-2: independent review, round 2

External Verifier session, 2026-10-13, read-only, with a browser against `shopify theme dev`. The report was given in chat; its evidence is summarised here.

**Verdict: FAIL**, for one low-impact wording finding. The pagination fix, the cart regression check and every command check passed.

- **Finding, low impact, text only.** The comment above the `Accept` header in `assets/section-pagination.js` said the Section Rendering API returns JSON "for any Accept". Measured on the dev store: `Accept: */*` gives 200 and section JSON; `Accept: application/json` gives 404 with a body that does not parse as JSON. The comment must be limited to the behaviour that was verified.

**Proven by the Verifier:**

- **Pagination, 1440 and 390:** the collection's `?sections=` requests return 200; no full-page navigation; the URL updates; back and forward restore the matching product list. The region replaced in ordinary pagination holds no module root; a whole-section replacement through the section refresh mounts the newly inserted `section-pagination` root exactly once.
- **Request:** it carries `Accept: */*` and `X-Requested-With: XMLHttpRequest`. The merge order in `assets/https.js` supports a per-call `Accept`; that file's Git object hash equals the source commit's. `sections=` occurs once under `assets/`.
- **Cart:** add to cart takes the count from 1 to 2 (test item removed afterwards). Changing this one call and keeping the cart's default header is justified.
- **Record:** the round 1 summary above matches the round 1 report; against round 1 the only new implementation change is the two lines in `assets/section-pagination.js`.
- **Fresh runs:** `npm.cmd run lint` passes; `npm.cmd run test:theme-check` 64 files, 0 offenses; `npm.cmd run test:validators` 169 pass, 0 fail; `git diff --check` no output; `git status --short` 16 modified files and the new `snippets/scripts.liquid`.

**Not proven:** whether the live storefront answers `Accept` the way the dev proxy does (already recorded as unknown above).

**Correction (coordinator of this repository, 2026-10-13):** the comment now reads "Observed on the dev storefront: this request answers 404 when Accept names JSON, and 200 with section JSON for `*/*`." No code changed. `npx prettier --check assets/section-pagination.js`, `npm.cmd run lint:compat:js` and `git diff --check` pass.

## BP-2: independent review, round 3

External Verifier session, 2026-10-13, read-only, limited to the comment and the file state; no browser pass, because no code changed.

**Verdict: PASS.** No new defect.

- `git diff -- assets/section-pagination.js`: two added lines only, the corrected comment and `headers: { Accept: '*/*' },`.
- The comment states only what was measured on the dev storefront and claims nothing about other `Accept` values or the live storefront.
- `git status --short`: the same 16 modified files and the new `snippets/scripts.liquid`. `assets/https.js` and the source commit's file share the Git object hash `f98e95093632d201121259e950f33c5670d297a8`. The Verifier notes that the file status is not a byte-for-byte history of every other file.
- `npm.cmd run lint:compat:js` and `git diff --check` exit 0. `npx prettier --check` was blocked by the PowerShell execution policy on `npx.ps1`; `npx.cmd prettier --check assets/section-pagination.js` exits 0.
- The round 2 section above matches the round 2 report.

**Accepted by the user on 2026-10-13 (step 8).** Open: commit and clear this file when the user asks (step 9).
