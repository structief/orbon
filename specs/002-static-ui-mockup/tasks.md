---
description: "Task list for Static Front-End Mockup for MVP Validation"
---

# Tasks: Static Front-End Mockup for MVP Validation

**Input**: Design documents from `/specs/002-static-ui-mockup/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`

**Tests**: This feature includes a small Playwright suite focused on the primary click-through journeys and secondary flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **App**: Next.js 15 App Router under `src/app/`
- **Mock experience**: `src/app/(mock)/...`
- **Components**: `src/components/mock/`, `src/components/ui/`
- **Mock data**: `src/lib/mock-data/`
- **E2E tests**: `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the static mock.

- [X] T001 Ensure Next.js 15 + React 18 app is configured with TypeScript and App Router in `src/app/` and root config files.
- [X] T002 [P] Configure Tailwind CSS base styles and theme in `tailwind.config.ts` and `src/app/globals.css`.
- [X] T003 [P] Install and initialize shadcn/ui primitives used by the mock in `src/components/ui/` and supporting config in `src/lib/utils.ts`.
- [X] T004 Create the `(mock)` route group entry layout and entry page shell in `src/app/(mock)/layout.tsx` and `src/app/(mock)/page.tsx`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Define shared mock data entities and initial seed data (user session, repository, specs, history, placeholders) in `src/lib/mock-data/index.ts`.
- [X] T006 [P] Create shared mock layout shell with header and navigation in `src/components/mock/MockLayout.tsx` and wire it into `src/app/(mock)/layout.tsx`.
- [X] T007 [P] Implement reusable UI primitives (buttons, cards, tabs, badges) used across mock routes in `src/components/ui/`.

**Checkpoint**: Foundation ready – user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 – Stakeholder Clicks Through Main User Journeys (Priority: P1) 🎯 MVP

**Goal**: Enable stakeholders to click through the main journeys (entry → dashboard → repo connect → spec overview → spec detail → edit) without any real backend.

**Independent Test**: Open `/mock`, navigate through sign-in, repo connect, overview, detail, and edit, confirming each screen appears with expected structure and mock content.

### Tests for User Story 1

- [X] T008 [P] [US1] Add Playwright E2E test for entry→dashboard→repo connect→spec overview→spec detail→edit journey in `tests/e2e/mock-clickthrough.spec.ts`.

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement entry sign-in/onboarding page with primary CTA routing to the dashboard in `src/app/(mock)/page.tsx`.
- [X] T010 [P] [US1] Implement post-auth dashboard page showing connected repo summary and navigation in `src/app/(mock)/dashboard/page.tsx`.
- [X] T011 [P] [US1] Implement repo connection mock flow with non-persistent form and success navigation in `src/app/(mock)/repos/connect/page.tsx`.
- [X] T012 [P] [US1] Implement spec overview page that lists specs for a mock repo and links to detail in `src/app/(mock)/repos/[repoId]/page.tsx`.
- [X] T013 [US1] Implement basic spec detail and edit pages with click-through navigation between overview, detail, and edit in `src/app/(mock)/repos/[repoId]/specs/[specId]/page.tsx` and `src/app/(mock)/repos/[repoId]/specs/[specId]/edit/page.tsx`.

**Checkpoint**: User Story 1 is fully navigable end-to-end and testable via Playwright.

---

## Phase 4: User Story 2 – Stakeholder Validates Layout and Content With Realistic Mock Data (Priority: P1)

**Goal**: Present realistic, consistent mock data across list, detail, and edit views so stakeholders can judge layout, density, and wording.

**Independent Test**: From spec overview, open a spec and confirm titles, statuses, summaries, journeys, requirements, and success criteria are plausible and consistent between overview, detail, and edit.

### Tests for User Story 2

- [X] T014 [P] [US2] Extend Playwright E2E test assertions for realistic mock titles, statuses, and consistency between overview and detail in `tests/e2e/mock-clickthrough.spec.ts`.

### Implementation for User Story 2

- [X] T015 [P] [US2] Define detailed mock specs with journeys, acceptance scenarios, requirements, and success criteria in `src/lib/mock-data/specs.ts` (imported by `src/lib/mock-data/index.ts`).
- [X] T016 [P] [US2] Render user journeys with priority badges and Given/When/Then acceptance scenarios in the spec detail view in `src/app/(mock)/repos/[repoId]/specs/[specId]/page.tsx`.
- [X] T017 [P] [US2] Render requirements and success criteria sections using mock data in `src/app/(mock)/repos/[repoId]/specs/[specId]/page.tsx`.
- [X] T018 [US2] Ensure edit view pre-fills form fields with the same mock content and maintains in-session consistency on mock "Save" in `src/app/(mock)/repos/[repoId]/specs/[specId]/edit/page.tsx`.

**Checkpoint**: User Story 2 provides realistic, consistent mock content for stakeholders to review.

---

## Phase 5: User Story 3 – Stakeholder Sees Secondary Flows and Placeholders (Priority: P2)

**Goal**: Expose secondary screens (history, placeholders, empty/error-like states) so stakeholders can validate placement and messaging.

**Independent Test**: From a spec detail, access history and placeholder sections, and navigate to at least one empty or error-style state, confirming labels and copy match expectations.

### Tests for User Story 3

- [X] T019 [P] [US3] Add Playwright E2E test for history tab and placeholder sections visibility and basic behaviour in `tests/e2e/mock-secondary-flows.spec.ts`.

### Implementation for User Story 3

- [X] T020 [P] [US3] Implement history page showing mock history entries with author, timestamp, and summary in `src/app/(mock)/repos/[repoId]/specs/[specId]/history/page.tsx`.
- [X] T021 [P] [US3] Implement placeholder sections (Tasks, Tests & Results, Validation, Deployment Status) driven by `MockPlaceholderSection` data in `src/app/(mock)/repos/[repoId]/specs/[specId]/page.tsx`.
- [X] T022 [P] [US3] Implement at least one empty-state view for "no repos" or "no specs" in `src/app/(mock)/dashboard/page.tsx` and/or `src/app/(mock)/repos/[repoId]/page.tsx`.
- [X] T023 [US3] Implement a representative error-style state or toggle for failed connection/invalid repo in `src/app/(mock)/repos/connect/page.tsx`.

**Checkpoint**: User Story 3 surfaces secondary flows and future-feature placeholders clearly and safely.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall experience.

- [X] T024 [P] Refine visual design and accessibility (focus states, contrast, keyboard navigation) across mock routes in `src/app/mock/` and `src/components/ui/`.
- [X] T025 Review and polish copy across all mock screens to be stakeholder-ready in `src/app/mock/`.
- [X] T026 [P] Harden Playwright test suite and integrate into CI by updating scripts in `package.json` and test setup in `tests/e2e/`.
- [ ] T027 Run through and adjust `specs/002-static-ui-mockup/quickstart.md` to match the final mock routes and flows.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories.
- **User Stories (Phases 3–5)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel (if staffed).
  - Or sequentially in priority order (P1 → P1 → P2).
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) – no dependencies on other stories.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) – depends on mock data scaffolding from T005/T015 but should be independently testable.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) – may reuse components from US1/US2 but should be independently testable.

### Within Each User Story

- Tests MUST be written and FAIL before implementation.
- Shared layout and mock data (Phase 2) before story-specific views.
- For each story: core routes and navigation before detailed content and polish.
- Each story should reach its checkpoint before moving to the next priority.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- Foundational tasks T006 and T007 can run in parallel once T005 is underway.
- Once Foundational is done, user stories can proceed in parallel by different team members.
- All test tasks marked [P] can run in parallel.
- Different user stories can be worked on in parallel by different team members.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL – blocks all stories).
3. Complete Phase 3: User Story 1 (click-through journeys).
4. **STOP and VALIDATE**: Test User Story 1 independently via Playwright and manual click-through.
5. Demo the mock to stakeholders and collect feedback.

### Incremental Delivery

1. Complete Setup + Foundational → foundation ready.
2. Add User Story 1 → test independently → demo.
3. Add User Story 2 → test independently → demo with realistic data.
4. Add User Story 3 → test independently → demo secondary flows and placeholders.
5. Apply Phase 6 polish once core flows are validated.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together.
2. Once Foundational is done:
   - Developer A: User Story 1 routes and navigation.
   - Developer B: User Story 2 mock data and content rendering.
   - Developer C: User Story 3 history, placeholders, and empty/error states.
3. Regroup for Phase 6 polish and test hardening.

