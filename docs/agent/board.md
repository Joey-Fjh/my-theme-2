# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, and overall status belong in `docs/project.md`; accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-10-14.

## Open decisions

- **Queued, the user's to time:** pushing branch `backport/agent-layer` and merging it into `main` (a pull request lets CI run the new dependency and the `doctor:agent` step in a clean environment). **No new version tag for now** (user, 2026-10-14): it waits for the first real use of Stitch.

## Evidence

- **Scope of this repository** (user, 2026-10-13 and 2026-10-14): it is the frame, like Shopify's official skeleton with this project's framework added: skills, MCP, SOP, documents, lint, CI, test tools, and the JavaScript and CSS frameworks. It holds no theme's content. The test for adding anything is whether this repository needs it. Reviews prove that mechanisms work; no screenshots, no size measuring, no judgement of appearance.
- **Design source, provisional** (user, 2026-10-14; the contract is in `docs/references/style-system/design-to-delivery.md`): Refero for references, Stitch as the design agent, the user's inspiration sites for motion and ideas. Still to verify at first use: whether Stitch accepts an existing DESIGN.md as a constraint; the cost, limits and supported clients of the Stitch and Refero MCP servers; and the whole procedure, which has not been run end to end.
- **`docs/design/design.md` is not linter-checked** (2026-10-14): `npx @google/design.md` exits 0 and prints nothing on this machine, for `lint` on a broken file and for `--help` alike. Find out why before relying on `lint`, `diff` or `export`.
- **`docs/project.md` "Status"** was written for v1.0.0 and has not been checked line by line against what was added since (the CSS chain and check configuration, the tools, the vendored libraries, the procedure).
- **Known limit, collection pagination** (2026-10-13): the `?sections=` request sends `Accept: */*` because the dev storefront answers 404 when `Accept` names JSON. Whether a live storefront answers the same way has not been measured.
- **Known limit, `.github/workflows/lighthouse.yml`** (2026-10-13): the job is skipped by testing the repository name `Joey-Fjh/my-skeleton-theme`. If this repository is renamed or transferred, update that condition, or Lighthouse starts running here without secrets.
- **Not proven, `.github/rulesets/main.json`:** an actual import of the ruleset file into a new repository; the first theme repository made from this one proves it.

## Deferred ideas

- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
- A switch for further checks, a layout check in CI, and the dialog, toast and other shared modules are added when a theme made from this repository first needs them.
