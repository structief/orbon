## UI Contract: Static Spec Editor Mockup

This document defines the UI-level contract for the static front-end mockup. It focuses on routes, screens, and expected mock data, not on real APIs or persistence.

### Routes and Screens

All mock screens live under the `src/app/(mock)/...` segment and are reachable via the `/mock` URL prefix.

#### `/mock` — Entry / Sign-in or Onboarding

- **Purpose**: First screen stakeholders see; represents sign-in or onboarding.
- **Expected elements**:
  - Product name or logo
  - One primary call-to-action (e.g. “Continue” or “Sign in with GitHub (mock)”)
  - Brief explanation that this is a mock / preview experience
- **Navigation**:
  - Primary CTA → `/mock/dashboard`

#### `/mock/dashboard` — Post-auth Dashboard / Repo Overview

- **Purpose**: Shows connected repositories and entry points into the main flows.
- **Expected elements**:
  - Header with user name and avatar (from `MockUserSession`)
  - List of connected `MockRepository` items (at least one)
  - Prominent “Connect a repository” action
- **Navigation**:
  - Clicking a repo card → `/mock/repos/[repoId]`
  - “Connect a repository” → `/mock/repos/connect`

#### `/mock/repos/connect` — Repo Connection Flow (Mock)

- **Purpose**: Simulates connecting a repository without calling real services.
- **Expected elements**:
  - Form with owner + repo name fields
  - Optional branch selector or description of default branch
  - Copy making it clear that this is a simulated connection
- **Navigation**:
  - Successful submit → `/mock/repos/[repoId]` for a representative mock repo

#### `/mock/repos/[repoId]` — Spec Overview (List)

- **Purpose**: Shows a list of specs for a single mock repository/branch.
- **Expected elements**:
  - Repository name and active branch
  - Branch selector (even if options are limited)
  - List of `MockSpecSummary` cards with title, status, priority badge, and summary
- **Navigation**:
  - Clicking a spec card → `/mock/repos/[repoId]/specs/[...specPath]`
  - Optional “New spec” action may be present but is purely illustrative.

#### `/mock/repos/[repoId]/specs/[...specPath]` — Spec Detail

- **Purpose**: Shows a single spec with user journeys, scenarios, requirements, and success criteria.
- **Expected elements**:
  - Spec title and status
  - One or more `MockUserJourney` sections with priority badges and descriptions
  - List of acceptance scenarios rendered as Given/When/Then rows
  - Sections for requirements and success criteria
  - Tabs or toggles for “Detail” and “History”
  - Placeholder sections for Tasks, Tests & Results, Validation, and Deployment Status
- **Navigation**:
  - “Edit” action → `/mock/repos/[repoId]/specs/[...specPath]/edit`
  - “History” tab → `/mock/repos/[repoId]/specs/[...specPath]/history`

#### `/mock/repos/[repoId]/specs/[...specPath]/edit` — Spec Edit View (Mock)

- **Purpose**: Simulates editing a spec via form controls.
- **Expected elements**:
  - Form fields mirroring the spec detail view (title, journeys, scenarios, requirements, success criteria)
  - Clear indication that edits are not persisted (mock-only)
  - Primary “Save” action and a secondary “Cancel” or “Back” action
- **Navigation**:
  - “Save” → returns to spec detail view with updated mock values or a simple success message
  - “Cancel/Back” → returns to spec detail view without applying changes

#### `/mock/repos/[repoId]/specs/[...specPath]/history` — History & Placeholders

- **Purpose**: Shows a mock history list and demonstrates how diff/changes might be represented.
- **Expected elements**:
  - List of `MockHistoryEntry` items with author, timestamp, and summary
  - Optional simple “diff-style” rows indicating changed fields
  - Clear copy that this is mock history, not real Git data
- **Navigation**:
  - Selecting a history item may update a simple diff area or highlighted changes; navigation should remain within the mock.

### Mock Data Contract

- There MUST be at least:
  - One `MockUserSession`
  - One `MockRepository` with:
    - At least one branch
    - At least two `MockSpecSummary` entries
  - Two corresponding `MockSpec` entities with journeys and scenarios populated
  - One or more `MockHistoryEntry` items for at least one spec
- Mock data MUST be consistent across:
  - Overview and detail (same spec id, title, and status)
  - Detail and edit (same fields pre-filled)
  - Detail and history (history entries refer to the same spec id)

### Behavioural Constraints

- No network calls to external APIs are made from mock routes.
- “Save”, “Connect”, and other actions MAY update in-memory state for the duration of the session but MUST NOT persist data.
- All screens and messages MUST be safe to show to non-technical stakeholders and SHOULD avoid raw error objects or technical stack traces.

