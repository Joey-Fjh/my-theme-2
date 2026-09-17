# Project Context

Current cross-session state and execution source for the Skeleton project. Record agreed plans, their dependencies and authorization state, current implementation status, accepted results, and unresolved decisions. Discussion and competing proposals stay in `docs/agent/board.md` until the user accepts a direction.

Last updated: 2026-09-17.

## Record Lifecycle

1. Use `docs/agent/board.md` for discussion, evidence, alternatives, disagreements, and pending decisions.
2. After the user accepts a direction, record it here with an accurate status such as `planned`, `authorized`, `in progress`, `implemented`, `provisional`, `accepted`, `deferred`, or `blocked`.
3. **Recording is not authorization.** A planned entry may be executed only when both conditions hold: the user has explicitly authorized that batch for execution, and every dependency listed in the entry is resolved. If either is missing, stop and raise it on the board.
4. Every planned entry lists its dependencies. A claim that a batch has no dependency on an open decision must name the evidence; an unsupported independence claim is treated as a dependency.
5. After implementation, record validation and acceptance here, compress the accepted plan into a short result, and remove obsolete discussion from the board.
6. Move stable architecture and operating contracts to `AGENTS.md`, code, configuration, or the matching document under `docs/references/`. This file tracks current project state; it is not the permanent owner of those contracts.

Chat history is not a durable source of project state. Superseded conclusions must be removed or clearly replaced.

## Project Identity

`my-skeleton-theme` is an internal Shopify Skeleton Theme mother template for building future themes.

- It is not a finished commercial theme or a direct Theme Store submission.
- It should be minimal, platform-complete, modular, extensible, maintainable, and verifiable.
- It provides stable architecture and quality contracts; derived themes provide page design, business features, and visual or functional uniqueness.
- Shopify Theme Store mandatory capabilities form the platform baseline. Optional feature declarations are not default mother-template requirements.
- Existing custom architecture, tooling, validators, and Agent infrastructure remain only when they have an approved mother-template purpose.

## Safety And Authority

- Never modify `my-theme-1`; use it only as read-only historical evidence.
- `my-skeleton-theme` is independent. Ceylune appearance, content, schemas, configuration, and behavior do not require compatibility here.
- The user owns outcomes, priorities, batch boundaries, architecture and risk decisions, and execution authority.
- The execution carrier is whichever client the user is working in for that request; it does not need to be named. Keep one writer per shared worktree, and never start a subagent to execute a batch.
- Once a batch is authorized, the implementer makes in-scope implementation choices, writes the files, validates the result, and corrects failures without asking for approval on each detail.
- Review, discussion, and prompt-only requests stop before implementation unless the user authorizes execution.
- Do not modify merchant-owned configuration or content without explicit authorization.
- Do not retain code or infrastructure merely because it already exists.

## Classification Model

Classify reviewed files and capabilities as one of:

- Platform Required
- Skeleton Core
- Optional Capability
- Theme-Specific Implementation
- Tooling and Governance
- Open Decision

Keep Shopify mandatory compliance, Theme Store optional declarations, and mother-template architecture capabilities separate.

## Accepted Theme Architecture

### Platform and composition

- Mandatory Shopify capabilities remain available through minimal, industry-neutral implementations. Required templates should use the smallest useful main-section composition rather than demo-rich layouts.
- The accepted initial generic Theme Block **inventory** is `group`, `heading`, `text`, and `button`. Their intended ownership is: `group` owns child composition; `heading` separates semantic level from visual tier; `text` owns non-heading rich text; `button` owns navigation-style calls to action.
- A generic block may vary appearance while preserving semantics, but it must not collect unrelated data ownership, business semantics, or behavior modes merely to reuse markup.
- **Correction, 2026-09-17:** an earlier record stated that these blocks "do not depend on the CSS manifest" and could "start immediately". That was wrong. Theme Blocks depend on the undecided CSS placement rules, typography tier design, button and surface primitives, and JavaScript runtime conventions. Block schemas and markup are therefore blocked by the JS/CSS architecture decisions. The current implementation is recorded as provisional under TB1.
- `image` is deferred pending the separate image, video, and product-media contract. Do not migrate `snippets/image.liquid` or make preview-only Liquid features an undeclared stable requirement.

