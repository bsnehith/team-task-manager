import { formatDueDate, isOverdue } from "../utils/date.js";
import StatusBadge from "./StatusBadge.jsx";

export default function TaskTable({
  tasks,
  onStatusChange,
  canUpdateStatus,
  canManageTask,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              const allowUpdate =
                typeof canUpdateStatus === "function"
                  ? canUpdateStatus(task)
                  : Boolean(canUpdateStatus);
              const allowManage =
                typeof canManageTask === "function"
                  ? canManageTask(task)
                  : Boolean(canManageTask);
              return (
                <tr key={task.id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {task.assignee?.name || "Unassigned"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.priority}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">
                        {formatDueDate(task.dueDate)}
                      </span>
                      {overdue && (
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">
                          Overdue
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {allowUpdate ? (
                      <select
                        className="input min-w-36 text-sm"
                        value={task.status}
                        onChange={(event) =>
                          onStatusChange(task.id, event.target.value)
                        }
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {allowManage ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => onEditTask(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-secondary border-rose-300 text-rose-700 hover:bg-rose-50"
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
