# Feature Specification: Spec Editor MVP

**Feature Branch**: `001-spec-editor-mvp`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Build a visual application for non-technical users to participate, add, view and make changes to the specifications of a certain git repo, including versioning. Task tracking, test and results review, full validation of all specs and deployment status are added for future development."

## Clarifications

### Session 2026-02-26

- Q: How does a user get assigned the viewer or editor role? → A: First-connector-gets-editor: the first user to connect a specific repo becomes its editor; all subsequent users who connect the same repo default to viewer.
- Q: Where and how is a Personal Access Token (PAT) stored between sessions? → A: Encrypted JWT session cookie only — PAT is stored inside the Auth.js encrypted session cookie; never in localStorage or a database; user must re-enter after session expiry.
- Q: Can a product owner manually change a spec's status in the visual editor? → A: Yes — manual via a status dropdown (draft/active/implemented/archived) in the spec editor form.
- Q: What should happen when the GitHub API rate limit is hit? → A: Show a timed, plain-language message derived from the `X-RateLimit-Reset` response header (e.g., "GitHub is temporarily unavailable — ready again in 4 minutes").
- Q: When a connected repo has no `specs/` or `.specify/` directory, what does "offer to initialize" create? → A: No files are created; the app shows an inline help panel explaining the expected directory structure and directing the user to set it up manually or via SpecKit tooling.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Product Owner Logs In and Connects a Git Repo (Priority: P1)

A product owner visits the Spec Editor web app for the first time. They sign in using
their GitHub account (OAuth), are greeted by a guided onboarding screen, and connect
their first Git repository by entering a Personal Access Token (PAT). The app validates
access, detects the spec directory layout (`.specify/` and/or `specs/`), and shows the
repo's spec overview.

**Why this priority**: This is the absolute prerequisite for every other interaction.
Without authentication and a connected repo, no specs can be viewed or edited.

**Independent Test**: Can be fully tested by opening the app in a browser, clicking
"Sign in with GitHub", completing OAuth, entering a repo URL, and confirming the repo
details screen loads with branch information and detected spec directories.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they visit the app root, **Then**
   they are shown a sign-in page with a "Sign in with GitHub" button.
2. **Given** the user is authenticated but has no connected repos, **When** they land
   on the dashboard, **Then** they see an empty state with a prominent "Connect a
   repository" call to action.
3. **Given** the user enters a valid GitHub repo URL and a Personal Access Token,
   **When** they submit the connection form, **Then** the app validates access, lists
   available branches, detects the spec directory structure, and navigates to the repo
   overview page. If no `specs/` or `.specify/` directory is detected, the overview
   page shows an inline help panel explaining the expected layout — no files are
   created automatically.
4. **Given** the user enters a repo URL they do not have access to, **When** they
   submit, **Then** they receive a clear, non-technical error explaining the access
   problem and how to fix it.
5. **Given** the user has already connected repos, **When** they log in again, **Then**
   they are taken directly to their repository dashboard without re-entering details.

---

### User Story 2 – Product Owner Views Current Specifications (Priority: P1)

A product owner selects a connected repo from their dashboard, chooses a branch, and
sees a visual overview of all specifications in that repo. Each spec is shown as a
named card with its current status (draft, active, etc.) and a brief description
derived from the spec itself. They can click on any spec to see its full detail view,
including user journeys, requirements, and success criteria.

**Why this priority**: Viewing specs is the core read path; it must work before editing
is meaningful. Product owners need to understand the landscape of specs before making
changes.

**Independent Test**: Can be fully tested by connecting a repo that contains at least
one spec file, navigating to the spec list, and verifying that each spec appears as a
card with title and status, and that clicking opens a readable detail view.

**Acceptance Scenarios**:

1. **Given** a connected repo with existing spec files, **When** the user navigates to
   the spec overview, **Then** they see a list or card grid of specs, each showing
   title, priority or status badge, and a short description.
2. **Given** the user clicks a spec card, **When** the detail view opens, **Then** it
   displays user journeys (with priorities), acceptance scenarios, requirements, and
   success criteria in a readable, non-technical layout — not raw markdown.
3. **Given** the repo has no spec files in the expected directories, **When** the user
   views the spec list, **Then** they see an empty state with guidance on how to create
   the first spec.
4. **Given** the user is on the spec overview, **When** they switch to a different
   branch using the branch selector, **Then** the spec list refreshes to show specs
   from the selected branch.

---

### User Story 3 – Product Owner Edits a Feature Spec Visually (Priority: P1)

