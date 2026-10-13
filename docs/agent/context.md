# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-14.

## BP-4: test tools and third-party libraries

**Status:** Authorized by the user on 2026-10-14 by starting the execution prompt, and continued the same day under "BP-4: plan amendment after the stop". Executed. Not accepted. Independent review (Ask) has not been run.

**Outcome:** this repository has the layout check and the contrast report as tools a theme can run, with this repository's own configuration and no baseline entries, and it vendors the Alpine Intersect plugin, Swiper and GSAP with ScrollTrigger behind their adapters. None of them adds weight to a page that does not use it, except the Intersect plugin (897 bytes).

**Source:** `../my-theme-1` at commit `388f58e`. Read source files only with `git -C ../my-theme-1 show 388f58e:<path>`, never from its working tree, and never write to it.

**Review tier:** Ask (`assets/*.js`, `AGENTS.md`, `package.json`, references; run from an external prompt).

**Review bar (user, 2026-10-14):** this repository is a skeleton. Prove that the mechanisms work. No screenshots, no size measuring, no judgement of appearance.

**Branch:** `backport/agent-layer`. No commit unless the user asks.

**Dependencies:** `npm.cmd install` needs network access for `playwright-core`. Acceptance check 9 needs a local Chrome. Acceptance check 10 needs `npm.cmd run shopify:dev` and the storefront password in `.env`; it may be left to the independent review or recorded as not run.

### Implementation surface

**A. Tools**

1. `.agents/tools/layout-check/`: the tool files, its test file and its fixtures, byte-identical to the source: `layout-check.mjs`, `checks.mjs`, `run-rules.mjs`, `runtime-keys.mjs`, `layout-check.test.mjs`, and `fixtures/`. If a tool file names something of the derived theme (a section, a class, a handle), stop and report it instead of copying.
2. `.agents/tools/layout-check/layout-check.config.json`: written for this repository. The generic keys keep the source values (`baseUrl`, the timings, the width sweep, the fixed pages that exist in every store). `alternateTemplates` is empty. `exceptions` keeps only entries for Shopify-injected or dev-proxy behaviour that is not tied to the derived theme's store, each with a reason that names no batch id.
3. `.agents/tools/layout-check/layout-check.baseline.json`: the empty baseline in the format the tool reads. No entry from the source.
4. `.agents/tools/contrast-report.mjs`: byte-identical if it reads only what BP-3 brought (the scheme colours in `config/settings_data.json`, the alpha steps in `snippets/css-variables.liquid`). A pair that needs a role this repository does not have is removed, and the record names it.
5. `package.json` and `package-lock.json`: scripts `test:layout`, `test:layout-harness`, `scan:contrast` as in the source; `playwright-core` in `devDependencies` at the source version. `package-lock.json` comes from `npm.cmd install`; a `resolved` URL rewritten to a registry mirror is restored to `https://registry.npmjs.org/`. `test:layout-harness` does not join `test:validators` (it needs Chrome).

**B. Third-party libraries**

6. `assets/vendor-alpine-intersect.min.js`, `assets/vendor-swiper.min.js`, `assets/vendor-swiper.min.css`, `assets/vendor-gsap.min.js`, `assets/vendor-gsap-scrolltrigger.min.js`: byte-identical to the source. Never edited.
7. `assets/carousel-swiper.js`, `assets/motion-gsap.js`: byte-identical to the source. Both load their library from a URL the markup passes in `data-*`, so nothing loads until a section asks.
8. `snippets/scripts.liquid`: the two import-map entries `carousel-swiper` and `motion-gsap`.
9. `assets/base.js`: the one static import of the Intersect plugin, as in the source.
10. `THIRD_PARTY_NOTICES.md`: the entries for the Intersect plugin, Swiper and GSAP, from the source.
11. The Swiper stylesheet is **not** imported into `tailwind/tailwind.input.css`. A section that uses the carousel adapter renders `vendor-swiper.min.css` itself with `stylesheet_tag`; the reference says so. `assets/tailwind.output.css` must not change.
12. `.agents/skills/check-theme-architecture/scripts/`: the import-map check that fails an entry nothing references gets one configuration key in `theme-checks.config.json` listing the adapter entries that may be unreferenced, with a test. No other validator change. If another check fails because of this batch (an outlet rule on a vendor file, the Theme Check asset rules), stop and report before changing it.

**C. Rules**

