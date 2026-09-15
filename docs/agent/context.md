# Project Context

Short cross-session state for agents. Record only user-confirmed direction, current status, and unresolved decisions. Detailed architecture belongs in `docs/references/` after discussion.

Last updated: 2026-09-14.

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

Discussion exists to build the Skeleton, not merely to grow this file. Recording a confirmed decision here does not implement it or complete its batch; place it in its permanent rule, architecture, configuration, or code owner and validate it when that approved scope is executed. This file only prevents repeated context recovery and tracks unresolved dependencies.

`docs/agent/context.md` is a temporary construction-phase decision ledger, not part of the finished Skeleton Theme. Before the Skeleton is declared complete, migrate every still-valid contract to its permanent owner, verify that no unresolved decision remains, and then remove this file.

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
- The Router makes six compact decisions: `Intent`, `Mode`, `Boundary`, `Route`, `Execution carrier`, and `Validation`. `Mode` distinguishes discussion, prompt-only, execution, and review; `Boundary` owns risk, permission, and stop conditions; `Route` selects abstract capability level, only the necessary docs or Skills, and whether delegation is justified; `Execution carrier` chooses `primary`, `native delegation`, `external prompt`, or `user`. Do not encode concrete vendor model names in canonical Router guidance.
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
- Retain `.codex/config.toml` as a thin project-scoped Codex adapter. It keeps `agents.max_concurrent_threads_per_session = 3` as a coordination and concurrent-cost guard, while redundant enablement, default subagent model and reasoning, and Hook feature settings are removed. Retain the two MCP entries as approved project configuration.
- Retain only `.codex/agents/scout.toml`, `.codex/agents/implementer.toml`, and `.codex/agents/verifier.toml` as thin adapters to the three approved vendor-neutral roles. Keep only the required identity, concise selection description, role-file instruction, and useful sandbox default: `read-only` for Scout and Verifier, `workspace-write` for Implementer. Remove concrete model and reasoning fields, strict result-schema references, and repeated canonical role rules. The sandbox value is a client default, not an absolute security boundary; active parent-session permission overrides still apply.
- Codex Docs Steward and Validator adapters and their corresponding canonical roles are removed. Approved documentation changes belong to a scope-limited Implementer; command-focused validation and independent acceptance belong to Scout or Verifier as appropriate.
- Codex model selection is runtime-owned: the user or client selects the parent model, retained custom Agents inherit it by default, and an explicit one-task spawn override is allowed when a concrete cost or capability need justifies it. Do not persist concrete model names, versions, or mappings in the repository. Selective delegation and the concurrent-thread cap are the stable cost controls; the cap does not limit total task tokens.
- Retain `.cursor/agents/scout.md`, `.cursor/agents/implementer.md`, and `.cursor/agents/verifier.md` as thin native Cursor adapters rather than relying on undocumented permission translation from Codex TOML compatibility. Keep only identity, concise selection description, one canonical role-file instruction, and explicit `readonly` values; omit `model` so Cursor inherits the parent model. Remove the Cursor `docs-steward` and `validator` adapters.
- Remove the Cursor `subagentStop` result-format Hook and its adapter. Retain `.cursor/mcp.json` as approved thin Cursor MCP configuration.
- Preserve the tracked `CLAUDE.md -> AGENTS.md` and `.claude/skills -> ../.agents/skills` symlinks as the zero-duplication Claude entry and Skill-discovery adapters. Their current plain-file appearance on this Windows checkout is caused by repository-local `core.symlinks = false`, not by invalid repository link metadata. Document the Windows prerequisite and targeted restore procedure; do not replace the links with copied rules, wrapper Skills, or a second Claude entry file.
- Retain three thin native Claude subagent adapters under `.claude/agents/`: Scout and Verifier use `permissionMode: plan`; Implementer inherits the parent permission context. All three omit `model` and inherit the active parent model. Do not add Claude adapters for Docs Steward or Validator.
- Remove project-level WebSearch and Anthropic-document WebFetch pre-approvals from `.claude/settings.json`; ordinary network access follows the active user/session permission policy. Retain the current MCP server enablement list as approved thin Claude configuration.
- The Skeleton keeps Tailwind, but changes what drives the build. Tailwind stops scanning Liquid files and instead generates an explicitly enumerated utility vocabulary through `@source inline(...)` with `source(none)`. The generated global asset stylesheet therefore has a fixed size that does not grow with the number of sections, and Tailwind becomes an architecture-level vocabulary generator rather than a per-change compile dependency.
- `npm.cmd run build:tw` is retained but only runs when the vocabulary manifest itself changes. Ordinary section work is buildless: any class in the manifest, including responsive `pc:`/`fw:` variants, is already present in the committed asset, so styles can also be edited in the Shopify admin code editor. Buildless daily editing is a confirmed Skeleton requirement; a zero-build repository is not.
- Component CSS moves to each section, block, or snippet's own `{% stylesheet %}` tag, which Shopify automatically subsets per render tree. `tailwind.components.css` and `tailwind.snippets.css` are removed as whole layers rather than migrated; they are Ceylune business CSS and are not part of the mother template.
- The single global asset stylesheet owns: reset and native element defaults, the `@theme inline` token bridge, typography tiers (`heading-h*`, `body-*`, `typo-subtitle`), single-element control primitives (`btn`, `field`, `badge`, `close-button`, `focus-ring`, `icons`, `skip-link`, `links-*`), cross-cutting vocabulary (`surface-*`, `z-layer-*`, `place-*`, `container-page`), the manifest utilities, and only the motion capabilities reused across unrelated files (`panel-motion-*`, `is-open`, `icons-animate-*`). Section-owned motion such as `watermark-marquee__*` and `scrolling-icon-with-text__*` moves to `{% stylesheet %}`.
- Anything reused by multiple unrelated files must stay in the global asset stylesheet. Subsetting only preserves classes defined in the same file or a rendering ancestor, and asset stylesheets are exempt from subsetting, so cross-file shared classes belong there by platform requirement, not by preference.
- One boundary rule governs where CSS goes: if the manifest utilities can express it, it must not be written into `{% stylesheet %}`. `{% stylesheet %}` carries only what the manifest cannot express, such as complex selectors, pseudo-elements, keyframes, container queries, `:has()`, grid template areas, and exact one-off values.
- Duplication risk is handled by naming separation and that boundary rule, not by Theme Check. `ValidScopedCSSClass` detects missing cross-file definitions, not duplicated declarations. A future `lint:theme` rule may flag `{% stylesheet %}` blocks that contain only atomic property declarations, but it is not required now.
- Measured baseline for this decision, recorded so it need not be re-measured: `assets/tailwind.output.css` is 369 KB raw, 41 KB gzip, 28 KB brotli, loaded as the only theme stylesheet link; its layer split is utilities 166 KB, snippets 106 KB, components 56 KB, base 37 KB including 14 KB vendor Swiper CSS, theme 2 KB. Liquid uses only two breakpoints (`pc` 48rem, `fw` 80rem) with 393 `pc:` and 16 `fw:` usages across 118 Liquid files, and 26 files already carry a `{% stylesheet %}` tag. For scale comparison, Shopify Horizon ships a 44.5 KB `assets/base.css` plus per-section `{% stylesheet %}`, and the official skeleton theme ships only a 2.4 KB `assets/critical.css`. The Skeleton global layer targets the Horizon order of magnitude, not the 2.4 KB one.

