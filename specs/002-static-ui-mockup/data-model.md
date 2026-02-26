## Data Model: Static Front-End Mockup

This feature models only the data needed to render realistic mock screens. All entities are in-memory and never persisted or fetched from real services.

### Entity: MockUserSession

- **Description**: Represents an authenticated user purely for UI purposes.
- **Fields**:
  - `id: string` — opaque mock identifier
  - `name: string` — display name used in headers/avatars
  - `avatarUrl?: string` — optional avatar image for the header
  - `role: "viewer" | "editor"` — used to toggle edit controls in the UI
- **Relationships**:
  - Owns zero or more `MockRepository` entries.
- **Validation**:
  - `name` must be non-empty.

### Entity: MockRepository

- **Description**: A connected Git repository shown in the dashboard and repo overview screens.
- **Fields**:
  - `id: string` — internal identifier for linking routes
  - `owner: string` — GitHub-style owner (e.g. `structief`)
  - `name: string` — repository name (e.g. `spec-editor-mvp`)
  - `defaultBranch: string` — branch label (e.g. `main`)
  - `branches: string[]` — list of branch names for selectors
  - `specs: MockSpecSummary[]` — specs associated with this repo/branch
- **Relationships**:
  - Referenced from dashboard “connected repos” and repo overview screens.
- **Validation**:
  - `owner`, `name`, and `defaultBranch` must be non-empty.

### Entity: MockSpecSummary

- **Description**: Lightweight representation of a spec for list/overview screens.
- **Fields**:
  - `id: string` — unique identifier used in routes
  - `title: string` — feature spec title
  - `status: "Proposed" | "In Progress" | "Validated"` — simple status badge
  - `priority: "P1" | "P2" | "P3"` — journey priority for visual emphasis
  - `summary: string` — short description for cards
  - `lastUpdated: string` — human-readable timestamp (e.g. `2026-02-26`)
  - `lastAuthor: string` — display name for history preview
- **Relationships**:
  - Links to a `MockSpec` with the same `id`.

### Entity: MockSpec

- **Description**: Full mock representation of a feature spec used in detail/edit/history views.
- **Fields**:
  - `id: string` — identifier matching `MockSpecSummary.id`
  - `title: string`
  - `status: "Proposed" | "In Progress" | "Validated"`
  - `journeys: MockUserJourney[]`
  - `requirements: string[]` — high-level requirements bullets
  - `successCriteria: string[]` — list of success criteria descriptions
- **Relationships**:
  - Aggregates `MockUserJourney` instances.
  - Linked from `MockHistoryEntry` to show what changed (descriptively).

### Entity: MockUserJourney

- **Description**: Represents a single user journey with acceptance scenarios.
- **Fields**:
  - `id: string`
  - `title: string`
  - `priority: "P1" | "P2" | "P3"`
  - `description: string`
  - `acceptanceScenarios: MockAcceptanceScenario[]`
- **Relationships**:
  - Owned by `MockSpec`.

### Entity: MockAcceptanceScenario

- **Description**: Given/When/Then scenario rendered in both detail and edit views.
- **Fields**:
  - `id: string`
  - `given: string`
  - `when: string`
  - `then: string`
- **Validation**:
  - All three fields must be non-empty to be shown.

### Entity: MockHistoryEntry

- **Description**: One item in the mock History tab for a spec.
- **Fields**:
  - `id: string`
  - `specId: string` — links back to `MockSpec`
  - `timestamp: string` — human-readable time
  - `author: string`
  - `summary: string` — plain-language change description
- **Relationships**:
  - A `MockSpec` has zero or more `MockHistoryEntry` items displayed in its History view.

### Entity: MockPlaceholderSection

- **Description**: Represents future sections (Tasks, Tests & Results, Validation, Deployment Status).
- **Fields**:
  - `id: "tasks" | "tests" | "validation" | "deployment"`
  - `title: string`
  - `description: string` — short “coming soon” message
- **Usage**:
  - Used to render collapsible placeholders on spec detail screens, aligning with the Spec Editor MVP vision while remaining clearly non-functional in this mock.

