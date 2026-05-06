import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  deleteMyAccountController,
  meController,
  usersController,
} from "./user.controller.js";

const router = Router();

router.get("/me", protect, meController);
router.get("/", protect, usersController);
router.delete("/me", protect, deleteMyAccountController);

export default router;
