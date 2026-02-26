/**
 * Unit tests for src/lib/spec-parser/diff.ts
 *
 * Covers: FR-009 (field-level diff view, not raw text)
 * See TRACEABILITY.md: DIFF-001–DIFF-010
 */

import { describe, it, expect } from "vitest";
import { diffFeatureSpecs } from "@/lib/spec-parser/diff";
import {
  PARSED_VALID_SPEC,
  PARSED_MODIFIED_SPEC,
} from "../../fixtures/spec-fixtures";
import type { FeatureSpec } from "@/types/index";

// ---------------------------------------------------------------------------
// DIFF-001–DIFF-004: Title and status changes
// ---------------------------------------------------------------------------
describe("diffFeatureSpecs — title and status", () => {
  it("DIFF-001: detects a title change as an 'updated' ChangedField", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const titleChange = changes.find((c) => c.fieldLabel === "Title");
    expect(titleChange).toBeDefined();
    expect(titleChange!.changeType).toBe("updated");
    expect(titleChange!.before).toBe(PARSED_VALID_SPEC.title);
    expect(titleChange!.after).toBe(PARSED_MODIFIED_SPEC.title);
  });

  it("DIFF-002: detects a status change with before and after values", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const statusChange = changes.find((c) => c.fieldLabel === "Status");
    expect(statusChange).toBeDefined();
    expect(statusChange!.changeType).toBe("updated");
    expect(statusChange!.before).toBe("draft");
    expect(statusChange!.after).toBe("active");
  });

  it("DIFF-003: returns no title/status changes when they are identical", () => {
    // Covers: FR-009 — identical specs produce no changes
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, { ...PARSED_VALID_SPEC });
    const titleChange = changes.find((c) => c.fieldLabel === "Title");
    const statusChange = changes.find((c) => c.fieldLabel === "Status");
    expect(titleChange).toBeUndefined();
    expect(statusChange).toBeUndefined();
  });

  it("DIFF-004: hasChanges is false when specs are identical", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, { ...PARSED_VALID_SPEC });
    expect(changes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DIFF-005–DIFF-007: Journey-level changes
// ---------------------------------------------------------------------------
describe("diffFeatureSpecs — journey changes", () => {
  it("DIFF-005: detects an updated journey title", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const journeyChange = changes.find(
      (c) => c.fieldLabel === "Journey 1 title"
    );
    expect(journeyChange).toBeDefined();
    expect(journeyChange!.changeType).toBe("updated");
    expect(journeyChange!.before).toBe("User Signs In with GitHub");
    expect(journeyChange!.after).toBe("User Signs In with GitHub OAuth");
  });

  it("DIFF-006: detects an added journey as an 'added' ChangedField", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const addedJourney = changes.find(
      (c) => c.fieldLabel === "Journey 3" && c.changeType === "added"
    );
    expect(addedJourney).toBeDefined();
    expect(addedJourney!.before).toBeNull();
    expect(addedJourney!.after).toContain("User Resets Session");
  });

  it("DIFF-007: detects a removed journey as a 'removed' ChangedField", () => {
    // Covers: FR-009
    const specWithJourneyRemoved: FeatureSpec = {
      ...PARSED_VALID_SPEC,
      journeys: [PARSED_VALID_SPEC.journeys[0]], // removed journey 2
    };
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, specWithJourneyRemoved);
    const removedJourney = changes.find(
      (c) => c.fieldLabel === "Journey 2" && c.changeType === "removed"
    );
    expect(removedJourney).toBeDefined();
    expect(removedJourney!.after).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// DIFF-008–DIFF-009: Requirement and success criteria changes
// ---------------------------------------------------------------------------
describe("diffFeatureSpecs — requirements and success criteria", () => {
  it("DIFF-008: detects an added functional requirement", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const addedReq = changes.find(
      (c) => c.fieldLabel === "Requirement FR-003" && c.changeType === "added"
    );
    expect(addedReq).toBeDefined();
    expect(addedReq!.after).toContain("force-expire");
  });

  it("DIFF-009: detects no changes to success criteria when they are identical", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const scChanges = changes.filter((c) => c.fieldLabel.startsWith("SC-"));
    expect(scChanges).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DIFF-010: Field-level labels are human-readable (not raw markdown paths)
// ---------------------------------------------------------------------------
describe("diffFeatureSpecs — field labels are human-readable (FR-009)", () => {
  it("DIFF-010a: changed field labels do not contain markdown heading syntax", () => {
    // Covers: FR-009 — labels must be non-technical
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    for (const change of changes) {
      expect(change.fieldLabel).not.toMatch(/^#+\s/);
      expect(change.fieldLabel).not.toMatch(/\*\*/);
    }
  });

  it("DIFF-010b: changed field labels do not contain file paths", () => {
    // Covers: FR-009
    const changes = diffFeatureSpecs(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    for (const change of changes) {
      expect(change.fieldLabel).not.toContain("/");
      expect(change.fieldLabel).not.toContain(".md");
    }
  });
});
