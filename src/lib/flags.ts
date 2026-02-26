/**
 * Feature flags for the Spec Editor.
 *
 * Rules (see spec FR-014):
 * - Never read process.env for a feature flag outside this module.
 * - Always call isEnabled(FLAGS.<FLAG>) at the call site.
 * - Adding a flag requires: a constant in FLAGS, a row in DEFAULTS, and a row in
 *   the Feature Flags table in specs/001-spec-editor-mvp/spec.md.
 *
 * Override any flag at deploy time via its NEXT_PUBLIC_FEATURE_<FLAG> env var
 * (set to "1" or "true" to enable, "0" or "false" to disable).
 */

// ---------------------------------------------------------------------------
// Flag registry
// ---------------------------------------------------------------------------

export const FLAGS = {
  // -- MVP flags (default: true) -------------------------------------------
  /** History tab and field-level diff view (US4 / FR-008, FR-009). */
  SPEC_HISTORY: "spec_history",
  /** Create new spec from the spec list (FR-003, FR-006). */
  SPEC_CREATE: "spec_create",

  // -- Future flags (default: false) ----------------------------------------
  /** Full task board and sprint planning (FR-012 placeholder). */
  TASK_TRACKING: "task_tracking",
  /** Test definitions and results viewer (FR-012 placeholder). */
  TEST_REVIEW: "test_review",
  /** Automated spec validation dashboard (FR-012 placeholder). */
  SPEC_VALIDATION: "spec_validation",
  /** CI/CD integration and deployment badges (FR-012 placeholder). */
  DEPLOYMENT_STATUS: "deployment_status",
  /** GitLab and Bitbucket repository support (out-of-scope MVP). */
  MULTI_PROVIDER: "multi_provider",
  /** GitHub App auth mode in place of OAuth App + PAT (out-of-scope MVP). */
  GITHUB_APP_AUTH: "github_app_auth",
  /** UI for assigning and changing user roles (FR-010, first-connector only in MVP). */
  ROLE_MANAGEMENT_UI: "role_management_ui",
} as const;

export type FlagName = (typeof FLAGS)[keyof typeof FLAGS];

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS: Record<FlagName, boolean> = {
  [FLAGS.SPEC_HISTORY]: true,
  [FLAGS.SPEC_CREATE]: true,

  [FLAGS.TASK_TRACKING]: false,
  [FLAGS.TEST_REVIEW]: false,
  [FLAGS.SPEC_VALIDATION]: false,
  [FLAGS.DEPLOYMENT_STATUS]: false,
  [FLAGS.MULTI_PROVIDER]: false,
  [FLAGS.GITHUB_APP_AUTH]: false,
  [FLAGS.ROLE_MANAGEMENT_UI]: false,
};

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Returns true when the given flag is enabled.
 *
 * Resolution order (first match wins):
 * 1. NEXT_PUBLIC_FEATURE_<FLAG> env var, if set.
 * 2. Hard-coded default from DEFAULTS.
 */
export function isEnabled(flag: FlagName): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;
  const envValue =
    typeof process !== "undefined" ? process.env[envKey] : undefined;

  if (envValue !== undefined) {
    return envValue === "1" || envValue === "true";
  }

  return DEFAULTS[flag];
}

/**
 * Returns a snapshot of all flags and their resolved values.
 * Useful for debug panels or server-side logging.
 */
export function allFlags(): Record<FlagName, boolean> {
  return Object.fromEntries(
    (Object.values(FLAGS) as FlagName[]).map((flag) => [flag, isEnabled(flag)])
  ) as Record<FlagName, boolean>;
}
