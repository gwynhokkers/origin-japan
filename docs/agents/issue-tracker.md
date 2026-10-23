# Issue tracker: Linear

Issues and specs for this repo live as Linear issues in the **Origin Japan** project.

- Workspace: [InkytheSquid](https://linear.app/inkythesquid)
- Team: InkytheSquid (`INK`)
- Project: Origin Japan (`P-INK-13`) — https://linear.app/inkythesquid/project/origin-japan-8b70156c34e1

Use the Linear MCP tools (`plugin-linear-linear`). Always scope creates and lists to team `InkytheSquid` and project `Origin Japan`.

## Conventions

- **Create an issue**: `save_issue` with `team: "InkytheSquid"`, `project: "Origin Japan"`, `title`, and `description` (Markdown).
- **Read an issue**: `get_issue` with the identifier (for example `INK-123`). Pass `includeRelations: true` when blocking matters. Read discussion with `list_comments`.
- **List issues**: `list_issues` with `team: "InkytheSquid"` and `project: "Origin Japan"`. Filter with `label`, `state`, and `assignee` as needed. Request `title`, `description`, `labels`, `status`, `url`.
- **Comment**: `save_comment` on the issue identifier.
- **Apply / remove labels**: `save_issue` with `addLabels` or `removeLabels`. If a label does not exist, create it with `create_issue_label` on team `InkytheSquid` before applying it. `labels` replaces the full set; prefer `addLabels` / `removeLabels`.
- **Start work**: before writing any code or docs for a ticket, `save_issue` with `state: "In Progress"`. Do this for every ticket you pick up, including each child ticket in a batch, so the board shows what has been worked on. Leave tickets that are already `In Progress`, `Blocked`, or `Done` as they are.
- **Close**: `save_issue` with `state: "Done"` when the work is finished, or `state: "Canceled"` for `wontfix`. Put the reason in a comment first.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a Linear issue in the Origin Japan project.

## When a skill says "fetch the relevant ticket"

`get_issue` for that identifier, plus `list_comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: one issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. Create it in this project with that label.
- **Child ticket**: `save_issue` with `parentId` set to the map identifier. Labels: `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). Once claimed, assign it to the driving dev.
- **Blocking**: Linear's native relations. Set `blockedBy` (and `blocks` on the blocker) to issue identifiers. A ticket is unblocked when every blocker is `Done` or `Canceled`. Read relations with `get_issue` `includeRelations: true`.
- **Frontier query**: `list_issues` with `parentId` of the map and an open state. Drop any issue that has an assignee or an open blocker. First in map order wins.
- **Claim**: `save_issue` with `assignee: "me"` and `state: "In Progress"`, the session's first write.
- **Resolve**: `save_comment` with the answer, set `state: "Done"`, then append a context pointer to the map's Decisions-so-far.
