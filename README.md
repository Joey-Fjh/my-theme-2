# my-skeleton-theme

Internal Shopify Skeleton Theme mother template for building maintainable and extensible themes.

Identity, inventory boundary, and accepted scope: [docs/project.md](docs/project.md). Rules, task routing, and validation commands: [AGENTS.md](AGENTS.md).

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

### MCP servers

Agents use Shopify Dev MCP and Context7. If an expected MCP is missing, check in this order: client configuration, project trust, client restart, Node/npm, and network. Codex loads project-level `.codex/config.toml` only for trusted projects; `trust_level` is machine-local and cannot be set by repository files.

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
- Rewrite `docs/project.md` for the derived theme's own identity and scope; the mother-template inventory rules do not bind it. `AGENTS.md` holds shared rules and stays as is.
- Empty `docs/agent/board.md` and `docs/agent/context.md`.
- Resetting `config/settings_data.json`, `templates/*.json`, or `sections/*-group.json` needs its own authorization in the derived theme.

Then deploy through Git:

1. Push the derived theme to its own GitHub repository.
2. In the Shopify admin, connect a branch of that repository through the [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github). Shopify updates the theme whenever the branch changes and commits theme editor and code editor saves back to the branch as "Update from Shopify" commits; this cannot be disabled, so pull before pushing.
3. The integration reads only the default theme folder structure and ignores folders outside it, such as `docs/`, `tailwind/`, and `.agents/`. It runs no build, so rebuild and commit `assets/tailwind.output.css` (`npm.cmd run build:tw`) before pushing Tailwind source changes.

## Repository Boundaries

Merchant-owned configuration, generated and vendor files, and the `icons/` staging directory follow [AGENTS.md](AGENTS.md) (Core Rules and Gotchas).

## Documentation

- [AGENTS.md](AGENTS.md): canonical repository rules and validation commands
- [docs/project.md](docs/project.md): this repository's identity, inventory boundary, and accepted scope
- [docs/agent/board.md](docs/agent/board.md): open decisions and deferred ideas
- [docs/agent/context.md](docs/agent/context.md): the plan under execution and its status; empty when no plan runs
- [docs/references/](docs/references/): on-demand architecture and review references

## License

This repository is derived from Shopify's Skeleton Theme and carries Shopify's license terms, including the restriction to developing themes for Shopify. See [LICENSE.md](LICENSE.md). Vendored third-party files keep their own licenses.
