/**
 * Unit tests for src/lib/validation/index.ts
 *
 * Covers: FR-003 (structural validation of parsed specs), FR-013 (validation messages)
 * The validator scaffold is also the future extension point for full spec validation.
 * See TRACEABILITY.md: (structural validation — subset of PARSE tests)
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  registerValidator,
  runValidators,
  clearValidators,
} from "@/lib/validation/index";
import {
  PARSED_VALID_SPEC,
  NO_P1_JOURNEY_SPEC_MARKDOWN,
} from "../../fixtures/spec-fixtures";
import { parseFeatureSpec } from "@/lib/spec-parser/feature-spec";
import type { FeatureSpec } from "@/types/index";

beforeEach(() => {
  // Reset validator registry between tests to avoid cross-test pollution
  clearValidators();
});

// ---------------------------------------------------------------------------
// Structural validator: spec must have at least one P1 journey
// ---------------------------------------------------------------------------
describe("runValidators — built-in structural checks", () => {
  it("VAL-001: valid spec with a P1 journey passes structural validation", () => {
    // Covers: FR-003 — constitution principle: FeatureSpec must have ≥1 P1 journey
    const result = runValidators(PARSED_VALID_SPEC);
    const p1Check = result.find((r) => r.checkId === "structural.has_p1_journey");
    expect(p1Check).toBeDefined();
    expect(p1Check!.pass).toBe(true);
  });

  it("VAL-002: spec with no P1 journey fails structural validation", () => {
    // Covers: FR-003
    const noP1 = parseFeatureSpec(NO_P1_JOURNEY_SPEC_MARKDOWN, "specs/004-no-p1/spec.md");
    const result = runValidators(noP1!);
    const p1Check = result.find((r) => r.checkId === "structural.has_p1_journey");
    expect(p1Check!.pass).toBe(false);
    expect(p1Check!.message).toBeTruthy();
  });

  it("VAL-003: validation message for missing P1 journey is human-readable", () => {
    // Covers: FR-013 — validation messages must be non-technical
    const noP1 = parseFeatureSpec(NO_P1_JOURNEY_SPEC_MARKDOWN, "specs/004-no-p1/spec.md");
    const result = runValidators(noP1!);
    const p1Check = result.find((r) => r.checkId === "structural.has_p1_journey");
    expect(p1Check!.message.toLowerCase()).toMatch(/p1|priority|journey/);
    expect(p1Check!.message).not.toMatch(/undefined|null|error:/i);
  });
});

// ---------------------------------------------------------------------------
// Pluggable validator registry
// ---------------------------------------------------------------------------
describe("registerValidator — pluggable architecture", () => {
  it("VAL-004: a registered custom validator runs against the spec", () => {
    // Covers: design hook — pluggable validation layer
    const customValidator = {
      id: "custom.has_title",
      run: (spec: FeatureSpec) => ({
        checkId: "custom.has_title",
        pass: spec.title.length > 0,
        message: spec.title.length > 0 ? "Title present" : "Title is required",
      }),
    };
    registerValidator(customValidator);
    const result = runValidators(PARSED_VALID_SPEC);
    const titleCheck = result.find((r) => r.checkId === "custom.has_title");
    expect(titleCheck).toBeDefined();
    expect(titleCheck!.pass).toBe(true);
  });

  it("VAL-005: multiple validators all run independently", () => {
    // Covers: design hook
    registerValidator({
      id: "check.a",
      run: () => ({ checkId: "check.a", pass: true, message: "ok" }),
    });
    registerValidator({
      id: "check.b",
      run: () => ({ checkId: "check.b", pass: false, message: "fail" }),
    });
    const result = runValidators(PARSED_VALID_SPEC);
    expect(result.find((r) => r.checkId === "check.a")!.pass).toBe(true);
    expect(result.find((r) => r.checkId === "check.b")!.pass).toBe(false);
  });

  it("VAL-006: validators registered in one test do not bleed into others (clearValidators)", () => {
    // Covers: test isolation — verifies clearValidators() works
    registerValidator({
      id: "leak.check",
      run: () => ({ checkId: "leak.check", pass: true, message: "" }),
    });
    clearValidators();
    const result = runValidators(PARSED_VALID_SPEC);
    expect(result.find((r) => r.checkId === "leak.check")).toBeUndefined();
  });
});
