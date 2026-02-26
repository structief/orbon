# Test Traceability Matrix: Spec Editor MVP

Every requirement maps to one or more test cases. Every test file cites the
requirement(s) it covers via `// Covers: FR-NNN` comments inline.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Requirement covered by at least one test |
| ⚠ | Partially covered (positive path only; boundary/error still needed) |
| ❌ | Not yet covered |

---

## Functional Requirements

| Requirement | Description (short) | Test files | Test IDs | Status |
|-------------|---------------------|-----------|----------|--------|
| FR-001 | GitHub OAuth authentication | `e2e/auth.spec.ts` | AUTH-001–AUTH-005 | ✅ |
| FR-002 | Connect repos via PAT or OAuth; PAT in encrypted cookie only | `e2e/repo-connect.spec.ts`, `contract/repos-api.test.ts` | REPO-001–REPO-008, C-REPO-001–C-REPO-006 | ✅ |
| FR-003 | Detect and parse spec files in `.specify/` and `specs/` | `unit/spec-parser/feature-spec.test.ts`, `unit/spec-parser/index.test.ts` | PARSE-001–PARSE-012 | ✅ |
| FR-004 | Display visual spec list with title, status badge, summary | `e2e/spec-view.spec.ts` | VIEW-001–VIEW-004 | ✅ |
| FR-005 | Render spec content without raw markdown | `e2e/spec-view.spec.ts` | VIEW-005–VIEW-007 | ✅ |
| FR-006 | Editor role can modify spec via form; status dropdown included | `e2e/spec-edit.spec.ts`, `unit/spec-writer/feature-spec.test.ts` | EDIT-001–EDIT-008, WRITE-001–WRITE-006 | ✅ |
| FR-007 | Every edit produces an auto-generated Git commit message | `unit/spec-writer/commit-message.test.ts`, `contract/specs-api.test.ts` | MSG-001–MSG-008, C-SPEC-005–C-SPEC-007 | ✅ |
| FR-008 | Display Git commit history per spec | `e2e/spec-history.spec.ts`, `contract/history-api.test.ts` | HIST-001–HIST-004, C-HIST-001–C-HIST-004 | ✅ |
| FR-009 | Field-level diff view (not raw text) | `unit/spec-parser/diff.test.ts`, `e2e/spec-history.spec.ts` | DIFF-001–DIFF-010, HIST-005–HIST-007 | ✅ |
| FR-010 | Role-based access; first-connector-gets-editor | `e2e/spec-edit.spec.ts`, `contract/repos-api.test.ts` | EDIT-009–EDIT-011, C-REPO-007–C-REPO-008 | ✅ |
| FR-011 | Warn before discarding unsaved edits | `e2e/spec-edit.spec.ts` | EDIT-012–EDIT-013 | ✅ |
| FR-012 | Placeholder sections for future features | `e2e/spec-view.spec.ts` | VIEW-008–VIEW-010 | ✅ |
| FR-013 | Non-technical error messages incl. rate-limit timed message | `unit/github/errors.test.ts`, `e2e/repo-connect.spec.ts` | ERR-001–ERR-010, REPO-009–REPO-010 | ✅ |

## Success Criteria

| Criterion | Description (short) | Test files | Test IDs | Status |
|-----------|---------------------|-----------|----------|--------|
| SC-001 | Journey 1 completable in < 5 min without assistance | `e2e/auth.spec.ts` | AUTH-PERF-001 | ✅ |
| SC-002 | Spec list loads in < 2 s for 50 specs | `e2e/spec-view.spec.ts` | VIEW-PERF-001 | ✅ |
| SC-003 | No raw markdown/JSON/code visible anywhere in spec views | `e2e/spec-view.spec.ts` | VIEW-005–VIEW-007 | ✅ |
| SC-004 | Edit → save → commit visible in History in single session | `e2e/spec-edit.spec.ts` | EDIT-E2E-001 | ✅ |
| SC-005 | Destructive actions require confirmation with plain explanation | `e2e/spec-edit.spec.ts` | EDIT-014–EDIT-015 | ✅ |
| SC-006 | WCAG 2.1 AA on all P1 journey screens | `e2e/spec-view.spec.ts`, `e2e/auth.spec.ts`, `e2e/spec-edit.spec.ts` | A11Y-001–A11Y-005 | ✅ |

## Clarification-Derived Tests

| Clarification | Implication | Test files | Test IDs | Status |
|---------------|-------------|-----------|----------|--------|
| C1: First-connector-gets-editor | First user to connect a repo → editor; others → viewer | `contract/repos-api.test.ts`, `e2e/spec-edit.spec.ts` | C-REPO-007, EDIT-009 | ✅ |
| C2: PAT in encrypted cookie only | PAT MUST NOT appear in localStorage or any client-accessible store | `e2e/repo-connect.spec.ts` | REPO-SEC-001–REPO-SEC-002 | ✅ |
| C3: Manual status dropdown | Editor can set draft/active/implemented/archived | `e2e/spec-edit.spec.ts`, `unit/spec-writer/feature-spec.test.ts` | EDIT-007, WRITE-005 | ✅ |
| C4: Rate-limit timed message | 429/403+header → plain message with minutes-to-reset | `unit/github/errors.test.ts`, `e2e/repo-connect.spec.ts` | ERR-008–ERR-010, REPO-009 | ✅ |
| C5: No-spec-dir inline help | No files created; help panel shown | `e2e/repo-connect.spec.ts` | REPO-011–REPO-012 | ✅ |

---

## Running the Tests

```bash
# All unit and contract tests
npx vitest run

# E2E tests (requires dev server on port 3000)
npx playwright test

# E2E with UI
npx playwright test --ui

# Accessibility audit only
npx playwright test --grep @a11y

# Specific requirement
npx vitest run --reporter=verbose tests/unit/spec-parser
```
