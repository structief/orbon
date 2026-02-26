## Research Summary: Static Front-End Mockup for MVP Validation

### Decision 1: Front-end stack (Next.js + React + Tailwind + shadcn/ui)

- **Decision**: Use a Next.js 15 (App Router) + React 18 + TypeScript 5.x stack with Tailwind CSS and shadcn/ui for the static mockup.
- **Rationale**: This matches the planned stack for the Spec Editor MVP, so components and layout work from the mock can be promoted directly into the real implementation. Tailwind + shadcn/ui provide fast iteration on UI while still allowing refinement later.
- **Alternatives considered**:
  - Plain React SPA (Vite/CRA): simpler build but diverges from the target Next.js architecture and would require rework of routing/layout.
  - Design-tool-only prototype (Figma-only flow): good for visual exploration but does not provide a realistic browser experience or clickable routes with production-like components.

### Decision 2: Data and state (in-memory mock data only)

- **Decision**: Represent all repos/specs/history as TypeScript constants under `src/lib/mock-data` and simple React state; no backend, no persistence.
- **Rationale**: Keeps the mock truly static and safe, while still allowing realistic, consistent data across list/detail/edit/history screens. Reduces setup and operational complexity for stakeholders who only need to click through.
- **Alternatives considered**:
  - Calling real GitHub APIs: would require authentication, error handling, and rate-limit considerations that are explicitly out of scope for this mock.
  - Local JSON file storage with write-back: still more complex than needed, and blurs the boundary between prototype and implementation.

### Decision 3: Routing and isolation (`(mock)` App Router segment)

- **Decision**: Place all mock routes under a dedicated `src/app/(mock)/...` segment, with its own layout and entry page.
- **Rationale**: Makes it obvious to developers and stakeholders when they are in the mock experience, avoids route conflicts with the future production app, and keeps promotion of components into the main app straightforward.
- **Alternatives considered**:
  - Reusing final intended routes directly (e.g. `/login`, `/repos/...`): would make it harder to run the mock side-by-side with the eventual implementation and could confuse QA/stakeholders once “real” flows exist.
  - Separate prototype repo: would fragment history and make it harder to keep spec, plan, and UI work traceable in a single Git repository.

### Decision 4: Test strategy (lightweight E2E for journeys)

- **Decision**: Add a small Playwright suite focused on the primary journeys (entry → spec list → spec detail → edit → history/placeholder) and treat other testing as optional.
- **Rationale**: Ensures the click-through experience remains intact as UI is iterated, without over-investing in unit tests for throwaway mock code. E2E tests also double as executable documentation of expected flows.
- **Alternatives considered**:
  - No automated tests: would make it too easy to accidentally break the click-through path as components change.
  - Full unit-test coverage (Vitest + RTL): higher maintenance cost than justified for a static mock that will either be evolved into production code or discarded.

### Decision 5: Accessibility and copy polish level

- **Decision**: Aim for reasonable WCAG 2.1 AA alignment on colours, focus states, and keyboard navigation for primary flows, and treat copy as “preview quality” that is safe to show to end users.
- **Rationale**: Even for a mock, poor accessibility or confusing wording would invalidate stakeholder feedback. Aligning early with the constitution’s accessibility and non-technical-collaboration principles reduces rework later.
- **Alternatives considered**:
  - Skipping accessibility/copy polish: faster initially but would produce feedback that does not reflect the eventual experience and may hide usability issues.

