import prisma from "../../config/db.js";

export async function getDashboard(userId) {
  const tasks = await prisma.task.findMany({
    where: {
      project: {
        members: { some: { userId } },
      },
    },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  });

  const totalTasks = tasks.length;
  const byStatus = {
    TODO: tasks.filter((task) => task.status === "TODO").length,
    IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS").length,
    DONE: tasks.filter((task) => task.status === "DONE").length,
  };

  const overdueTasks = tasks.filter(
    (task) => task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date(),
  ).length;

  const tasksPerUserMap = tasks.reduce((acc, task) => {
    const key = task.assignee?.name || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const tasksPerUser = Object.entries(tasksPerUserMap).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    totalTasks,
    byStatus,
    overdueTasks,
    tasksPerUser,
  };
}