### Rendering and runtime transition

- Liquid July '26 `{% block %}` and `{% partial %}` capabilities remain developer-preview features and are not stable mother-template requirements.
- A `{% partial %}` trial is allowed only in a low-risk page-bound refresh flow and must be verified for ordinary rendering, Theme Editor behavior, accessibility state, request races, Alpine lifecycle, and the custom component lifecycle.
- `ShopifySectionRefresher` remains a transitional compatibility mechanism while retained flows depend on Section Rendering API behavior. Remove it only after every caller has an approved replacement and explicit lifecycle, accessibility, error, and history ownership.

### CSS direction

- Tailwind remains, but the accepted target is a fixed utility vocabulary generated through `@source inline(...)` with `source(none)` rather than scanning Liquid files.
- Ordinary section work should be buildless once the manifest is established. `npm.cmd run build:tw` is needed only when the utility vocabulary changes.
- Component-specific CSS belongs in the owning section, block, or snippet `{% stylesheet %}` tag. Shared cross-file primitives, tokens, typography, surfaces, layout vocabulary, and truly reusable motion remain global.
- If manifest utilities can express a rule, do not duplicate it in `{% stylesheet %}`. Local styles are for selectors, pseudo-elements, keyframes, container queries, `:has()`, grid templates, and exact one-off values that the manifest cannot express.
- The manifest contents, token boundary, generated stylesheet name, Swiper CSS ownership, and final reference rewrite remain open. No CSS implementation batch has started.

## Always-On Entry Direction

Accepted by the user on 2026-09-17; implementation is planned under P1+P5b and has not started.

- `AGENTS.md` is the always-loaded entry. It must be **complete for rules that do not depend on the Skeleton's implementation**: project identity, safety and authority, merchant ownership, launch blockers, the work protocol, record lifecycle, routing, validation selection, adapter guardrails, and architecture-independent implementation safeguards.
- It must **not** encode the Skeleton's current implementation as permanent contract. Runtime names (`Components.register()`, `ThemeEvents`, `ShopifyHttp`, `ShopifySectionRefresher`, `$store.cart`, `AlpineComponentsFactory`), typography tier names and usage (`heading-h*`, `body-*`, `typo-subtitle`), motion-gate mechanics, and Tailwind placement rules describe current Ceylune-derived code whose mother-template status is undecided.
- Evidence: reviewing TB1 found its `text` block "violating" the entry rule on body copy sizing. That rule comes from the current typography implementation, yet it sat in the always-loaded entry and pre-constrained a Skeleton design decision that has not been discussed.
- Target shape, carried from the earlier P5-F20 classification: keep architecture-independent safeguards in the entry — no inline scripts or unmanaged global listeners; Liquid-to-JavaScript values through `data-*`; critical first-viewport content usable without JavaScript or animation completion; user-visible copy through locale keys; semantic, accessible interaction; no manual edits to vendor, generated, or optimized icon assets. Route implementation-specific rules to their reference owners, labelled as current-implementation protections pending mother-template review. Rules move; they are not silently deleted while existing code still depends on them.
- The exact always-on set still requires research before implementation.

## Agent Infrastructure State

### Implemented and retained

