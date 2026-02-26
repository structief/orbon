# Contract: Specifications API

**Feature**: Spec Editor MVP | **Date**: 2026-02-26

All spec-read and spec-write operations use Next.js Server Actions defined in
`src/app/(dashboard)/repos/[repoId]/specs/actions.ts`.

---

## Server Action: `listSpecArtifacts(repoId, branch)`

Lists all spec files detected in a repository for a given branch.

**Authentication**: Required.

**Input**:

```typescript
{
  repoId: string;  // "{owner}/{repo}"
  branch: string;
}
```

**Behavior**:
1. Calls `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` (GitHub API).
2. Filters the tree for files matching spec conventions (paths starting with
   `specs/` or `.specify/memory/`).
3. For each matching file, derives `SpecArtifactType` from filename.
4. Fetches last commit info for each file using
   `GET /repos/{owner}/{repo}/commits?path={path}&per_page=1`.
5. Returns the artifact list (content is NOT fetched at this stage — lazy loaded).

**Returns**:

```typescript
{
  data: SpecArtifact[];
  error?: string;
}
```

**Performance**: Maximum 200 spec files per call. If more exist, returns the first 200
with a `truncated: true` flag and a warning message.

---

## Server Action: `getSpecContent(repoId, branch, path)`

Fetches the content of a specific spec file.

**Authentication**: Required.

**Input**:

```typescript
{
  repoId: string;
  branch: string;
  path: string;      // e.g., "specs/001-auth/spec.md"
}
```

**Behavior**:
1. Calls `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}` (GitHub API).
2. Returns the file content (base64 decoded to UTF-8), SHA, and metadata.

**Returns**:

```typescript
{
  data?: {
    content: string;     // UTF-8 decoded markdown
    sha: string;         // Blob SHA — required for update operations
    path: string;
    size: number;        // bytes
  };
  error?: "NOT_FOUND" | "TOO_LARGE" | "GITHUB_API_ERROR";
}
```

**Constraints**: Files larger than 1 MB will return `TOO_LARGE` error. In this case,
the UI MUST display a message explaining the limitation.

---

## Server Action: `parseFeatureSpec(repoId, branch, path)`

Fetches and parses a `feature_spec` artifact into a structured `FeatureSpec` object.

**Authentication**: Required.

**Input**: Same as `getSpecContent`.

**Behavior**:
1. Calls `getSpecContent` internally.
2. Passes content through `lib/spec-parser/feature-spec.ts`.
3. Returns the structured `FeatureSpec` or an error if parsing fails.

**Returns**:

```typescript
{
  data?: {
    spec: FeatureSpec;
    sha: string;       // Blob SHA — pass back when saving
    rawContent: string; // Original markdown (kept for fallback display)
  };
  error?: "NOT_FOUND" | "PARSE_ERROR" | "TOO_LARGE" | "GITHUB_API_ERROR";
  parseWarnings?: string[]; // Non-fatal issues found during parsing
}
```

When `error === "PARSE_ERROR"`, the UI MUST display `rawContent` in a safe read-only
view with a warning explaining the spec could not be parsed visually.

---

## Server Action: `saveFeatureSpec(input)`

Serializes an edited `FeatureSpec` back to markdown and commits it to Git.

**Authentication**: Required (editor or admin role only).

**Input**:

```typescript
{
  repoId: string;
  branch: string;
  path: string;
  spec: FeatureSpec;        // Updated spec data
  originalSha: string;      // Blob SHA from parseFeatureSpec — for conflict detection
  commitMessage?: string;   // Optional override; auto-generated if omitted
}
```

**Behavior**:
1. Passes `spec` through `lib/spec-writer/feature-spec.ts` to produce markdown.
2. Calls `PUT /repos/{owner}/{repo}/contents/{path}` (GitHub API) with:
   - `content`: base64-encoded markdown
   - `message`: auto-generated commit message (or override)
   - `sha`: `originalSha` (GitHub uses this for conflict detection)
   - `branch`: target branch
3. On success, returns the new blob SHA and commit metadata.

**Auto-generated commit message format** (from `lib/spec-writer/commit-message.ts`):

```
Update spec: {spec title} — {plain-language change summary}

Changed: {field 1}, {field 2}, ...
```

**Returns**:

```typescript
{
  data?: {
    newSha: string;         // Updated blob SHA
    commitSha: string;      // New commit SHA
    commitMessage: string;  // Actual message used
  };
  error?: "CONFLICT" | "ACCESS_DENIED" | "BRANCH_PROTECTED" | "GITHUB_API_ERROR" | "VALIDATION_ERROR";
  errorDetail?: string;
}
```

**Conflict handling**: When GitHub returns 409 (SHA mismatch), the error code MUST
be `"CONFLICT"` and the UI MUST present a conflict resolution dialog (see
`ConflictDialog.tsx`) that shows both the user's version and the latest version.

---

## Server Action: `createFeatureSpec(input)`

Creates a new feature spec file in a connected repository.

**Authentication**: Required (editor or admin role only).

**Input**:

```typescript
{
  repoId: string;
  branch: string;
  featureName: string;      // Human-readable; used to derive path
  initialJourneyTitle?: string;
}
```

**Behavior**:
1. Derives the spec number by listing existing `specs/` subdirectory numbers and
   incrementing the highest.
2. Generates the file path: `specs/{###-kebab-feature-name}/spec.md`.
3. Generates initial markdown from the SpecKit spec template with provided values.
4. Calls `PUT /repos/{owner}/{repo}/contents/{path}` to create the file.

**Returns**:

```typescript
{
  data?: {
    path: string;
    commitSha: string;
    specNumber: string;   // e.g., "002"
  };
  error?: "ACCESS_DENIED" | "PATH_CONFLICT" | "GITHUB_API_ERROR";
}
```

---

## Error Display Rules

| Error code | User-facing message |
|------------|---------------------|
| `NOT_FOUND` | "This spec file doesn't exist on the selected branch." |
| `PARSE_ERROR` | "We couldn't read this spec in visual mode. The raw content is shown below." |
| `TOO_LARGE` | "This spec file is too large to edit visually (over 1 MB). Please use your code editor." |
| `CONFLICT` | "Someone else saved changes to this spec while you were editing. See below to review both versions." |
| `ACCESS_DENIED` | "You don't have permission to edit this spec." |
| `BRANCH_PROTECTED` | "This branch is protected. You may need to create a pull request to make changes." |
| `VALIDATION_ERROR` | Inline on the relevant form field. |
