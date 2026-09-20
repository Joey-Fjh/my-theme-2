# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-20.

## GSAP official Skills tooling

Accepted and authorized by the user on 2026-09-20; promoted to the active plan now that MOTION-1 is accepted and cleared. The accepted boundary and acceptance checks were recorded on the board and are reproduced here as the execution source.

### Scope

Vendor the minimum project-local set of GreenSock's official documentation Skills under the canonical `.agents/skills/` source: `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-performance`. Upstream is `greensock/gsap-skills`.

This is agent tooling, not storefront runtime. Installing Skills adds no payload and does not authorize vendoring or loading the GSAP runtime.

### Boundary

- No GSAP or ScrollTrigger runtime asset, import-map entry, npm dependency, Liquid tag, or always-loaded payload.
- Do not add `gsap-react`, `gsap-frameworks`, `gsap-plugins`, or `gsap-utils` until an accepted consumer requires them. React stays outside this architecture.
- One source of truth: `.agents/skills/`. Claude reads it through the existing `.claude/skills` symlink, Cursor discovers it directly, Codex uses the same project source. No duplicate per-client or machine-global copies.
- Preserve upstream attribution, license, and a pinned source revision so updates can be audited.
- Project motion policy has precedence over generic library guidance. Ordinary reveal stays on the native `data-motion-*` plus Intersection Observer path; GSAP Skills apply only after `motion-architecture.md` classifies work as explicit complex choreography.
- No merchant-owned configuration changes.

### Implementation surface

`.agents/skills/`, `AGENTS.md` (skill inventory and routing only), and the record layer.

### Acceptance criteria

A. The four skill directories exist, are readable, and each records its upstream revision and license.
B. `.agents/skills/` ownership and the `.claude/skills` symlink topology are intact; no `.cursor/skills`, no per-client duplicates, no machine-global install.
C. `AGENTS.md` describes them as documentation Skills, not as executable validator wrappers, and its routing keeps one unambiguous boundary between native ordinary reveal and complex GSAP choreography.
D. No GSAP runtime asset, import-map entry, npm dependency, or Liquid tag is added.
E. Link and syntax inspection passes for every changed agent file.
F. `git diff --name-only` contains no `config/settings_data.json` and no `templates/*.json`.
G. Independent review by someone other than the implementer, plus user acceptance.

### Status

Authorized, not started.
