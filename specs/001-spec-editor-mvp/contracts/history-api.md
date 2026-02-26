# Contract: History & Diff API

**Feature**: Spec Editor MVP | **Date**: 2026-02-26

History and diff operations use Next.js Server Actions defined in
`src/app/(dashboard)/repos/[repoId]/specs/[...specPath]/history/actions.ts`.

---

## Server Action: `getSpecHistory(repoId, branch, path, options?)`

Returns the Git commit history for a specific spec file.

**Authentication**: Required.

**Input**:

```typescript
{
  repoId: string;
  branch: string;
  path: string;       // e.g., "specs/001-auth/spec.md"
  options?: {
    page?: number;    // Default: 1
    perPage?: number; // Default: 20; max: 50
  };
}
```

**Behavior**:
1. Calls `GET /repos/{owner}/{repo}/commits?path={path}&sha={branch}&per_page={perPage}&page={page}`
   (GitHub API).
2. For each commit in the response, derives a `plainLanguageSummary` using the
   commit message parser (`lib/spec-writer/commit-message.ts` in reverse).
3. Returns the list of `CommitSummary` objects.

**Plain-language summary derivation**:
- If the commit message matches the auto-generated format
  (`Update spec: {title} — {summary}`), extract the summary portion directly.
- Otherwise, use the first line of the commit message and prefix with
  "Changed by {author}:".

**Returns**:

```typescript
{
  data?: {
    commits: CommitSummary[];
    totalCount: number | null;  // null if GitHub does not return total
    hasMore: boolean;
  };
  error?: "NOT_FOUND" | "GITHUB_API_ERROR";
}
```

---

## Server Action: `getSpecAtCommit(repoId, commitSha, path)`

Fetches the content of a spec file at a specific commit, parses it, and returns
the structured spec.

**Authentication**: Required.

**Input**:

```typescript
{
  repoId: string;
  commitSha: string;   // Full or abbreviated SHA
  path: string;
}
```

**Behavior**:
1. Calls `GET /repos/{owner}/{repo}/contents/{path}?ref={commitSha}` (GitHub API).
2. Decodes content and parses it with `lib/spec-parser/feature-spec.ts`.
3. Returns the structured spec at that point in time.

**Returns**:

```typescript
{
  data?: {
    spec: FeatureSpec;
    rawContent: string;
    commitSha: string;
  };
  error?: "NOT_FOUND" | "PARSE_ERROR" | "GITHUB_API_ERROR";
}
```

---

## Server Action: `getSpecDiff(repoId, fromSha, toSha, path)`

Returns a structured, field-level diff between two versions of a spec file.

**Authentication**: Required.

**Input**:

```typescript
{
  repoId: string;
  fromSha: string;    // Older commit SHA (or "initial" for first version)
  toSha: string;      // Newer commit SHA (or "HEAD" for latest)
  path: string;
}
```

**Behavior**:
1. Fetches the spec at both `fromSha` and `toSha` using `getSpecAtCommit`.
2. Compares the two `FeatureSpec` structures field by field using
   `lib/spec-parser/diff.ts` (new module).
3. Produces a list of `ChangedField` records describing what changed at the
   field level (not the raw text level).

**Diff logic (field-level)**:
- Compare `title`: single text field.
- Compare `status`: single enum field.
- Compare `journeys` array: match by `index`; for each journey, compare `title`,
  `priority`, `description`, `independentTest`, and `acceptanceScenarios` count.
- Compare `functionalRequirements` array: match by `id`.
- Compare `successCriteria` array: match by `id`.
- New items in `toSha` → `changeType: "added"`.
- Items in `fromSha` not in `toSha` → `changeType: "removed"`.
- Changed values → `changeType: "updated"` with `before` and `after`.

**Returns**:

```typescript
{
  data?: {
    changedFields: ChangedField[];
    fromSpec: FeatureSpec;
    toSpec: FeatureSpec;
    hasChanges: boolean;
  };
  error?: "NOT_FOUND" | "PARSE_ERROR" | "GITHUB_API_ERROR";
}
```

When `error === "PARSE_ERROR"` for either version, the UI MUST fall back to a raw
text diff view rather than the field-level view.

---

## Diff UI Behavior

- **Color coding**: Added fields shown with green background; removed with red;
  updated with amber.
- **Label-first**: Show the field label before the value, not raw markdown paths.
- **Collapsible**: Unchanged sections are collapsed by default; user can expand.
- **Non-technical first**: If `changedFields.length === 0`, show "No visual changes
  detected" even if whitespace or formatting changed in the raw file.
- **Raw fallback**: A "View raw diff" toggle exposes the underlying text diff for
  technical users.

---

## Error Display Rules

| Error code | User-facing message |
|------------|---------------------|
| `NOT_FOUND` | "One of the selected versions could not be found. It may have been deleted." |
| `PARSE_ERROR` | "One version of this spec couldn't be read visually. Showing raw text comparison." |
| `GITHUB_API_ERROR` | "Couldn't load history from GitHub. Try again in a moment." |
