# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## BP-1 backport: agent layer and harness

**Status:** direction accepted by the user on 2026-10-13 in the `my-theme-1` session (skeleton backport, by layer, layer 1 first). Recorded by that session's coordinator. **The user authorized this batch on 2026-10-13 by starting its execution prompt in this repository**; execution by the Implementer began on branch `backport/agent-layer`.

**Outcome:** the skeleton receives the agent-layer and harness improvements made in the derived theme `my-theme-1` (sibling directory `../my-theme-1`) that do not depend on that theme's runtime, CSS or business code. A theme started from the skeleton afterwards has the stricter roles, the review skills with named triggers, the Chrome DevTools MCP entry in all three clients, the MCP and ruleset checks in `doctor:agent`, the Lighthouse workflow and the `main` ruleset file.

**Source:** `../my-theme-1` at commit `388f58e` (branch `refactor/skeleton-shell`). Read source files with `git -C ../my-theme-1 show 388f58e:<path>`, not from its working tree. This is layer 1 of five; the later layers (validators, runtime JavaScript, CSS and tokens, the design chain) are separate batches.

**Review tier:** Ask (agent rules and validator wiring).

**Branch:** `backport/agent-layer`, created from `main` (`5191a50`). No commit unless the user asks.

**Dependencies:**

- None for the work.
- For the `Lighthouse` workflow to pass on this repository, the user adds the three Actions secrets and imports the ruleset (the README section this batch adds). Until then a push to `main` or a pull request into `main` shows a failing `Lighthouse` job. Whether the bare skeleton meets the workflow's thresholds (performance 0.6, accessibility 0.9) is unknown and is found out at the first run.

### Implementation surface

**A. Whole files, byte-identical to the source commit:**

1. `.agents/roles/implementer.md`, `.agents/roles/verifier.md`
2. `.agents/skills/review-animations/LICENSE`, `SKILL.md`, `STANDARDS.md`, `UPSTREAM.md`
3. `.agents/skills/frontend-design/LICENSE.txt`, `SKILL.md`, `UPSTREAM.md`
4. `.agents/tools/doctor-agent.mjs`, `.agents/tools/ci-contract.mjs`, `.agents/tools/ci-contract.test.mjs`
5. `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`, `.github/rulesets/main.json`
6. `.mcp.json`, `.cursor/mcp.json`, `.codex/config.toml`

Before copying each file that already exists here, confirm with `git diff --no-index` that the source differs from this repository's version only by additions that belong to this batch (expected: the role additions; the `doctor:agent` step in `ci.yml`; the `chrome-devtools` server in the three MCP files; the MCP and ruleset checks in `doctor-agent.mjs`). If a source file carries anything else, stop and report it instead of copying.

