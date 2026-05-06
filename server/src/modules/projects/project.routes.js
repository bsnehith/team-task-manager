import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireProjectAdmin, requireProjectRoles } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  addMemberController,
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  removeMemberController,
} from "./project.controller.js";
import {
  createProjectSchema,
  listProjectsSchema,
  memberSchema,
  projectIdSchema,
} from "./project.validation.js";

const router = Router();

router.use(protect);

router.get("/", validate(listProjectsSchema), listProjectsController);
router.post("/", validate(createProjectSchema), createProjectController);
router.get("/:projectId", validate(projectIdSchema), getProjectController);
router.delete("/:projectId", requireProjectAdmin(), validate(projectIdSchema), deleteProjectController);
router.post(
  "/:projectId/members",
  requireProjectRoles("ADMIN", "MANAGER"),
  validate(memberSchema),
  addMemberController,
);
router.delete(
  "/:projectId/members/:userId",
  requireProjectRoles("ADMIN", "MANAGER"),
  removeMemberController,
);

export default router;
