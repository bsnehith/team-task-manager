import prisma from "../../config/db.js";

export async function listNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    include: {
      task: {
        select: { id: true, title: true, status: true, dueDate: true, projectId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markNotificationRead(userId, notificationId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createDueDateReminders(userId) {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      assignedTo: userId,
      status: { not: "DONE" },
      dueDate: { not: null, lte: soon },
    },
    select: { id: true, title: true, dueDate: true },
  });

  for (const task of tasks) {
    const dueDate = new Date(task.dueDate);
    const overdue = dueDate < now;
    const dayKey = now.toISOString().slice(0, 10);
    const referenceKey = `${overdue ? "overdue" : "soon"}:${task.id}:${dayKey}`;
    await prisma.notification.upsert({
      where: { userId_referenceKey: { userId, referenceKey } },
      update: {
        isRead: false,
        title: overdue ? "Task overdue" : "Task due soon",
        body: overdue
          ? `"${task.title}" is overdue.`
          : `"${task.title}" is due within 24 hours.`,
      },
      create: {
        userId,
        taskId: task.id,
        type: overdue ? "TASK_OVERDUE" : "TASK_DUE_SOON",
        title: overdue ? "Task overdue" : "Task due soon",
        body: overdue
          ? `"${task.title}" is overdue.`
          : `"${task.title}" is due within 24 hours.`,
        referenceKey,
      },
    });
  }
}
