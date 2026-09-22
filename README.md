# my-skeleton-theme

Internal Shopify Skeleton Theme mother template for building maintainable and extensible themes.

This repository is the engineering baseline for future Shopify themes. Its storefront inventory follows Shopify's official `skeleton-theme`, with only explicitly accepted project additions such as the lifecycle/runtime and Agent configuration. It aims to stay minimal, modular, extensible, maintainable, and verifiable; derived themes own business features, page design, visual uniqueness, and Theme Store submission features.

Project rules and task routing live in [AGENTS.md](AGENTS.md). Short cross-session state lives in [docs/agent/context.md](docs/agent/context.md).

## Requirements

- Node.js 22+
- npm
- Shopify CLI
- Access to a Shopify development store

## Setup

First install:

```powershell
npm.cmd ci
```

First connect to a store:

```powershell
npm.cmd run shopify:dev -- --store <store>.myshopify.com
```

After the local CLI store link exists, start development with:

```powershell
npm.cmd run dev
```

This repository tracks two classes of client adapters. Neither class may be replaced with copied content.

**Entry adapters (must remain symlinks):**

- `CLAUDE.md -> AGENTS.md`
- `.claude/skills -> ../.agents/skills`

**Role adapters (must remain separate real files):**

- `.claude/agents/{implementer,verifier}.md`
- `.cursor/agents/{implementer,verifier}.md`
- `.codex/agents/{implementer,verifier}.toml`

These six files are per-client permission shims, not duplicates of `.agents/roles/`. Do not symlink them to the canonical roles or merge them across clients.

### Clone on a symlink-capable environment

On a machine that can create symbolic links, clone with symlink checkout enabled:

```powershell
git clone -c core.symlinks=true <repo-url>
```

No system setting change is required.

### Windows repair when adapters materialised as plain files

If `CLAUDE.md` or `.claude/skills` appear as plain files containing only their target paths, repair them from an elevated PowerShell. This changes **no** system setting: an elevated process already holds `SeCreateSymbolicLinkPrivilege`.

```powershell
git config core.symlinks true
Remove-Item CLAUDE.md, .claude\skills -Force
git checkout -- CLAUDE.md .claude/skills
```

### Optional: Windows Developer Mode

Enabling Developer Mode is optional convenience that can avoid needing an elevated shell later. It is **not** a prerequisite for repair or for cloning on a symlink-capable environment.

### Verify the entry adapters

```powershell
npm.cmd run doctor:agent
Get-Item CLAUDE.md, .claude\skills | Select-Object Name, LinkType, Target
```

`doctor:agent` should exit 0 when both entry adapters are real symlinks.

### Automatic warning in Claude Code

`.claude/settings.json` registers a SessionStart hook that runs `doctor-agent.mjs --hook` when an inert entry adapter is detected. Project Hooks run only after the workspace trust dialog is accepted, so the hook is the strongest repository-level warning for Claude Code rather than a guarantee on a fresh clone before trust. README remains the layer that works with no tooling and no trust; the `AGENTS.md` guardrail reaches Cursor and Codex always, and Claude Code whenever `CLAUDE.md` is intact.

## Commands

```powershell
npm.cmd run dev                 # Shopify theme dev and Tailwind watch
npm.cmd run shopify:dev         # Shopify theme dev only
npm.cmd run build:tw            # Rebuild generated Tailwind CSS
npm.cmd run watch:tw            # Watch Tailwind sources
npm.cmd run build:svg           # Regenerate assets/icon-*.svg from icons/
npm.cmd run lint                # Repository lint and format checks
npm.cmd run test:validators     # Project validator fixture tests
npm.cmd test                    # Validators, Liquid syntax guard, Theme Check
npm.cmd run test:theme-check    # Shopify Theme Check only
```

Use `npm.cmd` for project scripts in this Windows workspace. Default to the smallest relevant validation command while developing; run full `npm.cmd run lint` and `npm.cmd test` before PR, version/release, or Theme Store submission, or when explicitly requested.

## Start a derived theme

A derived theme starts from this repository the same way a theme starts from Shopify's official Skeleton, and is then edited directly. It does not pull later changes from this repository. The repository is private, so both commands need GitHub access to it.

```powershell
shopify theme init <theme-name> --clone-url https://github.com/Joey-Fjh/my-skeleton-theme
# or
git clone https://github.com/Joey-Fjh/my-skeleton-theme <theme-name>
```

After starting, the derived theme makes these edits:

- `theme_info` in `config/settings_schema.json` identifies this private mother template, and its links resolve only for repository collaborators. Replace the name, author, version, documentation URL, and support destination with the derived theme's own real values that merchants can reach.
- Rewrite the Project Context and Project Identity sections of `AGENTS.md` for the derived theme's own scope; the mother-template inventory rules do not bind it.
- Empty `docs/agent/board.md` and `docs/agent/context.md`.
- Resetting `config/settings_data.json` or `templates/*.json` needs its own authorization in the derived theme.

## Repository Boundaries

- Do not edit `config/settings_data.json` or `templates/*.json` without explicit authorization.
- Do not manually edit generated Tailwind output, generated icons, or minified vendor assets.
- `icons/` is a temporary SVG input directory. Create it only when importing icons, run `npm.cmd run build:svg`, then clear the staging input.
- `AGENTS.md` is the canonical rule entry. `docs/agent/context.md` records Skeleton construction-phase state only.

## Documentation

- [AGENTS.md](AGENTS.md): canonical repository rules and validation commands
- [docs/agent/context.md](docs/agent/context.md): short current-state and cross-session handoff
- [docs/references/](docs/references/): on-demand architecture and review references

## License

This repository is derived from Shopify's Skeleton Theme and carries Shopify's license terms, including the restriction to developing themes for Shopify. See [LICENSE.md](LICENSE.md). Vendored third-party files keep their own licenses.
