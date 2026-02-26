# Implementation Plan: Static Front-End Mockup for MVP Validation

**Branch**: `002-static-ui-mockup` | **Date**: 2026-02-26 | **Spec**: `specs/002-static-ui-mockup/spec.md`  
**Input**: Feature specification from `/specs/002-static-ui-mockup/spec.md`

**Note**: This file is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature delivers a static, click-through front-end mockup of the Spec Editor MVP UI. It covers the main journeys from the Spec Editor MVP vision—sign-in/onboarding, dashboard/repo connection, spec list, spec detail, edit, history, and future-placeholder sections—using fixed mock data and client-only routing.

The goal is to validate layout, copy, and flow with stakeholders before implementing any Auth.js, GitHub, or SpecKit backend integrations. The mock lives alongside the eventual production app and is structured so its components can be promoted into the real implementation or kept as a dedicated `/mock` experience.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Next.js 15 (App Router)  
**Primary Dependencies**: Next.js, React, Tailwind CSS, shadcn/ui; lightweight state via React hooks only; no backend libraries yet  
**Storage**: N/A (in-memory mock data defined in TypeScript modules)  
**Testing**: Playwright for click-through E2E of main journeys; optional Vitest/React Testing Library for critical components if needed  
**Target Platform**: Web application rendered in modern desktop and laptop browsers; responsive down to tablet widths  
**Project Type**: Front-end web application mock (Next.js app)  
**Performance Goals**: Initial mock entry route loads in < 1.5s on typical dev hardware; intra-mock navigation between screens feels instant (< 500ms) and never blocks interactions  
**Constraints**: No live backend or Git access; all screens must be suitable for non-technical stakeholders and respect basic WCAG 2.1 AA expectations for colour contrast and keyboard navigation  
**Scale/Scope**: ~6–8 screens (entry/sign-in, post-auth/dashboard, repo connect, spec list, spec detail, spec edit, history, empty/placeholder states) with 2–3 representative mock specs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Git-Backed Specification Source of Truth**  
  - This feature intentionally uses in-repo mock data instead of live Git-backed specs. It does **not** claim to show real repository state and will be clearly labeled as a mock/preview experience.  
  - **Gate**: Acceptable temporary deviation for a non-production UI mock; follow-up features (e.g. the Spec Editor MVP implementation) will provide real Git integration.

- **II. Visual, Non-Technical-Friendly Collaboration**  
  - Fully aligned: all work is on visual flows, labels, and layout for non-technical stakeholders. No raw markdown, API errors, or technical jargon appear in the mock.  
  - **Gate**: PASS — this feature directly serves this principle.

- **III. User-Journey-First Planning & Delivery**  
  - Journeys in the feature spec map directly to independently demoable click-through flows in the mock. Each can be reviewed and iterated without backend work.  
  - **Gate**: PASS — all P1 journeys from the feature spec are represented as separate, demoable flows.

- **IV. End-to-End Traceability Across Lifecycle**  
  - This feature does not introduce real tasks/tests/deployments; it only shapes the UI. Traceability links will be established in subsequent implementation features that build on this mock.  
  - **Gate**: Acceptable deviation, documented here and in Complexity Tracking; no user-facing claims are made about live status or deployment.

- **V. Safety, Roles & Governance**  
  - No real data is modified; the mock cannot affect production behaviour. Screens dealing with repositories/specs are clearly mock-only and safe to show broadly.  
  - **Gate**: PASS — risk is low, and governance is satisfied by documenting the limitations and intended use.

_Re-check after Phase 1_: The above assessments remain valid after design; no additional deviations are introduced beyond the temporary Git/traceability exceptions recorded here.

## Project Structure

### Documentation (this feature)

```text
specs/002-static-ui-mockup/
├── spec.md             # Feature specification: static UI mockup
├── plan.md             # This file (/speckit.plan command output)
├── research.md         # Phase 0 output (/speckit.plan command)
├── data-model.md       # Phase 1 output (/speckit.plan command)
├── quickstart.md       # Phase 1 output (/speckit.plan command)
├── contracts/          # Phase 1 output (/speckit.plan command)
│   └── ui-mockup.md    # UI navigation + mock data contract
└── tasks.md            # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 15 single-app layout with a dedicated mock segment

src/
├── app/
│   ├── (mock)/                         # Static mock experience entrypoint
│   │   ├── layout.tsx                  # Shell for all mock screens
│   │   ├── page.tsx                    # Landing / sign-in or onboarding
│   │   ├── dashboard/page.tsx          # Post-auth dashboard / repo overview
│   │   ├── repos/connect/page.tsx      # Repo connection mock flow
│   │   ├── repos/[repoId]/page.tsx     # Spec overview (list) mock
│   │   └── repos/[repoId]/specs/[...specPath]/
│   │       ├── page.tsx                # Spec detail mock
│   │       ├── edit/page.tsx           # Spec edit mock
│   │       └── history/page.tsx        # Spec history + placeholders mock
│   └── api/                            # (Empty for this feature; real APIs added later)
├── components/
│   ├── mock/                           # Components specific to the mock flows
│   └── ui/                             # Reusable UI primitives (e.g. buttons, cards)
├── lib/
│   └── mock-data/                      # TypeScript modules defining mock repos/specs/history
└── tests/
    └── e2e/
        └── mock-clickthrough.spec.ts   # Playwright spec for primary journeys
```

**Structure Decision**: Start with a single Next.js 15 app at the repo root and implement all static mock screens under a dedicated `src/app/(mock)/...` segment. Reusable UI components live under `src/components/ui`, while mock-specific scaffolding lives under `src/components/mock` and `src/lib/mock-data`. This keeps the mock clearly separated from future production routes while making it easy to promote components into the Spec Editor MVP implementation.

## Complexity Tracking

> **Filled because Constitution Check includes intentional, temporary deviations**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| No Git-backed data for this feature (Principle I) | The goal is to validate UI/UX quickly with fixed mock data before investing in Git integration or backend APIs. | Going straight to full Git + GitHub integration would slow down feedback and entangle UI design with infrastructure decisions. |
| No real traceability links yet (Principle IV) | This feature is purely a visual prototype; adding real tasks/tests/deployment wiring now would conflate prototype and implementation work. | Building traceability first would create extra work if the UI and flows change after stakeholder validation. |
