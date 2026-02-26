/**
 * Shared test fixtures for the Spec Editor MVP test suite.
 * These represent realistic SpecKit-format spec files and their expected
 * parsed representations. Used across unit, contract, and E2E tests.
 */

import type {
  FeatureSpec,
  UserJourney,
  AcceptanceScenario,
  FunctionalRequirement,
  SuccessCriterion,
  CommitSummary,
  ChangedField,
  GitRepository,
  SpecArtifact,
} from "@/types/index";

// ---------------------------------------------------------------------------
// Raw markdown fixtures
// ---------------------------------------------------------------------------

/** A valid, fully-populated SpecKit feature spec in markdown format. */
export const VALID_SPEC_MARKDOWN = `# Feature Specification: User Authentication

**Feature Branch**: \`001-user-auth\`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Allow users to sign in with GitHub OAuth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 – User Signs In with GitHub (Priority: P1)

A user visits the application for the first time and signs in using their GitHub
account via OAuth. After authorization, they land on the dashboard.

**Why this priority**: Authentication is the prerequisite for all other interactions.

**Independent Test**: Can be fully tested by visiting the app, clicking Sign in,
completing GitHub OAuth, and confirming the dashboard loads.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they visit the app root, **Then**
   they are shown a sign-in page with a "Sign in with GitHub" button.
2. **Given** the user clicks "Sign in with GitHub", **When** OAuth completes
   successfully, **Then** they are redirected to the dashboard.
3. **Given** the user is already signed in, **When** they visit the login page,
   **Then** they are redirected to the dashboard.

---

### User Story 2 – User Signs Out (Priority: P2)

An authenticated user can sign out of the application at any time.

**Why this priority**: Basic security hygiene; users must be able to end sessions.

**Independent Test**: Click sign-out button; verify redirect to login page and
session cookie cleared.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they click "Sign out", **Then**
   they are signed out and redirected to the login page.

---

### Edge Cases

- What happens when GitHub OAuth fails or is denied? The user MUST see a
  non-technical error message and a button to try again.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support user authentication via GitHub OAuth.
- **FR-002**: Authenticated users MUST be able to sign out at any time.

### Key Entities *(include if feature involves data)*

- **User**: An authenticated person. Attributes: id, displayName, email, avatarUrl, role.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can complete sign-in in under 2 minutes without assistance.
- **SC-002**: Session persists across browser tab reloads for up to 24 hours.
`;

/** A minimal valid spec — only the required fields, one P1 journey. */
export const MINIMAL_SPEC_MARKDOWN = `# Feature Specification: Minimal Feature

**Feature Branch**: \`002-minimal\`
**Created**: 2026-02-01
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Basic Action (Priority: P1)

A user performs the basic action.

**Acceptance Scenarios**:

1. **Given** the initial state, **When** the action occurs, **Then** the result appears.

---

### Edge Cases

- None identified.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST perform the basic action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User completes the basic action in under 1 minute.
`;

/** A spec with an "active" status set via frontmatter. */
export const ACTIVE_STATUS_SPEC_MARKDOWN = `# Feature Specification: Active Feature

**Feature Branch**: \`003-active\`
**Created**: 2026-02-10
**Status**: Active

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Active Journey (Priority: P1)

An active journey description.

**Acceptance Scenarios**:

1. **Given** state, **When** action, **Then** result.

---

### Edge Cases

- None.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST do something active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Active criterion.
`;

/** A spec markdown that is malformed (unparseable structure). */
export const MALFORMED_SPEC_MARKDOWN = `# Just a heading with no spec structure

This is some random text that does not follow the SpecKit format at all.
No user stories. No requirements. No success criteria.
`;

/** Markdown with no P1 journey — should fail structural validation. */
export const NO_P1_JOURNEY_SPEC_MARKDOWN = `# Feature Specification: No P1 Feature

**Feature Branch**: \`004-no-p1\`
**Created**: 2026-02-15
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Low Priority Journey (Priority: P2)

A P2-only journey.

**Acceptance Scenarios**:

1. **Given** state, **When** action, **Then** result.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Something.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Something measurable.
`;

// ---------------------------------------------------------------------------
// Parsed FeatureSpec object fixtures
// ---------------------------------------------------------------------------

