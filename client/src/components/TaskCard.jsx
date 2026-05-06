import { CalendarDays, Flag } from "lucide-react";
import { formatDueDate, isOverdue } from "../utils/date.js";
import StatusBadge from "./StatusBadge.jsx";

export default function TaskCard({
  task,
  onStatusChange,
  canUpdateStatus,
  canManageTask,
  onEditTask,
  onDeleteTask,
}) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <article className="card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <p className="mb-4 text-sm text-slate-500">{task.description}</p>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
          <CalendarDays size={14} />
          {formatDueDate(task.dueDate)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
          <Flag size={14} />
          {task.priority}
        </span>
        {overdue && (
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
            Overdue
          </span>
        )}
      </div>

      <div className="task-card-row">
        <p className="text-xs text-slate-500">
          Assigned: {task.assignee?.name || "Unassigned"}
        </p>
        <select
          className="input w-full text-sm sm:w-40"
          value={task.status}
          disabled={!canUpdateStatus}
          onChange={(event) => onStatusChange(task.id, event.target.value)}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
      {canManageTask && (
        <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row">
          <button className="btn-secondary justify-center" type="button" onClick={() => onEditTask(task)}>
            Edit
          </button>
          <button
            className="btn-secondary justify-center border-rose-300 text-rose-700 hover:bg-rose-50"
            type="button"
            onClick={() => onDeleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
