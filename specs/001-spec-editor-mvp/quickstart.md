# Quickstart: Spec Editor MVP

**Branch**: `001-spec-editor-mvp` | **Date**: 2026-02-26
**Phase 1 output** for [plan.md](./plan.md)

This guide covers how to run the Spec Editor locally, connect a test Git repository,
and walk through the three P1 user journeys end-to-end.

---

## Prerequisites

- Node.js 20 LTS (`node --version` should output `v20.x.x`)
- A GitHub account with access to at least one repository containing spec files
  (or any repository you want to test with)
- A GitHub OAuth App (for local development) — see setup step below

---

## 1. Clone and Install

```bash
git clone <spec-editor-repo-url>
cd spec-editor
npm install
```

---

## 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the following values:

```bash
# Auth.js
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_GITHUB_ID=<your GitHub OAuth App Client ID>
AUTH_GITHUB_SECRET=<your GitHub OAuth App Client Secret>

# App URL (for OAuth callback)
NEXTAUTH_URL=http://localhost:3000

# Optional: override detected spec root directory
SPEC_ROOT_DIR=specs
```

### Creating a GitHub OAuth App (for local dev)

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Set:
   - **Application name**: Spec Editor (local)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy the **Client ID** and generate a **Client Secret**.
4. Paste both into `.env.local`.

---

## 3. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 4. Walk Through the P1 User Journeys

### Journey 1: Log In and Connect a Repository

1. Open `http://localhost:3000`.
2. You are redirected to the login page. Click **Sign in with GitHub**.
3. Authorize the Spec Editor OAuth App on GitHub.
4. You are redirected to the dashboard (empty repos state).
5. Click **Connect a repository**.
6. Enter the owner and repository name of a GitHub repo you have access to
   (e.g., `your-org/your-repo`), or pick from the list of your repos.
7. Choose auth mode: **Use my GitHub session** (default) or enter a PAT.
8. Click **Connect**. The app validates access and detects the spec directory.
9. You land on the repository's spec overview page.

**Expected outcome**: The spec overview shows the repo name, active branch, and
(if the repo has spec files) a list of spec cards.

---

### Journey 2: View Current Specifications

1. From the spec overview page, you see spec cards — each showing the feature
   title and status badge.
2. Click any spec card.
3. The spec detail view opens, showing:
   - The feature title and status.
   - User journeys as collapsible cards, each with priority badge, description,
     and acceptance scenarios.
   - Requirements and success criteria sections below.
4. Use the **Branch selector** at the top to switch to a different branch and
   confirm the spec list updates.

**Expected outcome**: All spec content is displayed in readable, non-technical form
with no raw markdown visible.

---

### Journey 3: Edit a Feature Spec Visually

1. Open a spec detail view (from Journey 2).
2. Click **Edit** (top-right button — only visible if you have editor role).
3. The spec switches to edit mode: all fields become form controls.
4. Modify a user journey:
   - Change the title.
   - Change the priority using the dropdown (P1, P2, P3…).
   - Edit the description text.
5. Click **Save**.
6. A confirmation dialog shows a summary of changes. Click **Confirm save**.
7. The app commits the change to GitHub and returns to the detail view.
8. Open the **History** tab — you should see the new commit at the top with a
   plain-language description of what changed.

**Expected outcome**: The edit is visible in both the spec detail view and the
Git commit history on GitHub.

---

## 5. Run Tests

```bash
# Unit and component tests
npm run test

# E2E tests (requires dev server running on port 3000)
npm run test:e2e
```

For E2E tests, set `E2E_GITHUB_TOKEN` in `.env.test.local` to a PAT with `repo`
scope pointing at a test repository.

---

## 6. Build for Production

```bash
npm run build
npm run start
```

Or deploy to Vercel:

```bash
npx vercel --prod
```

Set the same environment variables as `.env.local` in the Vercel project settings.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Redirected to `/login` immediately after OAuth | `AUTH_SECRET` missing or `NEXTAUTH_URL` incorrect | Check `.env.local` values |
| "Repository not found" on connect | Wrong owner/name or token lacks `repo` scope | Verify repo exists and grant `repo` scope to the OAuth App |
| Spec list is empty for a repo with specs | Spec files not in `specs/` directory | Check the `SPEC_ROOT_DIR` env var or use the directory picker |
| "Parse error" on spec detail view | Spec file does not follow SpecKit format | The raw content is shown; spec can still be edited in raw mode (coming in future) |
| Edit button not visible | User has `viewer` role | Check role assignment; contact the repo admin |
