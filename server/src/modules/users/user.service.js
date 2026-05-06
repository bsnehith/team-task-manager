import prisma from "../../config/db.js";

export async function getMyProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteMyAccount(userId) {
  await prisma.user.delete({
    where: { id: userId },
  });
}
