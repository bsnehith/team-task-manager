import prisma from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";

async function ensureProjectMember(projectId, userId) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) throw new ApiError(403, "You are not part of this project");
  return member;
}

function canCreateTask(role) {
  return ["ADMIN", "MANAGER", "EDITOR"].includes(role);
}

function canManageTask(role) {
  return ["ADMIN", "MANAGER"].includes(role);
}

function canDeleteTask(role) {
  return ["ADMIN", "MANAGER"].includes(role);
}

function buildPriorityOrder() {
  return {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  };
}

async function createActivity({ taskId, actorId, action, field, oldValue, newValue }) {
  await prisma.taskActivity.create({
    data: {
      taskId,
      actorId,
      action,
      field,
      oldValue: oldValue == null ? null : String(oldValue),
      newValue: newValue == null ? null : String(newValue),
    },
  });
}

async function createNotification({ userId, taskId, type, title, body, referenceKey }) {
  const data = {
    userId,
    taskId: taskId || null,
    type,
    title,
    body,
    referenceKey: referenceKey || null,
  };
  if (referenceKey) {
    await prisma.notification.upsert({
      where: { userId_referenceKey: { userId, referenceKey } },
      update: { title, body, isRead: false },
      create: data,
    });
    return;
  }
  await prisma.notification.create({ data });
}

export async function createTask(projectId, userId, payload) {
  const member = await ensureProjectMember(projectId, userId);
  if (!canCreateTask(member.role)) {
    throw new ApiError(403, "Only editor, manager, or admin can create tasks");
  }

  const task = await prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      priority: payload.priority || "MEDIUM",
      assignedTo: payload.assignedTo || null,
      projectId,
      createdById: userId,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  await createActivity({
    taskId: task.id,
    actorId: userId,
    action: "TASK_CREATED",
  });

  if (task.assignedTo && task.assignedTo !== userId) {
    await createNotification({
      userId: task.assignedTo,
      taskId: task.id,
      type: "TASK_ASSIGNED",
      title: "New task assigned",
      body: `You were assigned "${task.title}"`,
    });
  }

  return task;
}

export async function listTasks(projectId, userId, filters = {}) {
  await ensureProjectMember(projectId, userId);
  const where = {
    projectId,
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.assignedTo ? { assignedTo: filters.assignedTo } : {}),
    ...(filters.dueFrom || filters.dueTo
      ? {
          dueDate: {
            ...(filters.dueFrom ? { gte: new Date(filters.dueFrom) } : {}),
            ...(filters.dueTo ? { lte: new Date(filters.dueTo) } : {}),
          },
        }
      : {}),
  };

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder || "desc";

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true, email: true } } },
      orderBy:
        sortBy === "priority"
          ? undefined
          : {
              [sortBy]: sortOrder,
            },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  const sortedItems =
    sortBy === "priority"
      ? [...items].sort((a, b) => {
          const map = buildPriorityOrder();
          const av = map[a.priority] || 0;
          const bv = map[b.priority] || 0;
          return sortOrder === "asc" ? av - bv : bv - av;
        })
      : items;

  return {
    items: sortedItems,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getTaskComments(taskId, userId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  await ensureProjectMember(task.projectId, userId);
  return prisma.taskComment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function addTaskComment(taskId, userId, content) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  await ensureProjectMember(task.projectId, userId);

  const comment = await prisma.taskComment.create({
    data: { taskId, userId, content },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await createActivity({
    taskId,
    actorId: userId,
    action: "COMMENT_ADDED",
    newValue: content,
  });

  if (task.assignedTo && task.assignedTo !== userId) {
    await createNotification({
      userId: task.assignedTo,
      taskId,
      type: "COMMENT_ADDED",
      title: "New comment on your task",
      body: content,
    });
  }

  return comment;
}

export async function getTaskActivity(taskId, userId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  await ensureProjectMember(task.projectId, userId);
  return prisma.taskActivity.findMany({
    where: { taskId },
    include: { actor: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTask(taskId, userId, payload) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: { select: { id: true, name: true } } },
  });
  if (!task) throw new ApiError(404, "Task not found");

  const member = await ensureProjectMember(task.projectId, userId);
  const isAssignee = task.assignedTo === userId;

  if (!canManageTask(member.role) && !(isAssignee && payload.status)) {
    throw new ApiError(403, "Only manager/admin or assignee can update");
  }

  const updateData = canManageTask(member.role)
    ? {
        ...payload,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate,
      }
    : { status: payload.status };

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  const trackFields = ["status", "priority", "assignedTo", "dueDate", "title", "description"];
  for (const key of trackFields) {
    if (key in updateData && task[key] !== updatedTask[key]) {
      await createActivity({
        taskId,
        actorId: userId,
        action: "TASK_UPDATED",
        field: key,
        oldValue: task[key],
        newValue: updatedTask[key],
      });
    }
  }

  if (updatedTask.assignedTo && updatedTask.assignedTo !== task.assignedTo) {
    await createNotification({
      userId: updatedTask.assignedTo,
      taskId,
      type: "TASK_ASSIGNED",
      title: "Task assigned",
      body: `You were assigned "${updatedTask.title}"`,
    });
  }

  if (updatedTask.assignedTo && updatedTask.assignedTo !== userId) {
    await createNotification({
      userId: updatedTask.assignedTo,
      taskId,
      type: "TASK_UPDATED",
      title: "Task updated",
      body: `Task "${updatedTask.title}" was updated`,
    });
  }

  return updatedTask;
}

export async function deleteTask(taskId, userId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  const member = await ensureProjectMember(task.projectId, userId);
  if (!canDeleteTask(member.role)) throw new ApiError(403, "Project manager/admin only");
  await createActivity({
    taskId,
    actorId: userId,
    action: "TASK_DELETED",
  });
  await prisma.task.delete({ where: { id: taskId } });
}
