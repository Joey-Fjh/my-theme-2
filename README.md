# my-skeleton-theme

Internal Shopify Skeleton Theme mother template for building maintainable and extensible themes.

This repository is the engineering baseline for future Shopify themes. It aims to stay minimal, platform-complete, modular, extensible, maintainable, and verifiable. Derived themes own business features, page design, and visual uniqueness.

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

This repository tracks two symlink adapters:

- `CLAUDE.md -> AGENTS.md`
- `.claude/skills -> ../.agents/skills`

On Windows, enable Developer Mode or use an account allowed to create symbolic links before cloning. Prefer:

```powershell
git clone -c core.symlinks=true <repo-url>
```

Verify the adapters after cloning:

```powershell
Get-Item CLAUDE.md
Get-Item .claude\skills
git ls-files -s CLAUDE.md .claude/skills
```

The tracked entries should report Git mode `120000`. Do not copy rules or skills into adapter paths.

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

## Repository Boundaries

- Do not edit `config/settings_data.json` or `templates/*.json` without explicit authorization.
- Do not manually edit generated Tailwind output, generated icons, or minified vendor assets.
- `icons/` is a temporary SVG input directory. Create it only when importing icons, run `npm.cmd run build:svg`, then clear the staging input.
- `AGENTS.md` is the canonical rule entry. `docs/agent/context.md` records Skeleton construction-phase state only.

## Documentation

- [AGENTS.md](AGENTS.md): canonical repository rules and validation commands
- [docs/agent/context.md](docs/agent/context.md): short current-state and cross-session handoff
- [docs/references/](docs/references/): on-demand architecture and review references
