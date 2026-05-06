import ApiResponse from "../../utils/ApiResponse.js";
import { getDashboard } from "./dashboard.service.js";

export async function dashboardController(req, res, next) {
  try {
    const data = await getDashboard(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Dashboard fetched", data));
  } catch (error) {
    return next(error);
  }
}
