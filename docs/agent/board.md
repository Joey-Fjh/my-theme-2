# Work Board

This board is the discussion surface for active issues, evidence, alternatives, disagreements, pending decisions, and proposed work batches.

- After the user accepts a direction, record it in `docs/agent/context.md` with its dependencies and authorization state.
- Recording a plan in `context.md` does not authorize execution. Execution requires explicit user authorization for that batch and resolved dependencies.
- Keep only evidence needed for an active decision or handoff. Accepted implementation state belongs in `context.md`; durable contracts belong in their permanent rule, reference, configuration, or code owner.
- Delivering an execution prompt does not complete a batch. Completion requires implementation, validation, and user acceptance.
- This file and `context.md` are construction-phase records. Migrate lasting rules and remove both when the Skeleton is complete.

Last updated: 2026-09-17.

---

## Working Model

| Role | Responsibility | Authority |
| --- | --- | --- |
| Decision owner | Sets the outcome, priorities, batch boundary, and execution authority. | The user is the sole approval authority. |
| Coordinator / reviewer | Inspects evidence, maintains board/context state, proposes a bounded task, and verifies results. | Read-only review and record maintenance unless implementation is authorized. |
| Implementer | Executes one authorized batch and validates it. | One writer per shared worktree; no scope expansion. |
| Verifier | Independently checks the diff, acceptance criteria, and fresh evidence. | Read-only acceptance review. |

The execution carrier is whichever client the user is working in for a request. Separate clients may perform proposal, implementation, and verification, but only one writer acts on the shared worktree at a time, and no client starts a subagent to execute a batch.

---

## Current Focus

The Agent layer is complete for this phase: P5a, P6, and V1 are accepted and summarised in `context.md`. TB1 is retained as a provisional implementation, not accepted as a Skeleton contract, and will be reworked after the JS/CSS architecture decisions.

Next discussion: the always-on entry. `AGENTS.md` should be complete for rules that do not depend on the Skeleton's implementation and should stop encoding current implementation details as permanent contract (see "Always-On Entry Direction" in `context.md`). Research the exact rule set under P1+P5b before the JS/CSS architecture discussion.

P3 is a ready micro-batch awaiting authorization.

---

## Pending Decisions

| ID | Question | Current position |
| --- | --- | --- |
| D3 | Should `assets/base.css` and the token bridge in `tailwind.input.css` be included in the CSS manifest batch? | On hold until the JS/CSS architecture discussion. |
| D17 | Which rules stay in the always-loaded `AGENTS.md`, and which move to a reference owner? | Open; research under P1+P5b. Starting point: the six architecture-independent safeguards recorded in `context.md`. Each of the 18 `Hard implementation rules` and 4 generated/vendor rules needs a keep, move, or merge classification with its destination. Also decide whether the two method prompts lost in P5a (smallest justified action; give delegated work only necessary context) belong in the entry. |

---

## Active Evidence And Constraints

| ID | Evidence | Impact |
| --- | --- | --- |
| ENTRY-F1 | The always-loaded entry encodes current implementation as permanent contract: runtime names, typography tier names and usage, motion-gate mechanics, and Tailwind placement. Reviewing TB1 found its `text` block conflicting with the entry's body-copy sizing rule, a rule that comes from the current typography implementation rather than an accepted Skeleton decision. | The entry pre-constrains undecided architecture. Slim it before the JS/CSS discussion (D17). |
| DOC-F1 | TB1 was executed because an earlier `context.md` entry claimed the blocks did not depend on the CSS manifest and could start immediately, and a recorded plan was treated as executable. The independence claim was wrong. | `context.md` now separates recording from authorization and requires every plan to list dependencies. `AGENTS.md` carries the same rule. |
| TB-F1 | The accepted generic inventory is `group`, `heading`, `text`, and `button`; `image` remains deferred to the media-contract review. | Input for the TB1 rework; do not add convenience blocks. |
| TB-F2 | TB1 known issues: `text` defaults to `body-md`, 12.5% smaller than global body copy on mobile; `heading` renders an empty heading when blank; `button` renders a role-less `span` with `aria-disabled` when the link is blank; `group` relies on inline custom properties and a local stylesheet. | Resolve in the TB1 rework after the typography, CSS placement, and primitive decisions. |
| TB-F3 | Semantic heading level and visual typography tier are independent; button is navigation-style; group owns child composition; text owns non-heading rich text. | Preserve these ownership boundaries in the rework. |
| TB-F4 | Before TB1, no section accepted `@theme` blocks or rendered `content_for 'blocks'`. TB1 added the minimal `custom-content` host without modifying merchant-owned template JSON. | Keep a host section in the rework. |
| P3-F1 | The `.env` Shopify upload surface has not been proven, but defensive `.shopifyignore` entries are low-cost and accepted in principle. | Describe the risk as unverified; change only `.shopifyignore`. |
| CSS-F1 | The future CSS batch must classify the old animation layers, reset and token bridge ownership, generated asset name, retained class consumers, and all existing `{% stylesheet %}` placements. | Keep D3 and the manifest work in the JS/CSS discussion; do not mix into other batches. |

---

## Proposed Work Batches

| Batch | Scope | Acceptance boundary | Status |
| --- | --- | --- | --- |
| P3 Upload-surface defense | Add `.env` and `.env.*` to `.shopifyignore` with the risk described as unverified. | Only `.shopifyignore` changes; entries and rationale are verified. | Planned; awaiting authorization. |
| P1+P5b Always-on entry slimming | Label the five implementation references as current-implementation protections pending mother-template review, and move implementation-specific rules out of `AGENTS.md` to exactly one owner each. | D17 accepted; no runtime or theme behavior change; no rule deleted while existing code depends on it; the entry stays complete for architecture-independent rules. | Research first (D17). |
| JS/CSS architecture discussion | Utility manifest and D3, CSS placement, typography design, button and surface primitives, JavaScript core and runtime conventions, Alpine scope. | Decisions recorded in `context.md` with dependencies. | Planned after P1+P5b. |
| TB1 rework | Rework the provisional Theme Blocks against the JS/CSS decisions and resolve TB-F2. | Accepted ownership boundaries preserved; known issues resolved; validation selected from the actual changes. | Blocked by the JS/CSS decisions. |
| CSS manifest | Define and measure the fixed Tailwind utility vocabulary and global/local CSS ownership. | D3 resolved; isolated measurement does not overwrite the tracked generated stylesheet; retained consumers and local stylesheet placements are inventoried. | Blocked by the JS/CSS decisions. |
| P4 License | Decide distribution intent, then align `package.json` license. | Distribution intent and package metadata agree. | Not started. |

---

## Future Extraction Goal

After the workflow is proven through real theme batches, evaluate extracting the portable board/context lifecycle, vendor-neutral roles, and thin client adapters into a reusable development template. Do not extract theme-specific rules, validators, or references as generic workflow infrastructure.
