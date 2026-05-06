import ApiResponse from "../../utils/ApiResponse.js";
import { deleteMyAccount, getMyProfile, listUsers } from "./user.service.js";

export async function meController(req, res, next) {
  try {
    const user = await getMyProfile(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Profile fetched", user));
  } catch (error) {
    return next(error);
  }
}

export async function usersController(_req, res, next) {
  try {
    const users = await listUsers();
    return res.status(200).json(new ApiResponse(200, "Users fetched", users));
  } catch (error) {
    return next(error);
  }
}

export async function deleteMyAccountController(req, res, next) {
  try {
    await deleteMyAccount(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Account deleted"));
  } catch (error) {
    return next(error);
  }
}
