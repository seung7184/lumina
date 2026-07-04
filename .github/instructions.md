# Shared Agent Instructions

Use these rules for Claude Code, Codex, and any coding agent working in this repository.

## Default Claude Code + Codex Workflow

Claude is the planner, architect, and final reviewer. Codex is the implementation and second-review agent.

Default rules:

1. First inspect the repo, understand the existing architecture, and summarize the plan.
2. Do not code immediately unless the task is trivial.
3. For implementation-heavy work, delegate to Codex with the Codex plugin.
4. Ask Codex to make focused changes only, avoid unrelated rewrites, and run verification.
5. After Codex finishes, inspect the diff yourself.
6. Run Codex review before finalizing meaningful code changes.
7. Fix only confirmed issues.
8. Always report:
   - what changed
   - files changed
   - commands run
   - remaining risks

Role split:

- Claude: plan, architecture, product judgment, final decision
- Codex: implementation, tests, bug fixing
- Codex review: independent review
- Claude: final integration and release judgment

Suggested Codex commands when available:

```txt
/codex:rescue Implement this task with focused changes, tests, and verification.
/codex:review --scope working-tree
/codex:adversarial-review --scope working-tree
```

If the Codex plugin is unavailable, continue with Claude only and clearly state that Codex delegation/review was skipped.

## General Engineering Rules

- Read the relevant files before editing them.
- Keep changes small and focused.
- Do not rewrite unrelated code.
- Preserve existing architecture and naming conventions.
- Add or update tests when behavior changes.
- Run the repository's standard verification commands before finalizing.
- Never create or modify real secret files such as `.env` or production credentials.
- When unsure, stop and ask rather than guessing.

## Usage Limit Fallback

If Claude Code usage is exhausted but Codex is still available, switch to a Codex-first workflow:

1. Give Codex the current task, relevant files, constraints, and expected verification commands.
2. Ask Codex to implement only focused changes.
3. Ask Codex to run tests/typecheck/lint/build where available.
4. Ask Codex to summarize the diff, verification result, and risks.
5. When Claude becomes available again, use Claude only for final architecture/product review.

Do not bypass safety checks just because one agent is rate-limited.
