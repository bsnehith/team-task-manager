import ApiResponse from "../utils/ApiResponse.js";

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return res.status(statusCode).json(new ApiResponse(statusCode, message));
}
