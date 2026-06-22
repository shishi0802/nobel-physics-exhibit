# Codex Project Rules

## Mandatory Git Version Control

All future Codex changes in this project must use git version management.

- Before editing any project file, run `git status --short` and understand the current worktree state.
- If the requested work starts from an accepted state, create or confirm a baseline commit before making new edits.
- Keep every Codex change trackable in git. Do not make untracked manual edits and leave them undocumented.
- After completing and verifying a change, commit the change with a clear message unless the user explicitly asks not to commit.
- Never use destructive git commands such as `git reset --hard`, `git checkout --`, or force cleanup commands unless the user explicitly requests that exact operation.
- Do not revert user changes. If the worktree contains unrelated changes, preserve them and work around them.

## Current Design Note

The current page transition effect is intentionally preserved. Do not roll it back or redesign it unless the user explicitly asks.
