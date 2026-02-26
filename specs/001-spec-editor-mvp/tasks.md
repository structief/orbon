---

description: "Task list template for feature implementation"
---

# Tasks: Spec Editor MVP

**Input**: Design documents from `/specs/001-spec-editor-mvp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No TDD approach requested. Tests are not included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js 15 project and configure all shared tooling and
dependencies so every subsequent phase can build on a stable foundation.

- [ ] T001 Initialize Next.js 15 project with TypeScript 5.x and App Router at repo root (`npx create-next-app@latest . --typescript --app --tailwind --eslint --src-dir`)
- [ ] T002 Install primary runtime dependencies: `auth` (Auth.js v5), `@auth/core`, `@octokit/rest`, `gray-matter`, `remark`, `remark-parse`, `remark-stringify`, `unified`, `zod`, `next-safe-action` in `package.json`
- [ ] T003 [P] Install and configure shadcn/ui with Tailwind CSS 4: run `npx shadcn@latest init` and add components Button, Card, Badge, Dialog, Input, Textarea, Select, Tabs, Collapsible to `src/components/ui/`
- [ ] T004 [P] Install and configure Vitest with React Testing Library: add `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` to `package.json`; create `vitest.config.ts` at repo root
- [ ] T005 [P] Install and configure Playwright for E2E: run `npx playwright install --with-deps`; create `playwright.config.ts` at repo root with `baseURL: 'http://localhost:3000'`
- [ ] T006 [P] Create `.env.example` at repo root with all required env vars (`AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXTAUTH_URL`, `SPEC_ROOT_DIR`) and `.env.local` in `.gitignore`
- [ ] T007 Create canonical TypeScript type definitions in `src/types/index.ts` from `data-model.md` (all interfaces: `User`, `GitRepository`, `SpecArtifact`, `SpecArtifactType`, `SpecStatus`, `FeatureSpec`, `UserJourney`, `AcceptanceScenario`, `FunctionalRequirement`, `KeyEntity`, `SuccessCriterion`, `CommitSummary`, `ChangedField`)

---

## Phase 2: Static Mockup UI

**Purpose**: Build all P1–P3 screens and components with **mock data only** — no Auth.js,
no GitHub API, no server actions. Validates layout, navigation, and UX before backend
work. Same file paths and component structure as later phases; later phases wire real
data and actions.

**Prerequisite**: Phase 1 complete (types in `src/types/index.ts` used for mock props).

- [ ] M001 Create app shell layout in `src/app/(dashboard)/layout.tsx` — sidebar with mock repo list (2–3 fake repos), header with mock user avatar and sign-out; no `auth()` call; use mock `User` and `GitRepository[]`
- [ ] M002 [P] Create login page in `src/app/(auth)/login/page.tsx` — "Sign in with GitHub" button (no `signIn()`); centred, accessible layout; link to dashboard for demo navigation
- [ ] M003 [P] Create repository dashboard in `src/app/(dashboard)/page.tsx` — empty state with "Connect a repository" CTA; optional: 1–2 mock `RepoCard` for demo
- [ ] M004 [P] Create `RepoCard` in `src/components/repo/RepoCard.tsx` — display owner/name, branch badge, "Open" / "Disconnect"; props: `GitRepository`
- [ ] M005 [P] Create `RepoConnectForm` in `src/components/repo/RepoConnectForm.tsx` — owner, repo name, auth toggle, PAT input; submit logs to console or navigates with mock success; no server action
- [ ] M006 Create connect repository page in `src/app/(dashboard)/repos/connect/page.tsx` — embed `RepoConnectForm`; on "submit" redirect to `/repos/mock-repo-id`
- [ ] M007 [P] Create `BranchSelector` in `src/components/repo/BranchSelector.tsx` — dropdown with mock branches (e.g. `main`, `develop`); no API
- [ ] M008 [P] Create `SpecCard` in `src/components/spec/SpecCard.tsx` — title, status badge, last modified; link to spec detail; props: `SpecArtifact` or mock shape
- [ ] M009 [P] Create `JourneyCard` in `src/components/spec/JourneyCard.tsx` — journey title, priority badge, description, acceptance scenarios
- [ ] M010 [P] Create `AcceptanceScenarioList` in `src/components/spec/AcceptanceScenarioList.tsx` — Given/When/Then rows
- [ ] M011 [P] Create `SpecDetailView` in `src/components/spec/SpecDetailView.tsx` — render `FeatureSpec` with `JourneyCard` and `AcceptanceScenarioList`; sections: journeys, requirements, success criteria; tabs: Detail | History (History shows mock list)
- [ ] M012 Create repo overview page in `src/app/(dashboard)/repos/[repoId]/page.tsx` — `BranchSelector`, grid of `SpecCard` with 3–5 mock specs; empty state variant
- [ ] M013 Create spec detail page in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/page.tsx` — load mock `FeatureSpec` from a constant or `mockSpecs.ts`; render `SpecDetailView`; Edit button links to edit page
- [ ] M014 [P] Create `JourneyEditor` in `src/components/spec/JourneyEditor.tsx` — editable form for one journey (title, priority, description, scenarios); no save action
- [ ] M015 [P] Create `SpecEditor` in `src/components/spec/SpecEditor.tsx` — orchestrates `JourneyEditor` for each journey, requirements/criteria editors; Save/Cancel; Save navigates back with mock success
- [ ] M016 [P] Create `ConflictDialog` in `src/components/shared/ConflictDialog.tsx` — modal "Your version" vs "Latest version"; no backend
- [ ] M017 Create spec edit page in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/edit/page.tsx` — mock `FeatureSpec`; render `SpecEditor`; save redirects to detail page
- [ ] M018 [P] Create `CommitHistoryList` in `src/components/shared/CommitHistoryList.tsx` — list of mock `CommitSummary` (avatar, author, date, summary)
- [ ] M019 [P] Create `DiffViewer` in `src/components/shared/DiffViewer.tsx` — mock `ChangedField[]` with before/after and color coding
- [ ] M020 Create spec history page in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/history/page.tsx` — mock history; render `CommitHistoryList` and `DiffViewer` for selected commit
- [ ] M021 Wire History tab in `SpecDetailView` — Detail | History tabs; History tab content can be mock list or link to history route
- [ ] M022 [P] Create `FuturePlaceholderSection` in `src/components/spec/FuturePlaceholderSection.tsx` — collapsible, "Coming soon" badge, description prop
- [ ] M023 Add four placeholder sections to `SpecDetailView` — Tasks, Tests & Results, Validation, Deployment Status per spec.md US5

