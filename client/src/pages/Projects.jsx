import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.js";
import { isAdmin } from "../utils/permissions.js";

export default function Projects() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/projects", {
        params: { search, sortBy, sortOrder, page, limit: 9 },
      });
      setProjects(data?.data?.items || []);
      setMeta(data?.data?.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [search, sortBy, sortOrder, page]);

  const createProject = async (event) => {
    event.preventDefault();
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      setShowForm(false);
      setPage(1);
      loadProjects();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create project");
    }
  };

  const deleteProject = async (projectId) => {
    const confirmed = window.confirm("Delete this project and all related tasks?");
    if (!confirmed) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="section-subtitle">
            Create, manage and track team projects.
          </p>
        </div>
        {admin && (
          <button className="btn-primary w-full justify-center sm:w-auto" onClick={() => setShowForm((prev) => !prev)}>
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>
      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="name">Name</option>
        </select>
        <select className="input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {showForm && admin && (
        <form className="card space-y-3 p-4" onSubmit={createProject}>
          <input
            className="input"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <textarea
            className="input min-h-24"
            placeholder="Project description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="form-actions">
            <button className="btn-primary justify-center" type="submit">
              Create
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading projects...</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="card project-tile group p-5 hover:-translate-y-1"
          >
            <div className="mb-3 flex items-center justify-between">
              <FolderKanban className="text-blue-600 transition group-hover:rotate-6 group-hover:scale-110" />
              <span className="badge">{project?._count?.members || 0} Members</span>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">{project.name}</h2>
            <p className="mb-4 text-sm text-slate-500">{project.description}</p>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <Link
                className="btn-secondary w-full justify-center group-hover:border-cyan-400/50 sm:flex-1"
                to={`/projects/${project.id}`}
              >
                Open Project
              </Link>
              {admin && (
                <button
                  className="btn-secondary w-full justify-center border-rose-300 text-rose-700 hover:bg-rose-50 sm:w-auto"
                  type="button"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Total projects: {meta.total || 0}</p>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">
            Page {meta.page || 1} / {meta.totalPages || 1}
          </span>
          <button
            className="btn-secondary"
            type="button"
            disabled={page >= (meta.totalPages || 1)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