## Implementation Status

- Execution carrier rules are now permanent in `AGENTS.md`: the primary agent defaults to analysis, plans, prompts, and review; broad scans, simple bulk work, and mechanical tasks default to external execution prompts; direct file edits require explicit user authorization. `agent-router` adds `Execution carrier` as a routing decision without duplicating the full work loop.
- Shopify Dev MCP and Context7 are approved and retained. Shopify Dev MCP is the authoritative Skeleton entry for Shopify API, Liquid, theme architecture, and platform requirements. Context7 is for current third-party library documentation, including but not limited to Tailwind, Alpine, GSAP, and Swiper.
- MCP client configuration stays in thin per-client adapters: `.codex/config.toml`, `.cursor/mcp.json`, `.mcp.json`, and `.claude/settings.json`. Do not centralize, generate, or symlink these files; `.shopifyignore` excludes them from theme upload only.
- The model-independent work loop is now an always-on rule in `AGENTS.md`: problem definition -> decomposition -> selection -> execution -> validation feedback -> correction. It governs both multi-turn discussion and authorized automatic execution without requiring a separate methodology Skill or mechanical response headings.
- The confirmed Codex adapter batch is implemented: `.codex/config.toml` retains only the three-thread Agent cap plus the approved MCP entries; concrete subagent model, reasoning, redundant enablement, and Hook feature settings are removed.
- `.codex/agents/scout.toml`, `.codex/agents/implementer.toml`, and `.codex/agents/verifier.toml` are reduced to thin role adapters with sandbox defaults and parent model inheritance. The Codex `docs-steward` and `validator` adapters are removed.
- `.codex/hooks/validate-agent-result.cjs` is removed. The behavior-free `.codex/hooks.json` placeholder and any legacy Hook directory residue are removed as part of the outer mechanical cleanup batch.
- The confirmed Cursor adapter batch is implemented: its Scout, Implementer, and Verifier files are thin native Markdown adapters with explicit `readonly` defaults and inherited parent models; its `docs-steward`, `validator`, `hooks.json`, and result-validator Hook adapter are removed. `.cursor/mcp.json` remains as approved thin Cursor MCP configuration.
- The confirmed Claude adapter batch is implemented without changing the two tracked symlinks: Scout, Implementer, and Verifier adapters are added under `.claude/agents/`; broad project Web pre-approvals are removed from `.claude/settings.json`; and `AGENTS.md` now records the Windows symlink prerequisite and recovery path. The local checkout still has `core.symlinks = false`, so restoring real links remains a machine setup action after Windows permits symlink creation.
- The three retained canonical roles now use concise semantic handoffs without fixed model profiles or strict JSON output. The redundant roles, contracts, Hook validator chain, Agent topology lint, and duplicate Agent workflow references are removed.
- `agent-router` and `orchestrate-agents` now contain the approved lightweight routing and optional delegation contracts. Shopify Dev MCP and Context7 are approved; MCP client adapters remain separate per client.
- `check-i18n` is approved and retained as an independent Skill with `npm.cmd run lint:i18n` and `npm.cmd run test:i18n`. Shopify Theme Check remains the platform authority; the project validator supplements it with duplicate keys, missing locale keys, Unicode hardcoded copy, schema/preset/default boundary checks, and instance `t:` misuse detection. Automated fixture tests are established and static `node --check` passed; runtime verification has not been run yet, though dependencies are installed.
- `check-theme-architecture` is approved and retained as the slim generic architecture validation Skill. Theme-specific rules, CSS layer allowlists, and the unused home-motion audit script are removed. Current `lint:theme` covers protected Shopify Liquid runtime-name assign/capture shadowing, static tab accessibility, and the SVG `textLength` WebKit guardrail only. JS/CSS architecture-coupled rules remain deferred until the corresponding implementation architecture is decided. Embedded JS lint uses virtual `assets/*.js` paths so ESLint applies the same config as first-party assets. `lint-liquid-syntax` is retained for strict Liquid output parsing; fixture tests are established via `npm.cmd run test:theme-architecture` and static `node --check` passed; runtime verification has not been run yet, though dependencies are installed.
- The redundant `build-svg-icons` Skill is removed while the SVG ingestion capability remains as `npm.cmd run build:svg` with root-owned `svgo.config.cjs`. `icons/` remains ignored temporary staging; optimized runtime icons are committed under `assets/`. Existing icon assets are not part of this configuration-only batch and remain pending the later asset inventory cleanup.
- Root configuration cleanup is implemented: README and package identity now describe the Skeleton mother template; `private: true` is set; build scripts use local `tailwindcss` and `svgo` binaries; `test:validators` is the unified validator entry and is wired into `npm test` and CI; personal `shopify.theme.toml` is removed from the repository and ignored locally; Theme Check returns to `theme-check:recommended`; `svgo.config.cjs` is excluded from Shopify upload; npm lockfile tarball sources use `registry.npmjs.org`; top-level `browserslist` is removed from devDependencies.
- Outer mechanical cleanup is complete: empty `.codex/hooks.json` is removed; stale `launch-gate.md` governance-path references are corrected.
- ESLint and Stylelint remain provisional repository configuration pending the separate JS/CSS architecture review. License distribution is still undecided.
- Validator fixture tests are established and static `node --check` passed; runtime execution has not been run yet, though dependencies are installed.

