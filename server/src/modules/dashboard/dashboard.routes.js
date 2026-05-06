import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get("/", protect, dashboardController);

export default router;
