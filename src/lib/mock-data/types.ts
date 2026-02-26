export type MockUserRole = "viewer" | "editor";
export type MockSpecStatus = "Proposed" | "In Progress" | "Validated";
export type MockPriority = "P1" | "P2" | "P3";
export type MockPlaceholderId = "tasks" | "tests" | "validation" | "deployment";

export interface MockUserSession {
  id: string;
  name: string;
  avatarUrl?: string;
  role: MockUserRole;
}

export interface MockAcceptanceScenario {
  id: string;
  given: string;
  when: string;
  then: string;
}

export interface MockUserJourney {
  id: string;
  title: string;
  priority: MockPriority;
  description: string;
  acceptanceScenarios: MockAcceptanceScenario[];
}

export interface MockSpecSummary {
  id: string;
  title: string;
  status: MockSpecStatus;
  priority: MockPriority;
  summary: string;
  lastUpdated: string;
  lastAuthor: string;
}

export interface MockSpec {
  id: string;
  title: string;
  status: MockSpecStatus;
  journeys: MockUserJourney[];
  requirements: string[];
  successCriteria: string[];
}

export interface MockHistoryEntry {
  id: string;
  specId: string;
  timestamp: string;
  author: string;
  summary: string;
}

export interface MockPlaceholderSection {
  id: MockPlaceholderId;
  title: string;
  description: string;
}

export interface MockRepository {
  id: string;
  owner: string;
  name: string;
  defaultBranch: string;
  branches: string[];
  specs: MockSpecSummary[];
}
