# Data Model: Spec Editor MVP

**Branch**: `001-spec-editor-mvp` | **Date**: 2026-02-26
**Phase 1 output** for [plan.md](./plan.md)

This document defines all entities, their fields, relationships, validation rules,
and state transitions for the Spec Editor MVP. Entities marked "(future)" are
reserved for subsequent releases; their structure is defined here so implementations
do not need to reverse-engineer them later.

---

## Entity Relationship Overview

```
User
 └── [has many] GitRepository (via UserRepo mapping)

GitRepository
 └── [has many] SpecArtifact (derived from Git tree, not stored)

SpecArtifact
 └── [parsed into] FeatureSpec | Plan | TaskSet | OtherSpec
     └── FeatureSpec
          └── [has ordered list] UserJourney
               └── [has ordered list] AcceptanceScenario

CommitSummary
 └── [belongs to] SpecArtifact (via file path)
```

No relational database is used in MVP. All spec content is stored in Git (GitHub API).
The only persistent store in MVP is the session JWT (Auth.js encrypted cookie) and the
user-to-repo mapping (stored in a lightweight JSON file in the repo itself or in the
session, per Decision 1/2 from research.md).

---

## Entity: User

Represents an authenticated person using the application.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `string` | Auth.js sub / GitHub user ID | Required; unique |
| `provider` | `"github"` | Identity provider | Required; `"github"` only in MVP |
| `providerAccountId` | `string` | GitHub user ID (numeric, as string) | Required |
| `displayName` | `string` | GitHub display name | Required |
| `email` | `string \| null` | Primary email from GitHub | May be null if hidden |
| `avatarUrl` | `string` | GitHub avatar URL | Required |
| `role` | `"viewer" \| "editor" \| "admin"` | App-level role | Default: `"editor"` for first user per repo; otherwise `"viewer"` |
| `createdAt` | `string` | ISO 8601 timestamp of first login | Set by Auth.js on first sign-in |
| `githubAccessToken` | `string` | OAuth access token (from Auth.js session) | Never exposed to client; used server-side only |

### Validation Rules

- `id` MUST be present and non-empty.
- `githubAccessToken` MUST be scoped to at minimum `repo` (read) access to allow
  reading spec files. Write path requires `repo` (write) scope.
- If `email` is null, the UI MUST display `displayName` as the primary identifier.

### State

User state is managed entirely by Auth.js. No user record is persisted separately
in MVP. The session cookie holds `id`, `displayName`, `avatarUrl`, and
`githubAccessToken` (encrypted).

---

## Entity: GitRepository

Represents a GitHub repository that the user has connected to the Spec Editor.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `string` | `"{owner}/{repo}"` — GitHub full name | Required; unique per user |
| `userId` | `string` | Owning User ID | Required; FK to User |
| `host` | `"github"` | Git provider | Required; `"github"` only in MVP |
| `owner` | `string` | GitHub org or user login | Required; lowercase |
| `name` | `string` | Repository name | Required |
| `defaultBranch` | `string` | Default branch (e.g., `"main"`) | Required; set on connect |
| `activeBranch` | `string` | Currently selected branch in UI | Default: `defaultBranch` |
| `authMode` | `"oauth_token" \| "pat"` | How the app authenticates to this repo | Required |
| `specRootDir` | `string` | Detected/configured spec directory | Default: `"specs"` |
| `connectedAt` | `string` | ISO 8601 timestamp of connection | Set on first connection |

### Validation Rules

- `owner` and `name` together MUST resolve to an accessible GitHub repository given
  the user's access token.
- `specRootDir` MUST be a valid path string (no leading `/`, no `..` traversal).
- Connection MUST fail with a descriptive error if the API returns 404 or 403.

### State

Stored client-side (in the session cookie or localStorage) in MVP, since there is no
database. Maximum 10 connected repositories per user in MVP.

---

## Entity: SpecArtifact

