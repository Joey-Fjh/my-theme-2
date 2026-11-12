# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, scope, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-11-12.

## Batch STATUS-1: Correct the merged mother-template status

**Status:** Executed; waiting for independent review in a separate session chosen by the user. The user authorized the status correction on 2026-11-12 ("那文档校正？") and subsequently requested committing and pushing it first ("先提交推送更新好的内容"). This authorizes publishing the correction before review, not recording a review PASS; the pending review record is retained.

**Outcome:** The project status reflects the existing PR #3 merge without changing the mother-template scope or rules.

**Dependencies:** Resolved. Git identifies `0e5b96b` as the PR #3 merge on 2026-11-11, and local `main` and `origin/main` both point to it.

**Implementation surface:** The stale stage-progress bullet under Status in `docs/project.md`; execution records in `docs/agent/context.md`.

**Review tier:** Ask, because the changed file is `docs/project.md`. The initial Ship classification for a status-only correction was corrected after the route identified the file-level Ask trigger. Identity, scope, agent rules and validator wiring are unchanged.

**Estimate:** A few minutes for the status correction and document checks.

**Checkpoint:** Following the user's 2026-11-12 follow-up, commit the status correction and its execution record, push to the current tracked branch `origin/feat/hm1-harness`, and verify the remote commit. Independent review remains pending; do not merge into `main` or create a derived theme in this batch.

**Bar:** Must fix the stale open/unmerged claim using Git evidence. Preserve historical CI evidence without claiming a fresh CI run. Guidance for the next theme follows the existing README and design-to-delivery procedure. Formatting follows the repository's existing `.prettierignore`; the extra diagnostic that bypassed it found only pre-existing nested-list indentation outside the changed status bullet, identical in HEAD and the working tree. Leave that formatting outside this factual correction.

### Acceptance checks

- The status names the PR #3 merge commit `0e5b96b` and date 2026-11-11, matching Git.
- The diff changes only the stage-progress status and execution records.
- `npm.cmd run lint:records`, `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, `npm.cmd exec -- prettier --check docs/project.md docs/agent/context.md` using repository ignore rules, and `git diff --check` pass.

### Execution log

- Evidence: inspected project and work records, README and design-to-delivery; `git show -s --format=fuller 0e5b96b` confirms the PR #3 merge date, and `git log -3 --oneline --decorate` confirms the branch pointers.
- Implementation: replaced the stale open/unmerged claim with the merge date, commit and verified branch pointers. No implementation or merchant-owned files changed.
- Validation: `npm.cmd run lint:doc-paths` passed ("Doc path lint passed."); `npm.cmd run doctor:agent` exited 0; `npm.cmd run lint:records` passed before implementation and after recording the handoff ("board topics: 0", "pending migration lines: 0"); `git diff --check` exited 0. `npm.cmd exec -- prettier --check docs/project.md docs/agent/context.md` exited 0 under repository ignore rules; docs are ignored, so this does not claim their content passed formatting.
- Formatting diagnostic: `npm.cmd exec -- prettier --check --ignore-path .gitignore docs/project.md docs/agent/context.md` exited 1 for inherited indentation in the Cleanup Test list in `docs/project.md`. A read-only Node comparison of Prettier output for `git show HEAD:docs/project.md` and the working file confirmed identical differences, all outside the changed bullet; context formatting passed. No formatter wrote files.
- Publication checks: re-ran `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, `npm.cmd run lint:records` and `git diff --check` on 2026-11-12; all exited 0. `git ls-remote --heads origin main feat/hm1-harness` confirms both remote branches at `0e5b96b` before publishing. The change contains no Tailwind content source, so the pre-commit Tailwind build rule does not apply.
- Handoff: no independent review has run. The user requested committing and pushing first; retain this pending-review plan instead of clearing it as a completed batch. The user chooses the separate review session; the prompt below is ready. The mother-template implementation remains closed; this status correction is the only current batch.

### Independent review prompt

```text
You are the Verifier for D:\fjh\shopify\my-skeleton-theme. Read AGENTS.md, then .agents/roles/verifier.md, and follow that role: read-only, no edits, builds, rewriting formatters, server starts, commits or subagents.

Batch: STATUS-1, "Correct the merged mother-template status". Read docs/agent/context.md for authorization, acceptance checks, Bar and validation claims; verify them independently.

Scope: the STATUS-1 commit titled "docs: correct merged mother-template status", inspected with git show, plus any uncommitted correction diff. Implementation surface: the stage-progress bullet under Status in docs/project.md and the execution record docs/agent/context.md. Review: full.

Verify the PR #3 merge date and commit with git show -s --format=fuller 0e5b96b, and branch pointers with git log -3 --oneline --decorate. Confirm that the diff changes no identity, inventory, accepted scope or agent rules and makes no new CI claim. Check the user's authorization recorded in context.

Run npm.cmd run lint:records, npm.cmd run lint:doc-paths, npm.cmd run doctor:agent, npm.cmd exec -- prettier --check docs/project.md docs/agent/context.md, git diff --check and git diff --stat. Docs are excluded by the existing .prettierignore; do not interpret that formatting command as checking ignored content. If investigating the bypassed formatting diagnostic, compare HEAD and the working tree without writing files.

Report findings first by impact with file, evidence and violated requirement; then proven/unproven claims, commands and output, and PASS or FAIL. Preferences and unchanged out-of-scope formatting are notes, not defects. Do not edit files.
```