**Checkpoint**: All screens navigable with mock data; no auth or API calls. Demo-ready for stakeholder review.

---

## Phase 3: Foundational (Blocking Prerequisites)

**Purpose**: Core library code and infrastructure that every user story depends on.
Replaces mock data and mock navigation with real auth, GitHub API, and server actions.

**Prerequisite**: Phase 2 (Static mockup UI) complete. This phase wires real behaviour
into the existing layout, pages, and components.

- [ ] T008 Implement Auth.js v5 configuration with GitHub OAuth provider in `src/lib/auth/config.ts` — export `handlers`, `auth`, `signIn`, `signOut`; store `access_token` in JWT callback; configure `repo` scope
- [ ] T009 [P] Implement Next.js authentication middleware in `src/middleware.ts` — protect all `/(dashboard)/**` routes; redirect unauthenticated requests to `/login?callbackUrl=<path>`; allow public routes: `/login`, `/api/auth/**`, `/`
- [ ] T010 [P] Implement Octokit client factory in `src/lib/github/client.ts` — `getOctokit(accessToken: string): Octokit` function; use `@octokit/rest`; set `User-Agent` header
- [ ] T011 Implement GitHub repository utilities in `src/lib/github/repos.ts` — `listUserRepos()`, `validateRepoAccess()`, `detectSpecRootDir()`, `listBranches()` — all accepting an Octokit instance; map 404/403 to typed errors
- [ ] T012 [P] Implement GitHub file contents utilities in `src/lib/github/contents.ts` — `getFileContent()`, `putFileContent()` (create or update) — accepting `{ octokit, owner, repo, path, ref, content?, sha?, message? }`; base64 encode/decode helpers
- [ ] T013 [P] Implement GitHub commit history utilities in `src/lib/github/commits.ts` — `getFileCommits()` (paginated), `getCommitDetail()` — accepting `{ octokit, owner, repo, path, branch, page?, perPage? }`
- [ ] T014 Create non-technical GitHub error mapping in `src/lib/github/errors.ts` — map `GithubError` status codes (401, 403, 404, 409, 422) to `GitHubErrorCode` enum with user-facing message strings per `contracts/repos-api.md`
- [ ] T015 [P] Implement SpecKit feature spec parser in `src/lib/spec-parser/feature-spec.ts` — `parseFeatureSpec(markdown: string): FeatureSpec` — extract title, status, journeys (with priorities and acceptance scenarios), functional requirements, success criteria from SpecKit template format using `remark` AST and `gray-matter`
- [ ] T016 [P] Implement spec artifact type detector in `src/lib/spec-parser/index.ts` — `detectArtifactType(filePath: string): SpecArtifactType` and `parseArtifact(artifact: SpecArtifact): FeatureSpec | null` orchestrator
- [ ] T017 Implement feature spec markdown serializer in `src/lib/spec-writer/feature-spec.ts` — `serializeFeatureSpec(spec: FeatureSpec): string` — reconstruct the SpecKit-format markdown from a `FeatureSpec` object, preserving heading structure from `spec-template.md`
- [ ] T018 [P] Implement plain-language commit message generator in `src/lib/spec-writer/commit-message.ts` — `generateCommitMessage(before: FeatureSpec | null, after: FeatureSpec): string` — produce messages like "Update spec: {title} — Added journey: {name}" per `contracts/specs-api.md`
- [ ] T019 [P] Implement pluggable validation scaffold in `src/lib/validation/index.ts` — `Validator` interface `{ id: string; run(spec: FeatureSpec): ValidationResult }`, `ValidationResult { pass: boolean; message: string }`, `registerValidator()`, `runValidators(spec)` — MVP registers only structural check (has at least one P1 journey)
- [ ] T020 Replace mock app shell with authenticated layout in `src/app/(dashboard)/layout.tsx` — use `auth()` for session; sidebar with real connected repos; redirect to `/login` if unauthenticated; keep existing shell structure from Phase 2

