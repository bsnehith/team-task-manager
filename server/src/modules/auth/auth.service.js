import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import env from "../../config/env.js";
import ApiError from "../../utils/ApiError.js";

function signToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function signup({ name, email, password, role = "MEMBER" }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "Email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken(user.id);
  return { user, token };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Credentials are not correct");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Credentials are not correct");

  const token = signToken(user.id);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function forgotPassword({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "No account found with this email");

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  return { email };
}

export async function checkEmailAvailability(email) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return { exists: Boolean(existing) };
}
