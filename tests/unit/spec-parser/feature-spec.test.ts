/**
 * Unit tests for src/lib/spec-parser/feature-spec.ts
 *
 * Covers: FR-003 (detect and parse spec files), FR-005 (no raw markdown in output)
 * See TRACEABILITY.md: PARSE-001–PARSE-012
 */

import { describe, it, expect } from "vitest";
import { parseFeatureSpec } from "@/lib/spec-parser/feature-spec";
import {
  VALID_SPEC_MARKDOWN,
  MINIMAL_SPEC_MARKDOWN,
  ACTIVE_STATUS_SPEC_MARKDOWN,
  MALFORMED_SPEC_MARKDOWN,
  NO_P1_JOURNEY_SPEC_MARKDOWN,
  PARSED_VALID_SPEC,
} from "../../fixtures/spec-fixtures";

// ---------------------------------------------------------------------------
// PARSE-001: Positive path — fully populated spec
// ---------------------------------------------------------------------------
describe("parseFeatureSpec — positive paths", () => {
  it("PARSE-001: parses title from H1 heading", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.title).toBe("Feature Specification: User Authentication");
  });

  it("PARSE-002: parses feature branch from metadata line", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.featureBranch).toBe("001-user-auth");
  });

  it("PARSE-003: parses created date from metadata line", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.createdDate).toBe("2026-01-15");
  });

  it("PARSE-004: parses status as lowercase enum value", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.status).toBe("draft");
  });

  it("PARSE-005: parses 'Active' status to lowercase 'active'", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(ACTIVE_STATUS_SPEC_MARKDOWN, "specs/003-active/spec.md");
    expect(result.status).toBe("active");
  });

  it("PARSE-006: extracts all user journeys with correct count", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.journeys).toHaveLength(2);
  });

  it("PARSE-007: correctly parses journey title and priority", () => {
    // Covers: FR-003, FR-005
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    const journey1 = result.journeys[0];
    expect(journey1.title).toBe("User Signs In with GitHub");
    expect(journey1.priority).toBe("P1");
  });

  it("PARSE-008: parses acceptance scenarios with Given/When/Then structure", () => {
    // Covers: FR-003, FR-005
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    const scenarios = result.journeys[0].acceptanceScenarios;
    expect(scenarios).toHaveLength(3);
    expect(scenarios[0].given).toContain("unauthenticated");
    expect(scenarios[0].when).toContain("visit the app root");
    expect(scenarios[0].then).toContain("sign-in page");
  });

  it("PARSE-009: parses functional requirements with correct IDs", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.functionalRequirements).toHaveLength(2);
    expect(result.functionalRequirements[0].id).toBe("FR-001");
    expect(result.functionalRequirements[1].id).toBe("FR-002");
  });

  it("PARSE-010: parses success criteria with correct IDs", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    expect(result.successCriteria).toHaveLength(2);
    expect(result.successCriteria[0].id).toBe("SC-001");
  });

  it("PARSE-011: sets artifactPath from the provided file path", () => {
    // Covers: FR-003
    const path = "specs/001-user-auth/spec.md";
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, path);
    expect(result.artifactPath).toBe(path);
  });
});

// ---------------------------------------------------------------------------
// PARSE-012: Boundary and error conditions
// ---------------------------------------------------------------------------
describe("parseFeatureSpec — boundary and error conditions", () => {
  it("PARSE-012a: returns null or throws for completely malformed markdown", () => {
    // Covers: FR-003, FR-013 — malformed specs must not crash the app
    expect(() => parseFeatureSpec(MALFORMED_SPEC_MARKDOWN, "specs/bad/spec.md")).not.toThrow();
    const result = parseFeatureSpec(MALFORMED_SPEC_MARKDOWN, "specs/bad/spec.md");
    // Parser should return a partial result or null — not crash
    // If null: the caller shows raw content fallback (contracts/specs-api.md)
    expect(result === null || typeof result === "object").toBe(true);
  });

  it("PARSE-012b: parses minimal spec with a single P1 journey successfully", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(MINIMAL_SPEC_MARKDOWN, "specs/002-minimal/spec.md");
    expect(result).not.toBeNull();
    expect(result!.journeys).toHaveLength(1);
    expect(result!.journeys[0].priority).toBe("P1");
  });

  it("PARSE-012c: parses a spec with a P2-only journey without error", () => {
    // Covers: FR-003 — parsing should succeed even if structurally invalid
    // Validation (no P1 journey) is a separate concern in lib/validation/
    const result = parseFeatureSpec(NO_P1_JOURNEY_SPEC_MARKDOWN, "specs/004-no-p1/spec.md");
    expect(result).not.toBeNull();
    expect(result!.journeys[0].priority).toBe("P2");
  });

  it("PARSE-012d: returns empty arrays for missing optional sections", () => {
    // Covers: FR-003
    const result = parseFeatureSpec(MINIMAL_SPEC_MARKDOWN, "specs/002-minimal/spec.md");
    expect(result!.keyEntities).toEqual([]);
    expect(result!.edgeCases).toHaveLength(0);
  });

  it("PARSE-012e: handles spec with no created date gracefully", () => {
    // Covers: FR-003 — createdDate is optional
    const noDates = VALID_SPEC_MARKDOWN.replace(/\*\*Created\*\*: [^\n]+\n/, "");
    const result = parseFeatureSpec(noDates, "specs/001-user-auth/spec.md");
    expect(result!.createdDate).toBeNull();
  });

  it("PARSE-012f: status defaults to 'draft' when not specified", () => {
    // Covers: FR-003
    const noStatus = VALID_SPEC_MARKDOWN.replace(/\*\*Status\*\*: [^\n]+\n/, "");
    const result = parseFeatureSpec(noStatus, "specs/001-user-auth/spec.md");
    expect(result!.status).toBe("draft");
  });
});

// ---------------------------------------------------------------------------
// FR-005: Parsed output contains no raw markdown syntax
// ---------------------------------------------------------------------------
describe("parseFeatureSpec — no raw markdown in output (FR-005)", () => {
  it("PARSE-FR005a: journey descriptions do not contain markdown bold syntax", () => {
    // Covers: FR-005 — descriptions must be clean text
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    for (const journey of result!.journeys) {
      expect(journey.description).not.toMatch(/\*\*/);
    }
  });

  it("PARSE-FR005b: acceptance scenario fields do not contain markdown list markers", () => {
    // Covers: FR-005
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    for (const journey of result!.journeys) {
      for (const scenario of journey.acceptanceScenarios) {
        expect(scenario.given).not.toMatch(/^[-*]/);
        expect(scenario.when).not.toMatch(/^[-*]/);
        expect(scenario.then).not.toMatch(/^[-*]/);
      }
    }
  });

  it("PARSE-FR005c: requirement descriptions are plain text without markdown", () => {
    // Covers: FR-005
    const result = parseFeatureSpec(VALID_SPEC_MARKDOWN, "specs/001-user-auth/spec.md");
    for (const req of result!.functionalRequirements) {
      expect(req.description).not.toMatch(/^- \*\*/);
    }
  });
});
