# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, and overall status belong in `docs/project.md`; accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-10-13.

## Open decisions

None.

## Evidence

- **Backport from `my-theme-1`** (user, 2026-10-13): the derived theme's framework improvements come back by layer, each a batch here: (1) agent layer and harness, BP-1; (2) validators; (3) runtime JavaScript; (4) CSS and tokens, with the layout and contrast tools; (5) the design chain. The layer list and the per-layer decisions are kept on the board of `../my-theme-1` until the backport is finished, because the source and its history are there.
- **Known limit, `.github/workflows/lighthouse.yml`** (BP-1 review, 2026-10-13): the job is skipped by testing the repository name `Joey-Fjh/my-skeleton-theme`. If this repository is renamed or transferred, update that condition, or Lighthouse starts running here without secrets.

## Deferred ideas

- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
