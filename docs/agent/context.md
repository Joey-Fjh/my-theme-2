# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-14.

## SK-2: three small framework items left by the migration

**Status:** accepted and authorized by the user on 2026-10-14, review tier set by the user to **Show** (the coordinator executes here and shows the diff and validator output; the user's look is the review). Executed; the user looked and accepted on 2026-10-14.

**Outcome:** the three items the completeness check found, each needed by this repository itself.

**Implementation surface and result:**

1. `.agents/skills/check-i18n/scripts/lint-i18n.js`: the schema extractor accepts `{%- schema -%}` and `{%- endschema -%}`. Before, a section written with whitespace-trimmed schema tags was skipped silently. `lint-i18n.test.js`: one test for it. Both from the source at `388f58e`.
2. `docs/references/code-review/launch-gate.md`: one bullet on when the `Lighthouse` workflow runs and what its thresholds mean, with the fact that it is skipped in this repository.
3. `.gitignore`: image and video files under `docs/design/` stay local, for the design input of `docs/references/style-system/design-to-delivery.md`.

**Validation (command, result):** `npm.cmd run test:i18n` 33 pass, 0 fail (32 before); `npm.cmd run lint` exit 0; `npm.cmd run doctor:agent` exit 0; `git diff --check` clean; `git status --short` lists the four files above and `docs/agent/board.md`.

**Accepted by the user on 2026-10-14.**
