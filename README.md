# ne1cc/.github

Account-wide defaults and the shared kit for the issue-driven agent workflow:

```
Opus plan (epic) → flash-ready sub-issues → executor PR per issue → template check → review → merge
```

| Path | What |
|---|---|
| `ISSUE_TEMPLATE/agent-task.md` | Self-contained spec for an executor model |
| `ISSUE_TEMPLATE/epic.md` | The plan; sub-issues hang off it |
| `pull_request_template.md` | The PR body is the documentation of each fix |
| `.github/workflows/pr-template-check.yml` | Reusable check: every section filled, `Closes #N` present (`no-issue` label exempts) |
| `scripts/check-pr-body.mjs` | The check itself; `node --test` runs its tests |
| `agent-kit/` | Copied into a repo by `terminal-configs/bin/init-agent-kit`: `AGENTS.md` skeleton and the check's caller workflow |

GitHub only shows these defaults in the web UI. Local agents (T3, workmux) read the repo's own
`.github/`, so run `init-agent-kit` in each repo that uses the workflow.
