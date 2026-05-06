import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = await login(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/");
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="badge">Welcome back</p>
        <h1 className="auth-title">Sign in to TeamFlow</h1>
        <p className="auth-subtitle">
          Manage your projects, tasks and team collaboration in one place.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="relative">
            <input
              className="input pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="text-right">
            <Link className="text-sm font-medium text-brand-700" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-500">
          <Link className="font-semibold text-brand-700" to="/">
            Back to Home
          </Link>
        </p>

        <p className="mt-4 text-sm text-slate-500">
          New here?{" "}
          <Link className="font-semibold text-brand-700" to="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