export const JOURNEY_1_SCENARIOS: AcceptanceScenario[] = [
  { index: 1, given: "the user is unauthenticated", when: "they visit the app root", then: 'they are shown a sign-in page with a "Sign in with GitHub" button' },
  { index: 2, given: 'the user clicks "Sign in with GitHub"', when: "OAuth completes successfully", then: "they are redirected to the dashboard" },
  { index: 3, given: "the user is already signed in", when: "they visit the login page", then: "they are redirected to the dashboard" },
];

export const JOURNEY_2_SCENARIOS: AcceptanceScenario[] = [
  { index: 1, given: "the user is authenticated", when: 'they click "Sign out"', then: "they are signed out and redirected to the login page" },
];

export const JOURNEY_1: UserJourney = {
  index: 1,
  title: "User Signs In with GitHub",
  priority: "P1",
  description: "A user visits the application for the first time and signs in using their GitHub\naccount via OAuth. After authorization, they land on the dashboard.",
  whyThisPriority: "Authentication is the prerequisite for all other interactions.",
  independentTest: "Can be fully tested by visiting the app, clicking Sign in,\ncompleting GitHub OAuth, and confirming the dashboard loads.",
  acceptanceScenarios: JOURNEY_1_SCENARIOS,
};

export const JOURNEY_2: UserJourney = {
  index: 2,
  title: "User Signs Out",
  priority: "P2",
  description: "An authenticated user can sign out of the application at any time.",
  whyThisPriority: "Basic security hygiene; users must be able to end sessions.",
  independentTest: "Click sign-out button; verify redirect to login page and\nsession cookie cleared.",
  acceptanceScenarios: JOURNEY_2_SCENARIOS,
};

export const FUNCTIONAL_REQUIREMENTS: FunctionalRequirement[] = [
  { id: "FR-001", description: "The system MUST support user authentication via GitHub OAuth." },
  { id: "FR-002", description: "Authenticated users MUST be able to sign out at any time." },
];

export const SUCCESS_CRITERIA: SuccessCriterion[] = [
  { id: "SC-001", description: "User can complete sign-in in under 2 minutes without assistance." },
  { id: "SC-002", description: "Session persists across browser tab reloads for up to 24 hours." },
];

export const PARSED_VALID_SPEC: FeatureSpec = {
  artifactPath: "specs/001-user-auth/spec.md",
  title: "Feature Specification: User Authentication",
  featureBranch: "001-user-auth",
  createdDate: "2026-01-15",
  status: "draft",
  journeys: [JOURNEY_1, JOURNEY_2],
  edgeCases: [
    "What happens when GitHub OAuth fails or is denied? The user MUST see a non-technical error message and a button to try again.",
  ],
  functionalRequirements: FUNCTIONAL_REQUIREMENTS,
  keyEntities: [
    { name: "User", description: "An authenticated person. Attributes: id, displayName, email, avatarUrl, role." },
  ],
  successCriteria: SUCCESS_CRITERIA,
};

/** A modified version of PARSED_VALID_SPEC for diff testing. */
export const PARSED_MODIFIED_SPEC: FeatureSpec = {
  ...PARSED_VALID_SPEC,
  title: "Feature Specification: User Authentication (Updated)",
  status: "active",
  journeys: [
    { ...JOURNEY_1, title: "User Signs In with GitHub OAuth", priority: "P1" },
    JOURNEY_2,
    {
      index: 3,
      title: "User Resets Session",
      priority: "P3",
      description: "A user can force-expire their own session.",
      whyThisPriority: "Security feature.",
      independentTest: null,
      acceptanceScenarios: [],
    },
  ],
  functionalRequirements: [
    ...FUNCTIONAL_REQUIREMENTS,
    { id: "FR-003", description: "Users MUST be able to force-expire their session." },
  ],
};

// ---------------------------------------------------------------------------
// CommitSummary fixtures
// ---------------------------------------------------------------------------

export const COMMIT_INITIAL: CommitSummary = {
  sha: "abc1234567890abcdef1234567890abcdef123456",
  shortSha: "abc1234",
  author: "Alice Product",
  authorAvatarUrl: "https://avatars.githubusercontent.com/u/12345",
  timestamp: "2026-01-15T10:00:00Z",
  rawMessage: "Add spec: User Authentication",
  plainLanguageSummary: "Initial creation",
  changedFields: [],
};

