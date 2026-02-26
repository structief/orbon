## Quickstart: Static Front-End Mockup (Branch `002-static-ui-mockup`)

This quickstart explains how to run and click through the static Spec Editor mockup so stakeholders can validate the UI before any backend work is implemented.

### 1. Prerequisites

- Node.js 20.x installed
- Git access to the repository containing this feature

### 2. Check out the feature branch

```bash
git fetch origin
git checkout 002-static-ui-mockup
```

### 3. Install dependencies

From the repository root:

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Then open `http://localhost:3000/mock` in your browser.

### 5. Click through the main journeys

Follow these steps to validate User Stories 1–3 from the feature spec:

1. **Entry / Sign-in or Onboarding**
   - Navigate to `/mock` and confirm you see an entry screen that represents sign-in or onboarding.
   - Click the primary call-to-action (e.g. “Continue” or “Sign in”) to reach the post-auth screen.

2. **Post-auth Dashboard / Repo Connection**
   - On the dashboard-like screen, observe any connected repos and a clear “Connect a repository” action.
   - Trigger the repo connection flow and step through until you land on a spec overview for a mock repo.

3. **Spec Overview → Spec Detail**
   - On the spec overview, confirm that at least two or three specs are listed with realistic titles, statuses, and summaries.
   - Click one spec to open its detail view.

4. **Spec Detail → Edit View**
   - On the spec detail screen, review the mock journeys, acceptance scenarios, requirements, and success criteria.
   - Click the “Edit” action (if available) to open an edit-style view; confirm that fields are pre-filled with the same mock content.

5. **Spec Detail → History & Placeholders**
   - From the spec detail, navigate to any “History” tab or section and confirm that a mock list of history entries is visible.
   - Scroll to or expand any “Tasks”, “Tests & Results”, “Validation”, or “Deployment Status” placeholders and confirm they are clearly labeled as future features.

### 6. Explore empty and error-like states

Depending on how the mock is wired, use the provided controls or routes to:

- View an empty-state version of the dashboard or spec overview (e.g. “no repos” or “no specs”).
- Optionally view a representative error-style screen (e.g. an invalid repo or failed connection mock) to validate layout and copy.

### 7. Run the click-through test (optional)

If Playwright tests are available:

```bash
npm run test:e2e
```

This should execute an automated click-through of the primary journeys described above and confirm that the mock remains navigable end-to-end.

