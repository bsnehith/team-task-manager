import dayjs from "dayjs";

export function formatDueDate(date) {
  if (!date) return "No due date";
  return dayjs(date).format("DD MMM YYYY");
}

export function isOverdue(date, status) {
  if (!date || status === "DONE") return false;
  return dayjs(date).isBefore(dayjs(), "day");
}
