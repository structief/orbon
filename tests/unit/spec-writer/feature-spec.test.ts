/**
 * Unit tests for src/lib/spec-writer/feature-spec.ts
 *
 * Covers: FR-006 (editor can modify spec; status dropdown), FR-007 (commits markdown back)
 * See TRACEABILITY.md: WRITE-001–WRITE-006
 */

import { describe, it, expect } from "vitest";
import { serializeFeatureSpec } from "@/lib/spec-writer/feature-spec";
import { parseFeatureSpec } from "@/lib/spec-parser/feature-spec";
import {
  PARSED_VALID_SPEC,
  VALID_SPEC_MARKDOWN,
} from "../../fixtures/spec-fixtures";
import type { FeatureSpec } from "@/types/index";

// ---------------------------------------------------------------------------
// WRITE-001–WRITE-003: Round-trip fidelity
// ---------------------------------------------------------------------------
describe("serializeFeatureSpec — round-trip fidelity", () => {
  it("WRITE-001: serialized output re-parses to the same FeatureSpec", () => {
    // Covers: FR-006, FR-007 — parse → serialize → re-parse must be stable
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    const reParsed = parseFeatureSpec(serialized, PARSED_VALID_SPEC.artifactPath);
    expect(reParsed!.title).toBe(PARSED_VALID_SPEC.title);
    expect(reParsed!.journeys).toHaveLength(PARSED_VALID_SPEC.journeys.length);
    expect(reParsed!.journeys[0].title).toBe(PARSED_VALID_SPEC.journeys[0].title);
    expect(reParsed!.journeys[0].priority).toBe(PARSED_VALID_SPEC.journeys[0].priority);
  });

  it("WRITE-002: serialized output preserves all acceptance scenarios", () => {
    // Covers: FR-006
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    const reParsed = parseFeatureSpec(serialized, PARSED_VALID_SPEC.artifactPath);
    const originalScenarioCount = PARSED_VALID_SPEC.journeys[0].acceptanceScenarios.length;
    expect(reParsed!.journeys[0].acceptanceScenarios).toHaveLength(originalScenarioCount);
  });

  it("WRITE-003: serialized output preserves functional requirement IDs", () => {
    // Covers: FR-006
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    const reParsed = parseFeatureSpec(serialized, PARSED_VALID_SPEC.artifactPath);
    const ids = reParsed!.functionalRequirements.map((r) => r.id);
    expect(ids).toContain("FR-001");
    expect(ids).toContain("FR-002");
  });
});

// ---------------------------------------------------------------------------
// WRITE-004: Adding a new journey
// ---------------------------------------------------------------------------
describe("serializeFeatureSpec — adding a journey (FR-006)", () => {
  it("WRITE-004: a newly added journey appears in the serialized output", () => {
    // Covers: FR-006 — "Add Journey" button in editor
    const specWithNewJourney: FeatureSpec = {
      ...PARSED_VALID_SPEC,
      journeys: [
        ...PARSED_VALID_SPEC.journeys,
        {
          index: 3,
          title: "User Resets Session",
          priority: "P3",
          description: "A user can force-expire their own session.",
          whyThisPriority: "Security feature.",
          independentTest: null,
          acceptanceScenarios: [
            {
              index: 1,
              given: "the user is authenticated",
              when: 'they click "Reset session"',
              then: "all session tokens are invalidated",
            },
          ],
        },
      ],
    };
    const serialized = serializeFeatureSpec(specWithNewJourney);
    expect(serialized).toContain("User Resets Session");
    expect(serialized).toContain("P3");
    expect(serialized).toContain("force-expire");
  });
});

// ---------------------------------------------------------------------------
// WRITE-005: Status dropdown — user-settable status (FR-006, Clarification C3)
// ---------------------------------------------------------------------------
describe("serializeFeatureSpec — manual status (FR-006, C3)", () => {
  it("WRITE-005a: serializes 'active' status correctly", () => {
    // Covers: FR-006, C3 — product owner can set status to active
    const activeSpec: FeatureSpec = { ...PARSED_VALID_SPEC, status: "active" };
    const serialized = serializeFeatureSpec(activeSpec);
    expect(serialized).toMatch(/\*\*Status\*\*: Active/i);
  });

  it("WRITE-005b: serializes 'implemented' status correctly", () => {
    // Covers: FR-006, C3
    const implSpec: FeatureSpec = { ...PARSED_VALID_SPEC, status: "implemented" };
    const serialized = serializeFeatureSpec(implSpec);
    expect(serialized).toMatch(/\*\*Status\*\*: Implemented/i);
  });

  it("WRITE-005c: serializes 'archived' status correctly", () => {
    // Covers: FR-006, C3
    const archivedSpec: FeatureSpec = { ...PARSED_VALID_SPEC, status: "archived" };
    const serialized = serializeFeatureSpec(archivedSpec);
    expect(serialized).toMatch(/\*\*Status\*\*: Archived/i);
  });
});

// ---------------------------------------------------------------------------
// WRITE-006: Output is valid SpecKit markdown format
// ---------------------------------------------------------------------------
describe("serializeFeatureSpec — SpecKit format compliance (FR-007)", () => {
  it("WRITE-006a: output starts with H1 heading", () => {
    // Covers: FR-007 — committed content must be valid SpecKit markdown
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    expect(serialized.trimStart()).toMatch(/^# Feature Specification:/);
  });

  it("WRITE-006b: output contains 'User Scenarios & Testing' section", () => {
    // Covers: FR-007
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    expect(serialized).toContain("## User Scenarios & Testing");
  });

  it("WRITE-006c: output contains 'Requirements' section", () => {
    // Covers: FR-007
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    expect(serialized).toContain("## Requirements");
  });

  it("WRITE-006d: output contains 'Success Criteria' section", () => {
    // Covers: FR-007
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    expect(serialized).toContain("## Success Criteria");
  });

  it("WRITE-006e: journey priorities appear in H3 headings matching SpecKit format", () => {
    // Covers: FR-007
    const serialized = serializeFeatureSpec(PARSED_VALID_SPEC);
    expect(serialized).toMatch(/### User Story 1 .*\(Priority: P1\)/);
    expect(serialized).toMatch(/### User Story 2 .*\(Priority: P2\)/);
  });
});
