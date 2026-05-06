import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "./notification.controller.js";

const router = Router();

router.use(protect);
router.get("/", listNotificationsController);
router.patch("/:id/read", markNotificationReadController);
router.patch("/read-all", markAllNotificationsReadController);

export default router;