Represents a spec file detected in a connected Git repository. Not stored — derived
on demand from the GitHub API.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `repoId` | `string` | Parent GitRepository ID | Required |
| `path` | `string` | Full file path relative to repo root | Required; e.g., `"specs/001-auth/spec.md"` |
| `type` | `SpecArtifactType` | Detected type of spec file | Required; see enum below |
| `branch` | `string` | Git branch this artifact belongs to | Required |
| `contentBase64` | `string` | Base64-encoded file content (from GitHub API) | Required when loaded |
| `sha` | `string` | Git blob SHA for the current version | Required for write operations |
| `lastCommitSha` | `string` | SHA of most recent commit touching this file | Optional; loaded lazily |
| `lastAuthor` | `string` | Display name of last committer | Optional; loaded lazily |
| `lastModifiedAt` | `string` | ISO 8601 timestamp of last commit | Optional; loaded lazily |
| `deploymentRef` | `string \| null` | Reserved for future CI/CD mapping | Always `null` in MVP |

### SpecArtifactType Enum

```typescript
type SpecArtifactType =
  | "feature_spec"      // specs/{###-name}/spec.md — SpecKit feature spec
  | "plan"              // specs/{###-name}/plan.md — SpecKit implementation plan
  | "tasks"             // specs/{###-name}/tasks.md — SpecKit task list
  | "research"          // specs/{###-name}/research.md
  | "data_model"        // specs/{###-name}/data-model.md
  | "quickstart"        // specs/{###-name}/quickstart.md
  | "constitution"      // .specify/memory/constitution.md
  | "other_spec";       // Any other detected markdown file in spec directories
```

### Detection Logic

1. Scan `specs/` directory tree from GitHub API.
2. Match filenames to types using exact name matches (e.g., `spec.md` → `feature_spec`,
   `plan.md` → `plan`, `tasks.md` → `tasks`).
3. Any `.md` file in a `specs/` subdirectory not matching known names → `other_spec`.
4. `constitution.md` in `.specify/memory/` → `constitution`.

---

## Entity: FeatureSpec

A structured representation of a SpecKit feature spec file. Derived by parsing a
`SpecArtifact` of type `feature_spec`. Not stored separately.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `artifactPath` | `string` | Source SpecArtifact path | Required |
| `title` | `string` | Feature title (from H1 heading) | Required |
| `featureBranch` | `string \| null` | Value of "Feature Branch" metadata line | Optional |
| `createdDate` | `string \| null` | Value of "Created" metadata line | Optional |
| `status` | `SpecStatus` | Parsed or derived status | Default: `"draft"` |
| `journeys` | `UserJourney[]` | Ordered list of user journeys | Required; at least 1 in valid spec |
| `edgeCases` | `string[]` | List of edge case descriptions | Optional |
| `functionalRequirements` | `FunctionalRequirement[]` | FR list | Optional |
| `keyEntities` | `KeyEntity[]` | Entity descriptions | Optional |
| `successCriteria` | `SuccessCriterion[]` | SC list | Optional |

### SpecStatus Enum

```typescript
type SpecStatus =
  | "draft"       // Default; spec exists but may be incomplete
  | "active"      // Spec is in active development
  | "implemented" // All journeys implemented
  | "archived";   // Spec is deprecated or replaced
```

Status is derived from metadata in the spec file's frontmatter if present; otherwise
defaults to `"draft"`.

### Validation Rules

- A `FeatureSpec` MUST have at least one `UserJourney` with priority `"P1"` to be
  considered structurally valid.
- All `FunctionalRequirement` IDs MUST follow the pattern `FR-{NNN}`.
- All `SuccessCriterion` IDs MUST follow the pattern `SC-{NNN}`.

---

## Entity: UserJourney

A sub-entity within FeatureSpec representing a single user story / journey.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `index` | `number` | 1-based position in spec | Required; determines order |
| `title` | `string` | Journey title | Required; non-empty |
| `priority` | `string` | Priority label (P1, P2, P3, …) | Required; MUST match pattern `P\d+` |
| `description` | `string` | Plain-language journey description | Required |
| `whyThisPriority` | `string \| null` | Rationale for priority | Optional |
| `independentTest` | `string \| null` | How to test independently | Optional |
| `acceptanceScenarios` | `AcceptanceScenario[]` | Ordered list of Given/When/Then scenarios | Optional; recommended |

---

## Entity: AcceptanceScenario

A single Given/When/Then acceptance scenario within a UserJourney.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `index` | `number` | 1-based position within the journey | Required |
| `given` | `string` | Initial state | Required |
| `when` | `string` | User or system action | Required |
| `then` | `string` | Expected outcome | Required |