**Checkpoint**: All lib utilities complete; layout and routes use real auth and data — user story implementation can now begin.

---

## Phase 4: User Story 1 – Log In and Connect a Git Repo (Priority: P1) 🎯 MVP

**Goal**: User can sign in via GitHub OAuth, land on a dashboard, and connect a GitHub
repository by entering owner/name or selecting from their repos.

**Builds on Phase 2**: Login page, dashboard, RepoCard, RepoConnectForm, and connect page
exist; these tasks add Auth.js signIn, session, server actions, and real repo data.

**Independent Test**: Open the app unauthenticated, click "Sign in with GitHub",
complete OAuth, confirm dashboard loads, click "Connect a repository", enter a valid
repo, confirm repo overview page loads with branch list and detected spec directory.

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create login page in `src/app/(auth)/login/page.tsx` — show "Sign in with GitHub" button using `signIn("github")` from Auth.js; handle `error` query param with non-technical messages; accessible, centred layout
- [ ] T022 [US1] Create Auth.js route handler in `src/app/(auth)/auth/[...nextauth]/route.ts` — export `{ GET, POST }` from Auth.js `handlers`; wires up OAuth callback, sign-in, sign-out
- [ ] T023 [P] [US1] Create repository dashboard home page in `src/app/(dashboard)/page.tsx` — list connected repos from session; show empty state with "Connect a repository" CTA when none exist; use `RepoCard` for each connected repo
- [ ] T024 [P] [US1] Create `RepoCard` component in `src/components/repo/RepoCard.tsx` — display owner/name, active branch badge, connected date, and "Open" / "Disconnect" actions; props: `GitRepository`
- [ ] T025 [P] [US1] Create `RepoConnectForm` component in `src/components/repo/RepoConnectForm.tsx` — controlled form: owner input, repo name input, auth mode toggle (OAuth session vs PAT), PAT input (conditional), submit button with loading state; validate with Zod; show field-level errors per `contracts/repos-api.md`
- [ ] T026 [US1] Implement repository server actions in `src/app/(dashboard)/repos/actions.ts` — `listUserRepos()`, `connectRepository(input)`, `disconnectRepository(repoId)`, `listBranches(repoId)`, `setActiveBranch(repoId, branch)` per `contracts/repos-api.md`; use `next-safe-action`; store connected repos in session cookie
- [ ] T027 [US1] Create connect repository page in `src/app/(dashboard)/repos/connect/page.tsx` — embed `RepoConnectForm`; on success redirect to `/repos/[repoId]`; show selectable list from `listUserRepos()` as an alternative to manual entry
- [ ] T028 [US1] Integrate non-technical error display in `RepoConnectForm` and dashboard page — map all `GitHubErrorCode` values from `src/lib/github/errors.ts` to user-facing toast/inline messages; no raw error objects shown in UI