- `AGENTS.md` is the canonical repository instruction source. Canonical role contracts live in `.agents/roles/`: `scout`, `implementer`, and `verifier`.
- Nine client permission shims remain under `.claude/agents/`, `.cursor/agents/`, and `.codex/agents/`. They are separate real files because each client reads a different permission field (`permissionMode`, `readonly`, `sandbox_mode`) and none reads the canonical `filesystem-profile`. Cursor reads `.claude/agents/` for compatibility but does not honour `permissionMode`, so `.cursor/agents/` cannot be removed. Their descriptions match the canonical role descriptions verbatim.
- `CLAUDE.md -> AGENTS.md` and `.claude/skills -> ../.agents/skills` remain tracked symlinks. Their content is never copied or synchronised; Git stores the link itself.
- `check-i18n` and `check-theme-architecture` remain because they wrap executable project validation. The prose-only `agent-router` and `orchestrate-agents` Skills were removed. `build:svg` remains a root npm capability.
- `.codex/config.toml`, `.cursor/mcp.json`, `.mcp.json`, and `.claude/settings.json` remain thin client-owned configuration. Shopify Dev MCP and Context7 are approved project capabilities; live availability is client- and machine-specific.
- `npm.cmd run doctor:agent` (`.agents/tools/doctor-agent.mjs`) checks the two entry adapters. A healthy symlink passes; a plain file, a missing path, or an inspection error fails. Ordinary mode exits 1 with stderr remediation on failure; `--hook` mode always exits 0 and prints an instruction on stdout on failure. Both modes are silent when healthy. It is not wired into `lint`, `test`, or `scan:compat`.
- **Superseded, 2026-09-17:** the P6 plan briefly split "missing" from "inert" so that derived themes removing `.claude/` would not be warned (P5-F35). That split was reverted in the implementation. The reversal stands because removing `.claude/` also removes `.claude/settings.json` and therefore the Hook itself; the remaining trigger, a partially removed adapter set, is an inconsistent state worth reporting.
- `.claude/settings.json` registers a `SessionStart` command Hook with matcher `startup|resume` that runs `node "${CLAUDE_PROJECT_DIR}/.agents/tools/doctor-agent.mjs" --hook`. It exists because an inert `CLAUDE.md` makes every rule in `AGENTS.md` unreadable to Claude Code; Cursor and Codex read root `AGENTS.md` directly and need no Hook.
- README owns the complete human symlink procedure: symlink-capable clone first, then the elevated-shell Windows repair that changes no system setting, with Developer Mode optional. `AGENTS.md` holds only two guardrail lines.

### Accepted operating model

- Inspect repository evidence before asking for discoverable facts. During authorized implementation, validate against the agreed acceptance criteria and correct failures; do not declare completion from edits alone or retry a failed action without new evidence.
- A project Skill must wrap a recurring executable project capability. Prose-only routing or delegation guidance belongs in `AGENTS.md`, role contracts, or references.
- Volatile tooling assertions require current authoritative evidence. Record the client, scope, and check date where availability can change; mark missing evidence as unverified rather than presenting it as fact.
- The portable workflow remains inside `AGENTS.md`. Do not create `.agents/WORKFLOW.md` or another protocol file until the pilot demonstrates reusable content worth extracting.

### Known limits

- Project Hooks run only after workspace trust is accepted. On a first clone the Hook may not fire; README is the layer that works with no tooling and no trust. The Hook is the strongest repository-level warning, not a guarantee.
- Whether the model warns unprompted when the first user message is unrelated has not been tested.
- The P5a compression removed two non-blocking method prompts from `AGENTS.md`: select the smallest justified action, and give a delegated Agent only the necessary context.

## Current Validation Evidence

Independently reproduced on 2026-09-17 after TB1 and V1:

- `npm.cmd run test:validators`: 24 of 24 i18n tests and 31 of 31 theme architecture tests pass.
- `lint:i18n`, `lint:theme`, `lint:liquid-syntax`, and `lint:compat:embedded` exit 0. Shopify Theme Check inspected 145 files with no offenses.
- `npm.cmd run doctor:agent` exits 0 on the live checkout. Both entry adapters are real symlinks.
- The SessionStart Hook was verified end to end in real Claude Code sessions: a non-interactive Claude Code 2.1.273 run and a VS Code extension session, each in a disposable project with inert adapters, received the Hook stop instruction in model context.
- Full `npm.cmd run lint` and `npm.cmd test` were not run.
- `lint:theme` enforces only protected Liquid runtime-name assign/capture, static tab accessibility, and the SVG `textLength` WebKit guardrail. Broader CSS, JavaScript, HTTP, and cart contracts are not enforced by any command.
- As of this record, none of the P5a, P6, TB1, or V1 changes are committed.

