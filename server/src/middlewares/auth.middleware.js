import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

export async function protect(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return next(new ApiError(401, "Invalid token"));
    req.user = user;
    next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
