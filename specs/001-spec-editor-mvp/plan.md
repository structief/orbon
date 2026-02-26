# Implementation Plan: Spec Editor MVP

**Branch**: `001-spec-editor-mvp` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-spec-editor-mvp/spec.md`

## Summary

Deliver a browser-based web application (Next.js, TypeScript) that lets non-technical
users log in via GitHub OAuth, connect Git repositories, and visually view, edit, and
version feature specifications stored in those repos. Edits are committed back to Git
automatically. Version history and diffs are presented in plain-language form. The
architecture reserves clear hooks for future task tracking, test review, validation,
and deployment status features.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS
**Primary Dependencies**:
- Next.js 15 (App Router, Server Actions, API routes)
- React 19
- Tailwind CSS 4 + shadcn/ui component library
- Auth.js v5 (NextAuth) for GitHub OAuth
- Octokit (`@octokit/rest`) for GitHub API
- gray-matter for parsing YAML frontmatter in spec files
- remark / unified for markdown parsing and rendering
- Zod for schema validation
- next-safe-action for type-safe server actions

**Storage**: GitHub as primary data store; no dedicated database in MVP. Sessions
managed via Auth.js with JWT strategy (encrypted cookie). Connected repo metadata
(owner, name, active branch, auth mode) is stored in the encrypted session cookie
alongside the PAT — no server-side persistence layer required. This was confirmed
during research: the session-cookie approach is sufficient for MVP scale (single user,
up to ~10 connected repos).

**Testing**: Vitest (unit), React Testing Library (component), Playwright (E2E)

**Target Platform**: Vercel (primary), or any Node.js 20 container runtime (Docker)

**Project Type**: Full-stack web application (Next.js monorepo)

**Performance Goals**:
- Spec list for up to 50 specs: < 2s initial load
- Spec detail view: < 1s navigation
- Commit/save roundtrip: < 3s on standard broadband

**Constraints**:
- All spec reads/writes MUST go through the GitHub API — no server-side git clone
- App MUST NOT bypass repo-level GitHub permissions
- UI MUST be safe for non-technical edits (no raw markdown exposed in edit path)
- WCAG 2.1 AA compliance required for all P1 journey screens

**Scale/Scope**: Small-to-medium product teams (2–20 users per repo connection);
up to 100 spec files per repo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

Evaluated against **Spec Editor Constitution v1.0.0**
(`.specify/memory/constitution.md`):

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Git-Backed Specification Source of Truth** | PARTIAL — JUSTIFIED | All reads use GitHub Contents API; all writes produce Git commits via GitHub API. No shadow store for spec content. "Restore or branch from previous versions" is deferred — MVP provides view and diff only. See Complexity Tracking. |
| **II. Visual, Non-Technical-Friendly Collaboration** | PASS | All P1 journeys use structured forms; raw markdown is never exposed in the edit path. |
| **III. User-Journey-First Planning & Delivery** | PARTIAL — JUSTIFIED | spec.md is organized by user journeys (US1–US5) with explicit priorities. Sprint/time-box mapping is deferred to a future task-tracking feature. See Complexity Tracking. |
| **IV. End-to-End Traceability Across Lifecycle** | PARTIAL — JUSTIFIED | MVP delivers spec ↔ Git history traceability. Tasks/tests/validation/deploy hooks are reserved but not implemented. This is intentional and documented (see Future-Facing Hooks below). |
| **V. Safety, Roles & Governance** | PARTIAL — JUSTIFIED | Role-based access (viewer/editor), safe commit flows with confirmation for destructive actions, audit trail via Git history. Review/approval workflow for major spec changes is deferred. See Complexity Tracking. |

**Intentional Deviations**:

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No database in MVP | Reduces infrastructure complexity; GitHub API provides sufficient persistence for specs | Adding a DB (e.g., PostgreSQL) in MVP would require migrations, hosting costs, and backup strategy before the product is validated |
| GitHub-only provider in MVP | Limits API surface; allows focus on correct UX patterns before generalizing | Supporting GitLab/Bitbucket simultaneously would triple the integration code without user validation |

## Project Structure

### Documentation (this feature)

```text
specs/001-spec-editor-mvp/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    ├── auth-api.md
    ├── repos-api.md
    ├── specs-api.md
    └── history-api.md
