import type { MockUserSession, MockRepository } from "./types";
import {
  MOCK_SPEC_SUMMARIES,
  MOCK_SPECS,
  MOCK_HISTORY,
  MOCK_PLACEHOLDER_SECTIONS,
} from "./specs";

export * from "./types";
export {
  MOCK_SPEC_SUMMARIES,
  MOCK_SPECS,
  MOCK_HISTORY,
  MOCK_PLACEHOLDER_SECTIONS,
} from "./specs";

export const MOCK_USER_SESSION: MockUserSession = {
  id: "user-mock-1",
  name: "Stakeholder Demo",
  role: "editor",
};

export const MOCK_REPOS: MockRepository[] = [
  {
    id: "repo-spec-editor",
    owner: "structief",
    name: "spec-editor",
    defaultBranch: "main",
    branches: ["main", "002-static-ui-mockup"],
    specs: MOCK_SPEC_SUMMARIES,
  },
];

export function getMockSpecById(specId: string) {
  return MOCK_SPECS.find((s) => s.id === specId) ?? null;
}

export function getMockHistoryBySpecId(specId: string) {
  return MOCK_HISTORY.filter((e) => e.specId === specId);
}

export function getMockPlaceholderSections() {
  return MOCK_PLACEHOLDER_SECTIONS;
}

export function getMockRepoById(repoId: string) {
  return MOCK_REPOS.find((r) => r.id === repoId) ?? null;
}
