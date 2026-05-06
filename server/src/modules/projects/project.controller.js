import ApiResponse from "../../utils/ApiResponse.js";
import {
  addMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjectsForUser,
  removeMember,
} from "./project.service.js";

export async function createProjectController(req, res, next) {
  try {
    const project = await createProject(req.user.id, req.validated.body);
    return res.status(201).json(new ApiResponse(201, "Project created", project));
  } catch (error) {
    return next(error);
  }
}

export async function listProjectsController(req, res, next) {
  try {
    const projects = await getProjectsForUser(req.user.id, req.validated.query || {});
    return res.status(200).json(new ApiResponse(200, "Projects fetched", projects));
  } catch (error) {
    return next(error);
  }
}

export async function getProjectController(req, res, next) {
  try {
    const project = await getProjectById(req.params.projectId, req.user.id);
    return res.status(200).json(new ApiResponse(200, "Project fetched", project));
  } catch (error) {
    return next(error);
  }
}

export async function addMemberController(req, res, next) {
  try {
    const { userId, role } = req.validated.body;
    const member = await addMember(req.params.projectId, userId, role);
    return res.status(200).json(new ApiResponse(200, "Member added", member));
  } catch (error) {
    return next(error);
  }
}

export async function removeMemberController(req, res, next) {
  try {
    await removeMember(req.params.projectId, req.params.userId);
    return res.status(200).json(new ApiResponse(200, "Member removed"));
  } catch (error) {
    return next(error);
  }
}

export async function deleteProjectController(req, res, next) {
  try {
    await deleteProject(req.params.projectId);
    return res.status(200).json(new ApiResponse(200, "Project deleted"));
  } catch (error) {
    return next(error);
  }
}