**Checkpoint**: US1 fully functional — sign in, connect a repo, dashboard shows the repo card, disconnect works.

---

## Phase 5: User Story 2 – View Current Specifications (Priority: P1)

**Goal**: User selects a connected repo, picks a branch, and sees a card list of all
spec files; clicking any card opens a readable, non-technical detail view of that spec.

**Independent Test**: With a connected repo containing at least one `spec.md`, navigate
to `/repos/[repoId]`, confirm spec cards render with title and status badge, click a
card, confirm the detail view shows user journeys with priorities and acceptance
scenarios — no raw markdown visible.

### Implementation for User Story 2

- [ ] T029 [P] [US2] Implement `listSpecArtifacts(repoId, branch)` server action in `src/app/(dashboard)/repos/[repoId]/specs/actions.ts` — call GitHub tree API, filter to spec dirs, derive `SpecArtifactType`, return `SpecArtifact[]` per `contracts/specs-api.md`
- [ ] T030 [P] [US2] Implement `parseFeatureSpec(repoId, branch, path)` server action in `src/app/(dashboard)/repos/[repoId]/specs/actions.ts` — fetch file content, decode base64, parse with `src/lib/spec-parser/feature-spec.ts`, return `FeatureSpec` and `sha` per `contracts/specs-api.md`
- [ ] T031 [US2] Create `BranchSelector` component in `src/components/repo/BranchSelector.tsx` — dropdown populated via `listBranches(repoId)`; triggers `setActiveBranch()` and refreshes spec list on change; shows active branch name as label
- [ ] T032 [US2] Create repo overview page (spec list) in `src/app/(dashboard)/repos/[repoId]/page.tsx` — server component; load spec list via `listSpecArtifacts`; render `BranchSelector`, grid of `SpecCard` components, empty state when no specs found, error state for API failures
- [ ] T033 [P] [US2] Create `SpecCard` component in `src/components/spec/SpecCard.tsx` — display feature title, `SpecStatus` badge, last modified date, last author avatar; link to spec detail page; derive summary from first journey description
- [ ] T034 [P] [US2] Create `JourneyCard` component in `src/components/spec/JourneyCard.tsx` — show journey title, priority badge (color-coded by P1/P2/P3), description, optional independent test note, list of acceptance scenarios
- [ ] T035 [P] [US2] Create `AcceptanceScenarioList` component in `src/components/spec/AcceptanceScenarioList.tsx` — render Given/When/Then scenarios as labeled rows with subtle separators; no code-style formatting
- [ ] T036 [US2] Create `SpecDetailView` component in `src/components/spec/SpecDetailView.tsx` — render full `FeatureSpec` using `JourneyCard` and `AcceptanceScenarioList`; sections: journeys, functional requirements, success criteria; tabs for Detail / History (History tab wired in US4); no raw markdown visible
- [ ] T037 [US2] Create spec detail page in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/page.tsx` — server component; call `parseFeatureSpec`; render `SpecDetailView`; show raw content read-only fallback with warning when `PARSE_ERROR`; role-aware Edit button (hidden for viewer role)

**Checkpoint**: US2 fully functional — browse spec list, switch branches, open detail view, all content readable without raw markdown.

---

## Phase 6: User Story 3 – Edit a Feature Spec Visually (Priority: P1)

**Goal**: User with editor role can open any feature spec, edit journeys/requirements
via form controls, save back to Git as a commit, and see the updated content immediately.

**Independent Test**: Open an existing spec, click Edit, modify a journey title, click
Save, confirm the detail view shows the updated title and the spec's history tab shows
a new commit with a plain-language summary of the change.

### Implementation for User Story 3

- [ ] T038 [P] [US3] Implement `saveFeatureSpec(input)` server action in `src/app/(dashboard)/repos/[repoId]/specs/actions.ts` — serialize `FeatureSpec` to markdown, call GitHub PUT contents API with original SHA for conflict detection, generate commit message; return new SHA and commit SHA per `contracts/specs-api.md`
- [ ] T039 [P] [US3] Implement `createFeatureSpec(input)` server action in `src/app/(dashboard)/repos/[repoId]/specs/actions.ts` — derive next feature number, generate initial spec markdown from SpecKit template, commit to GitHub per `contracts/specs-api.md`
- [ ] T040 [US3] Create `JourneyEditor` component in `src/components/spec/JourneyEditor.tsx` — editable form for a single `UserJourney`: text input for title, priority select dropdown (P1–P5), textarea for description, repeatable row editor for acceptance scenarios (Given/When/Then fields); add/remove scenario buttons
- [ ] T041 [P] [US3] Create `SpecEditor` component in `src/components/spec/SpecEditor.tsx` — orchestrates full spec editing: displays `JourneyEditor` for each journey, add/remove journey controls, functional requirements list editor, success criteria list editor; tracks dirty state; Save and Cancel buttons; unsaved-change warning on navigate-away
- [ ] T042 [US3] Create visual spec editor page in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/edit/page.tsx` — load current spec via `parseFeatureSpec`; render `SpecEditor`; on save call `saveFeatureSpec`; on conflict render `ConflictDialog`; redirect to detail page on success
- [ ] T043 [P] [US3] Create `ConflictDialog` component in `src/components/shared/ConflictDialog.tsx` — modal showing "Your version" vs "Latest version" side by side; options: "Discard my changes and use latest" or "Keep editing"; non-technical conflict explanation text per `contracts/specs-api.md`
- [ ] T044 [US3] Implement unsaved-changes guard in `src/components/spec/SpecEditor.tsx` — add `beforeunload` event listener when form is dirty; intercept Next.js router navigation with confirmation dialog; clear guard on successful save