13. `AGENTS.md`: Tech Stack, the sentence "A selected library is vendored only when an accepted consumer exists" becomes: the selected libraries (Alpine with its Intersect plugin, Swiper, GSAP with ScrollTrigger) are vendored behind their adapters and load on demand; a further library needs an accepted decision. The Validation table gains the layout-check row from the source, without a baseline rule that assumes entries. The GSAP skills trigger keeps its wording.
14. `docs/project.md`: "Settled: no Playwright …" is replaced by what is true now (the layout check uses `playwright-core`; the user still runs browser checks a plan names); Accepted Scope names the tools and the vendored libraries.
15. `docs/references/architecture/javascript-runtime.md` and `docs/references/architecture/motion-architecture.md`: the statements this batch makes untrue (no vendored Swiper or GSAP, no GSAP runtime), and the adapter contracts in the source wording: how a section passes the URLs, and that a carousel section renders the Swiper stylesheet. `README.md`: the two command lines for the tools.
16. This file and `docs/agent/board.md`.

**Not in this batch:** the dialog layer, the toast store and every other module of the derived theme (self-implemented, they stay there); any section or snippet that uses a carousel or GSAP; `test:layout` in CI; `.github/`; `config/`, `locales/`, `templates/*.json`, `sections/*-group.json`.

**Forbidden:** everything not listed, commits, `prettier --write`, `git stash` / `checkout` / `reset` on the working tree, and any write to `../my-theme-1`.

### Acceptance checks

1. `git status --short` lists only surface files; state the count from the command.
2. Every file of items 1, 4 (if unchanged), 6 and 7 is identical to `git -C ../my-theme-1 show 388f58e:<path>`. Name the command and list any file that differs, with the reason.
3. `git grep` finds, in the files this batch changed, no batch id of the derived theme (`[0-9]-[A-Z][0-9]`), no name of a section that exists only there, and no store handle. The baseline holds no entry.
4. `git diff -- package.json` shows the three scripts and the one dev dependency only; every `resolved` URL added to `package-lock.json` starts with `https://registry.npmjs.org/`; `npm.cmd ci --dry-run` succeeds.
5. `git diff --stat -- assets/tailwind.output.css tailwind/` is empty.
6. Loading on demand, proven from the code: `git grep` shows that `vendor-swiper`, `vendor-gsap` and `vendor-gsap-scrolltrigger` are named by no file under `layout/`, `sections/`, `snippets/`, `blocks/`, `templates/` and by no static `import`; the only static import of a vendor file besides Alpine is the Intersect plugin in `assets/base.js`.
7. `npm.cmd run test:validators` passes; state the counts before (taken before the first edit) and after. `npm.cmd run lint`, `npm.cmd run test:theme-check` and `npm.cmd run doctor:agent` pass. The unreferenced-entry key works both ways: with the two adapter entries listed the lint passes, and a fixture with an unlisted unreferenced entry still fails.
8. `npm.cmd run scan:contrast` runs to the end and prints a report for this repository's schemes.
9. `npm.cmd run test:layout-harness` passes; state the test count. If no local Chrome is found, record that and the tool's own message.
10. `npm.cmd run test:layout -- --widths 390,1440` starts, discovers the pages and finishes with a report file, against `shopify theme dev`. Its findings on this repository's pages are listed in the record as information; they are not fixed in this batch and no baseline entry is written. If discovery stops because the store lacks a page type the tool requires, record the message; do not change the tool.
11. `git diff --check` is clean; `npx.cmd prettier --check` passes on every changed file Prettier covers (vendor files are not formatted).
12. Independent review (Ask) reports PASS.

## BP-4: executed

Continued after the amendment. The earlier stop copied nothing. Branch `backport/agent-layer`. Not accepted. No commit.

### Edits against the source (`git diff --no-index --numstat`)

Scratch copies of `git cat-file blob 388f58e:<path>` are outside this repository. Line counts:

| File | Insertions | Deletions |
| --- | --- | --- |
| `.agents/tools/layout-check/layout-check.mjs` | 6 | 4 |
| `.agents/tools/layout-check/layout-check.test.mjs` | 3 | 3 |
| `.agents/tools/layout-check/run-rules.mjs` | 11 | 0 |
| `.agents/tools/contrast-report.mjs` | 2 | 11 |

The runner reads `presetLocalStorage` and sets each entry before page scripts run. This repository's configuration leaves that object empty. `validateConfig` rejects a non-object and an empty key. The three test titles lost their batch-id prefix; the bodies are unchanged. Contrast keeps text, text-muted, text-subtle, success, and error. Pairs removed because this scheme does not define the roles: primary button, secondary button, badge, warning, info, input text, input placeholder, input border, focus ring. The report line no longer names an owner id.