## Scope And Boundaries

Active issues, pending decisions, and work batches live in `docs/agent/board.md`, not here. This file records accepted results only.

Cleanup scope: classify Agent infrastructure, client adapters, validation and build tooling, documentation, editor and CI configuration, and the `tailwind/` CSS source layer separately from Shopify's eight standard theme runtime directories (`assets`, `blocks`, `config`, `layout`, `locales`, `sections`, `snippets`, `templates`). Being outside those directories is not itself a deletion reason; retain only items with an approved Skeleton purpose.

Not started: theme file deletion, page rebuild, CSS or JavaScript refactor, ESM migration.

The minimum problem-solving loop and execution carrier rules are permanently owned by `AGENTS.md`; the lightweight Router selects mode, boundary, route, execution carrier, and validation without duplicating that loop. Avoid creating a separate methodology Skill, response-template file, or long always-on prompt.

The audit covers Shopify composition and Theme Editor behavior; layout and settings; CSS and responsive design; images, video, product media, and 3D media; JavaScript lifecycle and loading; commerce capabilities; accessibility, SEO, performance, compatibility, progressive enhancement, i18n, edge cases, testing, documentation, tooling, and governance.

## Agent Approval Gate

- Existing and future Agents, Skills, Roles, Contracts, Hooks, validators, MCP configuration, adapters, permissions, npm scripts, and multi-agent orchestration are all subject to user review.
- Existing use or a reference from another file does not grant retention approval.
- Current Agent files may remain operational during the audit, but their temporary use does not exempt them from later review.
- Do not add, install, migrate, expand, or refactor Agent-related content without prior discussion and approval.
- Do not run multi-agent orchestration unless the user explicitly authorizes the specific task.
- Before retaining an item, explain its path, purpose, trigger, inputs and outputs, dependencies, permissions, repository effects, Skeleton value, maintenance cost, simpler alternatives, removal impact, and validation method.
- The user does not need to author these systems, but must understand and approve every retained item.
- Repository-level Agent, MCP, build, and tooling configuration is reviewed in the current outer-layer phase outside the Shopify business directories. Validation rules that are tightly coupled to theme implementation can be finalized only after the corresponding theme architecture is decided.