```

### Source Code (repository root)

```text
# Web application (Next.js App Router monorepo)
src/
├── app/                        # Next.js App Router pages and layouts
│   ├── (auth)/                 # Auth group — login, callback
│   │   ├── login/page.tsx
│   │   └── auth/[...nextauth]/route.ts
│   ├── (dashboard)/            # Authenticated app shell
│   │   ├── layout.tsx          # Sidebar + header shell
│   │   ├── page.tsx            # Repository dashboard
│   │   ├── repos/
│   │   │   ├── connect/page.tsx
│   │   │   └── [repoId]/
│   │   │       ├── page.tsx    # Spec overview for a repo
│   │   │       └── specs/
│   │   │           └── [specPath]/
│   │   │               ├── page.tsx      # Spec detail view
│   │   │               ├── edit/page.tsx # Visual editor
│   │   │               └── history/page.tsx
│   └── api/
│       └── [...route]/          # API routes for GitHub webhooks / server callbacks
├── components/
│   ├── ui/                     # shadcn/ui primitives (generated)
│   ├── spec/                   # Spec-specific components
│   │   ├── SpecCard.tsx
│   │   ├── SpecDetailView.tsx
│   │   ├── SpecEditor.tsx
│   │   ├── JourneyCard.tsx
│   │   ├── JourneyEditor.tsx
│   │   ├── AcceptanceScenarioList.tsx
│   │   └── FuturePlaceholderSection.tsx
│   ├── repo/
│   │   ├── RepoConnectForm.tsx
│   │   ├── RepoCard.tsx
│   │   └── BranchSelector.tsx
│   └── shared/
│       ├── CommitHistoryList.tsx
│       ├── DiffViewer.tsx
│       └── ConflictDialog.tsx
├── lib/
│   ├── auth/
│   │   └── config.ts           # Auth.js config (GitHub provider)
│   ├── github/
│   │   ├── client.ts           # Octokit wrapper / factory
│   │   ├── repos.ts            # Repo listing, validation
│   │   ├── contents.ts         # Read/write file contents via GitHub API
│   │   └── commits.ts          # Commit history, diff retrieval
│   ├── spec-parser/
│   │   ├── index.ts            # Orchestrator
│   │   ├── feature-spec.ts     # Parse SpecKit feature spec format
│   │   ├── plan.ts             # Parse plan format
│   │   └── types.ts            # Shared types for SpecArtifact, FeatureSpec, etc.
│   ├── spec-writer/
│   │   ├── index.ts
│   │   ├── feature-spec.ts     # Serialize FeatureSpec back to markdown
│   │   └── commit-message.ts   # Generate plain-language commit messages
│   └── validation/
│       └── index.ts            # Pluggable validator scaffold (basic structural checks)
└── types/
    └── index.ts                # Shared TypeScript types

tests/
├── unit/
│   ├── spec-parser/
│   └── spec-writer/
├── integration/
│   └── github/
└── e2e/
    ├── auth.spec.ts
    ├── repo-connect.spec.ts
    ├── spec-view.spec.ts
    ├── spec-edit.spec.ts
    └── spec-history.spec.ts
```

**Structure Decision**: Single Next.js App Router project. All backend logic lives
in server actions and API routes within the same project. No separate Express server
needed in MVP. The `lib/` split into `github/`, `spec-parser/`, `spec-writer/`, and
`validation/` ensures clean separation of concerns and makes each subsystem
independently testable and replaceable.

## Complexity Tracking

> **Intentional deviations from constitution documented here**

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Traceability (Principle IV) partially deferred | Tasks/tests/validation/deploy status are out of scope for MVP | Implementing them now would take >3× the MVP effort with no user validation |
| Restore/branch from history (Principle I bullet 4) deferred | Requires a branch-creation and file-restore workflow that adds significant API surface | Partial delivery (view + diff) still satisfies the core "Git-backed truth" intent; restore can be added in a follow-on sprint |
| Sprint/time-box mapping (Principle III bullet 3) deferred | Requires a task board and planning UI beyond the spec view/edit scope | Future `task_tracking` feature flag reserves the hook; MVP focus on core spec read/write path |
| Review/approval workflow (Principle V bullet 2) deferred | Formal stakeholder sign-off workflow requires notification, asynchronous review, and role-management UI | MVP first-connector role model provides minimum governance; approval flows can be layered in after user validation |

## Future-Facing Design Hooks

To avoid rework when future features are added:

- **Tasks**: `SpecArtifact` type enum includes `tasks`; UI reserves a `TasksSection`
  component stub on the spec detail page.
- **Tests & Results**: `SpecArtifact` type enum includes `test_spec`; a
  `TestsSection` component stub is rendered with a "Coming soon" state.
- **Validation**: `lib/validation/index.ts` is scaffolded as a pluggable registry
  (array of validators, each returning `{pass: boolean, message: string}`). MVP runs
  only structural checks; later validators can be registered without changing callers.
- **Deployment Status**: `DeploymentStatusSection` component stub; `SpecArtifact`
  has an optional `deploymentRef` field reserved for future CI/CD mapping.
