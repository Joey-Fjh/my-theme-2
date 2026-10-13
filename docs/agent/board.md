# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, and overall status belong in `docs/project.md`; accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-10-13.

## Open decisions

None.

## Judged and left out (coordinator, 2026-10-13)

Each candidate was tested with "would a theme of a completely different design need it?". These are recorded so they are not proposed again without new evidence.

- **CSS vocabulary from the derived theme** (space steps, extra colour roles, hover variants): the chain and its rules are already here for typography, colour and motion; the names and steps are that theme's content. Tailwind's default spacing scale stays available. Left out.
- **The `dead-setting` check and "nine dead `social_*_link` settings":** the settings are not dead. `sections/header.liquid` reads them through `settings[organization_social_setting_id]` for the Organization `sameAs` list. The check as written is wrong for this code. Left out.
- **A switch or configuration file for checks, and baselines or ratchets:** no theme needs one yet; `lint-allow <check-id>: <reason>` is the existing capability for exceptions. Left out until a theme has to switch a check off.
- **`layout-check`, `contrast-report`, Playwright MCP:** `docs/project.md` settles no Playwright; they depend on a page frame and tokens this repository does not have. Left out.
- **Stage-1 design skills** (`ui-ux-pro-max`, `taste-skill`): adopt none; `frontend-design` is already vendored with a named trigger.

## Evidence

- **Scope of what comes into the skeleton** (user, 2026-10-13): this repository decides what it lacks; `../my-theme-1` is a reference only, never an authority, and is never written to. The earlier by-layer backport driven from that repository is stopped. Only the outer, business-independent layer belongs here: skills, MCP, documents, lint, CI, and the JavaScript and CSS frameworks. Architecture comes over, not content: no sections, feature modules, component CSS, concrete values or setting inventories. For lint and baselines, where one is needed at all, the skeleton keeps the capability (the mechanism), not a derived theme's accumulated list of specific rules; later themes add their own. Test for every candidate: would a theme of a completely different design need it?
- **Done on branch `backport/agent-layer`, not merged into `main`, not pushed:** BP-1, agent layer and harness (`b676754`; plan and reviews: `git show b676754:docs/agent/context.md`); BP-2, entry scripts snippet, loader by init interception, three framework defects (`05e79a6`; plan and three review rounds: `git show 05e79a6:docs/agent/context.md`).
- **Also done there:** SK-1, the design-to-delivery procedure as one short reference (`c653009`; plan and two review rounds: `git show c653009:docs/agent/context.md`). With it the skeleton has no open item against the scope above. The procedure has not been run end to end; the first theme to run it corrects `docs/references/style-system/design-to-delivery.md`.
- **Known limit, collection pagination** (BP-2 review, 2026-10-13): the `?sections=` request sends `Accept: */*` because the dev storefront answers 404 when `Accept` names JSON. Whether a live storefront answers the same way has not been measured.
- **Known limit, `.github/workflows/lighthouse.yml`** (BP-1 review, 2026-10-13): the job is skipped by testing the repository name `Joey-Fjh/my-skeleton-theme`. If this repository is renamed or transferred, update that condition, or Lighthouse starts running here without secrets.

## Deferred ideas

- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