**Checkpoint**: US3 fully functional — edit journeys and requirements visually, save commits to GitHub, conflict detection and warning work, viewer role cannot reach edit page.

---

## Phase 7: User Story 4 – Spec Version History and Diffs (Priority: P2)

**Goal**: User can open the History tab on a spec and browse all past versions with
plain-language descriptions; clicking a version shows what changed at field level.

**Independent Test**: Edit a spec twice, open the History tab, confirm two distinct
entries appear with author, timestamp, and plain-language summaries; click the earlier
entry and confirm a diff view highlights the changed fields in accessible colors.

### Implementation for User Story 4

- [ ] T045 [P] [US4] Implement `getSpecHistory(repoId, branch, path, options?)` server action in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/history/actions.ts` — call GitHub commits API filtered to file path, derive `plainLanguageSummary` from commit message per `contracts/history-api.md`
- [ ] T046 [P] [US4] Implement `getSpecAtCommit(repoId, commitSha, path)` server action in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/history/actions.ts` — fetch file at specific SHA, decode, parse, return `FeatureSpec`
- [ ] T047 [US4] Implement field-level diff logic in `src/lib/spec-parser/diff.ts` — `diffFeatureSpecs(before: FeatureSpec, after: FeatureSpec): ChangedField[]` — compare title, status, journeys (matched by index), functional requirements (matched by id), success criteria (matched by id); produce `ChangedField[]` with `before`/`after` values and `changeType`
- [ ] T048 [US4] Implement `getSpecDiff(repoId, fromSha, toSha, path)` server action in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/history/actions.ts` — call `getSpecAtCommit` for both SHAs, run `diffFeatureSpecs`, return structured diff per `contracts/history-api.md`
- [ ] T049 [P] [US4] Create `CommitHistoryList` component in `src/components/shared/CommitHistoryList.tsx` — render paginated list of `CommitSummary` items: avatar, author name, timestamp (relative + absolute tooltip), `plainLanguageSummary`; clickable rows that open the diff view; "Initial creation" label for first commit
- [ ] T050 [P] [US4] Create `DiffViewer` component in `src/components/shared/DiffViewer.tsx` — render `ChangedField[]` as labeled rows: field label, change type indicator, before/after values with color coding (added: green, removed: red, updated: amber); collapsible; raw diff toggle for technical users
- [ ] T051 [US4] Create spec history page in `src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/history/page.tsx` — load history via `getSpecHistory`; render `CommitHistoryList`; on row click load diff via `getSpecDiff` and render `DiffViewer` below the list
- [ ] T052 [US4] Wire History tab into `SpecDetailView` in `src/components/spec/SpecDetailView.tsx` — add Tabs component with "Detail" and "History" tabs; History tab lazy-loads history page content via a client component boundary

**Checkpoint**: US4 fully functional — History tab shows all commits with plain-language summaries, clicking any commit shows field-level colored diff.

---

## Phase 8: User Story 5 – Future Feature Placeholders (Priority: P3)

**Goal**: Spec detail page shows collapsible placeholder sections for Tasks, Tests &
Results, Validation, and Deployment Status — each with a "Coming soon" badge and a
plain-language description of what will eventually appear there.

**Independent Test**: Open any spec detail page, scroll below the spec content, confirm
four collapsible sections are visible with "Coming soon" badges; expand each and confirm
a non-technical description of the future feature is shown.

### Implementation for User Story 5

- [ ] T053 [US5] Create `FuturePlaceholderSection` component in `src/components/spec/FuturePlaceholderSection.tsx` — reusable collapsible section: accepts `title`, `icon`, `description` props; renders "Coming soon" badge; subtle, non-intrusive visual treatment that does not compete with live content
- [ ] T054 [US5] Add four placeholder sections to `SpecDetailView` in `src/components/spec/SpecDetailView.tsx` — render `FuturePlaceholderSection` instances for: "Tasks" ("Task lists linked to this spec's user journeys will appear here"), "Tests & Results" ("Test definitions and their latest run results for this feature will appear here"), "Validation" ("Automated checks verifying this spec is complete and consistent will appear here"), "Deployment Status" ("The current deployment state of this feature across environments will appear here")

**Checkpoint**: US5 fully functional — all four future sections visible, collapsible, clearly labeled, and non-disruptive to the current spec content.

---

## Phase 9: Feature Flag Wiring (FR-014)

**Purpose**: Connect `src/lib/flags.ts` to every gated surface so feature flags are
enforced at runtime. These tasks depend on the components they modify existing first
(T036, T052, T053, T054 from US2–US5).

**⚠️ PREREQUISITE**: Phase 8 (US5) must be complete before T063.

- [ ] T061 [P] Create feature flag module in `src/lib/flags.ts` — export `FLAGS` constant
  registry, `FlagName` type, `DEFAULTS` map (spec_history: true, spec_create: true;
  all future flags: false), and `isEnabled(flag: FlagName): boolean` resolving via
  `NEXT_PUBLIC_FEATURE_<FLAG>` env var then defaults; export `allFlags()` snapshot
  helper (file is pre-scaffolded as spec artifact; this task locks the implementation
  contract and integrates it with the build)
- [ ] T062 [US4] Wire `spec_history` flag into History tab in
  `src/components/spec/SpecDetailView.tsx` — import `isEnabled`, `FLAGS` from
  `src/lib/flags.ts`; render the History tab only when `isEnabled(FLAGS.SPEC_HISTORY)`
  is true; when false, the Tabs component shows the Detail tab only with no history
  option visible (not just disabled)
- [ ] T063 [US5] Wire future feature flags into placeholder sections in
  `src/components/spec/FuturePlaceholderSection.tsx` and
  `src/components/spec/SpecDetailView.tsx` — add a `featureFlag` prop to
  `FuturePlaceholderSection`; in `SpecDetailView` pass the corresponding
  `FLAGS.<FLAG>` for each of the four sections (task_tracking, test_review,
  spec_validation, deployment_status); when `isEnabled(featureFlag)` is `true`,
  render the real feature component in place of the "Coming soon" panel
- [ ] T064 [US2] Add "New spec" button to spec list page
  `src/app/(dashboard)/repos/[repoId]/page.tsx` — render a "New spec" button that
  calls `createFeatureSpec` (T039) only when `isEnabled(FLAGS.SPEC_CREATE)` is true;
  when false the button is absent from the DOM; button opens a minimal creation
  dialog (spec title + first journey name) and redirects to the new spec's edit page
  on success

**Checkpoint**: All feature flags enforced at runtime — toggling env vars correctly
shows/hides gated surfaces without code changes.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements spanning multiple user stories and non-functional quality gates.

- [ ] T055 [P] Verify WCAG 2.1 AA compliance for all P1 journey screens: run `axe-core` (via `@axe-core/playwright`) against login page (`src/app/(auth)/login/page.tsx`), dashboard (`src/app/(dashboard)/page.tsx`), spec list (`src/app/(dashboard)/repos/[repoId]/page.tsx`), spec detail (`…/specs/[...specPath]/page.tsx`), and editor (`…/edit/page.tsx`); fix any violations
- [ ] T056 [P] Add global error boundary for unhandled GitHub API errors in `src/app/(dashboard)/error.tsx` — render a friendly "Something went wrong" screen with a retry button and a link to re-connect the repo; log error details server-side only
- [ ] T057 Implement token expiry detection and re-auth prompt in `src/middleware.ts` — detect GitHub API 401 responses in server actions; clear session and redirect to `/login?reason=token_expired&callbackUrl=<path>` with a plain-language explanation message on the login page
- [ ] T058 [P] Add spec list pagination in `src/app/(dashboard)/repos/[repoId]/page.tsx` — show first 20 specs with a "Load more" button; display total count; ensure list remains responsive for repos with 50–100 spec files (per SC-002)
- [ ] T059 [P] Run quickstart.md end-to-end validation — follow all steps in `specs/001-spec-editor-mvp/quickstart.md` against the local dev server; confirm all P1 journey steps complete without errors; update quickstart if any steps are out of date
- [ ] T060 [P] Performance review — load spec list with 50 mock specs and verify < 2s; navigate to spec detail and verify < 1s; run a save operation and verify < 3s roundtrip (per plan.md performance goals); document findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; all tasks can run in parallel after T001 completes
- **Static mockup UI (Phase 2)**: Depends on Phase 1 (types from T007) — delivers all screens with mock data; demo-ready before backend
- **Foundational (Phase 3)**: Depends on Phase 1 and Phase 2 — wires real auth, GitHub API, and libs into existing UI
- **US1 (Phase 4)**: Depends on Phase 3 — no dependency on other user stories
- **US2 (Phase 5)**: Depends on Phase 3 — no dependency on US1 (can start in parallel with US1)
- **US3 (Phase 6)**: Depends on Phase 3 — requires spec parser and writer from Foundational; can start in parallel with US1/US2
- **US4 (Phase 7)**: Depends on Phase 3 — requires commits utility and diff logic; can start in parallel with US1/US2/US3
- **US5 (Phase 8)**: Depends on US2 (SpecDetailView must exist) — can start immediately after T036
- **Flag Wiring (Phase 9)**: T061 can start after Phase 3; T062 depends on T052; T063 depends on T054; T064 depends on T039 and T032
- **Polish (Phase 10)**: Depends on all desired user stories and Phase 9 being complete

### User Story Dependencies

- **US1**: Independent after Foundational
- **US2**: Independent after Foundational
- **US3**: Depends on US2 (spec detail page must exist to navigate to edit page)
- **US4**: Depends on US2 (SpecDetailView History tab integration in T052)
- **US5**: Depends on US2 (SpecDetailView component must exist for T054)

### Within Each User Story

- Server actions before pages that call them
- Types/lib utilities before components that use them
- Components before pages that compose them

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run after T001
- All Foundational tasks marked [P] can run in parallel within Phase 2
- Once Foundational is done, US1, US2, and US3 lib/action work can all start in parallel
- Within any user story, [P]-marked component tasks have no dependencies between them

---

## Parallel Example: User Story 2

```bash
# After T030/T031 (server actions) are complete, launch all components together:
Task: "T033 Create SpecCard in src/components/spec/SpecCard.tsx"
Task: "T034 Create JourneyCard in src/components/spec/JourneyCard.tsx"
Task: "T035 Create AcceptanceScenarioList in src/components/spec/AcceptanceScenarioList.tsx"
Task: "T031 Create BranchSelector in src/components/repo/BranchSelector.tsx"

