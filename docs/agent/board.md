# Work Board

This board holds only active items: discussions, pending decisions, disagreements, agreed conclusions awaiting implementation, and work batches.

- Keep agreed conclusions in “Agreed, awaiting implementation” until the change is implemented and accepted. Then move them to `docs/agent/context.md`.
- Remove an item only after acceptance and transfer to the ledger, or when the user discards it. Remove the row, not this file.
- **Delivering an execution prompt does not complete a batch.** Completion requires an implemented change and acceptance.
- This file and `context.md` are construction-phase records. Migrate their lasting rules and remove both when the Skeleton is complete.

Last updated: 2026-09-15.

---

## Working model

| Role | Responsibility | Authority |
| --- | --- | --- |
| Decision owner | Sets the outcome, priorities, batch boundary, and execution authority. | The user is the sole approval authority. |
| Coordinator / reviewer | Inspects evidence, evaluates a bounded task, proposes an execution carrier, and prepares a concrete assignment or execution prompt. More than one independent reviewer may be used when useful. | Read-only review and proposals unless the user authorizes implementation. |
| Implementer | Executes one authorized batch and validates the result. | One writer per shared worktree; no scope expansion. |
| Verifier | Independently checks the implemented result and its evidence. The user decided on 2026-09-15 that there is no fixed reviewer rotation. | Read-only acceptance review. |

During discussion, write only to this board. After a batch is implemented and accepted, move its lasting conclusions to `context.md` and remove its rows from the board. Do not update `context.md` during discussion.

For this pilot, the shared board carries handoffs between separate editor sessions. A reviewer’s conclusion is available to the other reviewer only after it is recorded here. This file-based handoff does not require API keys, workflow nodes, or a native delegation channel.

The user chooses the reviewer, implementer, client, and delivery mode in the current request. When the user asks for an execution prompt, review ends with a concrete prompt; implementation and acceptance happen in the subsequent execution batch.

---

## Current issues

Build the Agent workflow foundation: board, roles, automatic session reading, and batch status fields. The goal is a workflow that can later be extracted from the Skeleton and reused in other programming projects.

Continue the CSS architecture phase after the workflow is usable.

The user’s execution priority (2026-09-15): keep the user’s outcome, priorities, and batch boundary central. Do not keep expanding discussion and plans while Skeleton theme code remains untouched. Resolve an issue on the board into a bounded batch and acceptance criteria; once the user settles the direction and carrier, execute directly or hand off a concrete execution prompt, then implement, validate, and accept the result. **Context records accepted results and is not a prerequisite to start work.** Independent batches do not wait for the entire architecture audit.

