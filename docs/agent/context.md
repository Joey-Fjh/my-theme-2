# Project Context

Short cross-session state for agents. Record only user-confirmed direction, current status, and unresolved decisions. Detailed architecture belongs in `docs/references/` after discussion.

Last updated: 2026-09-11.

## Project Identity

`my-skeleton-theme` is an internal Shopify Skeleton Theme mother template for building future themes.

- It is not a finished commercial theme or a direct Theme Store submission.
- It should be minimal, complete, modular, extensible, maintainable, and verifiable.
- It provides stable architecture and quality contracts; derived themes provide page design, business features, and visual or functional uniqueness.
- Optional Theme Store feature declarations are not default mother-template requirements.
- Existing custom architecture, tooling, validators, and Agent systems are pending review. Nothing is retained only because it already exists.

## Reference Sources

| Source | Role |
| --- | --- |
| Shopify developer documentation and Theme Store requirements | Normative platform requirements, best practices, and test guidance |
| [Shopify Skeleton Theme](https://github.com/Shopify/skeleton-theme) | Primary reference for a minimal, well-structured starting point |
| [Shopify Horizon](https://github.com/Shopify/horizon) | Learning reference for current Shopify implementation patterns and organization; do not copy or retain patterns without discussion |
| [Original commercial theme](https://github.com/Joey-Fjh/my-theme-1) | Read-only source for the existing Ceylune implementation, history, tags, and releases |

## Safety Boundary

- Never modify `my-theme-1`; consult it only when historical implementation evidence is needed.
- `my-skeleton-theme` is independent and may be structurally reduced or rebuilt after approval.
- Ceylune appearance, sections, template content, schema IDs, merchant configuration, and storefront behavior do not require compatibility in this repository.
- Do not retain code "just in case"; each retained part must have an approved mother-template purpose.
- Implementation may proceed in a narrowly scoped batch after the user confirms that batch; confirmation does not authorize unrelated or still-open decisions.

## Confirmed Workflow

1. Inspect and analyze the repository without changing it.
2. Present evidence, architecture options, tradeoffs, and open questions to the user.
3. The user confirms, changes, or rejects each decision.
4. Only confirmed decisions may be written to documentation or code.
5. A confirmed, self-contained batch may be implemented immediately when the user asks execution to proceed; otherwise continue the audit until a larger implementation prompt can be produced.
6. Do not implement unconfirmed or adjacent decisions merely because one batch was approved.
7. Review and validate every completed implementation batch.

Undiscussed conclusions must not be treated as decisions. Superseded decisions must be removed or clearly replaced. Do not rely on chat history as the only durable state.

`docs/agent/context.md` is a temporary construction-phase decision ledger, not part of the finished Skeleton Theme. Before the Skeleton is declared complete, migrate every still-valid contract to its permanent rule, architecture, or usage document, verify that no unresolved decision remains, and then remove this file.

## Classification Model

Classify each reviewed file, feature, or capability as:

- Platform Required
- Skeleton Core
- Optional Capability
- Theme-Specific Implementation
- Tooling and Governance
- Open Decision

Keep three separate views: Shopify mandatory compliance, Theme Store optional feature declarations, and mother-template architecture capabilities.

## Confirmed Architecture Decisions

- The mother template uses the complete Shopify Theme Store mandatory capability set as its platform baseline, even though the mother template itself is not a direct submission theme.
- Mandatory capabilities remain available through minimal, industry-neutral implementations; retaining a capability does not require retaining its current Ceylune implementation.
- Required page templates should default to the smallest useful main-section composition rather than demo-rich page compositions.
- Theme Store optional feature declarations are not part of the default core unless separately approved as a reusable mother-template capability.
- Ceylune copy, industry positioning, visual composition, and presentation-oriented sections are not part of the mother-template baseline.
- Shopify official best practices are tracked separately from mandatory requirements and are evaluated as architecture and quality contracts.
- The mother template should use a small set of semantically distinct, reusable Theme Blocks rather than duplicating similar Section Blocks. Each generic block exposes a limited and stable merchant configuration contract; presets and CSS tokens provide controlled visual variation, parent Sections or Group/Container Blocks own composition and layout, specialized blocks own business semantics, and JavaScript owns interaction behavior.
- A generic block must not accumulate unrelated behavior modes merely to reuse markup. Appearance differences that preserve semantics belong to the same block; different data ownership, semantics, or behavior require a specialized block or parent composition.
- The confirmed initial generic Theme Block inventory is `group`, `heading`, `text`, and `button`. Product, cart, search, navigation, media-gallery, and other business blocks are reviewed separately. `image`, `spacer`, `divider`, `icon`, `button-group`, and `custom-liquid` are not part of the initial inventory merely for convenience.
- `group` owns child composition only; `heading` separates semantic heading level from visual typography; `text` owns non-heading rich text; and `button` owns navigation-style calls to action rather than arbitrary JavaScript actions. Exact schemas, presets, accepted parents, and parameter lists remain under discussion.
- `image` is deferred from the Theme Block inventory. Do not migrate `snippets/image.liquid` into `blocks/image.liquid`, delete the snippet, or make the Liquid July '26 `{% block %}` preview an image-architecture dependency unless a later discussion reopens and approves that decision. Image, video, and product-media ownership remain part of the separate media-contract review.
- The Liquid July '26 `{% block %}` and `{% partial %}` tags are useful future-facing capabilities but remain developer-preview features and must not become an undeclared compatibility requirement for the stable mother template.
- During implementation, `{% partial %}` may be trialed in low-risk, page-bound refresh flows where it clearly reduces Section Rendering API and selector-mapping code. Each trial must be documented and verified for ordinary storefront rendering, Theme Editor behavior, accessibility state, request races, Alpine lifecycle, and the custom `Components` lifecycle.
- `ShopifySectionRefresher` remains a transitional compatibility mechanism while required flows still depend on Section Rendering API behavior. Do not remove it wholesale, and do not add a permanent `partial`/`section` mode branch to one shared public method. Collection, search, and blog refreshes are preferred future trial candidates; Cart bundled section rendering and special endpoints remain on their existing path until an equivalent Partial path is proven.
- Remove `ShopifySectionRefresher` only after every retained caller has an approved replacement and its Alpine, custom component, accessibility, error, and history responsibilities have explicit owners.
- Non-trivial Agent work follows one minimal problem-solving loop: problem -> decomposition -> selection -> execution -> feedback and correction. First-principles reasoning informs the problem definition, pyramid-style structure informs decomposition and communication, and Feynman-style explanation is used to check that a retained decision can be understood plainly; these are embedded behaviors, not separate Agents or Skills.
- Keep that loop operational and concise. Do not require repeated restatement, expose verbose internal reasoning, create abstract methodology layers, or duplicate the same rules across `AGENTS.md`, Router, Skills, references, and vendor adapters. Delivery mode determines where the loop stops: discussion and prompt-only work stop before execution, while authorized execution continues through validation and correction.
- Keep only a short stable invocation in the always-on rule layer. Store detailed guidance in one on-demand reference only if later examples prove it necessary, and create a dedicated Skill only when a recurring workflow has concrete triggers, tools, outputs, and validation that the Router alone cannot express.
- Retain `agent-router` as the single lightweight dispatcher, not as an implementation Agent. Invoke it only when a task requires a real routing choice, such as ambiguous or broad scope, cross-session continuation, governance, multiple domains, delegation, or capability selection; skip it for clear single-file changes, fixed commands, and ordinary factual queries.
- The Router makes five compact decisions: `Intent`, `Mode`, `Boundary`, `Route`, and `Validation`. `Mode` distinguishes discussion, prompt-only, execution, and review; `Boundary` owns risk, permission, and stop conditions; `Route` selects abstract capability level, only the necessary docs or Skills, and whether delegation is justified. Do not encode concrete vendor model names in canonical Router guidance.
- Routing is internal by default. Do not print a mechanical route report on every task; explain it only when execution mode, authority, risk, architecture direction, or delegation materially affects the user. The Router should not require a second routing reference that merely repeats its own rules.
- `docs/references/agent-workflow/skill-routing.md` is removed after moving its unique rules to their actual owners. User delivery-mode overrides and the low-risk Router bypass belong in `agent-router`; multi-agent boundaries belong with orchestration; MCP hard rules belong in `AGENTS.md`.
- Retain a small `orchestrate-agents` Skill as the capability-aware SOP loaded only after the Router decides multi-agent work is justified. Codex multi-agent availability can depend on the active client, exposed tools, root model, and permitted worker models; the Skill guides supported execution and explicit degradation but cannot create a missing native delegation capability.
- `orchestrate-agents` must detect whether native delegation is available, respect the selected delivery mode and authority, choose bounded native delegation only when useful, otherwise fall back explicitly to sequential work or prompt-only external handoff, keep one writer in a shared worktree, and keep final ownership with the primary Agent. Do not hardcode a permanent model support matrix; use abstract capability levels and transient client/runtime overrides only when a task explicitly needs them.
- Do not create project Skills merely to wrap general model or client capabilities. A project Skill is justified only by a clear, recurring, project-specific SOP with concrete triggers, required inputs, procedural steps or tools, outputs, boundaries, and a way to verify completion. Prefer built-in capabilities and short routing guidance when those are sufficient.
- Cross-client portability is an explicit Agent-system goal. Keep reusable role behavior, permissions, and handoff meaning vendor-neutral; client-specific files under `.codex/`, `.cursor/`, `.claude/`, or future adapters should remain thin and removable without changing the canonical project contract.
- Do not require the user to maintain concrete model names across roles and clients. Canonical routing and role guidance uses abstract capability and reasoning levels. Client adapters should inherit an active/default model when the client reliably supports it, and otherwise keep the smallest centralized mapping required by that client; verify actual inheritance behavior before removing required adapter fields.
- Retain three vendor-neutral delegated roles: `scout` for efficient read-only discovery, `implementer` for one bounded write scope, and `verifier` for independent high-confidence read-only review. The primary Agent is inherently the orchestrator. Deterministic validation belongs to `scout` or `verifier` as appropriate, and approved governance-document changes belong to a scope-limited `implementer`; the standalone `orchestrator`, `validator`, and `docs-steward` roles and adapters are removed.
- Preserve approved Agent capabilities and reasoning principles independently from their current files. Every existing implementation file still requires a concrete owner, purpose, dependency, and minimum-value justification; retaining a capability does not grant automatic retention to its current Role, Contract, Hook, validator, adapter, or documentation structure.
- Strict task/result JSON schemas are removed because no external or theme runtime consumes them. The portable handoff meaning remains in the compact orchestration SOP: a task provides objective, scope and authority, necessary context, acceptance criteria, and stop conditions; a result provides status and conclusion, evidence, changed files, validation, and unresolved risk or blockers.
- The subagent-result format enforcement chain is removed: client Hook configuration and adapters, the shared validator and Hook test, the npm test script, and its direct AJV dependency. These Hooks validated JSON shape rather than implementation correctness and did not provide an independent permission boundary.
- Preserve Hook support as a possible client extension point, not as preinstalled Skeleton infrastructure. Add a Hook later only for a concrete event that must be enforced automatically and cannot be handled reliably by the client sandbox, Router, scoped handoff, deterministic theme validation, or independent review.
- The whole Agent-system structure linter and its npm script are removed. It validated an exact directory topology, fixed roles and model names, schemas, Hooks, adapters, and documentation links rather than proving an Agent capability or Shopify theme outcome. Do not replace it with another whole-system structure linter.
- Retain all Shopify-focused deterministic validation. Add a future Agent configuration check only for a concrete, reproducible failure that can be verified mechanically and is not already reported by the active client.
- `docs/references/agent-workflow/multi-agent-architecture.md` is removed. Its useful rules now live directly in the compact orchestration SOP: pass only necessary task context, parallelize only independent work, keep one writer in a shared worktree, retain final ownership with the primary Agent, and degrade explicitly when native delegation is unavailable. Do not create a replacement reference unless later cross-client behavior develops substantial stable detail that cannot remain concise in the Skill.
- Retain `.codex/config.toml` as a thin project-scoped Codex adapter. It keeps `agents.max_concurrent_threads_per_session = 3` as a coordination and concurrent-cost guard, while redundant enablement, default subagent model and reasoning, and Hook feature settings are removed. Review the two MCP entries separately before retaining or changing them.
- Retain only `.codex/agents/scout.toml`, `.codex/agents/implementer.toml`, and `.codex/agents/verifier.toml` as thin adapters to the three approved vendor-neutral roles. Keep only the required identity, concise selection description, role-file instruction, and useful sandbox default: `read-only` for Scout and Verifier, `workspace-write` for Implementer. Remove concrete model and reasoning fields, strict result-schema references, and repeated canonical role rules. The sandbox value is a client default, not an absolute security boundary; active parent-session permission overrides still apply.
- Codex Docs Steward and Validator adapters and their corresponding canonical roles are removed. Approved documentation changes belong to a scope-limited Implementer; command-focused validation and independent acceptance belong to Scout or Verifier as appropriate.
- Codex model selection is runtime-owned: the user or client selects the parent model, retained custom Agents inherit it by default, and an explicit one-task spawn override is allowed when a concrete cost or capability need justifies it. Do not persist Astra, Sol, Terra, or future model-version mappings in the repository. Selective delegation and the concurrent-thread cap are the stable cost controls; the cap does not limit total task tokens.
- Retain `.cursor/agents/scout.md`, `.cursor/agents/implementer.md`, and `.cursor/agents/verifier.md` as thin native Cursor adapters rather than relying on undocumented permission translation from Codex TOML compatibility. Keep only identity, concise selection description, one canonical role-file instruction, and explicit `readonly` values; omit `model` so Cursor inherits the parent model. Remove the Cursor `docs-steward` and `validator` adapters.
- Remove the Cursor `subagentStop` result-format Hook and its adapter. Retain `.cursor/mcp.json` unchanged until the shared MCP capability audit; its location is valid Cursor project configuration, but that does not pre-approve either server entry.
- Preserve the tracked `CLAUDE.md -> AGENTS.md` and `.claude/skills -> ../.agents/skills` symlinks as the zero-duplication Claude entry and Skill-discovery adapters. Their current plain-file appearance on this Windows checkout is caused by repository-local `core.symlinks = false`, not by invalid repository link metadata. Document the Windows prerequisite and targeted restore procedure; do not replace the links with copied rules, wrapper Skills, or a second Claude entry file.
- Retain three thin native Claude subagent adapters under `.claude/agents/`: Scout and Verifier use `permissionMode: plan`; Implementer inherits the parent permission context. All three omit `model` and inherit the active parent model. Do not add Claude adapters for Docs Steward or Validator.
- Remove project-level WebSearch and Anthropic-document WebFetch pre-approvals from `.claude/settings.json`; ordinary network access follows the active user/session permission policy. Retain only the current MCP server enablement list until the shared MCP audit, without treating the listed servers as pre-approved architecture.

## Implementation Status

- The confirmed Codex adapter batch is implemented: `.codex/config.toml` retains only the three-thread Agent cap plus the still-pending MCP entries; concrete subagent model, reasoning, redundant enablement, and Hook feature settings are removed.
- `.codex/agents/scout.toml`, `.codex/agents/implementer.toml`, and `.codex/agents/verifier.toml` are reduced to thin role adapters with sandbox defaults and parent model inheritance. The Codex `docs-steward` and `validator` adapters are removed.
- `.codex/hooks/validate-agent-result.cjs` is removed. The active Windows Codex process prevented deletion of `.codex/hooks.json`, so it currently contains only `{}` and has no Hook behavior; delete the empty file after the client releases it.
- The confirmed Cursor adapter batch is implemented: its Scout, Implementer, and Verifier files are thin native Markdown adapters with explicit `readonly` defaults and inherited parent models; its `docs-steward`, `validator`, `hooks.json`, and result-validator Hook adapter are removed. `.cursor/mcp.json` remains unchanged pending MCP review.
- The confirmed Claude adapter batch is implemented without changing the two tracked symlinks: Scout, Implementer, and Verifier adapters are added under `.claude/agents/`; broad project Web pre-approvals are removed from `.claude/settings.json`; and `AGENTS.md` now records the Windows symlink prerequisite and recovery path. The local checkout still has `core.symlinks = false`, so restoring real links remains a machine setup action after Windows permits symlink creation.
- The three retained canonical roles now use concise semantic handoffs without fixed model profiles or strict JSON output. The redundant roles, contracts, Hook validator chain, Agent topology lint, and duplicate Agent workflow references are removed.
- `agent-router` and `orchestrate-agents` now contain the approved lightweight routing and optional delegation contracts. Remaining Shopify validation Skills, MCP configuration, and theme implementation are unchanged pending their separate reviews.

## Current Phase

Active: completing the approved Agent-foundation cleanup as a coherent checkpoint. Routing, delivery modes, model inheritance, permissions, delegation fallback, external prompt execution, and verification ownership are now recorded without fixed model names or a duplicated enforcement framework. Theme architecture decisions already confirmed remain valid, but their implementation remains paused.

The current cleanup scope prioritizes files and directories outside Shopify's eight standard theme runtime directories: `assets`, `blocks`, `config`, `layout`, `locales`, `sections`, `snippets`, and `templates`. Being outside those directories is not itself a deletion reason. Classify Agent infrastructure, client adapters, validation/build tooling, documentation, editor/CI configuration, and the `tailwind/` CSS source layer separately, then retain only items with an approved Skeleton purpose.

Not started: theme file deletion, page rebuild, CSS or JavaScript refactor, or ESM migration.

The user's minimum problem-solving loop and the lightweight Router contract are approved Agent-system design constraints. Their eventual permanent placement remains part of the rule-layer audit; avoid creating a separate methodology Skill or long always-on prompt by default.

The audit covers Shopify composition and Theme Editor behavior; layout and settings; CSS and responsive design; images, video, product media, and 3D media; JavaScript lifecycle and loading; commerce capabilities; accessibility, SEO, performance, compatibility, progressive enhancement, i18n, edge cases, testing, documentation, tooling, and governance.

## Agent Approval Gate

- Existing and future Agents, Skills, Roles, Contracts, Hooks, validators, MCP configuration, adapters, permissions, npm scripts, and multi-agent orchestration are all subject to user review.
- Existing use or a reference from another file does not grant retention approval.
- Current Agent files may remain operational during the audit, but their temporary use does not exempt them from later review.
- Do not add, install, migrate, expand, or refactor Agent-related content without prior discussion and approval.
- Do not run multi-agent orchestration unless the user explicitly authorizes the specific task.
- Before retaining an item, explain its path, purpose, trigger, inputs and outputs, dependencies, permissions, repository effects, Skeleton value, maintenance cost, simpler alternatives, removal impact, and validation method.
- The user does not need to author these systems, but must understand and approve every retained item.
- The full Agent audit occurs after the theme architecture and validation model are decided.

## Open Decisions

- Exact schemas, presets, allowed parent contexts, and external-input contracts for the four confirmed initial Theme Blocks
- Whether `image` should ever become a Theme Block after the separate image, video, and product-media contract is reviewed
- Global page, Section, and Block layout protocol
- Settings, CSS token, and Tailwind source boundaries
- JavaScript core, business modules, ESM, import maps, and on-demand loading
- Alpine scope and initialization order
- Image, video, and product-media contracts
- Accessibility, SEO, performance, compatibility, and testing gates
- Final tooling, Agent, Skill, rule, and validator architecture
- Remaining cross-client capability and fallback differences for Cursor, Claude, and future clients

## Next Step

Review the remaining Shopify validation Skills and MCP entries as separate decisions. Then resume the four Theme Block contracts and global layout protocol before changing theme runtime code. After this Codex process releases `.codex/hooks.json`, delete that behavior-free empty file as a small cleanup.