---

## Entity: CommitSummary

A human-readable summary of a Git commit that touches a specific spec file. Derived
from the GitHub Commits API; not stored.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `sha` | `string` | Full commit SHA | Required |
| `shortSha` | `string` | First 7 chars of SHA | Derived |
| `author` | `string` | Committer's display name | Required |
| `authorAvatarUrl` | `string \| null` | Committer's avatar URL | Optional |
| `timestamp` | `string` | ISO 8601 commit timestamp | Required |
| `rawMessage` | `string` | Original Git commit message | Required |
| `plainLanguageSummary` | `string` | Human-readable summary derived from message | Required; generated by `lib/spec-writer/commit-message.ts` logic in reverse |
| `changedFields` | `ChangedField[]` | List of spec fields changed in this commit | Optional; populated when diff is loaded |

### ChangedField

| Field | Type | Description |
|-------|------|-------------|
| `fieldLabel` | `string` | Human-readable field name (e.g., "Journey 1 priority") |
| `changeType` | `"added" \| "updated" \| "removed"` | Nature of change |
| `before` | `string \| null` | Previous value (null if added) |
| `after` | `string \| null` | New value (null if removed) |

---

## Future Entities (Reserved)

### TaskSet (future)

Container for the structured task list from a `tasks.md` file.

Reserved fields: `artifactPath`, `featureBranch`, `phases` (array of phases, each with
tasks), `totalTasks`, `completedTasks`.

### ValidationStatus (future)

Roll-up of validation check results for a SpecArtifact or FeatureSpec.

Reserved fields: `artifactPath`, `checkResults` (array of `{checkId, pass, message}`),
`overallStatus` (`pass | warn | fail`), `runAt`.

### DeploymentStatus (future)

Mapping from a feature/spec to deployment environments.

Reserved fields: `featureBranch`, `environments` (array of `{name, status, url,
deployedAt}`).

---

## Type Definitions Summary

```typescript
// Canonical TypeScript types for src/types/index.ts

type SpecArtifactType =
  | "feature_spec" | "plan" | "tasks" | "research"
  | "data_model" | "quickstart" | "constitution" | "other_spec";

type SpecStatus = "draft" | "active" | "implemented" | "archived";

interface User {
  id: string;
  provider: "github";
  providerAccountId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string;
  role: "viewer" | "editor" | "admin";
  createdAt: string;
}

interface GitRepository {
  id: string;
  userId: string;
  host: "github";
  owner: string;
  name: string;
  defaultBranch: string;
  activeBranch: string;
  authMode: "oauth_token" | "pat";
  specRootDir: string;
  connectedAt: string;
}

interface SpecArtifact {
  repoId: string;
  path: string;
  type: SpecArtifactType;
  branch: string;
  contentBase64?: string;
  sha?: string;
  lastCommitSha?: string;
  lastAuthor?: string;
  lastModifiedAt?: string;
  deploymentRef: string | null;
}

interface AcceptanceScenario {
  index: number;
  given: string;
  when: string;
  then: string;
}

interface UserJourney {
  index: number;
  title: string;
  priority: string;
  description: string;
  whyThisPriority: string | null;
  independentTest: string | null;
  acceptanceScenarios: AcceptanceScenario[];
}

interface FunctionalRequirement {
  id: string; // FR-001, FR-002, …
  description: string;
}

interface KeyEntity {
  name: string;
  description: string;
}

interface SuccessCriterion {
  id: string; // SC-001, SC-002, …
  description: string;
}

interface FeatureSpec {
  artifactPath: string;
  title: string;
  featureBranch: string | null;
  createdDate: string | null;
  status: SpecStatus;
  journeys: UserJourney[];
  edgeCases: string[];
  functionalRequirements: FunctionalRequirement[];
  keyEntities: KeyEntity[];
  successCriteria: SuccessCriterion[];
}

interface ChangedField {
  fieldLabel: string;
  changeType: "added" | "updated" | "removed";
  before: string | null;
  after: string | null;
}

interface CommitSummary {
  sha: string;
  shortSha: string;
  author: string;
  authorAvatarUrl: string | null;
  timestamp: string;
  rawMessage: string;
  plainLanguageSummary: string;
  changedFields: ChangedField[];
}
```