`git hash-object` against `git -C ../my-theme-1 rev-parse 388f58e:<path>`: 37 files, 0 mismatches. That set is `checks.mjs`, `runtime-keys.mjs`, the fixtures, and the seven library files (five vendor files plus `carousel-swiper.js` and `motion-gsap.js`).

`layout-check.baseline.json` is `{ "version": 1, "issues": [] }`. `alternateTemplates` is empty. Exceptions kept: the hCaptcha badge, the deliberate 404 document, the dev-proxy GraphQL and shop.app requests, and the shopify-account console message. That last one stays because the unchanged test asserts that exact selector; the reason names no batch id and describes Shopify's component, not a theme section.

`THIRD_PARTY_NOTICES.md` takes the Intersect, Swiper, and GSAP entries from the source. The GSAP note drops a parenthetical that named a batch id.

### Checks

Before the first edit, `npm.cmd run test:validators` exited 0: `test:i18n` 32/32, `test:theme-architecture` 124/124, `test:section-stylesheet-carry` 3/3, `test:doc-paths` 7/7, `test:ci-contract` 18/18. Total 184 pass, 0 fail.

After, the same command exited 0: 32/32, 125/125, 3/3, 7/7, 18/18. Total 185 pass, 0 fail. The added test is `configured import map entries may stay unreferenced and an unlisted entry still fails` (pass). With `carousel-swiper` and `motion-gsap` listed, those two are not reported; an unlisted `orphan` entry is.

`npm.cmd run lint` exited 0 (liquid syntax, i18n, theme, compat, doc paths, `prettier . --check`). `npm.cmd run test:theme-check`: 64 files inspected, no offenses. `npm.cmd run doctor:agent` exited 0. `npm.cmd ci --dry-run` exited 0 (`up to date`). `git diff -- package.json` is the three scripts and `playwright-core` only. The one new `resolved` URL is `https://registry.npmjs.org/playwright-core/-/playwright-core-1.64.0.tgz` (a mirror URL was rewritten back). `git diff --stat -- assets/tailwind.output.css tailwind/` is empty. `git diff --check` is clean. `npx.cmd prettier --check` on `package.json`, `snippets/scripts.liquid`, `assets/base.js`, `assets/carousel-swiper.js`, `assets/motion-gsap.js`, `THIRD_PARTY_NOTICES.md`, and `README.md` exited 0. Vendor files and `.agents/` are outside Prettier's coverage.

`npm.cmd run scan:contrast` exited 0 and printed scheme-1 and scheme-2. 0 failing pairs.

`npm.cmd run test:layout-harness` exited 0. Tests 28, pass 28, fail 0. Local Chrome was found.

`npm.cmd run test:layout -- --widths 390,1440` exited 0 against the `shopify theme dev` already listening on `127.0.0.1:9292`. The live import map ends with `carousel-swiper` and `motion-gsap`, which is this repository's map. There is no `.env` in this repository; the server returned the storefront, not a password form. Discovered pages: home, cart, search, collections, collection-all, not-found, product, blog, article. Every check count was 0. Wall time 52487ms. New issues not in the baseline: 0. Report file: `.tmp-layout-check/report.json`. The baseline file was not given an entry. These zero counts are information; nothing was fixed.

`git grep` for a static `import` of `vendor-` under `assets/*.js` finds only `assets/base.js` importing the Intersect plugin. `git grep` for `vendor-swiper` and `vendor-gsap` under `layout/`, `sections/`, `snippets/`, `blocks/`, `templates/`, and `assets/` finds nothing (the vendor files themselves are untracked, so they are not in that search). A workspace search including untracked files finds those names in notices, the plan text above, the board's earlier size note, and the runtime reference. No Liquid file renders them and no static import loads them.

`git grep` for the batch-id pattern, after dropping integrity hashes, fixtures, and `layout-check.test.mjs`, finds no hit once this section no longer quotes the ids. Sample strings inside the test and the fixtures are exempt under the amendment. The baseline holds no entry.

### Motion review

`review-animations`: `assets/motion-gsap.js` only inserts classic script tags and calls `registerPlugin`. The diff adds no `transition`, `animation`, `@keyframes`, or tween. Nothing in the ten standards applies. GSAP timeline, ScrollTrigger, and performance skills were not applied: this repository still has no choreography consumer.

