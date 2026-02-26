# Research: Spec Editor MVP

**Branch**: `001-spec-editor-mvp` | **Date**: 2026-02-26
**Phase 0 output** for [plan.md](./plan.md)

This document resolves all NEEDS CLARIFICATION items from the Technical Context and
records architectural decisions with rationale and alternatives considered.

---

## Decision 1: Authentication Provider and Strategy

**Decision**: Auth.js v5 (NextAuth) with GitHub OAuth as the sole provider in MVP.
Sessions stored as encrypted JWTs in HTTP-only cookies (stateless; no DB required
for auth).

**Rationale**:
- GitHub OAuth is the natural choice because the primary integration is GitHub repos.
  Users who connect a GitHub repo already have a GitHub account, so a single sign-in
  covers both authentication and repo authorization.
- Auth.js v5 is the de-facto standard for Next.js authentication, supports the App
  Router, and provides first-class GitHub provider support out of the box.
- JWT sessions eliminate the need for a session store in MVP, keeping infrastructure
  lean. The GitHub access token is included in the session (encrypted) so server
  actions can use it directly for API calls without a database lookup.
- Non-technical users will recognize "Sign in with GitHub" and trust it — reducing
  onboarding friction.

**Alternatives considered**:
- **Custom email/password + magic link** (e.g., Resend + custom token table): Rejected
  because it requires a database for token storage, adds email deliverability concerns,
  and is unfamiliar to most product owners who are used to OAuth flows.
- **Clerk / Auth0 / Supabase Auth**: Full-featured managed identity platforms.
  Rejected for MVP because they add a paid third-party dependency, introduce
  vendor lock-in, and do not simplify the GitHub-specific token handling needed for
  repo access. Can be evaluated post-MVP if multi-provider support is required.
- **NextAuth v4** (legacy): Rejected in favor of v5 which supports App Router natively
  and has a more stable async API.

---

## Decision 2: Git Integration Strategy

**Decision**: GitHub only for MVP. Use the GitHub REST API (Octokit `@octokit/rest`)
for all Git operations. No server-side repository cloning. The user's GitHub OAuth
access token (stored in the Auth.js JWT session) is used for all API calls, scoped
to repositories the user has authorized.

**Operations covered by GitHub REST API**:
- List user repositories and branches
- Read file contents at a specific branch/ref (`GET /repos/{owner}/{repo}/contents/{path}`)
- Create or update a file (commit in one API call) (`PUT /repos/{owner}/{repo}/contents/{path}`)
- Get commit history for a specific file (`GET /repos/{owner}/{repo}/commits?path={path}`)
- Get commit details including file diffs (`GET /repos/{owner}/{repo}/commits/{sha}`)

**Rationale**:
- Using the GitHub REST API means zero server-side storage for repo content, full
  respect for GitHub's existing access control, and a well-documented, stable surface.
- Cloning repos server-side would require disk space management, concurrency handling,
  and background sync jobs — all out of scope for MVP and at odds with the stateless
  architecture.
- GitHub is the dominant platform for the target users (product owners working with
  development teams). Supporting only GitHub in MVP allows focus on UX quality rather
  than provider abstraction.
- The provider interface (`lib/github/`) is designed to be abstracted so a GitLab or
  Bitbucket provider can be added later without changing consumers.

**Alternatives considered**:
- **isomorphic-git + GitHub API**: Run git operations in Node without cloning. More
  complex, less mature, and the GitHub API already covers all MVP operations without
  needing raw Git protocol.
- **Multi-provider from day one (GitHub + GitLab + Bitbucket)**: Rejected because
  each provider has different auth flows, rate limits, API shapes, and webhook
  models. Adding providers is a distinct workstream and should be validated after MVP.
- **GitHub App instead of OAuth App**: A GitHub App provides finer-grained permissions
  and can be installed on organizations. Recommended for post-MVP but adds complexity
  (installation flow, webhook setup, private key management) that is not justified in
  MVP.

---

## Decision 3: Node.js and Next.js Versions

**Decision**: Node.js 20 LTS, Next.js 15 (App Router), React 19, TypeScript 5.x.

**Rationale**:
- Node.js 20 LTS is the current long-term support release (supported through April 2026
  at minimum, transitioning to maintenance). It is the standard target for Vercel
  deployments and most CI environments.
- Next.js 15 with App Router and React Server Components is now stable and represents
  the current recommended approach for new Next.js projects. Server Actions replace
  custom fetch-and-mutation boilerplate and reduce client bundle size.
- TypeScript 5.x (latest stable) offers improved performance and features compared to
  4.x, and is the default for new Next.js projects.

**Alternatives considered**:
- **Node.js 22**: Too new for broad hosting support at time of writing; not yet LTS.
- **Next.js Pages Router**: Legacy routing model; more client-side JavaScript, less
  efficient data fetching. Rejected in favor of App Router.
- **Remix**: A strong alternative, but the team's SpecKit tooling and constitution are
  already Next.js-oriented.

---

## Decision 4: UI Framework and Component Library

**Decision**: Tailwind CSS 4 for styling + shadcn/ui as the component library.

**Rationale**:
- Tailwind CSS provides utility-first styling that is easy to maintain and does not
  require a separate CSS file per component.