Documentation language (user choice, 2026-09-15): use English for this board, `context.md`, and the session-start instructions. `context.md` is already English. Keep role names and workflow rules client-neutral; do not record current tool or model assignments as workflow rules. Test the instructions with a small real batch before extracting the workflow. No fixed double-review gate, permanent log, API orchestration, or additional Agent layer is required for this pilot. [AGENTS.md format](https://agents.md/) · [Codex instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Claude Code guidance](https://code.claude.com/docs/en/best-practices)

---

## Pending decisions

| ID | Question | Needed answer |
| --- | --- | --- |
| D3 | M2: Should `assets/base.css` and the token bridge in `tailwind.input.css` be included in this CSS batch? | **On hold** (user decision, 2026-09-15: revisit after the workflow is usable). |

D1 and D2 are closed; see A9 and A10 under “Agreed, awaiting implementation.”

---

## Cross-review findings

Claude reviewed the Codex proposal (G1–G4 accepted, M1–M5 omissions, C1–C2 conflicts). Codex responded to each item on 2026-09-15. M2 remains on hold under D3. M3 and C1 have since converged; A2 and A8 have been revised in the agreed items below. M4 still needs acceptance of the proposed verification boundary.

| ID | Issue | Claude Code review | Codex response |
| --- | --- | --- | --- |
| M1 | `tailwind.animates.css` was omitted from classification. | **Split the layer rather than retain it whole.** Global rules at `tailwind.animates.css:37,518` and section-owned rules at `:1286-1323` share one file. Classify all three old CSS layers, about 4,763 lines. | Agree. Classify reusable cross-file motion, section-owned motion, and capabilities pending the JS/motion review. Do not decide to retain the whole layer in advance. |
| M2 | Ownership of `assets/base.css` (209 lines) and the token bridge in `tailwind.input.css:18-79` is undecided. | Set their scope before delivering a global-ownership manifest. | Agree that the target contract must explain reset and token-bridge ownership. A draft and two scenario measurements may use explicit scope assumptions. Do not make a final decision while D3 is on hold; resolve D3 before the formal contract and implementation. |
| M3 | The generated asset filename was missing from the sequence. | **Converged.** Claude confirmed three Liquid references (`layout/theme.liquid:21`, `layout/password.liquid:17`, `templates/gift_card.liquid:7`) and found another in `stylelint.config.cjs:39`. A rename affects these four references plus `build:tw`, `watch:tw`, and `lint:compat:css` in `package.json`. | Decide the name when the user accepts the manifest and the contract is rewritten. Change `.shopifyignore` or README only if their actual references or ignore boundaries change. |
| M4 | Step 4 lacked a way to detect missing styles. | Theme Check, stylelint, and a Tailwind build cannot prove that retained consumers still have CSS. Run a one-time class-use difference analysis. | Agree. List removed CSS definitions, uses in retained Liquid/JS, and replacements. Dynamic classes and selectors also need a caller inventory plus key-page rendering and interaction checks. A one-time analysis script does not become permanent lint by default. |
| M5 | The 26 existing `{% stylesheet %}` tags were not inventoried. | The placement rule is changing; current compatibility has not been reviewed. | Agree. Inventory all 26: 24 plain `{% stylesheet %}` tags and two `{%- stylesheet -%}` tags. Decide for each whether it stays local, becomes a manifest utility, or leaves with its caller. |
| C1 | `context.md` was being updated too often. | **Closed.** `AGENTS.md` now sends in-flight conclusions to the board and implemented, accepted results to context. The board now keeps agreed conclusions pending implementation and says that an execution prompt does not complete a batch. | Agree; this correction originated in the Codex review. |
| C2 | `abstraction-boundaries.md` had no review owner. | Its `sectionPagination` example belongs to the JS architecture review. | Agree. Keep portable principles and clean or replace the project-specific example during that review. |

---

## Agreed, awaiting implementation

These conclusions were agreed in cross-review or decided by the user. Move them to `context.md` only after the corresponding batch is implemented and accepted.

| ID | Conclusion | Source |
| --- | --- | --- |
| A1 | `node_modules` has 229 entries and `tailwindcss@4.1.18` is present. `npm ci` is **not** a required prerequisite on this machine. | Codex found it; Claude confirmed with PowerShell. |
| A2 | **Verification rule:** If one client’s sandbox hides a path excluded by `.gitignore`, do not infer that the path does not exist. First confirm with another read-only method available to that client; request normal approval only if escalation is genuinely required. Observed difference: Claude’s Bash tool could not see `node_modules/`, while PowerShell could; Codex could read it in the sandbox. | Root cause of A1. The former blanket rule requiring unsandboxed verification was discarded. |
| A3 | Record MCP availability with the **client and check date**. One connection failure is not a permanent state. | Proposed by Codex; accepted by Claude. |
| A4 | Record verification by **inspected scope, date, and path or commit evidence**, not a mechanical marker on every ledger assertion. | Proposed by Codex; Claude withdrew its former proposal. |
| A5 | Describe the `.env` upload surface as **unverified** and add minimal defensive ignore entries. Do not claim upload has been proven. | Proposed by Codex; accepted by Claude. |
| A6 | B1 boundary: “Do not migrate the old CSS layers as a whole” does not mean “delete every caller.” Classify required Skeleton capabilities separately from Ceylune-specific implementations. | Codex correction to Claude’s earlier wording. |
| A7 | Measure CSS with an isolated temporary build that does not overwrite tracked `assets/tailwind.output.css`. Report scenarios with and without Swiper, both raw and compressed. **The measurement does not require theme-file deletion first.** | Proposed by Codex; accepted by Claude. |
| A8 | Working model and writing schedule (above). | User decision, 2026-09-15. |
| A9 | **D1 implemented:** `AGENTS.md` has a `## Session Start` section. Read `board.md` at session start, write back new conclusions, and read `context.md` when continuing previous work or recording an accepted result. Plain instructions avoid client-specific import syntax. The section is now in English, as requested by the user. | User approved on 2026-09-15; the write-back sentence completes the two-way handoff. |
| A10 | **D2 discarded:** Do not copy a fixed double-review rule into `AGENTS.md` or `orchestrate-agents`. The user chooses reviewers and implementers in each request; review-only scope and implementation authority are already defined in `AGENTS.md`. | User decision, 2026-09-15; accepted by Claude. |

---

## Work batches

Fields: scope, proposer, verifier, acceptance criteria, and status. The user assigns the execution carrier in the current request; record the resulting work and acceptance status here.

| Batch | Scope | Proposer | Verifier | Acceptance criteria | Status |
| --- | --- | --- | --- | --- | --- |
| P2 Skill invocation conflict | Resolve the conflict between `.agents/skills/orchestrate-agents/agents/openai.yaml` and the skill invocation rule. | To assign | To assign | The conflict is removed and the skill can still be invoked through the router; verify one real invocation. | Not started |
| P3 Upload-surface defense | Add `.env` and `.env.*` to `.shopifyignore`. | To assign | To assign | Entries exist; describe the reason as in A5. | Not started |
| P4 License | Decide the mother template’s distribution intent, then align the `ISC` value in `package.json`. **Do not include CSS lint paths or `--minify` in this batch.** | To assign | To assign | Intent is recorded clearly; `package.json` agrees with it. | Not started |
| P1 Reference status | Mark `css-architecture.md`, `javascript-runtime.md`, `motion-architecture.md`, and `image-display-contract.md` as existing-implementation references pending mother-template review. Also examine `AGENTS.md` routing and hard rules, distinguishing protections for existing code from confirmed Skeleton contracts. | To assign | To assign | Four references carry the status; conflicts in `AGENTS.md` are resolved and existing-code protections have an explicit owner. That owner is still a prerequisite decision. | Not started |
| CSS phase | Draft a read-only manifest; run isolated size measurements; after user acceptance rewrite the contract; classify active classes and callers of old layers; implement and validate. | To assign | To assign | Acceptance criteria are defined separately for the five steps. | Not started; remaining review boundaries need closure before the formal contract. |

Dependency: P1–P4 are independent and can be assigned separately. A CSS draft and isolated measurement may proceed while D3 is on hold; the formal CSS contract and implementation wait for D3 and the remaining review boundaries. Keep one writer per shared worktree.

---

## Future extraction goal

The Skeleton is the pilot for this file-based workflow. Extract a reusable programming-project workflow only after this pilot proves useful. Constraints for extraction:

- Keep roles and collaboration rules client-neutral and free of Shopify-specific requirements.
- Keep client adapters thin and removable without changing the canonical role contract.
- `board.md` and `context.md` are construction-phase records. Extract their **structure and useful rules**, not this project’s contents.

Agent-system changes remain subject to the approval boundary in `context.md`. Discuss and approve each new Agent rule or `.agents/` change before writing it.