export const COMMIT_UPDATE: CommitSummary = {
  sha: "def5678901234def5678901234def5678901234",
  shortSha: "def5678",
  author: "Alice Product",
  authorAvatarUrl: "https://avatars.githubusercontent.com/u/12345",
  timestamp: "2026-02-15T14:30:00Z",
  rawMessage: "Update spec: User Authentication — Updated journey 1 title; changed status to active",
  plainLanguageSummary: "Updated journey 1 title; changed status to active",
  changedFields: [
    { fieldLabel: "Journey 1 title", changeType: "updated", before: "User Signs In with GitHub", after: "User Signs In with GitHub OAuth" },
    { fieldLabel: "Status", changeType: "updated", before: "draft", after: "active" },
  ],
};

// ---------------------------------------------------------------------------
// GitRepository fixture
// ---------------------------------------------------------------------------

export const MOCK_REPO: GitRepository = {
  id: "acme-corp/my-product",
  userId: "gh-user-42",
  host: "github",
  owner: "acme-corp",
  name: "my-product",
  defaultBranch: "main",
  activeBranch: "main",
  authMode: "oauth_token",
  specRootDir: "specs",
  connectedAt: "2026-02-26T09:00:00Z",
};

// ---------------------------------------------------------------------------
// SpecArtifact fixtures
// ---------------------------------------------------------------------------

export const MOCK_SPEC_ARTIFACT: SpecArtifact = {
  repoId: "acme-corp/my-product",
  path: "specs/001-user-auth/spec.md",
  type: "feature_spec",
  branch: "main",
  sha: "blobsha123",
  lastCommitSha: COMMIT_UPDATE.sha,
  lastAuthor: "Alice Product",
  lastModifiedAt: "2026-02-15T14:30:00Z",
  deploymentRef: null,
};

// ---------------------------------------------------------------------------
// GitHub API mock responses
// ---------------------------------------------------------------------------

/** Simulates a GitHub Contents API response for a spec file. */
export function makeGitHubContentsResponse(markdown: string, sha = "blobsha123") {
  return {
    type: "file" as const,
    encoding: "base64" as const,
    size: markdown.length,
    name: "spec.md",
    path: "specs/001-user-auth/spec.md",
    content: Buffer.from(markdown).toString("base64") + "\n",
    sha,
    url: "https://api.github.com/repos/acme-corp/my-product/contents/specs/001-user-auth/spec.md",
    download_url: null,
    html_url: "https://github.com/acme-corp/my-product/blob/main/specs/001-user-auth/spec.md",
    git_url: null,
    _links: { self: "", git: "", html: "" },
  };
}

/** Simulates a GitHub Commits API response for file history. */
export function makeGitHubCommitListResponse() {
  return [
    {
      sha: COMMIT_UPDATE.sha,
      commit: {
        author: { name: "Alice Product", date: COMMIT_UPDATE.timestamp },
        message: COMMIT_UPDATE.rawMessage,
      },
      author: { login: "alice", avatar_url: COMMIT_UPDATE.authorAvatarUrl },
    },
    {
      sha: COMMIT_INITIAL.sha,
      commit: {
        author: { name: "Alice Product", date: COMMIT_INITIAL.timestamp },
        message: COMMIT_INITIAL.rawMessage,
      },
      author: { login: "alice", avatar_url: COMMIT_INITIAL.authorAvatarUrl },
    },
  ];
}

/** Simulates a GitHub repo tree response containing spec files. */
export function makeGitHubTreeResponse() {
  return {
    sha: "treetreee",
    url: "",
    truncated: false,
    tree: [
      { path: "specs/001-user-auth/spec.md", type: "blob", sha: "blobsha123" },
      { path: "specs/001-user-auth/plan.md", type: "blob", sha: "blobsha456" },
      { path: "specs/001-user-auth/tasks.md", type: "blob", sha: "blobsha789" },
      { path: "specs/002-repo-connect/spec.md", type: "blob", sha: "blobsha222" },
      { path: ".specify/memory/constitution.md", type: "blob", sha: "blobsha333" },
      { path: "README.md", type: "blob", sha: "blobsha000" }, // should be ignored
    ],
  };
}
