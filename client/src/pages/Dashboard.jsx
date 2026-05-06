import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import TaskCard from "../components/TaskCard.jsx";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.js";
import { isAdmin } from "../utils/permissions.js";

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <article className="card mesh-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className={tone} size={18} />
      </div>
      <p className="stat-number text-3xl font-black">{value}</p>
    </article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    byStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
    overdueTasks: 0,
    tasksPerUser: [],
  });
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const admin = isAdmin(user);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");
        const [dashboardRes, projectsRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/projects"),
        ]);
        const dashboardData = dashboardRes?.data?.data;
        const projects = projectsRes?.data?.data?.items || [];
        setStats(
          dashboardData || {
            totalTasks: 0,
            byStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
            overdueTasks: 0,
            tasksPerUser: [],
          },
        );

        if (projects.length > 0) {
          const firstProjectId = projects[0].id;
          const tasksRes = await api.get(`/projects/${firstProjectId}/tasks`);
          setTasks(tasksRes?.data?.data?.items || []);
        } else {
          setTasks([]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      }
    };
    loadDashboard();
  }, []);

  const velocity = useMemo(() => {
    const total = stats.totalTasks || 0;
    const done = stats.byStatus?.DONE || 0;
    return {
      total,
      done,
      percentage: total ? Math.round((done / total) * 100) : 0,
    };
  }, [stats]);

  return (
    <section className="space-y-6">
      <div className="card mesh-card p-5 md:p-6">
        <p className="badge mb-3">{admin ? "Admin workspace" : "Member workspace"}</p>
        <h1 className="section-title">
          Hi {user?.name || "User"}, track your team progress
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
          Monitor task completion, check overdue work, and keep your projects aligned
          with deadlines.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label="Total tasks"
          value={stats.totalTasks}
          tone="text-blue-600"
        />
        <StatCard
          icon={Clock3}
          label="In progress"
          value={stats.byStatus?.IN_PROGRESS || 0}
          tone="text-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Done"
          value={stats.byStatus?.DONE || 0}
          tone="text-emerald-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={stats.overdueTasks}
          tone="text-rose-500"
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="card p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Team velocity</p>
          <span className="text-xs text-slate-500">
            {velocity.done}/{velocity.total} completed
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 transition-all duration-500"
            style={{
              width: `${velocity.percentage}%`,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canUpdateStatus={admin || task.assignee?.id === user?.id}
            onStatusChange={() => {}}
          />
        ))}
      </div>
    </section>
  );
}