## Open Decisions

- Exact schemas, presets, allowed parent contexts, and external-input contracts for the four confirmed initial Theme Blocks
- Whether `image` should ever become a Theme Block after the separate image, video, and product-media contract is reviewed
- Global page, Section, and Block layout protocol
- The utility vocabulary manifest itself: which utility families, how many steps per scale, and which variants (`pc`, `fw`, `hover`, `focus-visible`, container queries) are enumerated, plus its measured output size
- Settings and CSS token boundaries
- Name of the generated global asset stylesheet, currently `assets/tailwind.output.css`
- Whether the 14 KB `vendor-swiper.min.css` stays compiled into the always-loaded global stylesheet; deferred to the carousel and JavaScript architecture review
- Rewrite of `docs/references/style-system/css-architecture.md` and the matching `AGENTS.md` CSS rules after the manifest is approved
- JavaScript core, business modules, ESM, import maps, and on-demand loading
- Alpine scope and initialization order
- Image, video, and product-media contracts
- Accessibility, SEO, performance, compatibility, and testing gates
- License distribution model
- Remaining cross-client capability and fallback differences for Cursor, Claude, and future clients

## Machine Setup Notes

- On this machine, Codex has not yet added this repository to user-level trusted projects, so `codex mcp list` shows only the global `node_repl` server and does not load the project's Shopify Dev MCP or Context7 entries from `.codex/config.toml`. This is a local trust configuration gap, not missing repository MCP files. After adding the project to Codex trusted projects, restart Codex and confirm both servers appear in the tool list.
- In Cursor on this machine, the `shopify-dev-mcp` server failed live tool discovery and its `mcp_auth` call timed out, and `context7` is configured in `.cursor/mcp.json` but is not mounted as an available namespace. The CSS decisions above were therefore grounded in shopify.dev documentation pages, the official `Shopify/skeleton-theme` and `Shopify/horizon` sources through the GitHub API, and tailwindcss.com documentation. Those are degraded sources under the `AGENTS.md` MCP rule; re-verify the platform and Tailwind facts through MCP once the servers load.
- Dependencies are installed on this machine (checked 2026-09-15): `node_modules` has 229 entries and `tailwindcss@4.1.18` is present. `npm ci` is not a prerequisite here. No manifest prototype has been built or measured yet, but nothing blocks doing so.
- Sandbox visibility differs per client (checked 2026-09-15). One client's Bash tool could not see `node_modules/` while PowerShell in the same client could; another client could read it directly. If a client's sandbox hides a path excluded by `.gitignore`, do not infer that the path is missing; confirm with another read-only method available to that client.
- This file records current state and machine-specific follow-ups only. It does not replace permanent rules in `AGENTS.md`, project Skills, or `docs/references/`.

## Next Step

Skeleton implementation batches and the CSS review run in parallel. Do not hold executable theme work behind the architecture audit.

- Theme Blocks: the four confirmed generic blocks (`group`, `heading`, `text`, `button`) do not depend on the CSS manifest. `blocks/` does not exist yet. Their typography tiers already live in the global layer and stay there under the confirmed CSS ownership, so this batch can start immediately; its schemas and presets are implementation choices inside the batch.
- CSS: draft the utility vocabulary manifest (utility families, scale steps, variant strategy, global-layer ownership table, and the global-versus-local boundary rule with examples and counter-examples), then measure real output size with an isolated build. Only after the user accepts the manifest, rewrite `docs/references/style-system/css-architecture.md` and the `AGENTS.md` CSS rules, then change `tailwind/` sources and the generated asset.
- JavaScript architecture review follows the CSS contract rewrite.
- The global page, Section, and Block layout protocol follows the first Theme Block batch, informed by what that batch proves.
