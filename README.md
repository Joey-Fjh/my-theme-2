# AXIS / LAYR Shopify theme

Official Shopify theme for the AXIS / LAYR eyewear storefront, derived from the internal Skeleton-based theme.

Project identity and scope are recorded in [docs/project.md](docs/project.md). The [Shopify design draft](DESIGN.md) and the [homepage frame and global settings](docs/agent/board.md#homepage-frame-and-global-settings) are ready for review. Repository rules and validation commands are in [AGENTS.md](AGENTS.md).

## Requirements

- Node.js 22.12+
- npm
- Shopify CLI 4.8.4+
- Access to a Shopify development store

Root `AGENTS.md` and `DESIGN.md` are supported theme context files. Shopify CLI 4.8.4+
includes them in theme pull, push and package operations; the Shopify GitHub integration
also syncs both files in both directions. Internal tooling and supporting documentation
remain excluded by `.shopifyignore`. See [Shopify's theme context file support](https://shopify.dev/docs/storefronts/themes/agentic-workflows).

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
- `.codex/agents/{implementer,verifier}.toml`

These four files are per-client permission shims, not duplicates of `.agents/roles/`. Do not symlink them to the canonical roles or merge them across clients.

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

### Hooks

`.claude/settings.json` registers a SessionStart hook that runs `doctor-agent.mjs --hook` when an inert entry adapter is detected. Project hooks run only after the workspace trust dialog is accepted, so the hook is the strongest repository-level warning for Claude Code rather than a guarantee on a fresh clone before trust. README remains the layer that works with no tooling and no trust; the `AGENTS.md` guardrail reaches Codex always, and Claude Code whenever `CLAUDE.md` is intact.

Each client keeps its hook config and a thin adapter in its own directory: `.claude/settings.json` with `.claude/claude-hook.mjs`, and `.codex/config.toml` with `.codex/codex-hook.mjs`. The decisions live in `.agents/tools/harness/core.mjs`.

- **Claude Code** keeps asks and fails open: a broken hook never blocks the client.
- **Codex** turns every ask into a deny, and its guards fail closed.
- **Codex** runs a changed hook entry only after you trust it again (`/hooks`, then `t`), and must be started at the repository root.

### MCP servers

Agents use Shopify Dev MCP and Context7 for documentation, and Chrome DevTools MCP (`chrome-devtools`) to drive a browser against `shopify theme dev`: console messages, network requests, script evaluation, and performance traces. It needs a local Chrome (stable channel) and starts it with `--isolated`, so every session begins with a clean profile and an empty cache. Each client keeps its own config: `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex); `npm.cmd run doctor:agent` fails when their server lists differ.

If an expected MCP is missing, check in this order: client configuration, project trust, client restart, Node/npm, and network. Codex loads project-level `.codex/config.toml` only for trusted projects; `trust_level` is machine-local and cannot be set by repository files.

### Preapproved validators

The read-only validators listed under `preapproved` in `.agents/tools/harness/routes.json` run without a permission prompt. None writes to the repository; `test:harness` and `test:merchant` create temporary Git repositories in the system temp directory and delete them. Builds, formatters, `shopify` commands and `test:layout` always prompt. A preapproval must match the exact command: several of these scripts write files when given an extra argument (for example `lint:theme -- --shrink-migration-baseline` rewrites a tracked baseline). `npm.cmd run test:harness` fails when the Claude Code list differs from `routes.json`, when a listed script (or a script it runs) builds, rewrites or calls `shopify`, or when a prefix-matching allowlist is committed for Codex.

- **Claude Code:** `permissions.allow` in `.claude/settings.json`, one exact `npm.cmd run <script>` rule per script for each of the Bash and PowerShell tools ([permissions](https://code.claude.com/docs/en/permissions)).
- **Codex:** no committed list. Its `.codex/rules/` `prefix_rule` ([rules](https://learn.chatgpt.com/docs/agent-configuration/rules)) matches by prefix, so it would also allow the writing arguments. The project rules still apply through the hooks, and the verifier stays read-only through its agent file; the commands only prompt (in Codex's read-only sandbox, only the two tests, which write to the system temp directory).

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
npm.cmd run doctor:agent        # Verify CLAUDE.md / .claude/skills symlinks, matching MCP lists, ruleset checks against job names
npm.cmd run test:layout-harness # Layout-check fixture suite (Chrome required; no dev server)
npm.cmd run test:layout         # Storefront layout scan (Chrome + shopify:dev). Optional LAYOUT_INJECT_STYLE for local regression CSS probes.
```

Use `npm.cmd` for project scripts in this Windows workspace. Default to the smallest relevant validation command while developing; run full `npm.cmd run lint` and `npm.cmd test` before PR, version/release, or Theme Store submission, or when explicitly requested.

## GitHub CI setup

Lighthouse audits a Shopify development store with a published product and collection. Select the test store and catalog fixtures for this repository.

1. **Protect `main`.** In the repository on GitHub: Settings, Rules, Rulesets, New ruleset, Import a ruleset, and choose `.github/rulesets/main.json`. It requires a pull request and the `Lint`, `Theme Check` and `Lighthouse` checks (up to date), and blocks force pushes and deletion; repository admins may bypass it for pull requests only.
2. **Configure the Actions settings.** Set `SHOP_STORE`, `SHOP_ACCESS_TOKEN` and, for a password-protected storefront, `SHOP_PASSWORD` as repository secrets. Pin published sample handles with repository variables `LIGHTHOUSE_PRODUCT_HANDLE` and `LIGHTHOUSE_COLLECTION_HANDLE`. When these variables are empty, the action looks for the first published product and the first published manual collection. [Shopify Lighthouse CI action](https://github.com/Shopify/lighthouse-ci-action/blob/v1/entrypoint.sh#L197-L213)
3. **Run the `Lighthouse` workflow manually** from GitHub Actions once the workflow is on `main`. Confirm the home, product and collection URLs are audited.

`npm.cmd run doctor:agent` fails when a check the ruleset file requires is not the name of a workflow job, because such a merge would wait forever. It reads files only: it does not see the live ruleset or the secrets, so change the file and the live ruleset together.

## Theme delivery

Review the [design draft](DESIGN.md) before mapping values, preparing a preset or implementing theme sections. See [Design to delivery](docs/references/style-system/design-to-delivery.md).

The Shopify GitHub integration can connect a branch of `Joey-Fjh/my-theme-2` to a theme. When connected, Shopify syncs branch changes and sends theme editor and code editor saves back as "Update from Shopify" commits. Pull before pushing. Include a current `assets/tailwind.output.css` in commits that change the Tailwind sources or content inputs. [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github)

## Repository Boundaries

Merchant-owned configuration, generated and vendor files, and the `icons/` staging directory follow [AGENTS.md](AGENTS.md) (Core Rules and Gotchas).

## Documentation

- [AGENTS.md](AGENTS.md): canonical repository rules and validation commands
- [docs/project.md](docs/project.md): this repository's identity, inventory boundary, and accepted scope
- [docs/agent/board.md](docs/agent/board.md): open decisions and deferred ideas
- [docs/agent/backlog.md](docs/agent/backlog.md): accepted work no batch has scheduled yet
- [docs/agent/context.md](docs/agent/context.md): the plan under execution and its status; empty when no plan runs
- [docs/references/](docs/references/): on-demand architecture and review references

## License

This repository is derived from Shopify's Skeleton Theme and carries Shopify's license terms, including the restriction to developing themes for Shopify. See [LICENSE.md](LICENSE.md). Vendored third-party files keep their own licenses.
