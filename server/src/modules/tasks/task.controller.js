import ApiResponse from "../../utils/ApiResponse.js";
import {
  addTaskComment,
  createTask,
  deleteTask,
  getTaskActivity,
  getTaskComments,
  listTasks,
  updateTask,
} from "./task.service.js";

export async function createTaskController(req, res, next) {
  try {
    const task = await createTask(req.params.projectId, req.user.id, req.validated.body);
    return res.status(201).json(new ApiResponse(201, "Task created", task));
  } catch (error) {
    return next(error);
  }
}

export async function listTasksController(req, res, next) {
  try {
    const tasks = await listTasks(req.params.projectId, req.user.id, req.validated.query || {});
    return res.status(200).json(new ApiResponse(200, "Tasks fetched", tasks));
  } catch (error) {
    return next(error);
  }
}

export async function updateTaskController(req, res, next) {
  try {
    const task = await updateTask(req.params.taskId, req.user.id, req.validated.body);
    return res.status(200).json(new ApiResponse(200, "Task updated", task));
  } catch (error) {
    return next(error);
  }
}

export async function deleteTaskController(req, res, next) {
  try {
    await deleteTask(req.params.taskId, req.user.id);
    return res.status(200).json(new ApiResponse(200, "Task deleted"));
  } catch (error) {
    return next(error);
  }
}

export async function listTaskCommentsController(req, res, next) {
  try {
    const comments = await getTaskComments(req.params.taskId, req.user.id);
    return res.status(200).json(new ApiResponse(200, "Comments fetched", comments));
  } catch (error) {
    return next(error);
  }
}

export async function createTaskCommentController(req, res, next) {
  try {
    const comment = await addTaskComment(req.params.taskId, req.user.id, req.validated.body.content);
    return res.status(201).json(new ApiResponse(201, "Comment added", comment));
  } catch (error) {
    return next(error);
  }
}

export async function listTaskActivityController(req, res, next) {
  try {
    const activity = await getTaskActivity(req.params.taskId, req.user.id);
    return res.status(200).json(new ApiResponse(200, "Activity fetched", activity));
  } catch (error) {
    return next(error);
  }
}
