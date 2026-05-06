import prisma from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";

export async function createProject(userId, payload) {
  const project = await prisma.project.create({
    data: {
      name: payload.name,
      description: payload.description,
      createdById: userId,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
  });
  return project;
}

export async function getProjectsForUser(userId, filters = {}) {
  const where = {
    members: {
      some: { userId },
    },
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;
  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder || "desc";

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getProjectById(projectId, userId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

export async function addMember(projectId, userId, role = "EDITOR") {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  return prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: { role },
    create: { projectId, userId, role },
  });
}

export async function removeMember(projectId, userId) {
  return prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}

export async function deleteProject(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError(404, "Project not found");
  await prisma.project.delete({ where: { id: projectId } });
}

export async function getProjectMemberRole(projectId, userId) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) throw new ApiError(403, "You are not part of this project");
  return member.role;
}
