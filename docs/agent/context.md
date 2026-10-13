# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-14.

## BP-4: test tools and third-party libraries

**Status:** direction accepted by the user on 2026-10-14 (the tools of the procedure; the third-party libraries with their adapters; loading on demand in principle; one batch). The board listed these as BP-4 and BP-5; they are one batch here because both are copies with a small configuration. Recorded by the coordinator. **The user authorizes this batch by starting its execution prompt**; until then nothing but this file and the board is changed.

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
