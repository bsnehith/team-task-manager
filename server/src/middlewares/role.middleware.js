import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";

export function requireGlobalRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden"));
    }
    return next();
  };
}

export function requireProjectAdmin() {
  return async (req, _res, next) => {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user?.id;
    if (!projectId || !userId) return next(new ApiError(400, "Invalid request"));

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return next(new ApiError(403, "Project admin only"));
    }
    return next();
  };
}

export function requireProjectRoles(...roles) {
  return async (req, _res, next) => {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user?.id;
    if (!projectId || !userId) return next(new ApiError(400, "Invalid request"));

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
    if (!membership || !roles.includes(membership.role)) {
      return next(new ApiError(403, "Insufficient project permissions"));
    }
    return next();
  };
}