## Batch Status

### P5a — Agent infrastructure cleanup — accepted

Removed the prose-only `agent-router` and `orchestrate-agents` Skills and their references; compressed the work loop and Agent behavior rules in `AGENTS.md` (18,362 bytes at HEAD before P5a); narrowed the two validator Skills' discovery text; added `doctor:agent`; corrected the false `lint:theme` capability claim in `css-architecture.md`; repaired the incomplete `{% liquid %}` capture fixture; aligned the board/context lifecycle. Independently cross-reviewed by Codex and Claude.

### P6 — Adapter documentation and failure surfacing — accepted

Reordered the README symlink procedure; reduced the `AGENTS.md` symlink paragraph to two guardrails naming both adapter classes; normalised the nine shim descriptions; added the `--hook` mode and the SessionStart Hook. `AGENTS.md` is 16,035 bytes after P6. Independently verified, including all doctor modes in separate disposable fixtures and end-to-end Hook delivery.

### V1 — Validation baseline cleanup — accepted

Cleared five pre-existing i18n findings and one Theme Check warning exposed by TB1 validation:

- `article` eyebrow and before/after labels use schema locale defaults whose English values equal the previous literals.
- The newsletter overlay `alignment` setting uses `text_alignment` with the same ID and `left` default.
- `custom.ingredients` moved from a translatable text-setting default into literal preset instance data.
- The unused `is_first` filter argument, parameter doc, and assignment were removed; no other references exist.

Saved configuration is unaffected: `templates/article.json` stores eyebrow `"categories"`; `templates/index.json` and `templates/page.about.json` store `"BEFORE"` / `"AFTER"`; `templates/product.json` stores `metafield_key` `"custom.ingredients"`; `sections/overlay-group.json` stores alignment `"left"`, a valid `text_alignment` value.

### TB1 — First generic Theme Blocks — provisional, retained

Status: **implemented and validated, retained as a provisional implementation, not accepted as a Skeleton contract** (user decision, 2026-09-17).

TB1 was executed from a context entry built on the incorrect independence claim corrected above. It added `blocks/group.liquid`, `blocks/heading.liquid`, `blocks/text.liquid`, `blocks/button.liquid`, the `sections/custom-content.liquid` host that accepts `@theme` and `@app` blocks and renders `content_for 'blocks'`, and schema locale keys under `blocks.*` and `sections.custom-content`. No merchant-owned template or configuration changed. Validation passes.

It remains in the repository but must be reworked after the JS/CSS architecture decisions. Known issues to resolve in that rework:

- `text` defaults to `body-md`, which on mobile computes to `--font-body-size-mobile × scale × 0.875`, 12.5% smaller than global body copy (`--font-body-size-mobile × scale`); desktop is identical. Resolve with the typography decision.
- `heading` renders an empty heading element when its copy is blank.
- `button` renders `<span aria-disabled="true">` without a role when the link is blank; in WAI-ARIA 1.2 `aria-disabled` is not a global attribute, so assistive technology receives nothing.
- `group` uses inline CSS custom properties and a local `{% stylesheet %}`; `heading`, `text`, and `button` use the current typography and button primitives. All of these depend on undecided CSS placement and primitive decisions.

Dependencies for the rework: JS/CSS architecture decisions, including D3 and the utility manifest.

## Planned Work

None of the entries below is authorized for execution yet.

### P3 — Upload-surface defense

