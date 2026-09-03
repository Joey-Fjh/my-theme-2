# Project Context

Short cross-session state for agents. Record only user-confirmed direction, current status, and unresolved decisions. Detailed architecture belongs in `docs/references/` after discussion.

Last updated: 2026-09-03.

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
- No theme or Agent-system implementation is currently authorized beyond this Context update.

## Confirmed Workflow

1. Inspect and analyze the repository without changing it.
2. Present evidence, architecture options, tradeoffs, and open questions to the user.
3. The user confirms, changes, or rejects each decision.
4. Only confirmed decisions may be written to documentation or code.
5. After discussion is complete, produce an implementation prompt for approval.
6. Implement only after that prompt is approved.
7. Review and validate the completed implementation.

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
- The confirmed initial generic Theme Block inventory is `group`, `heading`, `text`, `button`, and `image`. Product, cart, search, navigation, media-gallery, and other business blocks are reviewed separately. `spacer`, `divider`, `icon`, `button-group`, and `custom-liquid` are not initial generic blocks merely for convenience.
- `group` owns child composition only; `heading` separates semantic heading level from visual typography; `text` owns non-heading rich text; `button` owns navigation-style calls to action rather than arbitrary JavaScript actions; and `image` owns the reusable image presentation contract. Exact schemas, presets, accepted parents, and parameter lists remain under discussion.
- The intended image end state is one implementation in `blocks/image.liquid`. Existing `snippets/image.liquid` behavior is to be fully migrated and the snippet removed, not retained as a renderer beneath a wrapper block.
- The image Block must serve both merchant-composed and developer-composed use: Theme Editor settings for configurable instances, and explicit external parameters for images that a Section or other Liquid composition supplies without separate image configuration. Developer-controlled technical values such as responsive sizes, loading priority, placeholders, and lifecycle hints must not become merchant-facing settings.
- Complete image migration is conditional on a focused Liquid July '26 preview proof. It must demonstrate that `{% block %}` can invoke the same image Block from required Section and Block contexts, pass image objects and technical parameters, support repeated calls without unwanted Theme Editor state or ID conflicts, survive Theme Editor and section refresh lifecycles, and pass the applicable Theme Check and LiquidDoc rules. Until this proof passes and preview compatibility is explicitly approved, do not delete `snippets/image.liquid` or treat the migration as implemented.
- The Liquid July '26 `{% block %}` and `{% partial %}` tags are useful future-facing capabilities but remain developer-preview features and must not become an undeclared compatibility requirement for the stable mother template.
- During implementation, `{% partial %}` may be trialed in low-risk, page-bound refresh flows where it clearly reduces Section Rendering API and selector-mapping code. Each trial must be documented and verified for ordinary storefront rendering, Theme Editor behavior, accessibility state, request races, Alpine lifecycle, and the custom `Components` lifecycle.
- `ShopifySectionRefresher` remains a transitional compatibility mechanism while required flows still depend on Section Rendering API behavior. Do not remove it wholesale, and do not add a permanent `partial`/`section` mode branch to one shared public method. Collection, search, and blog refreshes are preferred future trial candidates; Cart bundled section rendering and special endpoints remain on their existing path until an equivalent Partial path is proven.
- Remove `ShopifySectionRefresher` only after every retained caller has an approved replacement and its Alpine, custom component, accessibility, error, and history responsibilities have explicit owners.

## Current Phase

Active: full-repository read-only understanding, official requirement mapping, architecture audit, and discussion. The initial generic Theme Block inventory has been selected; per-block contracts and the conditional image Block migration proof are the current checkpoint.

Not started: file deletion, page rebuild, CSS or JavaScript refactor, ESM migration, or Agent-system refactor.

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

- Exact schemas, presets, allowed parent contexts, and external-input contracts for the five confirmed initial Theme Blocks
- Whether the Liquid July '26 `{% block %}` proof is sufficient to make the preview an explicit mother-template dependency and complete the `image` snippet-to-Block migration
- Global page, Section, and Block layout protocol
- Settings, CSS token, and Tailwind source boundaries
- JavaScript core, business modules, ESM, import maps, and on-demand loading
- Alpine scope and initialization order
- Image, video, and product-media contracts
- Accessibility, SEO, performance, compatibility, and testing gates
- Final tooling, Agent, Skill, rule, and validator architecture

## Known Rule Mismatch

`AGENTS.md` still describes a commercial Theme Store candidate and contains preservation constraints that do not fully match the confirmed mother-template direction. Do not change it during the current audit. Before implementation, explain any blocking conflict and obtain approval for the smallest required rule sync.

## Next Step

Define the five initial Theme Block contracts and prepare the focused `{% block %}` image proof and acceptance criteria for user approval. After that, define the global page, Section, and Block layout protocol. Do not modify theme code before the corresponding implementation or proof prompt is approved.
