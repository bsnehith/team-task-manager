import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/.test(form.password);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isPasswordValid) {
      setError(
        "Password must be 8-20 characters and include one uppercase letter, one number, and one special character.",
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    const result = await forgotPassword(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess("Password updated successfully. Please login with your new password.");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="badge">Reset password</p>
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your registered email and set a new password.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Registered email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="relative">
            <input
              className="input pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              autoComplete="new-password"
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
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          Back to{" "}
          <Link className="font-semibold text-brand-700" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