### Not done

Acceptance check 12 (independent review) has not been run.

## BP-4: plan amendment after the stop

Coordinator, 2026-10-14. The stop was correct under the plan as written; the plan was too strict. Decided by the coordinator under the user's review bar (prove the mechanisms, do not over-pursue), and replacing the words "byte-identical" for the tool files, the stop rule in item 1, and acceptance checks 2 and 3 for those files:

1. **`layout-check.mjs`:** the source file with one change. The init script that marks one popup as shown stops naming a key: the tool reads an object `presetLocalStorage` from the configuration and sets each entry before page scripts run. This repository's configuration has it empty. `run-rules.mjs` `validateConfig` accepts the key if it validates keys. The comment above it loses the popup's name.
2. **`layout-check.test.mjs`:** the source file with the batch id removed from the three test titles. Section and class names inside test bodies are sample input for the selector logic and stay.
3. **`fixtures/`:** byte-identical. A fixture is test data for the tool; the section, class and theme ids in it are sample strings, not content of this repository.
4. **`checks.mjs`, `run-rules.mjs` (apart from item 1), `runtime-keys.mjs`:** byte-identical.
5. **`contrast-report.mjs`:** the source file with the batch ids removed from its comments and with only the pairs whose roles exist here: text, muted text and subtle text on the scheme background, and the success and error pairs. The record lists the pairs removed.
6. **Acceptance check 2** for the files of items 1, 2 and 5: `git diff --no-index` against the source shows only the edits named here; the record shows that diff's line counts. **Acceptance check 3** does not apply to `fixtures/` or to sample strings inside `layout-check.test.mjs`; it applies to everything else.

Parts B and C are unchanged. Continue from the recorded stop.

## BP-4: coordinator check

Coordinator, 2026-10-14, read-only, before the independent review. Consistent with the implementer's record: `git status --short` 25 lines, all in the surface; no change under `tailwind/`, `assets/tailwind.output.css`, `config/`, `locales/`, the merchant JSON or `.github/`; `git grep` finds `vendor-swiper` and `vendor-gsap` in no file under `layout/`, `sections/`, `snippets/`, `blocks/`, `templates/` or `tailwind/`; the only vendor import in `assets/base.js` is the Intersect plugin; the baseline is `{ "version": 1, "issues": [] }`; `alternateTemplates` is empty and `presetLocalStorage` is `{}`; `.tmp-layout-check/` is ignored by `.gitignore`; the `AGENTS.md` and `docs/project.md` diffs are the rule changes the plan lists.

## BP-4: independent review

External Verifier session, 2026-10-14, read-only, at the review bar the plan states (mechanisms only; no screenshots, no sizes).

**Verdict: PASS.**

- **Scope:** `git status --short` 25 entries, all in the amended surface.
- **Copies:** `git hash-object` equal for 37 files, 0 mismatches. `git diff --no-index` shows only the amendment's edits: `layout-check.mjs` +6/−4, `layout-check.test.mjs` +3/−3, `run-rules.mjs` +11/−0, `contrast-report.mjs` +2/−11.
- **No data of the derived theme:** baseline `issues: []`; `alternateTemplates: []`; `presetLocalStorage: {}`; the exceptions concern Shopify and dev-proxy behaviour; 0 batch-id hits outside fixtures.
- **Loading on demand:** 0 references to the Swiper or GSAP vendor files in the theme trees; the only new static vendor import is the Intersect plugin in `assets/base.js`; both adapters load from the URLs passed to them; the Tailwind diff is empty.
- **Import-map allowlist:** in a scratch copy, 0 failures with the listed adapters and 1 `module-import-map-unused` failure for an unlisted entry.
- **Rules and references:** the diffs match the authorized changes; notices carry Intersect 3.15.3, Swiper 12.1.2, GSAP and ScrollTrigger 3.15.0.
- **Commands, all exit 0:** `test:validators` 185 pass and 0 fail (32 + 125 + 3 + 7 + 18); `lint`; `test:theme-check` 64 files, no offenses; `doctor:agent`; `npm.cmd ci --dry-run`; `scan:contrast` 2 schemes, 0 failing pairs; `test:layout-harness` 28 pass and 0 fail; `git diff --check` empty.
- **Live:** `test:layout -- --widths 390,1440` on 9 page types, 0 new issues, baseline still empty; home loads the Intersect plugin with no console error from theme code (the errors seen came from Shopify services and the favicon).

**Accepted by the user on 2026-10-14 (step 8).**
