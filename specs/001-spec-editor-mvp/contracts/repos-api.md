# Contract: Repositories API

**Feature**: Spec Editor MVP | **Date**: 2026-02-26

All repository operations use Next.js Server Actions (and one API route for webhook
future support). No separate Express server. Actions are defined in
`src/app/(dashboard)/repos/actions.ts`.

---

## Server Action: `listUserRepos()`

Lists GitHub repositories accessible to the authenticated user.

**Authentication**: Required (editor or admin role).

**Behavior**: Calls `GET /user/repos` (GitHub API) with the session access token.
Returns a simplified list suitable for the Connect UI.

**Returns**:

```typescript
{
  data: Array<{
    fullName: string;    // "{owner}/{repo}"
    owner: string;
    name: string;
    description: string | null;
    private: boolean;
    defaultBranch: string;
    htmlUrl: string;
  }>;
  error?: string;
}
```

**Errors**:
- `"UNAUTHORIZED"` — session token missing or invalid.
- `"GITHUB_API_ERROR"` — GitHub API returned a non-2xx response.

---

## Server Action: `connectRepository(input)`

Connects a GitHub repository to the user's account.

**Authentication**: Required (editor or admin role).

**Input**:

```typescript
{
  owner: string;        // GitHub org or user
  name: string;         // Repository name
  authMode: "oauth_token" | "pat";
  pat?: string;         // Required if authMode === "pat"
}
```

**Validation** (Zod schema — `src/lib/github/repos.ts`):
- `owner` MUST be non-empty and match pattern `^[a-zA-Z0-9_-]+$`.
- `name` MUST be non-empty and match pattern `^[a-zA-Z0-9_.-]+$`.
- If `authMode === "pat"`, `pat` MUST be non-empty and start with `ghp_` or `github_pat_`.

**Behavior**:
1. Uses provided PAT (or OAuth token from session) to call
   `GET /repos/{owner}/{name}` (GitHub API).
2. Validates the response (repo exists, user has read access).
3. Detects `specRootDir` by checking for existence of `specs/` or `.specify/`
   directory using `GET /repos/{owner}/{name}/contents/specs`.
4. Persists the `GitRepository` record (session-local store in MVP).
5. Returns the connected repo metadata.

**Returns**:

```typescript
{
  data?: GitRepository;
  error?: "REPO_NOT_FOUND" | "ACCESS_DENIED" | "ALREADY_CONNECTED" | "GITHUB_API_ERROR" | "VALIDATION_ERROR";
  errorDetail?: string;
}
```

---

## Server Action: `disconnectRepository(repoId)`

Removes a connected repository from the user's account. Does not modify the Git repo.

**Authentication**: Required (editor or admin role).

**Input**:

```typescript
{
  repoId: string; // "{owner}/{repo}"
}
```

**Returns**:

```typescript
{
  success: boolean;
  error?: "REPO_NOT_FOUND" | "UNAUTHORIZED";
}
```

---

## Server Action: `listBranches(repoId)`

Lists branches for a connected repository.

**Authentication**: Required.

**Input**: `{ repoId: string }`

**Behavior**: Calls `GET /repos/{owner}/{name}/branches` (GitHub API, paginated; max
100 branches per page, up to 3 pages in MVP).

**Returns**:

```typescript
{
  data: Array<{
    name: string;
    sha: string;          // HEAD commit SHA
    isDefault: boolean;
  }>;
  error?: string;
}
```

---

## Server Action: `setActiveBranch(repoId, branch)`

Updates the user's active branch selection for a repository (stored in session).

**Authentication**: Required.

**Input**: `{ repoId: string; branch: string }`

**Returns**: `{ success: boolean }`

---

## Error Display Rules

All errors returned by repository actions MUST be mapped to user-friendly messages
before display. The `errorDetail` field MAY be shown in an expandable "technical
details" section for users who want it, but the primary message MUST be non-technical.

| Error code | User-facing message |
|------------|---------------------|
| `REPO_NOT_FOUND` | "We couldn't find that repository. Double-check the name and try again." |
| `ACCESS_DENIED` | "You don't have access to this repository. Check your token permissions or ask the repo owner to grant access." |
| `ALREADY_CONNECTED` | "This repository is already connected to your account." |
| `GITHUB_API_ERROR` | "GitHub returned an unexpected error. Try again in a moment." |
| `UNAUTHORIZED` | "You need to sign in to do that." |
| `VALIDATION_ERROR` | Shown inline on the form field that failed validation. |
