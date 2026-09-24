# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-24.

## Batch G: trim `AGENTS.md` toward 150 lines

Accepted and authorized by the user 2026-09-24 (items a–f).

- **Outcome:** `AGENTS.md` is shorter with no rule added, strengthened, weakened, or dropped; moved text lands in the named destination.
- **Implementation surface:** `AGENTS.md`, `.agents/roles/implementer.md`, `README.md`, record files.
- **Review tier:** Ask (changes the agent rules).
- **Tasks:**
  - a. Tech Stack runtime constraints: keep one pointer to `javascript-runtime.md` for load order instead of restating it.
  - b. Authority: merge the Theme Store and Horizon bullets into one.
  - c. Batch SOP step 5: move the "inspect facts before asking / classify before editing / smallest action" detail to `.agents/roles/implementer.md`.
  - d. Record-layer checks: drop what duplicates the `board.md` and `context.md` headers; keep the coexistence exception and the "unfinished plan blocks other work" rule.
  - e. Sources: move the missing-MCP troubleshooting to `README.md`.
  - f. Agent Adapters: four bullets into three.
- **Acceptance checks:**
  - `AGENTS.md` line count ≤ 155.
  - Every removed sentence has its rule either kept in `AGENTS.md` or present in the destination file (verifier diffs old vs new).
  - `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; `npx prettier --check` passes on changed files.

## Status

- a–f applied. Moved text: step-5 method → `.agents/roles/implementer.md` "Working method"; MCP troubleshooting → `README.md` "MCP servers".
- `AGENTS.md`: 173 → 168 lines after a–f (a–f merged long single-line paragraphs, so few lines dropped). User chose (2026-09-24) to also remove the 8 `---` section separators (formatting only): now 152 lines, check passes.
- `lint:doc-paths` passed; `doctor:agent` exit 0; `npx prettier --check` passed on all changed files.
- Ask review 1 (2026-09-24): FAIL, two rules lost — the Alpine classic `defer` statement (item a) and "plans waiting on work the agent could finish" (item d). Both restored verbatim in `AGENTS.md`; still 152 lines; `lint:doc-paths`, `doctor:agent`, and `prettier --check` pass again.
- Ask review 2 (2026-09-24): PASS. No rule added, strengthened, weakened, or lost; fresh validators pass. Batch complete; waiting on the user's commit request (step 9).