A product owner opens an existing feature spec and edits it using structured form
fields. They can add or update user journeys (including priority and acceptance
scenarios), modify requirements, and update success criteria — all without touching
markdown. On saving, the app commits the changes to the connected Git repo with a
clear, auto-generated commit message and confirms the save.

**Why this priority**: Editing specs is the core write path. If non-technical users
cannot edit specs visually, the application does not deliver its primary value
proposition.

**Independent Test**: Can be fully tested by opening an existing spec, modifying a user
journey title and priority, clicking Save, and verifying the spec detail view shows the
update and the Git history shows a new commit with a descriptive message.

**Acceptance Scenarios**:

1. **Given** the user has edit permissions and opens a spec, **When** they click "Edit",
   **Then** the spec fields become editable form controls (text inputs, priority
   selectors, rich-text or plain-text areas for descriptions).
2. **Given** the user modifies a user journey and clicks "Save", **When** the save
   completes, **Then** the app commits the change to Git with an auto-generated message
   of the form "Update spec: [spec name] — [summary of change]", shows a success
   confirmation, and returns to the detail view with the updated content.
3. **Given** the user adds a new user journey using the "Add Journey" button, **When**
   they fill in the title, priority, and at least one acceptance scenario and save,
   **Then** the new journey appears in the spec and is committed to Git.
4. **Given** the user is a viewer (read-only role), **When** they open a spec, **Then**
   there is no Edit button and all fields are read-only.
5. **Given** the user makes edits but navigates away without saving, **When** the
   navigation occurs, **Then** they are warned that unsaved changes will be lost.

---

### User Story 4 – Product Owner Views Spec Version History and Diffs (Priority: P2)

