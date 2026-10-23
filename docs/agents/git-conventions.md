# Git conventions

Every commit message and branch name follows
[Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/).
Check each one against this page before you run `git commit` or `git checkout -b`.

The hooks in `.githooks/` enforce the parts a script can check. `bun install`
turns them on through the `prepare` script. To turn them on by hand, run
`git config core.hooksPath .githooks`.

## Types

Use one type from this list for both commits and branches.

| Type       | Use for                                                       |
| ---------- | ------------------------------------------------------------- |
| `feat`     | A new buyer-facing or admin-facing capability                 |
| `fix`      | A bug fix                                                     |
| `perf`     | A change that improves performance without changing behaviour |
| `refactor` | Restructured code with no behaviour change                    |
| `style`    | Formatting or whitespace only (CSS work is `feat` or `fix`)   |
| `test`     | Adding or changing tests and fixtures only                    |
| `docs`     | Documentation only, including `AGENTS.md`, `CONTEXT.md` and `docs/` |
| `build`    | Dependencies, `package.json`, `bun.lock`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.jsonc` build settings |
| `ci`       | CI and deploy pipeline config                                 |
| `chore`    | Maintenance that fits nowhere above, including git hooks      |
| `revert`   | Reverting an earlier commit                                   |

## Commit messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **Scope** is optional, lowercase, and names the area touched: `public`,
  `admin`, `emdash`, `seed`, `import`, `photos`, `leads`, `storybook`, `adr`,
  `cloudflare`, `deps`, `git`. Omit it when the change spans several areas.
- **Subject** is imperative mood, lowercase first letter, no trailing full stop,
  72 characters or fewer for the whole header line. Write "add", "fix",
  "remove", as if completing "This commit will …".
- **Body** is optional. Explain _why_ the change was made and what it affects,
  wrapped at 72 characters, separated from the header by a blank line.
- **Footer** links the Linear issue when one exists:
  - `Refs: INK-123` for related work.
  - `Fixes: INK-123` when the commit completes the issue.
- **Breaking changes** add `!` after the type or scope and a
  `BREAKING CHANGE: <description>` footer. In this repo that includes changes
  to EmDash collections or block types in `seed/seed.json`, Cloudflare bindings
  or environment variables in `wrangler.jsonc`, and public URLs covered by
  ADR 0003.

Keep each commit to one logical change. When a working tree holds unrelated
changes, stage and commit them separately, each with its own type.

### Examples

```
feat(public): label the stock section showroom

The nav, mobile menu, stock page title, vehicle breadcrumb and home
call to action say Showroom. /stock and listing URLs are unchanged.

Fixes: INK-300
Refs: INK-262
```

```
fix(leads): confirm a vehicle enquiry when the email fails after saving

Fixes: INK-261
```

```
build(deps): add bun.lock alongside package-lock.json
```

```
feat(emdash)!: rename the import_photos collection to gallery_photos

BREAKING CHANGE: existing EmDash databases need the collection renamed
before deploy, or personal import photos disappear.
```

## Branch names

```
<type>/<issue>-<short-description>
<type>/<short-description>
```

- Use the same type list as commits.
- Include the Linear identifier in lowercase when the work has an issue
  (`ink-123`). Linear links the branch to the issue automatically.
- Do not use Linear's "copy git branch name" (`gwyn/ink-123-...`). Older
  branches use that form. New branches use the type prefix.
- Write the description in lowercase kebab-case, three to five words,
  using only `a-z`, `0-9` and `-`.
- Branch from the up-to-date release branch for the current cycle
  (for example `release/cycle-1`), not from `main`, and keep one issue per
  branch. See [Release branches per cycle](#release-branches-per-cycle).

### Examples

```
feat/ink-300-showroom-label
fix/ink-261-enquiry-email-failure
docs/git-conventions
build/add-bun-lockfile
```

`main` and `release/cycle-<n>` branches are exempt from the naming pattern.

## Release branches per cycle

Work is grouped into one-week Linear cycles on the InkytheSquid team, starting
Mondays, and each cycle has its own release branch. The cycle number is the
Linear cycle number. Never commit or merge issue work straight into `main`.

| Branch | Purpose |
| ------ | ------- |
| `main` | Signed-off, released cycles only. No direct commits or pushes. |
| `release/cycle-<n>` | Integration branch for cycle `n`, cut from `main` when the cycle starts. |
| `<type>/ink-<id>-<desc>` | One Linear issue, branched from the current `release/cycle-<n>`. |

Flow:

1. **Cycle start:** create `release/cycle-<n>` from an up-to-date `main` and
   push it.
2. **Per issue:** branch from `release/cycle-<n>`, do the work, open a pull
   request **into `release/cycle-<n>`** (not `main`), and squash merge it.
3. **Unfinished issues** at cycle end: keep the issue branch and retarget its
   pull request to the next cycle's release branch, matching where the issue
   moves in Linear.
4. **Cycle end:** open one pull request from `release/cycle-<n>` into `main`
   titled `chore(release): cycle <n>`, merge with a merge commit (not squash),
   then tag `main` as `v0.<n>.0-cycle-<n>`. Cut the next release branch from
   the updated `main`.
5. **Fixes to a merged cycle:** branch `fix/ink-<id>-...` from the current
   release branch; the fix ships with that cycle.

## Pull requests

Target the current `release/cycle-<n>` branch for issue work, and `main` only
for the end-of-cycle release merge. Title the pull request with a valid
Conventional Commit header, since it becomes the commit message on squash
merge. Put `Fixes: INK-123` or `Refs: INK-123` in the description.

## Agents

An agent never commits on `main` or on a `release/cycle-<n>` branch. Before the
first commit for an issue, it creates the issue branch from the current release
branch. If it finds itself on `main` with uncommitted work, it moves that work
to a new issue branch before committing.
