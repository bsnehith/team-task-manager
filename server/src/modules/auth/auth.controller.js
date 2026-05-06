import ApiResponse from "../../utils/ApiResponse.js";
import {
  checkEmailAvailability,
  forgotPassword,
  login,
  signup,
} from "./auth.service.js";

export async function signupController(req, res, next) {
  try {
    const data = await signup(req.validated.body);
    return res.status(201).json(new ApiResponse(201, "Signup successful", data));
  } catch (error) {
    return next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const data = await login(req.validated.body);
    return res.status(200).json(new ApiResponse(200, "Login successful", data));
  } catch (error) {
    return next(error);
  }
}

export async function forgotPasswordController(req, res, next) {
  try {
    const data = await forgotPassword(req.validated.body);
    return res
      .status(200)
      .json(new ApiResponse(200, "Password updated successfully", data));
  } catch (error) {
    return next(error);
  }
}

export async function checkEmailController(req, res, next) {
  try {
    const { email } = req.validated.query;
    const data = await checkEmailAvailability(email);
    return res.status(200).json(new ApiResponse(200, "Email status fetched", data));
  } catch (error) {
    return next(error);
  }
}
