export function isAdmin(user) {
  return user?.role === "ADMIN";
}

export function canUpdateTask(user, task) {
  if (!user || !task) return false;
  if (isAdmin(user)) return true;
  return task.assignee?.id === user.id;
}
