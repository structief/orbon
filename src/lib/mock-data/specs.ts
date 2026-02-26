import type { MockSpec, MockSpecSummary, MockHistoryEntry, MockPlaceholderSection } from "./types";

export const MOCK_SPEC_SUMMARIES: MockSpecSummary[] = [
  {
    id: "001-spec-editor-mvp",
    title: "Spec Editor MVP",
    status: "In Progress",
    priority: "P1",
    summary: "Core spec editor with Git-backed specs and stakeholder collaboration.",
    lastUpdated: "2026-02-26",
    lastAuthor: "Alex",
  },
  {
    id: "002-static-ui-mockup",
    title: "Static Front-End Mockup for MVP Validation",
    status: "Validated",
    priority: "P1",
    summary: "Click-through mock of the Spec Editor UI for stakeholder validation.",
    lastUpdated: "2026-02-25",
    lastAuthor: "Jordan",
  },
];

export const MOCK_SPECS: MockSpec[] = [
  {
    id: "001-spec-editor-mvp",
    title: "Spec Editor MVP",
    status: "In Progress",
    journeys: [
      {
        id: "j1",
        title: "Stakeholder reviews a spec",
        priority: "P1",
        description: "A non-technical stakeholder opens a feature spec and reviews journeys, requirements, and success criteria.",
        acceptanceScenarios: [
          {
            id: "s1",
            given: "A feature spec exists in the repo",
            when: "The stakeholder opens the spec detail view",
            then: "They see title, status, user journeys with Given/When/Then, requirements, and success criteria.",
          },
        ],
      },
    ],
    requirements: [
      "Git-backed specification source of truth",
      "Visual, non-technical-friendly collaboration",
      "User-journey-first planning and delivery",
    ],
    successCriteria: [
      "Stakeholders can open and read specs without touching raw markdown",
      "Specs are stored in the repository and versioned with the codebase",
    ],
  },
  {
    id: "002-static-ui-mockup",
    title: "Static Front-End Mockup for MVP Validation",
    status: "Validated",
    journeys: [
      {
        id: "j1",
        title: "Stakeholder clicks through main journeys",
        priority: "P1",
        description: "Stakeholder navigates entry → dashboard → repo connect → spec overview → spec detail → edit.",
        acceptanceScenarios: [
          {
            id: "s1",
            given: "The mock app is running at /mock",
            when: "The user follows the primary CTA and navigates through each screen",
            then: "Each screen appears with expected structure and mock content.",
          },
        ],
      },
    ],
    requirements: [
      "Static routes under (mock) with no backend calls",
      "Consistent mock data across list, detail, and edit views",
      "Placeholder sections for Tasks, Tests, Validation, Deployment",
    ],
    successCriteria: [
      "Full click-through from entry to edit without errors",
      "Realistic mock data visible for stakeholder review",
    ],
  },
];

export const MOCK_HISTORY: MockHistoryEntry[] = [
  {
    id: "h1",
    specId: "001-spec-editor-mvp",
    timestamp: "2026-02-26 14:30",
    author: "Alex",
    summary: "Added P1 journey and acceptance scenario for stakeholder review flow.",
  },
  {
    id: "h2",
    specId: "001-spec-editor-mvp",
    timestamp: "2026-02-25 11:00",
    author: "Jordan",
    summary: "Initial spec structure and success criteria.",
  },
  {
    id: "h3",
    specId: "002-static-ui-mockup",
    timestamp: "2026-02-25 16:00",
    author: "Jordan",
    summary: "Marked status as Validated after stakeholder walkthrough.",
  },
];

export const MOCK_PLACEHOLDER_SECTIONS: MockPlaceholderSection[] = [
  { id: "tasks", title: "Tasks", description: "Linked implementation tasks will appear here. (Coming in a future release.)" },
  { id: "tests", title: "Tests & Results", description: "Test runs and results linked to this spec. (Coming in a future release.)" },
  { id: "validation", title: "Validation", description: "Validation status and checks. (Coming in a future release.)" },
  { id: "deployment", title: "Deployment Status", description: "Deployment and release status. (Coming in a future release.)" },
];
