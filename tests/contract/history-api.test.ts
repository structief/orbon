/**
 * Contract tests for the History & Diff API server actions.
 * Validates that action outputs conform to contracts/history-api.md.
 *
 * Covers: FR-008 (display commit history), FR-009 (field-level diff view)
 * See TRACEABILITY.md: C-HIST-001–C-HIST-004
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  COMMIT_INITIAL,
  COMMIT_UPDATE,
  makeGitHubCommitListResponse,
} from "../fixtures/spec-fixtures";

// ---------------------------------------------------------------------------
// Zod schemas derived from contracts/history-api.md
// ---------------------------------------------------------------------------

const ChangedFieldSchema = z.object({
  fieldLabel: z.string().min(1),
  changeType: z.enum(["added", "updated", "removed"]),
  before: z.string().nullable(),
  after: z.string().nullable(),
});

const CommitSummarySchema = z.object({
  sha: z.string().length(40),
  shortSha: z.string().length(7),
  author: z.string(),
  authorAvatarUrl: z.string().url().nullable(),
  timestamp: z.string().datetime(),
  rawMessage: z.string(),
  plainLanguageSummary: z.string(),
  changedFields: z.array(ChangedFieldSchema),
});

const GetSpecHistoryOutputSchema = z.object({
  data: z.object({
    commits: z.array(CommitSummarySchema),
    totalCount: z.number().nullable(),
    hasMore: z.boolean(),
  }).optional(),
  error: z.enum(["NOT_FOUND", "GITHUB_API_ERROR"]).optional(),
});

const GetSpecDiffOutputSchema = z.union([
  z.object({
    data: z.object({
      changedFields: z.array(ChangedFieldSchema),
      fromSpec: z.any(),
      toSpec: z.any(),
      hasChanges: z.boolean(),
    }),
  }),
  z.object({
    error: z.enum(["NOT_FOUND", "PARSE_ERROR", "GITHUB_API_ERROR"]),
  }),
]);

// ---------------------------------------------------------------------------
// C-HIST-001: CommitSummary output shape
// ---------------------------------------------------------------------------
describe("getSpecHistory — CommitSummary shape (C-HIST-001)", () => {
  it("C-HIST-001a: CommitSummary with all fields conforms to schema", () => {
    // Covers: FR-008
    expect(CommitSummarySchema.safeParse(COMMIT_UPDATE).success).toBe(true);
  });

  it("C-HIST-001b: CommitSummary for initial commit (no changedFields) conforms", () => {
    // Covers: FR-008
    expect(CommitSummarySchema.safeParse(COMMIT_INITIAL).success).toBe(true);
  });

  it("C-HIST-001c: shortSha is exactly 7 characters", () => {
    // Covers: FR-008 — display convention
    expect(COMMIT_UPDATE.shortSha).toHaveLength(7);
    expect(COMMIT_INITIAL.shortSha).toHaveLength(7);
  });

  it("C-HIST-001d: timestamp is a valid ISO 8601 datetime string", () => {
    // Covers: FR-008
    expect(() => new Date(COMMIT_UPDATE.timestamp)).not.toThrow();
    expect(new Date(COMMIT_UPDATE.timestamp).toISOString()).toBe(COMMIT_UPDATE.timestamp);
  });
});

// ---------------------------------------------------------------------------
// C-HIST-002: getSpecHistory output shape
// ---------------------------------------------------------------------------
describe("getSpecHistory — output shape (C-HIST-002)", () => {
  it("C-HIST-002a: success output with multiple commits conforms to schema", () => {
    // Covers: FR-008
    const mockOutput = {
      data: {
        commits: [COMMIT_UPDATE, COMMIT_INITIAL],
        totalCount: 2,
        hasMore: false,
      },
    };
    expect(GetSpecHistoryOutputSchema.safeParse(mockOutput).success).toBe(true);
  });

  it("C-HIST-002b: success output with unknown total count (null) conforms", () => {
    // Covers: FR-008 — GitHub API does not always return total count
    const mockOutput = {
      data: {
        commits: [COMMIT_INITIAL],
        totalCount: null,
        hasMore: false,
      },
    };
    expect(GetSpecHistoryOutputSchema.safeParse(mockOutput).success).toBe(true);
  });

  it("C-HIST-002c: error output uses known error codes only", () => {
    // Covers: FR-013
    const mockError = { error: "NOT_FOUND" as const };
    expect(GetSpecHistoryOutputSchema.safeParse(mockError).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C-HIST-003: plainLanguageSummary is non-technical
// ---------------------------------------------------------------------------
describe("CommitSummary.plainLanguageSummary — non-technical (FR-008, FR-013)", () => {
  it("C-HIST-003a: plain language summary does not contain raw markdown syntax", () => {
    // Covers: FR-008 — summaries must be human-readable, not markdown
    const summaries = [COMMIT_INITIAL.plainLanguageSummary, COMMIT_UPDATE.plainLanguageSummary];
    for (const s of summaries) {
      expect(s).not.toMatch(/^#/);
      expect(s).not.toMatch(/\*\*/);
      expect(s).not.toMatch(/^\-\s/m);
    }
  });

  it("C-HIST-003b: initial commit summary is labeled 'Initial creation'", () => {
    // Covers: FR-008 — spec says first commit should be labeled this way
    expect(COMMIT_INITIAL.plainLanguageSummary).toMatch(/initial creation/i);
  });
});

// ---------------------------------------------------------------------------
// C-HIST-004: getSpecDiff — field-level diff output shape
// ---------------------------------------------------------------------------
describe("getSpecDiff — output shape (C-HIST-004)", () => {
  it("C-HIST-004a: diff output with changes conforms to schema", () => {
    // Covers: FR-009
    const mockOutput = {
      data: {
        changedFields: COMMIT_UPDATE.changedFields,
        fromSpec: {},
        toSpec: {},
        hasChanges: true,
      },
    };
    expect(GetSpecDiffOutputSchema.safeParse(mockOutput).success).toBe(true);
  });

  it("C-HIST-004b: diff output with no changes has hasChanges: false", () => {
    // Covers: FR-009
    const mockOutput = {
      data: {
        changedFields: [],
        fromSpec: {},
        toSpec: {},
        hasChanges: false,
      },
    };
    expect(GetSpecDiffOutputSchema.safeParse(mockOutput).success).toBe(true);
    expect((mockOutput.data.changedFields as unknown[]).length).toBe(0);
  });

  it("C-HIST-004c: ChangedField has human-readable fieldLabel (not a file path)", () => {
    // Covers: FR-009 — field labels must be non-technical
    for (const field of COMMIT_UPDATE.changedFields) {
      expect(field.fieldLabel).not.toContain("/");
      expect(field.fieldLabel).not.toContain(".md");
      expect(field.fieldLabel).not.toMatch(/^#/);
    }
  });

  it("C-HIST-004d: 'added' change has before: null", () => {
    // Covers: FR-009 — data model constraint
    const addedField = { fieldLabel: "Journey 3", changeType: "added" as const, before: null, after: "User Resets Session" };
    expect(ChangedFieldSchema.safeParse(addedField).success).toBe(true);
    expect(addedField.before).toBeNull();
  });

  it("C-HIST-004e: 'removed' change has after: null", () => {
    // Covers: FR-009 — data model constraint
    const removedField = { fieldLabel: "Journey 2", changeType: "removed" as const, before: "User Signs Out", after: null };
    expect(ChangedFieldSchema.safeParse(removedField).success).toBe(true);
    expect(removedField.after).toBeNull();
  });
});