# Then compose into pages:
Task: "T036 Create SpecDetailView — depends on JourneyCard + AcceptanceScenarioList"
Task: "T032 Create repo overview page — depends on SpecCard + BranchSelector"
Task: "T037 Create spec detail page — depends on SpecDetailView"
```

---

## Implementation Strategy

### Static Mockup First, Then Backend

1. Complete Phase 1: Setup
2. Complete Phase 2: Static mockup UI — all screens with mock data; **STOP and VALIDATE** with stakeholders (layout, navigation, UX)
3. Complete Phase 3: Foundational — wire real auth, GitHub, spec parser/writer
4. Complete Phase 4: US1 (Login + Connect)
5. Complete Phase 5: US2 (View Specs)
6. Complete Phase 6: US3 (Edit Specs)
7. **STOP and VALIDATE**: Walk through `quickstart.md` P1 journeys end-to-end
8. Deploy to Vercel preview — demo to stakeholders

### Incremental Delivery

1. Setup → Static mockup UI → validate UX → then Foundational
2. Add US1 → validate independently → deploy
3. Add US2 → validate independently → deploy
4. Add US3 → validate independently → deploy (full MVP!)
5. Add US4 → History and diff → deploy
6. Add US5 → Future placeholders → deploy
7. Polish → quality gates → production release

### Parallel Team Strategy

With multiple developers, once Phase 2 (mockup) is done, Phase 3 (Foundational) can proceed; once Foundational is done:

- Developer A: US1 (auth + repo connection)
- Developer B: US2 (spec parsing + list/detail views)
- Developer C: US3 lib work (spec writer + save action)
- Developer D: US4 lib work (diff logic + history actions)

Stories merge cleanly: US3 adds an edit page on top of US2's detail page; US4 adds a
history tab to US2's detail view.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [Story] label maps each task to its user story for independent delivery
- Each user story is independently completable and demoable after Foundational is done
- Avoid: vague task descriptions, same-file conflicts within a phase, cross-story dependencies that prevent independent testing
- Commit after each task or logical group
- Stop at any checkpoint to validate the user story independently before moving to the next
