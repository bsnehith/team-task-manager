import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createTaskCommentController,
  createTaskController,
  deleteTaskController,
  listTaskActivityController,
  listTaskCommentsController,
  listTasksController,
  updateTaskController,
} from "./task.controller.js";
import {
  createCommentSchema,
  createTaskSchema,
  deleteTaskSchema,
  projectTaskParamsSchema,
  taskIdSchema,
  updateTaskSchema,
} from "./task.validation.js";

const router = Router();

router.use(protect);
router.get("/projects/:projectId/tasks", validate(projectTaskParamsSchema), listTasksController);
router.post("/projects/:projectId/tasks", validate(createTaskSchema), createTaskController);
router.patch("/tasks/:taskId", validate(updateTaskSchema), updateTaskController);
router.delete("/tasks/:taskId", validate(deleteTaskSchema), deleteTaskController);
router.get("/tasks/:taskId/comments", validate(taskIdSchema), listTaskCommentsController);
router.post("/tasks/:taskId/comments", validate(createCommentSchema), createTaskCommentController);
router.get("/tasks/:taskId/activity", validate(taskIdSchema), listTaskActivityController);

export default router;
