import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import TaskCard from "../components/TaskCard.jsx";
import TaskTable from "../components/TaskTable.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { canUpdateTask } from "../utils/permissions.js";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    assignedTo: "",
  });
  const [taskFilters, setTaskFilters] = useState({
    search: "",
    status: "",
    priority: "",
    assignedTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [taskPage, setTaskPage] = useState(1);
  const [taskMeta, setTaskMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("EDITOR");

  const projectRole = useMemo(
    () => project?.members?.find((member) => member.userId === user?.id)?.role || null,
    [project, user],
  );
  const canCreateOrEditTasks = ["ADMIN", "MANAGER", "EDITOR"].includes(projectRole);
  const canDeleteTasks = ["ADMIN", "MANAGER"].includes(projectRole);
  const canManageMembers = ["ADMIN", "MANAGER"].includes(projectRole);
  const isEditMode = Boolean(editingTaskId);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [tasks, selectedTaskId],
  );

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/projects/${projectId}`);
      const projectData = data?.data;
      setProject(projectData);
      if (!selectedTaskId && projectData?.tasks?.length) {
        setSelectedTaskId(projectData.tasks[0].id);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load project");
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`, {
        params: {
          ...taskFilters,
          status: taskFilters.status || undefined,
          priority: taskFilters.priority || undefined,
          assignedTo: taskFilters.assignedTo || undefined,
          page: taskPage,
          limit: 20,
        },
      });
      const payload = data?.data || {};
      setTasks(payload.items || []);
      setTaskMeta(payload.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    }
  };

  useEffect(() => {
    if (projectId) loadTasks();
  }, [projectId, taskFilters, taskPage]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setAllUsers(data?.data || []);
    } catch {
      setAllUsers([]);
    }
  };

  useEffect(() => {
    if (canManageMembers) loadUsers();
  }, [canManageMembers]);

  const loadTaskInsights = async (taskId) => {
    if (!taskId) return;
    try {
      const [commentsRes, activityRes] = await Promise.all([
        api.get(`/tasks/${taskId}/comments`),
        api.get(`/tasks/${taskId}/activity`),
      ]);
      setComments(commentsRes?.data?.data || []);
      setActivity(activityRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load task activity");
    }
  };

  useEffect(() => {
    if (selectedTaskId) loadTaskInsights(selectedTaskId);
  }, [selectedTaskId]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}`, { status });
      const updated = data?.data;
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
      if (selectedTaskId === taskId) loadTaskInsights(taskId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task");
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
        assignedTo: taskForm.assignedTo || undefined,
      };
      const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
      setTasks((prev) => [data?.data, ...prev]);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        assignedTo: "",
      });
      setShowCreateTask(false);
      setTaskPage(1);
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task");
    }
  };

  const handleEditTaskClick = (task) => {
    if (!canCreateOrEditTasks) return;
    setEditingTaskId(task.id);
    setShowCreateTask(true);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      priority: task.priority || "MEDIUM",
      assignedTo: task.assignedTo || "",
    });
  };

  const handleUpdateTask = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
        assignedTo: taskForm.assignedTo || null,
      };
      const { data } = await api.patch(`/tasks/${editingTaskId}`, payload);
      const updated = data?.data;
      setTasks((prev) => prev.map((task) => (task.id === editingTaskId ? updated : task)));
      setEditingTaskId(null);
      setShowCreateTask(false);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        assignedTo: "",
      });
      if (selectedTaskId === editingTaskId) loadTaskInsights(editingTaskId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!canDeleteTasks) return;
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
        setComments([]);
        setActivity([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete task");
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!selectedTaskId || !commentText.trim()) return;
    try {
      await api.post(`/tasks/${selectedTaskId}/comments`, { content: commentText.trim() });
      setCommentText("");
      loadTaskInsights(selectedTaskId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add comment");
    }
  };

  const updateMemberRole = async (memberUserId, role) => {
    if (!canManageMembers) return;
    try {
      await api.post(`/projects/${projectId}/members`, { userId: memberUserId, role });
      setProject((prev) => ({
        ...prev,
        members: (prev.members || []).map((member) =>
          member.userId === memberUserId ? { ...member, role } : member,
        ),
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update member role");
    }
  };

  const removeMember = async (memberUserId) => {
    if (!canManageMembers) return;
    if (memberUserId === user?.id) return;
    const confirmed = window.confirm("Remove this member from project?");
    if (!confirmed) return;
    try {
      await api.delete(`/projects/${projectId}/members/${memberUserId}`);
      setProject((prev) => ({
        ...prev,
        members: (prev.members || []).filter((member) => member.userId !== memberUserId),
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove member");
    }
  };

  const addMemberToProject = async (event) => {
    event.preventDefault();
    if (!canManageMembers || !newMemberUserId) return;
    try {
      await api.post(`/projects/${projectId}/members`, {
        userId: newMemberUserId,
        role: newMemberRole,
      });
      const selectedUser = allUsers.find((item) => item.id === newMemberUserId);
      if (selectedUser) {
        setProject((prev) => {
          const exists = (prev.members || []).some((member) => member.userId === selectedUser.id);
          if (exists) {
            return {
              ...prev,
              members: (prev.members || []).map((member) =>
                member.userId === selectedUser.id ? { ...member, role: newMemberRole } : member,
              ),
            };
          }
          return {
            ...prev,
            members: [
              ...(prev.members || []),
              { userId: selectedUser.id, role: newMemberRole, user: selectedUser },
            ],
          };
        });
      } else {
        await loadProject();
      }
      setNewMemberUserId("");
      setNewMemberRole("EDITOR");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add member");
    }
  };

  const resetTaskForm = () => {
    setEditingTaskId(null);
    setShowCreateTask(false);
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "MEDIUM",
      assignedTo: "",
    });
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading project...</p>;
  }

  if (!project) {
    return (
      <section className="card p-6">
        <h1 className="text-xl font-semibold text-slate-900">Project not found</h1>
        <Link to="/projects" className="mt-4 inline-flex text-brand-700">
          Go back to projects
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="card mesh-card flex flex-wrap items-start justify-between gap-3 p-5 sm:items-center">
        <div>
          <Link
            to="/projects"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500"
          >
            <ArrowLeft size={16} />
            Back to projects
          </Link>
          <h1 className="section-title">{project.name}</h1>
          <p className="section-subtitle">{project.description}</p>
        </div>
        {canCreateOrEditTasks && (
          <button className="btn-primary w-full justify-center sm:w-auto" onClick={() => setShowCreateTask((p) => !p)}>
            <Plus size={16} />
            Create Task
          </button>
        )}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {showCreateTask && canCreateOrEditTasks && (
        <form
          className="card space-y-3 p-4"
          onSubmit={isEditMode ? handleUpdateTask : handleCreateTask}
        >
          <input
            className="input"
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <textarea
            className="input min-h-24"
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              className="input"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
            />
            <select
              className="input"
              value={taskForm.priority}
              onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select
              className="input"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm((p) => ({ ...p, assignedTo: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {project.members?.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn-secondary justify-center" type="button" onClick={resetTaskForm}>
              Cancel
            </button>
            <button className="btn-primary justify-center" type="submit">
              {isEditMode ? "Update task" : "Save task"}
            </button>
          </div>
        </form>
      )}
      <div className="card grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
        <input
          className="input lg:col-span-2"
          placeholder="Search tasks..."
          value={taskFilters.search}
          onChange={(e) => {
            setTaskFilters((prev) => ({ ...prev, search: e.target.value }));
            setTaskPage(1);
          }}
        />
        <select
          className="input"
          value={taskFilters.status}
          onChange={(e) => {
            setTaskFilters((prev) => ({ ...prev, status: e.target.value }));
            setTaskPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
        <select
          className="input"
          value={taskFilters.priority}
          onChange={(e) => {
            setTaskFilters((prev) => ({ ...prev, priority: e.target.value }));
            setTaskPage(1);
          }}
        >
          <option value="">All Priority</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <select
          className="input"
          value={taskFilters.assignedTo}
          onChange={(e) => {
            setTaskFilters((prev) => ({ ...prev, assignedTo: e.target.value }));
            setTaskPage(1);
          }}
        >
          <option value="">All Assignees</option>
          {project.members?.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.user?.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={`${taskFilters.sortBy}:${taskFilters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(":");
            setTaskFilters((prev) => ({ ...prev, sortBy, sortOrder }));
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="dueDate:asc">Due date asc</option>
          <option value="priority:desc">Priority high-low</option>
        </select>
      </div>

      <div className="hidden lg:block">
        <TaskTable
          tasks={tasks}
          onStatusChange={handleStatusChange}
          canUpdateStatus={(task) => canUpdateTask(user, task) || canManageMembers}
          canManageTask={() => canDeleteTasks}
          onEditTask={handleEditTaskClick}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      <div className="grid gap-4 lg:hidden">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            canUpdateStatus={canUpdateTask(user, task) || canManageMembers}
            canManageTask={canDeleteTasks}
            onEditTask={handleEditTaskClick}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">Total tasks: {taskMeta.total || 0}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-secondary"
            type="button"
            disabled={taskPage <= 1}
            onClick={() => setTaskPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {taskMeta.page || 1} / {taskMeta.totalPages || 1}
          </span>
          <button
            className="btn-secondary"
            type="button"
            disabled={taskPage >= (taskMeta.totalPages || 1)}
            onClick={() => setTaskPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <section className="card p-4">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Project members</h2>
        {canManageMembers && (
          <form className="mb-4 grid gap-2 sm:grid-cols-3" onSubmit={addMemberToProject}>
            <select
              className="input sm:col-span-2"
              value={newMemberUserId}
              onChange={(e) => setNewMemberUserId(e.target.value)}
            >
              <option value="">Select user to add</option>
              {allUsers
                .filter((item) => !(project.members || []).some((member) => member.userId === item.id))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.email})
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <select
                className="input"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              >
                <option value="VIEWER">VIEWER</option>
                <option value="EDITOR">EDITOR</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button className="btn-primary" type="submit" disabled={!newMemberUserId}>
                Add
              </button>
            </div>
          </form>
        )}
        <div className="space-y-2">
          {(project.members || []).map((member) => (
            <article key={member.userId} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-800">{member.user?.name}</p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                {canManageMembers ? (
                  <select
                    className="input w-full sm:w-auto"
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                    disabled={member.userId === user?.id && member.role === "ADMIN"}
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  <span className="badge">{member.role}</span>
                )}
                {canManageMembers && member.userId !== user?.id && (
                  <button
                    className="btn-secondary w-full justify-center border-rose-300 text-rose-700 hover:bg-rose-50 sm:w-auto"
                    type="button"
                    onClick={() => removeMember(member.userId)}
                  >
                    Remove
                  </button>
                )}
              </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Task comments</h2>
          <select
            className="input mb-3"
            value={selectedTaskId || ""}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">Select task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          {selectedTask && (
            <form className="mb-3 flex flex-col gap-2 sm:flex-row" onSubmit={addComment}>
              <input
                className="input"
                placeholder={`Add comment to "${selectedTask.title}"`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className="btn-primary w-full justify-center sm:w-auto" type="submit">
                Add
              </button>
            </form>
          )}
          <div className="space-y-2">
            {comments.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-800">{item.content}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.user?.name} - {new Date(item.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="card p-4">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Activity history</h2>
          <div className="space-y-2">
            {activity.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-medium text-slate-800">{item.action}</p>
                <p className="text-slate-500">
                  {item.field ? `${item.field}: ` : ""}
                  {item.oldValue ? `${item.oldValue} -> ` : ""}
                  {item.newValue || ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.actor?.name} - {new Date(item.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
