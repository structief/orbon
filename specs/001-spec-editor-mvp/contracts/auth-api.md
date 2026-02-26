# Contract: Authentication API

**Feature**: Spec Editor MVP | **Date**: 2026-02-26

Authentication is handled entirely by Auth.js v5. The following contracts describe
the key endpoints and server actions exposed by the authentication layer.

---

## 1. `GET /api/auth/signin`

Initiates the GitHub OAuth flow.

**Description**: Redirects the user to GitHub's OAuth authorization page. This
endpoint is handled by Auth.js and does not require a custom implementation.

**Query parameters**:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `callbackUrl` | No | URL to redirect to after successful sign-in (default: `/`) |

**Response**: `302 Redirect` to GitHub OAuth.

---

## 2. `GET /api/auth/callback/github`

OAuth callback endpoint — handled by Auth.js. GitHub redirects here after the user
authorizes.

**Auth.js behavior**:
- Exchanges the authorization code for an access token.
- Stores `access_token`, `displayName`, `avatarUrl`, and GitHub user ID in the
  encrypted JWT session cookie.
- Redirects to `callbackUrl` or `/` on success.
- Redirects to `/login?error=...` on failure.

---

## 3. `POST /api/auth/signout`

Signs the user out by clearing the session cookie.

**Response**: `302 Redirect` to `/login`.

---

## 4. Server Action: `getSession()`

Returns the current session for authenticated server components and actions.

**Location**: `lib/auth/config.ts` (exported via `auth()` from Auth.js)

**Returns**:

```typescript
interface Session {
  user: {
    id: string;
    displayName: string;
    email: string | null;
    avatarUrl: string;
    role: "viewer" | "editor" | "admin";
  };
  accessToken: string; // GitHub OAuth token — server-side only
  expires: string;     // ISO 8601 expiry timestamp
}
```

**Error cases**:
- Returns `null` if no valid session exists. Server components MUST redirect to
  `/login` when `null`.

---

## 5. Middleware Auth Guard

**Location**: `src/middleware.ts`

All routes under `/(dashboard)/**` require an authenticated session. The middleware
checks for a valid Auth.js session and redirects unauthenticated requests to
`/login?callbackUrl=<original_path>`.

**Public routes** (no auth required):
- `/login`
- `/api/auth/**`
- `/` (redirects authenticated users to `/repos`)

---

## 6. Error States

| Error | Display | Recovery |
|-------|---------|----------|
| OAuth authorization denied by user | `/login?error=access_denied` | Prompt to try again |
| GitHub returns an error on callback | `/login?error=github_error` | Show GitHub status link |
| Session expired mid-session | Middleware intercept → `/login?callbackUrl=...` | Re-authenticate and return to previous page |
| Access token revoked by user | GitHub API returns 401 → sign out | Clear session; redirect to `/login` with message |