- shadcn/ui is a curated set of accessible, unstyled-by-default React components built
  on Radix UI primitives. It satisfies the WCAG 2.1 AA requirement (Radix UI
  components are keyboard-navigable and screen-reader compatible out of the box).
- shadcn/ui components are copied into the project (not imported from a package), which
  means they can be customized freely without fighting a third-party API.

**Alternatives considered**:
- **Material UI (MUI)**: Opinionated design system, heavy bundle, less flexibility for
  non-technical visual customization. Rejected.
- **Chakra UI**: Good accessibility, but requires more configuration for Tailwind
  coexistence. Rejected for simplicity.
- **Plain Radix UI without shadcn**: More setup required; shadcn/ui wraps Radix in a
  ready-to-use fashion that is consistent with the "sensible default" principle.

---

## Decision 5: Hosting and Deployment

**Decision**: Vercel as primary deployment target for MVP.

**Rationale**:
- Vercel is the canonical hosting platform for Next.js and provides zero-configuration
  deployment for App Router projects (including Server Actions and Edge Functions if
  needed).
- Vercel's preview deployment feature enables easy review of spec-related changes by
  non-technical stakeholders before merging.
- No server management overhead in MVP phase.

**Alternatives considered**:
- **Docker + self-hosted Node**: Viable for teams with on-premise requirements.
  Not chosen as default for MVP but supported via the included `Dockerfile` in the
  project structure for teams that need it.
- **AWS Amplify / Railway**: Comparable to Vercel but less mature for Next.js 15 App
  Router at time of writing.

---

## Decision 6: Spec Directory Convention

**Decision**: The Spec Editor will detect spec files in the following directories,
in priority order:
1. `specs/` — SpecKit feature specs and plans (primary)
2. `.specify/` — SpecKit configuration, templates, memory (secondary; readable but
   not editable by non-technical users in MVP)

Within `specs/`, spec files are expected to follow the pattern:
`specs/{###-feature-name}/spec.md` (required), `plan.md`, `tasks.md` (optional).

For repos that do not follow the SpecKit convention, the MVP will offer a directory
picker and will mark spec files without SpecKit structure as "unstructured" (readable
but not editable via the visual form in MVP).

**Rationale**:
- The target project (Spec Editor itself) and all SpecKit-based projects follow this
  layout. Starting with the known layout avoids over-engineering a generic file browser.
- Marking non-conforming files as "unstructured" rather than failing hard means the
  app remains useful for partial adoption.

**Alternatives considered**:
- **User-configurable path**: Requires settings UI and persistence. Deferred to
  post-MVP.
- **Auto-detect any markdown file**: Produces too much noise in large repos. Rejected
  for initial MVP.

---

## Decision 7: Spec Parsing and Serialization

**Decision**: Use `gray-matter` to extract YAML frontmatter and `remark` to parse the
markdown body into an AST. A custom `lib/spec-parser/feature-spec.ts` module will
extract the structured fields (user journeys, priorities, acceptance scenarios,
requirements, success criteria) from the headings and content. Serialization uses
`lib/spec-writer/feature-spec.ts` which rebuilds the markdown from the parsed
structure, preserving the SpecKit template format.

**Rationale**:
- `gray-matter` is a lightweight, well-tested package widely used in Next.js projects
  for frontmatter parsing.
- `remark` provides a robust AST-based approach to parsing markdown, making it
  possible to extract structured sections reliably even if the markdown has minor
  formatting differences.
- Keeping the spec in its canonical markdown format (rather than converting to a
  proprietary format) ensures that dev teams can still edit specs directly in their
  editor and version control systems continue to show clean text diffs.

**Alternatives considered**:
- **Store specs as JSON in the repo**: Would simplify parsing but break the dev
  team's workflow (no human-readable specs in the repo). Rejected — violates
  constitution Principle I (Git-backed truth must remain readable by developers).
- **Use a specialized markdown-to-JSON schema (e.g., MDX, Contentlayer)**: Adds
  build-time complexity and requires the spec format to stay within schema constraints.
  The current SpecKit format uses conventions (headings, keywords) rather than strict
  schema, which `remark` handles more flexibly.

---

## Decision 8: Testing Strategy

**Decision**:
- **Unit tests**: Vitest (fast, native ESM support, Vite-based — compatible with
  Next.js + TypeScript without extra config).
- **Component tests**: Vitest + React Testing Library (tests component behavior
  from a user perspective; no implementation details).
- **E2E tests**: Playwright (cross-browser; can be run against local dev server or
  Vercel preview deployments; non-flaky due to robust auto-wait).

**Rationale**:
- Vitest replaces Jest in modern Next.js projects; it is faster and requires less
  configuration to work with ESM and TypeScript path aliases.
- Playwright is preferred over Cypress for E2E because it supports multiple browsers
  out of the box and is the recommended E2E tool by the Next.js team.
- Component tests focus on the spec-parser, spec-writer, and critical UI components
  (SpecEditor, JourneyEditor) since these are the highest-risk areas.

**Alternatives considered**:
- **Jest for unit tests**: Slower cold start, more config required for ESM. Rejected.
- **Cypress for E2E**: Strong tool but single-browser by default in free tier.
  Playwright preferred.
