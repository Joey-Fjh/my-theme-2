# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, and overall status belong in `docs/project.md`; accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-10-13.

## Direction

**The migration continues here, batch by batch** (user, 2026-10-13, correcting the coordinator). The framework that `../my-theme-1` polished (JavaScript, CSS, skills, MCP, SOP, documents, lint, CI, test tools) is to be brought into this repository. The work moved to this session because the repository context was wrong there, not because the migration stops. Only concrete content stays out: sections, feature modules, component CSS, concrete values, setting inventories, that theme's baselines, and its long lists of specific lint rules (keep the lint capability). `../my-theme-1` is read with `git -C ../my-theme-1 show <commit>:<path>` and never written to. The full source record is `git -C ../my-theme-1 show 9d366d5:docs/agent/board.md`; framework file contents are read at `388f58e`.

**Coordinator errors to avoid repeating:** the statement "the skeleton has no open item" (made before the source record was read in full); citing `docs/project.md` "no Playwright" (written 2026-09-23) as a reason to exclude a tool the derived theme adopted on 2026-10-08; and the claim that this repository's sections carry raw Tailwind spacing utilities (a count on 2026-10-13 found 3 uses in 1 file).

| Batch | Content | State |
| --- | --- | --- |
| BP-1 | Agent layer and harness | Done, `b676754` |
| BP-2 | Entry scripts snippet, loader by init interception, three framework defects | Done, `05e79a6` |
| SK-1 | Design-to-delivery procedure, the document part of BP-4 | Done, `c653009`; not run end to end |
| BP-3 | CSS architecture: the rules, the chain and its vocabulary (colour roles, space and type steps, breakpoints, hover variants) with neutral default values, and the check capability that enforces them | Next; not planned yet |
| BP-4 | The tools of the procedure: `layout-check` and `contrast-report` with this repository's own configuration and no baseline | After BP-3; not planned yet |
| BP-5 | The third-party libraries and their adapters (user, 2026-10-14): the Alpine Intersect plugin, Swiper with `carousel-swiper.js`, GSAP and ScrollTrigger with `motion-gsap.js`, their `THIRD_PARTY_NOTICES.md` entries and import-map entries. The self-implemented dialog layer and toast store stay out | After BP-4; not planned yet |

All of it is on branch `backport/agent-layer`, not merged into `main`; the remote branch stops at `0372d44`.

## Open decisions

None yet. BP-3 starts with a read-only inventory (below); its results bring the decisions.

## Evidence

- **BP-3 inventory, first numbers** (coordinator, 2026-10-13; `wc -l`, this repository against `388f58e`): `tailwind/tailwind.input.css` 66 / 156; `tailwind.typography.css` 181 / 205; `tailwind.elements.css` 84 / 948; `tailwind.components.css` 177 / 2164; `tailwind.utilities.css` 24 / 178; `tailwind.animates.css` 35 / 1143; `snippets/css-variables.liquid` 106 / 324; `assets/base.css` 165 / 196; `config/settings_schema.json` 486 / 1399. Most of the difference in `elements`, `components`, `animates` and the schema is expected to be content; the inventory separates framework from content file by file.
- **Validator libraries there, not here:** `colour-setting-lint.js`, `dead-setting-lint.js`, `font-weight-lint.js`, `migration-lint.js`, `page-frame-lint.js`, `raw-colour-lint.js`, `schema-block.js`, `section-placement-lint.js`, `stylesheet-ownership-lint.js`. Each is judged with the code it checks. Ten checks carry that theme's data, and the checks cannot be switched or configured there; a configuration mechanism has to be built here.
- **`dead-setting` on this repository:** the nine `social_*_link` settings it reported are read by `sections/header.liquid` through `settings[organization_social_setting_id]`. The check must learn dynamic reads before it is switched on here.
- **Stale line in `docs/project.md`:** "Settled: no Playwright". BP-4 changes it. The rest of "Settled" and "Status" has not been checked against the source record.
- **Framework JavaScript:** the remaining differences in `assets/events.js`, `assets/utils.js` and `assets/alpine.store.cart.js` are that theme's event names, a scroll-velocity helper for its marquee, and a toast hook; they stay out, as do the self-implemented dialog layer and toast store. **Revised (user, 2026-10-14):** the third-party libraries come over without waiting for a consumer (BP-5). This replaces "a module arrives with its first consumer" for them, and it changes the `AGENTS.md` rule "A selected library is vendored only when an accepted consumer exists", which BP-5 rewrites with the user's approval.
- **BP-5 facts** (`git -C ../my-theme-1 ls-tree -r -l 388f58e assets`): `vendor-alpine-intersect.min.js` 897 bytes (3.15.3); `vendor-swiper.min.js` 155,178 and `vendor-swiper.min.css` 14,424 (12.1.2); `vendor-gsap.min.js` 72,927 and `vendor-gsap-scrolltrigger.min.js` 44,575 (3.15.0); adapters `carousel-swiper.js` 1,859 and `motion-gsap.js` 1,767. There, `base.js` imports the Intersect plugin statically, and `tailwind/tailwind.input.css` imports the Swiper stylesheet into the base layer. **Decided (user, 2026-10-14):** loading is on demand in principle. Something small may load globally (the Intersect plugin); the Swiper and GSAP scripts and the Swiper stylesheet load with the adapter that needs them.
- **Review bar for this repository** (user, 2026-10-14): like Shopify's official skeleton, it has almost no look of its own. Reviews prove that mechanisms work; no screenshots, no size measuring, no judgement of appearance.
- **Content of the derived theme's CSS reference, stays out:** the step values and the raw-to-step mapping table, the five colour schemes, the `width: 'full'` section allowlist, the badge colour settings, the legacy tier aliases and migration lints with their baselines, and the section padding formula. The `section-frame` and primitive snippets were excluded by the user on 2026-10-04 for the section-block model; the source record says the user re-decides this at the CSS layer, because this repository composes with Theme Blocks.
- **Stage-1 design skills** (`ui-ux-pro-max`, `taste-skill`) and a Playwright MCP: researched on 2026-10-13, recommendation adopt none; `frontend-design` and Chrome DevTools MCP are already here.
- **Known limit, collection pagination** (BP-2 review, 2026-10-13): the `?sections=` request sends `Accept: */*` because the dev storefront answers 404 when `Accept` names JSON. Whether a live storefront answers the same way has not been measured.
- **Known limit, `.github/workflows/lighthouse.yml`** (BP-1 review, 2026-10-13): the job is skipped by testing the repository name `Joey-Fjh/my-skeleton-theme`. If this repository is renamed or transferred, update that condition, or Lighthouse starts running here without secrets.

## Deferred ideas

- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
