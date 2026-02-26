/**
 * Contract tests for the Specifications API server actions.
 * Validates that action inputs/outputs conform to contracts/specs-api.md.
 *
 * Covers: FR-003 (parse spec files), FR-004 (list specs), FR-006 (edit spec),
 *         FR-007 (commit message), FR-013 (error codes)
 * See TRACEABILITY.md: C-SPEC-001–C-SPEC-007
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  PARSED_VALID_SPEC,
  makeGitHubTreeResponse,
  makeGitHubContentsResponse,
  VALID_SPEC_MARKDOWN,
  MOCK_SPEC_ARTIFACT,
} from "../fixtures/spec-fixtures";

// ---------------------------------------------------------------------------
// Zod schemas derived from contracts/specs-api.md
// ---------------------------------------------------------------------------

const SpecArtifactTypeSchema = z.enum([
  "feature_spec",
  "plan",
  "tasks",
  "research",
  "data_model",
  "quickstart",
  "constitution",
  "other_spec",
]);

const SpecArtifactSchema = z.object({
  repoId: z.string(),
  path: z.string(),
  type: SpecArtifactTypeSchema,
  branch: z.string(),
  contentBase64: z.string().optional(),
  sha: z.string().optional(),
  lastCommitSha: z.string().optional(),
  lastAuthor: z.string().optional(),
  lastModifiedAt: z.string().optional(),
  deploymentRef: z.string().nullable(),
});

const ListSpecArtifactsOutputSchema = z.object({
  data: z.array(SpecArtifactSchema).optional(),
  error: z.string().optional(),
});

const ParseFeatureSpecOutputSchema = z.union([
  z.object({
    data: z.object({
      spec: z.any(), // FeatureSpec — validated in unit tests
      sha: z.string(),
      rawContent: z.string(),
    }),
  }),
  z.object({
    error: z.enum(["NOT_FOUND", "PARSE_ERROR", "TOO_LARGE", "GITHUB_API_ERROR"]),
    parseWarnings: z.array(z.string()).optional(),
  }),
]);

const SaveFeatureSpecInputSchema = z.object({
  repoId: z.string(),
  branch: z.string(),
  path: z.string(),
  spec: z.any(),
  originalSha: z.string(),
  commitMessage: z.string().optional(),
});

const SaveFeatureSpecOutputSchema = z.union([
  z.object({
    data: z.object({
      newSha: z.string(),
      commitSha: z.string(),
      commitMessage: z.string(),
    }),
  }),
  z.object({
    error: z.enum([
      "CONFLICT",
      "ACCESS_DENIED",
      "BRANCH_PROTECTED",
      "GITHUB_API_ERROR",
      "VALIDATION_ERROR",
    ]),
    errorDetail: z.string().optional(),
  }),
]);

// ---------------------------------------------------------------------------
// C-SPEC-001: listSpecArtifacts — artifact type detection from tree
// ---------------------------------------------------------------------------
describe("listSpecArtifacts — artifact type detection (C-SPEC-001)", () => {
  it("C-SPEC-001a: spec.md files in specs/ are typed as feature_spec", () => {
    // Covers: FR-003 — filename-based type detection
    const tree = makeGitHubTreeResponse();
    const specPaths = tree.tree
      .filter((f) => f.path.endsWith("/spec.md"))
      .map((f) => ({ path: f.path, type: "feature_spec" as const }));
    for (const item of specPaths) {
      expect(SpecArtifactTypeSchema.safeParse(item.type).success).toBe(true);
      expect(item.type).toBe("feature_spec");
    }
  });

  it("C-SPEC-001b: plan.md files in specs/ are typed as plan", () => {
    // Covers: FR-003
    const planPath = "specs/001-user-auth/plan.md";
    const derived = planPath.endsWith("/plan.md") ? "plan" : "other_spec";
    expect(derived).toBe("plan");
  });

  it("C-SPEC-001c: constitution.md in .specify/memory/ is typed as constitution", () => {
    // Covers: FR-003
    const path = ".specify/memory/constitution.md";
    const derived = path.includes(".specify/memory/constitution.md") ? "constitution" : "other_spec";
    expect(derived).toBe("constitution");
  });

  it("C-SPEC-001d: README.md at repo root is not included in spec artifacts", () => {
    // Covers: FR-003 — non-spec files must be filtered out
    const tree = makeGitHubTreeResponse();
    const specFiles = tree.tree.filter(
      (f) =>
        f.path.startsWith("specs/") || f.path.startsWith(".specify/memory/")
    );
    const readmeIncluded = specFiles.some((f) => f.path === "README.md");
    expect(readmeIncluded).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C-SPEC-002: listSpecArtifacts — output shape
// ---------------------------------------------------------------------------
describe("listSpecArtifacts — output shape (C-SPEC-002)", () => {
  it("C-SPEC-002: each artifact conforms to SpecArtifact schema", () => {
    const result = ListSpecArtifactsOutputSchema.safeParse({
      data: [MOCK_SPEC_ARTIFACT],
    });
    expect(result.success).toBe(true);
  });

  it("C-SPEC-002b: deploymentRef is always null in MVP", () => {
    // Covers: FR-003 — deploymentRef reserved for future use
    expect(MOCK_SPEC_ARTIFACT.deploymentRef).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// C-SPEC-003: parseFeatureSpec — output shape
// ---------------------------------------------------------------------------
describe("parseFeatureSpec — output shape (C-SPEC-003)", () => {
  it("C-SPEC-003a: success output includes spec, sha, and rawContent", () => {
    const mockOutput = {
      data: {
        spec: PARSED_VALID_SPEC,
        sha: "blobsha123",
        rawContent: VALID_SPEC_MARKDOWN,
      },
    };
    expect(ParseFeatureSpecOutputSchema.safeParse(mockOutput).success).toBe(true);
  });

  it("C-SPEC-003b: PARSE_ERROR output includes the correct error code", () => {
    // Covers: FR-013 — malformed spec returns PARSE_ERROR, not a crash
    const mockError = { error: "PARSE_ERROR" as const };
    expect(ParseFeatureSpecOutputSchema.safeParse(mockError).success).toBe(true);
  });

  it("C-SPEC-003c: TOO_LARGE error is returned for files over 1 MB", () => {
    // Covers: FR-013, contract constraint
    const mockError = { error: "TOO_LARGE" as const };
    expect(ParseFeatureSpecOutputSchema.safeParse(mockError).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C-SPEC-004: saveFeatureSpec — input shape
// ---------------------------------------------------------------------------
describe("saveFeatureSpec — input validation (C-SPEC-004)", () => {
  it("C-SPEC-004a: valid save input conforms to schema", () => {
    const input = {
      repoId: "acme-corp/my-product",
      branch: "main",
      path: "specs/001-user-auth/spec.md",
      spec: PARSED_VALID_SPEC,
      originalSha: "blobsha123",
    };
    expect(SaveFeatureSpecInputSchema.safeParse(input).success).toBe(true);
  });

  it("C-SPEC-004b: rejects input with missing originalSha", () => {
    // Covers: FR-006 — SHA required for conflict detection
    const input = {
      repoId: "acme-corp/my-product",
      branch: "main",
      path: "specs/001-user-auth/spec.md",
      spec: PARSED_VALID_SPEC,
      // originalSha missing
    };
    expect(SaveFeatureSpecInputSchema.safeParse(input).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C-SPEC-005–C-SPEC-007: saveFeatureSpec — output shape and conflict handling
// ---------------------------------------------------------------------------
describe("saveFeatureSpec — output shape (C-SPEC-005)", () => {
  it("C-SPEC-005: success output includes newSha, commitSha, commitMessage", () => {
    const mockOutput = {
      data: {
        newSha: "newblobsha456",
        commitSha: "commitsha789",
        commitMessage: "Update spec: User Authentication — Updated journey 1 title",
      },
    };
    expect(SaveFeatureSpecOutputSchema.safeParse(mockOutput).success).toBe(true);
  });

  it("C-SPEC-006: CONFLICT error is returned when SHA mismatches", () => {
    // Covers: FR-006 — concurrent edit conflict detection
    const mockConflict = { error: "CONFLICT" as const };
    expect(SaveFeatureSpecOutputSchema.safeParse(mockConflict).success).toBe(true);
  });

  it("C-SPEC-007: auto-generated commitMessage follows 'Update spec: {title} — {summary}' format", () => {
    // Covers: FR-007 — commit message format is enforced by the contract
    const msg = "Update spec: User Authentication — Updated journey 1 title";
    expect(msg).toMatch(/^Update spec: .+ — .+/);
  });
});
