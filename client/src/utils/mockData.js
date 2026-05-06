export const demoProjects = [
  {
    id: "p1",
    name: "Website Redesign",
    description: "Build a modern responsive marketing website.",
    members: 4,
  },
  {
    id: "p2",
    name: "Mobile App Sprint",
    description: "Deliver onboarding and dashboard modules.",
    members: 6,
  },
];

export const demoTasks = [
  {
    id: "t1",
    title: "Create login page",
    description: "Implement responsive login and signup flow.",
    status: "IN_PROGRESS",
    dueDate: "2026-05-08",
    priority: "HIGH",
    projectId: "p1",
    assignee: { id: "u2", name: "Akhil" },
  },
  {
    id: "t2",
    title: "Setup dashboard cards",
    description: "Show totals, status splits and overdue count.",
    status: "TODO",
    dueDate: "2026-05-10",
    priority: "MEDIUM",
    projectId: "p1",
    assignee: { id: "u1", name: "Saisnehith" },
  },
  {
    id: "t3",
    title: "Task API integration",
    description: "Connect task list and update status actions.",
    status: "DONE",
    dueDate: "2026-05-04",
    priority: "HIGH",
    projectId: "p2",
    assignee: { id: "u1", name: "Saisnehith" },
  },
];
