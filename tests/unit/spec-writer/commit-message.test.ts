/**
 * Unit tests for src/lib/spec-writer/commit-message.ts
 *
 * Covers: FR-007 (every edit committed with auto-generated structured message)
 * See TRACEABILITY.md: MSG-001–MSG-008
 */

import { describe, it, expect } from "vitest";
import { generateCommitMessage } from "@/lib/spec-writer/commit-message";
import {
  PARSED_VALID_SPEC,
  PARSED_MODIFIED_SPEC,
} from "../../fixtures/spec-fixtures";
import type { FeatureSpec } from "@/types/index";

// ---------------------------------------------------------------------------
// MSG-001–MSG-003: Message format compliance
// ---------------------------------------------------------------------------
describe("generateCommitMessage — format (FR-007)", () => {
  it("MSG-001: message starts with 'Update spec: {title}'", () => {
    // Covers: FR-007 — format: "Update spec: {title} — {summary}"
    const msg = generateCommitMessage(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    expect(msg).toMatch(/^Update spec: .+/);
  });

  it("MSG-002: message contains ' — ' separator between title and summary", () => {
    // Covers: FR-007
    const msg = generateCommitMessage(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    expect(msg).toContain(" — ");
  });

  it("MSG-003: message for a new spec starts with 'Add spec: {title}'", () => {
    // Covers: FR-007 — createFeatureSpec uses before=null
    const msg = generateCommitMessage(null, PARSED_VALID_SPEC);
    expect(msg).toMatch(/^Add spec: /);
  });
});

// ---------------------------------------------------------------------------
// MSG-004–MSG-006: Summary content reflects actual changes
// ---------------------------------------------------------------------------
describe("generateCommitMessage — summary content (FR-007)", () => {
  it("MSG-004: summary mentions journey title change when title was updated", () => {
    // Covers: FR-007 — summary must describe the change
    const msg = generateCommitMessage(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    // Should reference that a journey title changed or journey was updated
    expect(msg.toLowerCase()).toMatch(/journey|updated title/);
  });

  it("MSG-005: summary mentions status change when status was updated", () => {
    // Covers: FR-007
    const activeSpec: FeatureSpec = { ...PARSED_VALID_SPEC, status: "active" };
    const msg = generateCommitMessage(PARSED_VALID_SPEC, activeSpec);
    expect(msg.toLowerCase()).toContain("status");
  });

  it("MSG-006: summary mentions added journey when a journey was added", () => {
    // Covers: FR-007
    const specWithExtra: FeatureSpec = {
      ...PARSED_VALID_SPEC,
      journeys: [
        ...PARSED_VALID_SPEC.journeys,
        {
          index: 3,
          title: "New Journey",
          priority: "P2",
          description: "desc",
          whyThisPriority: null,
          independentTest: null,
          acceptanceScenarios: [],
        },
      ],
    };
    const msg = generateCommitMessage(PARSED_VALID_SPEC, specWithExtra);
    expect(msg.toLowerCase()).toMatch(/added journey|new journey/);
  });
});

// ---------------------------------------------------------------------------
// MSG-007–MSG-008: Plain language (FR-013 — no technical jargon)
// ---------------------------------------------------------------------------
describe("generateCommitMessage — plain language (FR-013)", () => {
  it("MSG-007: message does not contain raw markdown syntax", () => {
    // Covers: FR-007, FR-013 — commit messages should be human-readable
    const msg = generateCommitMessage(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    expect(msg).not.toMatch(/\*\*/);
    expect(msg).not.toMatch(/^#/m);
    expect(msg).not.toMatch(/^\-\s/m);
  });

  it("MSG-008: message does not exceed 200 characters on the first line", () => {
    // Covers: FR-007 — Git first-line convention and readability
    const msg = generateCommitMessage(PARSED_VALID_SPEC, PARSED_MODIFIED_SPEC);
    const firstLine = msg.split("\n")[0];
    expect(firstLine.length).toBeLessThanOrEqual(200);
  });
});
