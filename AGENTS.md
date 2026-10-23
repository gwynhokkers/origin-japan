## Agent skills

### Issue tracker

Issues and specs live as Linear issues in the Origin Japan project on the InkytheSquid team. See `docs/agents/issue-tracker.md`.

When you start work on a ticket, move it to `In Progress` in Linear first.

### Git

Never commit on `main` or on a `release/cycle-<n>` branch. Work on one issue branch per ticket, named `<type>/ink-<id>-<short-description>` and cut from the current `release/cycle-<n>`, where `n` is the current Linear cycle. Commit messages and pull request titles are Conventional Commits with a `Fixes: INK-<id>` or `Refs: INK-<id>` footer. Pull requests for issue work target the release branch, not `main`. See `docs/agents/git-conventions.md`.

### Triage labels

Five canonical roles, each label string equal to its name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
