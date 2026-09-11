---
name: orchestrate-agents
description: Coordinate bounded multi-agent work only when agent-router determines that isolated context, independent verification, or parallel execution materially improves the result.
---

# Orchestrate Agents

Use this capability-aware SOP only after `agent-router` selects delegation.

## Workflow

1. Confirm that native delegation tools are available and that the user-authorized delivery mode permits delegation.
2. If delegation is unavailable, continue sequentially or provide an explicit prompt-only handoff; do not pretend independent execution occurred.
3. Keep the primary agent responsible for task division, decisions, user communication, and final acceptance.
4. Give each delegated agent a bounded task containing the objective, scope and authority, necessary context, acceptance criteria, and stop conditions.
5. Parallelize only independent work. Keep dependent work sequential and allow only one writer in a shared worktree.
6. Require a concise result containing status and conclusion, evidence, changed files, validation, and unresolved risks or blockers.
7. Check delegated claims against repository evidence before accepting them.

## Roles

- `scout`: read-only discovery and evidence.
- `implementer`: the sole writer for one approved change scope.
- `verifier`: independent read-only review and validation.

Read the matching `.agents/roles/<role>.md` before assigning a named role.

## Guardrails

- Pass only the context needed for the delegated objective; do not fork full conversation history by default.
- Do not return raw logs when a concise evidence summary is enough.
- Do not let delegated agents expand scope, approve their own work, change merchant-owned content without authorization, or create more agents.
- Do not use multiple agents merely to imitate parallelism.
- Do not hardcode vendor model names or assume every client exposes delegation.

## Fallback

If native delegation or required isolation is missing, use the primary agent sequentially. When the user requested external execution instead, return a self-contained task prompt with scope, acceptance criteria, validation, and stop conditions.
