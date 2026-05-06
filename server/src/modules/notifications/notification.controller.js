import ApiResponse from "../../utils/ApiResponse.js";
import {
  createDueDateReminders,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notification.service.js";

export async function listNotificationsController(req, res, next) {
  try {
    await createDueDateReminders(req.user.id);
    const data = await listNotifications(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Notifications fetched", data));
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationReadController(req, res, next) {
  try {
    await markNotificationRead(req.user.id, req.params.id);
    return res.status(200).json(new ApiResponse(200, "Notification marked as read"));
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsReadController(req, res, next) {
  try {
    await markAllNotificationsRead(req.user.id);
    return res.status(200).json(new ApiResponse(200, "All notifications marked as read"));
  } catch (error) {
    return next(error);
  }
}