**B. Merged by hand (this repository's text stays, the listed change is applied):**

7. **`AGENTS.md`**, exactly these changes, each taken from the source wording:
   - Authority: "the validator wiring (`package.json` scripts and the workflows under `.github/workflows/`)" replaces the mention of `ci.yml` alone.
   - Batch SOP, the subagent paragraph: the default-model sentence (inherit the main model; propose Sonnet for a mechanical, high-volume task whose plan fixes the surface and acceptance checks; model choice stays out of the adapter files).
   - Sources: the Chrome DevTools MCP bullet.
   - Agent Skills: the list form, the two new skills, "All vendored skills rank below…", and the Triggers block. In the GSAP trigger, do not name `assets/motion-gsap.js` or `assets/scatter-gallery.js` (they do not exist here): write "the work touches a GSAP consumer, or the motion reference classifies new work as complex choreography".
   - **Not taken:** the Tech Stack adapter list (`holdUntilReady`, `releaseHold`) and the `snippets/scripts.liquid` sentence (layer 3); the section-block routing line (this repository keeps `theme-blocks.md`); the `test:layout` row of the Validation table (layer 4).
8. **`package.json`**: the script `test:ci-contract` and its addition to `test:validators`; `js-yaml` and `smol-toml` in `devDependencies` at the source's versions. Not taken: `name`, `description`, `scan:contrast`, `test:layout`, `test:layout-harness`, `shopify:dev`, `playwright-core`.
9. **`package-lock.json`**: produced by `npm.cmd install`, never edited by hand except to restore a `resolved` URL to `https://registry.npmjs.org/…` if the local registry mirror rewrote it.
10. **`README.md`**: the section "New theme repository setup" (placed before "Start a derived theme"), the `doctor:agent` line in Commands, and Chrome DevTools MCP in the "MCP servers" paragraph, each from the source README. Everything else in this README stays.
11. **`.gitignore`**: the `%SystemDrive%/` entry with its comment. Not the `docs/design/` image lines (design chain).
12. **`.shopifyignore`**: `__pycache__/*` in place of `__pycache__/`.
13. This file and `docs/agent/board.md`.

**Not in this batch:** `.agents/tools/layout-check/` and `.agents/tools/contrast-report.mjs` (they depend on the page frame and colour tokens, layer 4); every file under `.agents/skills/check-theme-architecture/` and `.agents/skills/check-i18n/` (layer 2); `docs/references/`; `docs/project.md`; all theme files.

**Forbidden:** `assets/`, `blocks/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`, `tailwind/`, `docs/references/`, any file not listed above, commits, `prettier --write`, `git stash` / `checkout` / `reset` on the working tree (creating the branch is allowed), and any write to `../my-theme-1`.

### Acceptance checks

1. `git status --short` lists only surface files. State the count of changed and new files from the command.
2. Each file of part A is identical to its source: `git -C ../my-theme-1 show 388f58e:<path>` compared with the file here gives no difference. Name the command and list any file that differs.
3. `git diff -- AGENTS.md` contains the four listed changes and nothing else. None of these strings occurs in `AGENTS.md`: `holdUntilReady`, `scripts.liquid`, `scatter-gallery`, `motion-gsap`, `test:layout`. The line routing to `docs/references/architecture/theme-blocks.md` is unchanged.
4. `git diff -- package.json` shows the one new script, the `test:validators` change and the two dev dependencies only. `git diff -- package-lock.json` adds only what those two packages need, every `resolved` URL in the diff starts with `https://registry.npmjs.org/`, and `npm.cmd ci --dry-run` succeeds.
5. `npm.cmd run test:validators` passes. State the test counts before (on `main`, taken before the first edit) and after, from the command output; the difference is the `ci-contract` suite.
6. `npm.cmd run doctor:agent` exits 0, and `node .agents/tools/doctor-agent.mjs --hook` prints nothing and exits 0.
7. `npm.cmd run lint` passes (it includes `lint:doc-paths` and `format:check`).
8. `.agents/tools/ci-contract.mjs` reads this repository's workflows as exactly `Lint`, `Theme Check` and `Lighthouse`, the three contexts `.github/rulesets/main.json` requires.
9. `git diff --check` is clean.
10. Independent review (Ask) reports PASS.

### BP-1: executed

Executed on branch `backport/agent-layer` (from `main`, `5191a50`) on 2026-10-13. Nothing committed. Source: `../my-theme-1` at `388f58e`, read with `git -C ../my-theme-1 show`; that repository was not written to.

**Baseline** (`main`, before the first edit), `npm.cmd run test:validators`: i18n 32, theme-architecture 105, section-stylesheet-carry 3, doc-paths 7; 147 pass, 0 fail.

**Part A.** Before copying, each of the 7 existing files (`implementer.md`, `verifier.md`, `doctor-agent.mjs`, `ci.yml`, `.mcp.json`, `.cursor/mcp.json`, `.codex/config.toml`) was compared with the source by `git diff --no-index`; every difference was an addition the plan expects (role additions, the `doctor:agent` step, the `chrome-devtools` server, the MCP and ruleset checks). All 18 files were then written byte-identical.

**Part B.**

- `AGENTS.md`: the four changes only. The GSAP trigger uses the plan's wording.
- `package.json`: `test:ci-contract`, the `test:validators` addition, `js-yaml` `^4.3.1`, `smol-toml` `^1.9.0`.
- `package-lock.json`: `npm.cmd install` added `smol-toml` 1.9.1 and the two root `devDependencies` entries (`js-yaml` was already a transitive package). The mirror had written `https://registry.npmmirror.com/…` for `smol-toml`; restored to `https://registry.npmjs.org/…` (0 `npmmirror` matches remain).
- `README.md`: "New theme repository setup" before "Start a derived theme", the `doctor:agent` line in Commands, and the Chrome DevTools MCP text in "MCP servers".
- `.gitignore`: `%SystemDrive%/` with its comment. `.shopifyignore`: `__pycache__/*`.

**Acceptance checks (command, result):**

1. `git status --short`: 20 lines: 14 modified (including `docs/agent/context.md`) and 6 untracked entries (2 skill directories, 2 tool files, `.github/rulesets/`, `lighthouse.yml`) holding 11 new files. All are surface files.
2. `git -C ../my-theme-1 show 388f58e:<path>` piped to `cmp` for the 18 part A files: 18 identical, 0 differ.
3. `grep -c` of `holdUntilReady|scripts\.liquid|scatter-gallery|motion-gsap|test:layout` in `AGENTS.md`: 0. The `theme-blocks.md` routing line is unchanged. `git diff --stat -- AGENTS.md`: 20 insertions, 5 deletions, in the four listed places.
4. `git diff -- package.json`: the new script, the `test:validators` change, two dependencies. `git diff -- package-lock.json`: 15 insertions (two root entries, one `smol-toml` package); the only `resolved` URL starts with `https://registry.npmjs.org/`. `npm.cmd ci --dry-run`: exit 0.
5. `npm.cmd run test:validators`: i18n 32, theme-architecture 105, section-stylesheet-carry 3, doc-paths 7, ci-contract 18; 165 pass, 0 fail. Difference from baseline: +18, the `ci-contract` suite.
6. `npm.cmd run doctor:agent`: exit 0, no output. `node .agents/tools/doctor-agent.mjs --hook`: empty stdout, exit 0.
7. `npm.cmd run lint`: exit 0 (including `lint:doc-paths` and `format:check`, "All matched files use Prettier code style").
8. `collectCiContractFailures` from `ci-contract.mjs`: workflow jobs `ci.yml` = `Lint`, `Theme Check`; `lighthouse.yml` = `Lighthouse`; required contexts in `main.json` = `Lint`, `Theme Check`, `Lighthouse`; failures `[]`.
9. `git diff --check`: exit 0.
10. Pending: independent review (Ask).

**Deviations and notes:**

- README "MCP servers": the source's first paragraph replaces the first sentence here; this repository's missing-MCP troubleshooting text and the Codex trust note are kept as a second paragraph. The source's separate "restart the client" paragraph was not taken (it was not on the plan).
- `lighthouse.yml` is byte-identical to the source as the plan requires, so it carries `product_handle: amazing-cotton-bag-collection15` and `collection_handle: collection1`, and thresholds 0.6 / 0.9. Whether those handles exist on the shared CI store, and whether the bare skeleton meets the thresholds, is unverified until the first run.
- Untracked files are not covered by `git diff --check`; `format:check` (in `lint`) did cover them.

## BP-1: coordinator check

Coordinator of the `my-theme-1` session, 2026-10-13, read-only. Consistent with the implementer's record.

- `git status --short`: surface files only, on `backport/agent-layer`.
- The 18 part A files compared one by one with `git -C ../my-theme-1 show 388f58e:<path>` through `cmp`: no difference.
- `git diff -- AGENTS.md`: the four planned changes only; the GSAP trigger names no theme file; `grep -c -E "holdUntilReady|scripts\.liquid|scatter-gallery|motion-gsap|test:layout" AGENTS.md` gives 0.
- `git diff -- package.json package-lock.json .gitignore .shopifyignore`: the planned changes only; the one added `resolved` URL is on `registry.npmjs.org`.
- The README merge was left to the independent review.

## BP-1: independent review

External Verifier session, 2026-10-13, read-only, a session other than the implementer's. The report was given in chat; its evidence is summarised here.

**Verdict: PASS, no defect.**

- **Scope:** 14 modified files and 11 new files, all inside the surface; branch `backport/agent-layer`, HEAD equal to `main` (`5191a50`).
- **Part A:** all 18 files byte-identical to the source commit; the 7 that existed on `main` differ from it only by the expected additions; nothing specific to the derived theme arrived.
- **`AGENTS.md`:** exactly the four planned changes; the five excluded strings do not occur; the `theme-blocks.md` routing line is unchanged; every skill and file the new text names exists; the role texts' references are supported by the updated rules.
- **`doctor:agent`:** the three MCP configs list `chrome-devtools`, `context7` and `shopify-dev-mcp`. Hook mode exits silently before loading either parser, also in a scratch copy without `node_modules`. In a scratch copy the CLI passed, and renaming `Lint` produced exactly one contract failure and exit 1.
- **Contract:** the workflow jobs and the required contexts are exactly `Lint`, `Theme Check`, `Lighthouse`.
- **README:** the setup section and the MCP paragraph match the source; cited paths, commands, job names and secret names exist; the recorded deviation is acceptable and nothing unrelated was lost.
- **Packages:** only the planned script wiring and the two dev dependencies; the lock adds the root entries and `smol-toml` with a `registry.npmjs.org` URL; `npm.cmd ci --dry-run` exit 0.
- **Notices:** both skills carry their licence and `UPSTREAM` files. `THIRD_PARTY_NOTICES.md` needs no entry: the rule covers vendored libraries behind runtime adapters, and these are agent documentation with no storefront payload.
- **Approval:** recorded for the whole batch.
- **Fresh runs:** `npm.cmd run test:validators` 147 passed on `main` (32 + 105 + 3 + 7) and 165 on the branch, the difference being the 18-test `ci-contract` suite; `npm.cmd run doctor:agent` exit 0; `npm.cmd run lint` exit 0; `npm.cmd run lint:doc-paths` passed; `git diff --check` clean.

**Not proven, recorded dependencies and not defects:** the Actions secrets and the imported ruleset on this repository; that the handles `amazing-cotton-bag-collection15` and `collection1` serve this theme on the CI store; the Lighthouse scores of the bare skeleton against 0.6 / 0.9. The first Lighthouse run after the repository setup proves them.

## BP-1: amendment after the review

**Decision (user, 2026-10-13, in the `my-theme-1` session):** the skeleton is a template, so it does not run Lighthouse on itself and imports no ruleset. The files travel with it for the theme repositories made from it. This replaces the plan's dependency ("the user adds the three Actions secrets and imports the ruleset" on this repository) and the three "not proven" items of the review, which no longer apply here.

**Changes (coordinator, 2026-10-13), both inside the plan's surface:**

- `.github/workflows/lighthouse.yml`: the job's `if` gains `github.repository != 'Joey-Fjh/my-skeleton-theme' &&` in front of the existing fork condition, now in parentheses, with a two-line comment. The file is therefore no longer byte-identical to the source: part A item 5 and acceptance check 2 hold for it except these lines (`git -C ../my-theme-1 show 388f58e:.github/workflows/lighthouse.yml | diff - .github/workflows/lighthouse.yml` shows the comment and the condition only).
- `README.md`, "New theme repository setup": one sentence saying the section does not apply to the skeleton repository itself.

**Why the repository name and not a switch variable:** a required check whose job is skipped counts as passed on GitHub, so a theme repository that forgot to turn a switch on would lose the performance gate silently. With the name, a repository made from the skeleton runs the job without any setting.

**Validation:**

| Command | Result |
| --- | --- |
| js-yaml `load` of the workflow, `jobs.lighthouse.if` | one string: the name test, `&&`, the fork condition in parentheses |
| `readJobs` on the workflow | `Lighthouse`, not an expression |
| `npm.cmd run doctor:agent` | exit 0 |
| `npx prettier --check .github/workflows/lighthouse.yml README.md` | formatted |
| `npm.cmd run lint:doc-paths` | passed |
| `git diff --check` | clean |
| `git remote get-url origin` | `https://github.com/Joey-Fjh/my-skeleton-theme.git`, the name the condition tests |

## BP-1: independent review of the amendment

Same Verifier session, 2026-10-13, read-only. **Verdict: PASS, no blocking defect.**

- Against `388f58e` the workflow differs only by the comment and the folded `if`; the other 17 part A files stay byte-identical.
- `if: >-` parses to one expression string, and a job condition needs no `${{ }}`. Local assertions over 18 combinations of repository, event and origin: always false in `Joey-Fjh/my-skeleton-theme`; in any other repository the same result as the old condition, fork pull requests included. `origin` names that repository.
- The job is still named `Lighthouse`; the contract check reports no failure.
- The reasoning for the repository name over a switch variable is sound: a skipped required job reports success.
- The README sentence is accurate; the byte-identity claim is correctly amended for this one file.
- Fresh runs: `npm.cmd run doctor:agent` exit 0; `npm.cmd run test:ci-contract` 18 of 18; `npm.cmd run lint` exit 0; `git diff --check` clean; the same 14 modified files and 6 untracked entries as before.
- **Note, not blocking:** the condition hardcodes the repository identity, so a rename or transfer would turn Lighthouse on here. Recorded on `docs/agent/board.md` (Evidence).
- **Not proven:** an actual run on GitHub.

**Open:** the user's acceptance, then the commit and clearing this file.