- Scope: add `.env` and `.env.*` to `.shopifyignore`; describe the upload surface as unverified.
- Dependencies: none. Only `.shopifyignore` changes.
- Status: planned; ready for a separate micro-batch when the user authorizes it.

### P1+P5b — Always-on entry slimming

Merged by user decision on 2026-09-17 (D16) and ordered before the JS/CSS architecture discussion, so that discussion is not pre-constrained by current-implementation rules in the entry.

- Scope: research, then implement the direction in "Always-On Entry Direction". Label the implementation references as current-implementation protections pending mother-template review, and move implementation-specific rules from `AGENTS.md` to exactly one owning reference each.
- Reference set (D15, resolved 2026-09-17): `docs/references/architecture/javascript-runtime.md`, `docs/references/architecture/motion-architecture.md`, `docs/references/architecture/abstraction-boundaries.md`, `docs/references/style-system/css-architecture.md`, and `docs/references/style-system/image-display-contract.md`.
- Dependencies: a researched always-on rule set proposed on the board and accepted by the user.
- Boundaries: no runtime or theme behavior change; no rule deleted while existing code depends on it; no CSS manifest or JavaScript refactor.
- Status: planned; research first.

### JS/CSS architecture discussion

- Scope: board discussion covering the utility manifest (including D3), CSS placement, typography tier design, button and surface primitives, JavaScript core and runtime conventions, and Alpine scope.
- Dependencies: P1+P5b, so the discussion starts from a slimmed entry.
- Status: planned discussion.

### TB1 rework

- Scope: rework the provisional Theme Blocks against the accepted JS/CSS decisions and resolve the known issues listed under TB1.
- Dependencies: JS/CSS architecture decisions.
- Status: blocked.

### CSS manifest implementation

- Scope: define and measure the fixed Tailwind utility vocabulary and global/local CSS ownership. Prototype in isolation without overwriting the tracked generated stylesheet and report raw, gzip, and brotli sizes with and without Swiper.
- Dependencies: JS/CSS architecture discussion; D3.
- Status: blocked.

### P4 — License

- Scope: decide distribution intent, then align the `ISC` value in `package.json`.
- Dependencies: user decision on distribution intent.
- Status: not started.

## Machine And Client Notes

- On this Windows machine the entry adapters were repaired on 2026-09-17 from an elevated PowerShell with repository-local `core.symlinks = true`. Windows Developer Mode remains off and is optional.
- Codex project MCP availability was not proven on this machine because the repository trust configuration had not loaded the project entries. Cursor also failed live Shopify Dev MCP discovery and did not expose Context7 when checked. Both MCP servers resolve through unpinned `npx ...@latest`. Treat these as dated observations and verify live MCP use in Cursor and Codex before relying on them.
- If a client sandbox hides an ignored path, verify it through another available read-only method before concluding that the path is absent.

## Open Decisions

- The exact always-on rule set for `AGENTS.md` (research under P1+P5b)
- Theme Block schemas, allowed parents, and external-input contracts beyond the provisional TB1 implementation
- Image, video, and product-media ownership
- Global page, Section, and Block layout protocol
- Utility manifest families, scale steps, variants, output size, token boundary (D3), stylesheet name, and Swiper CSS ownership
- Typography tier design and body copy sizing
- JavaScript core, business modules, ESM, import maps, and on-demand loading
- Alpine scope and initialization order
- Accessibility, SEO, performance, compatibility, and final test gates
- License and distribution model
- Remaining cross-client capability and fallback differences, including live MCP availability in Cursor and Codex

## Execution Order

1. The user reviews these records and commits the current state.
2. P3 when authorized.
3. P1+P5b: research the always-on rule set, propose it on the board, obtain acceptance and authorization, then implement.
4. JS/CSS architecture discussion on the board.
5. TB1 rework and CSS manifest implementation after those decisions.
6. P4 separately. Verify live MCP availability in Cursor and Codex at any convenient point.