A product owner opens a spec and clicks a "History" tab. They see a chronological
list of changes made to that spec, each described in plain language (e.g., "Added
journey: User logs in", "Updated priority of Journey 2 to P1"). They can click on
any version to see what changed, with a human-friendly diff highlighting added and
removed content.

**Why this priority**: Version history is a core part of the constitution's Git-backed
truth principle. It enables accountability and rollback understanding. It is ranked P2
because it enhances value, but the app is still useful without it for an initial demo.

**Independent Test**: Can be fully tested by making several edits to a spec, navigating
to the History tab, and verifying each saved change appears as a distinct entry with a
timestamp, author, and human-readable description of what changed.

**Acceptance Scenarios**:

1. **Given** a spec with at least two committed versions, **When** the user opens the
   History tab, **Then** they see a list of entries with author, date, and a
   plain-language change summary.
2. **Given** the user clicks a history entry, **When** the diff view opens, **Then**
   it shows added content highlighted in one color and removed content in another,
   using field labels (not raw markdown syntax) to explain what changed.
3. **Given** the spec has only one version (initial creation), **When** the user opens
   the History tab, **Then** they see a single entry labeled "Initial creation" with no
   diff option.

---

### User Story 5 – Non-Technical User Sees Future Feature Placeholders (Priority: P3)

A product owner navigating the spec detail view sees clearly labeled but non-functional
sections for Tasks, Tests, Validations, and Deployment Status. Each section shows a
brief description of what it will do and an indication that these features are coming.
This grounds the mental model early and avoids confusion about the scope of the product.

**Why this priority**: This delivers no functional value but is essential for product
alignment and stakeholder expectation setting. It is P3 because it can be deferred
without affecting the core journeys.

**Independent Test**: Can be fully tested by opening any spec detail view and
confirming that each placeholder section is visible, clearly labeled, and shows a
non-technical "coming soon" message rather than empty or broken UI.

**Acceptance Scenarios**:

1. **Given** the user views a spec detail page, **When** they scroll past the main
   spec content, **Then** they see collapsible sections for "Tasks", "Tests & Results",
   "Validation", and "Deployment Status", each with a short description and a
   "Coming soon" badge.
2. **Given** the user clicks on a "Coming soon" section, **When** it expands, **Then**
   it shows a brief, plain-language description of what will appear there (e.g.,
   "Tasks linked to this spec's user journeys will appear here").

---

### Edge Cases

- What happens when a connected repo's access token (OAuth token or PAT) expires
  mid-session? The user MUST see a clear re-authentication prompt, not a raw API
  error. For PAT-based connections, the prompt MUST ask the user to re-enter their
  PAT (since it is not persisted beyond the session cookie).
- What happens when the GitHub API rate limit is hit (HTTP 429 / 403 with
  `X-RateLimit-Remaining: 0`)? The system MUST display a plain-language message
  telling the user how many minutes remain until the limit resets, derived from
  the `X-RateLimit-Reset` response header (e.g., "GitHub is temporarily
  unavailable — ready again in 4 minutes"). All affected actions MUST be disabled
  until the reset time passes.
- What happens when two editors save conflicting changes to the same spec
  simultaneously? The system MUST detect the conflict, refuse the second save, and
  present the conflict to the user with guidance on how to resolve it.
- What happens if the spec file in Git is malformed (not parseable)? The app MUST
  show the raw content in a safe read-only view with a warning, not crash or show
  blank content.
- What happens when the Git repo has a very large number of specs (100+)? The spec
  list MUST paginate or virtualize so the UI remains responsive.
- What happens when the user connects a repo that has no `.specify/` or `specs/`
  directory? The app MUST display an inline help panel explaining the expected
  directory layout and directing the user to set it up manually or via SpecKit
  tooling. The app MUST NOT create any files in the repository without explicit
  user action. No "initialize" button is provided in MVP.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support user authentication via GitHub OAuth.
- **FR-002**: Authenticated users MUST be able to connect one or more GitHub repositories
  using a Personal Access Token (PAT). The PAT MUST be stored exclusively inside the
  Auth.js encrypted JWT session cookie — never in localStorage, a database, or any
  other client-accessible store. The app MUST prompt the user to re-enter their PAT
  after session expiry. GitHub App authentication is reserved for a future release
  (see `github_app_auth` feature flag).
- **FR-003**: The system MUST detect and parse spec files in the repo's `.specify/` and
  `specs/` directories, supporting at minimum the formats produced by SpecKit templates.
- **FR-004**: The system MUST display a visual list of all detected spec files for a
  selected repo and branch, showing title, status badge, and summary.
- **FR-005**: The system MUST render feature spec content (user journeys, priorities,
  acceptance scenarios, requirements, success criteria) in a human-readable visual
  layout without exposing raw markdown.
- **FR-006**: The system MUST allow users with editor role to modify spec content via
  structured form controls and commit changes to Git. The editor form MUST include a
  status dropdown allowing the product owner to manually set the spec's lifecycle
  status (draft / active / implemented / archived).
- **FR-007**: Every spec edit MUST be committed to the connected Git repo with a
  structured, auto-generated commit message that summarizes the change.
- **FR-008**: The system MUST display the Git commit history for any individual spec,
  with each entry showing author, timestamp, and a plain-language change summary.
- **FR-009**: The system MUST provide a diff view for any two versions of a spec,
  displayed using field-level highlights rather than raw text diffs.
- **FR-010**: The system MUST enforce role-based access: viewers can read but not edit
  or commit; editors can read and edit. Role assignment follows the first-connector
  rule: the first authenticated user to connect a given repository is assigned the
  editor role for that repo; all other users who subsequently connect the same repo
  default to viewer. No role-management UI is required in MVP.
- **FR-011**: The system MUST warn users before discarding unsaved edits.
- **FR-012**: The system MUST display placeholder sections for Tasks, Tests & Results,
  Validation, and Deployment Status on the spec detail view, clearly marked as future
  features.
- **FR-013**: The system MUST provide clear, non-technical error messages for all
  failure cases (auth expiry, access denied, conflict, parse error, network failure,
  rate limiting). When the GitHub API rate limit is reached, the message MUST state
  how many minutes until the limit resets (derived from `X-RateLimit-Reset` header)
  and MUST disable affected actions until that time.
- **FR-014**: All optional MVP features and every future-facing capability MUST be
  gated behind named feature flags. Flag resolution MUST be centralised in
  `src/lib/flags.ts`; no component or server action may read `process.env` directly
  for a feature flag. Each flag defaults to the value declared in the Feature Flags
  section and can be overridden at deploy time via the corresponding
  `NEXT_PUBLIC_FEATURE_<FLAG>` environment variable (`1`/`true` to enable,
  `0`/`false` to disable).
- **FR-015**: The system MUST allow users with editor role to create a new feature spec
  from the spec list, which is committed to the connected Git repo as a new file
  following the SpecKit template. The creation form MUST require at minimum a spec
  title and one user journey. This capability MUST be gated behind the `spec_create`
  feature flag (see Feature Flags section).

### Key Entities *(include if feature involves data)*

- **User**: An authenticated person using the app. Attributes: id, provider (GitHub),
  provider user ID, display name, email, avatar URL, role (viewer/editor/admin),
  created_at. Relationships: has many GitRepository connections.
- **GitRepository**: A connected repository. Attributes: id, owner_id (User), host
  (github), owner (GitHub org or user), repo name, default branch, auth_mode
  (PAT or app), created_at. Relationships: belongs to User; has many SpecArtifacts.
- **SpecArtifact**: A spec file tracked in Git. Attributes: repo_id, file path,
  detected type (feature_spec/plan/tasks/other), current content (cached),
  last_commit_sha, last_author, last_modified_at. Relationships: belongs to
  GitRepository.
- **FeatureSpec**: A structured view over a SpecArtifact of type `feature_spec`.
  Attributes: title, status (user-settable via editor dropdown: draft/active/
  implemented/archived), journeys (ordered list), requirements (list), success
  criteria (list). Derived from parsing the spec file; not stored separately.
- **UserJourney**: A sub-entity within FeatureSpec. Attributes: title, priority (P1–Pn),
  description, independent_test, acceptance_scenarios (list). Derived from parsing.
- **CommitSummary**: A human-readable summary of a Git commit touching a spec file.
  Attributes: sha, author, timestamp, message, plain_language_summary.

## Feature Flags *(mandatory for incremental delivery)*

Feature flags gate optional MVP features and all future-facing capabilities. Each flag
defaults to the value in the table below and can be overridden at deploy time via the
corresponding `NEXT_PUBLIC_FEATURE_<FLAG>` environment variable (`1` or `true` to
enable, `0` or `false` to disable). Flag resolution is centralised in `src/lib/flags.ts`
(see FR-014).

### MVP Flags — shipped in this version

| Flag | Env var | Default | Controls | Linked requirement |
|------|---------|---------|----------|--------------------|
| `spec_history` | `NEXT_PUBLIC_FEATURE_SPEC_HISTORY` | `true` | History tab and field-level diff view (US4) | FR-008, FR-009 |
| `spec_create` | `NEXT_PUBLIC_FEATURE_SPEC_CREATE` | `true` | Create new spec from the spec list | FR-015 |

### Future Flags — OFF in this version

| Flag | Env var | Default | Controls | Linked requirement |
|------|---------|---------|----------|--------------------|
| `task_tracking` | `NEXT_PUBLIC_FEATURE_TASK_TRACKING` | `false` | Full task board and sprint planning | FR-012 placeholder |
| `test_review` | `NEXT_PUBLIC_FEATURE_TEST_REVIEW` | `false` | Test definitions and results viewer | FR-012 placeholder |
| `spec_validation` | `NEXT_PUBLIC_FEATURE_SPEC_VALIDATION` | `false` | Automated spec validation dashboard | FR-012 placeholder |
| `deployment_status` | `NEXT_PUBLIC_FEATURE_DEPLOYMENT_STATUS` | `false` | CI/CD integration and deployment badges | FR-012 placeholder |
| `multi_provider` | `NEXT_PUBLIC_FEATURE_MULTI_PROVIDER` | `false` | GitLab and Bitbucket repository support | out-of-scope MVP |
| `github_app_auth` | `NEXT_PUBLIC_FEATURE_GITHUB_APP_AUTH` | `false` | GitHub App auth mode in place of OAuth App + PAT | out-of-scope MVP |
| `role_management_ui` | `NEXT_PUBLIC_FEATURE_ROLE_MANAGEMENT_UI` | `false` | UI for assigning and changing user roles | FR-010 (first-connector only in MVP) |

### Implementation Contract

- All flag checks in application code MUST call `isEnabled(FLAGS.<FLAG>)` from
  `src/lib/flags.ts`; direct `process.env` reads for feature flags are forbidden.
- Placeholder sections rendered under FR-012 MUST branch on their respective future
  flag: when `false`, render the "Coming soon" panel; when `true`, render the real
  feature.
- When `spec_history` is `false`, the History tab MUST be hidden (not just empty).
- When `spec_create` is `false`, the "New spec" button MUST be hidden.
- Adding a new feature flag MUST be accompanied by: (1) a row in this table,
  (2) a constant in `FLAGS` in `src/lib/flags.ts`, and (3) a default in `DEFAULTS`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A non-technical product owner with no prior knowledge of SpecKit or Git
  can complete Journey 1 (log in + connect a repo) in under 5 minutes without
  external assistance.
- **SC-002**: The spec list page for a repo with up to 50 specs loads in under 2 seconds
  on a standard broadband connection.
- **SC-003**: A product owner can view the full detail of any spec without encountering
  any raw markdown, JSON, or code syntax.
- **SC-004**: A product owner can edit a spec, save it, and see the resulting Git commit
  appear in the History tab — all within a single browser session with no manual Git
  operations. *Requires `spec_history` feature flag to be enabled (default: true).*
- **SC-005**: All destructive or high-impact actions (delete, overwrite, conflict
  resolution) present a confirmation step that includes a plain-language explanation
  of the consequence.
- **SC-006**: The application passes WCAG 2.1 AA accessibility checks for all P1 journey
  screens, enabling participation by users relying on keyboard navigation or screen
  readers.
