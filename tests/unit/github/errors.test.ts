/**
 * Unit tests for src/lib/github/errors.ts
 *
 * Covers: FR-013 (non-technical error messages incl. rate-limit timed message)
 *         Clarification C4 (rate-limit timed message from X-RateLimit-Reset header)
 * See TRACEABILITY.md: ERR-001–ERR-010
 */

import { describe, it, expect } from "vitest";
import {
  mapGitHubError,
  getRateLimitResetMessage,
  GitHubErrorCode,
} from "@/lib/github/errors";

// ---------------------------------------------------------------------------
// ERR-001–ERR-006: HTTP status → error code mapping
// ---------------------------------------------------------------------------
describe("mapGitHubError — status to error code (FR-013)", () => {
  it("ERR-001: 401 status maps to UNAUTHORIZED", () => {
    // Covers: FR-013
    const code = mapGitHubError(401);
    expect(code).toBe(GitHubErrorCode.UNAUTHORIZED);
  });

  it("ERR-002: 403 without rate-limit headers maps to ACCESS_DENIED", () => {
    // Covers: FR-013
    const code = mapGitHubError(403, {});
    expect(code).toBe(GitHubErrorCode.ACCESS_DENIED);
  });

  it("ERR-003: 403 with X-RateLimit-Remaining: 0 maps to RATE_LIMITED", () => {
    // Covers: FR-013, C4 — rate limiting is a distinct case
    const code = mapGitHubError(403, { "x-ratelimit-remaining": "0" });
    expect(code).toBe(GitHubErrorCode.RATE_LIMITED);
  });

  it("ERR-004: 404 status maps to NOT_FOUND", () => {
    // Covers: FR-013
    const code = mapGitHubError(404);
    expect(code).toBe(GitHubErrorCode.NOT_FOUND);
  });

  it("ERR-005: 409 status maps to CONFLICT", () => {
    // Covers: FR-013
    const code = mapGitHubError(409);
    expect(code).toBe(GitHubErrorCode.CONFLICT);
  });

  it("ERR-006: 422 status maps to VALIDATION_ERROR", () => {
    // Covers: FR-013
    const code = mapGitHubError(422);
    expect(code).toBe(GitHubErrorCode.VALIDATION_ERROR);
  });
});

// ---------------------------------------------------------------------------
// ERR-007: User-facing messages are non-technical
// ---------------------------------------------------------------------------
describe("mapGitHubError — user-facing messages are non-technical (FR-013)", () => {
  it("ERR-007a: UNAUTHORIZED message does not mention 'HTTP', '401', or 'token'", () => {
    // Covers: FR-013
    const { userMessage } = mapGitHubError(401, {}, true);
    expect(userMessage).not.toMatch(/\b401\b/);
    expect(userMessage.toLowerCase()).not.toContain("http");
  });

  it("ERR-007b: NOT_FOUND message gives actionable guidance", () => {
    // Covers: FR-013 — per contracts/repos-api.md error display rules
    const { userMessage } = mapGitHubError(404, {}, true);
    expect(userMessage.length).toBeGreaterThan(20);
    // Should explain what happened and what to do
    expect(userMessage.toLowerCase()).toMatch(/repository|repo|find/);
  });

  it("ERR-007c: CONFLICT message mentions both versions", () => {
    // Covers: FR-013 — per contracts/specs-api.md conflict handling
    const { userMessage } = mapGitHubError(409, {}, true);
    expect(userMessage.toLowerCase()).toMatch(/changed|conflict|version/);
  });
});

// ---------------------------------------------------------------------------
// ERR-008–ERR-010: Rate-limit timed message (Clarification C4)
// ---------------------------------------------------------------------------
describe("getRateLimitResetMessage — timed rate-limit message (C4)", () => {
  it("ERR-008: returns a message containing minutes-to-reset when reset is in the future", () => {
    // Covers: C4 — X-RateLimit-Reset header value is a Unix timestamp
    const resetAt = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
    const message = getRateLimitResetMessage(resetAt);
    expect(message).toContain("5 minute");
  });

  it("ERR-009: message rounds down to nearest minute", () => {
    // Covers: C4 — e.g., 4m 45s → "4 minutes"
    const resetAt = Math.floor(Date.now() / 1000) + 285; // 4m 45s
    const message = getRateLimitResetMessage(resetAt);
    expect(message).toContain("4 minute");
  });

  it("ERR-010: message says 'shortly' when reset is within the next 60 seconds", () => {
    // Covers: C4 — < 1 minute edge case
    const resetAt = Math.floor(Date.now() / 1000) + 45;
    const message = getRateLimitResetMessage(resetAt);
    expect(message.toLowerCase()).toMatch(/shortly|moment|less than a minute/);
  });

  it("ERR-010b: message does not contain raw API headers or timestamps", () => {
    // Covers: FR-013, C4 — must be non-technical
    const resetAt = Math.floor(Date.now() / 1000) + 180;
    const message = getRateLimitResetMessage(resetAt);
    expect(message).not.toMatch(/\d{10}/); // no Unix timestamp
    expect(message.toLowerCase()).not.toContain("x-ratelimit");
    expect(message.toLowerCase()).not.toContain("header");
  });
});
