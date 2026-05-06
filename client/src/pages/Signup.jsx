import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading, checkEmailAvailability } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MEMBER",
  });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const passwordChecks = {
    length: form.password.length >= 8 && form.password.length <= 20,
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordHint =
    "Password must be 8-20 characters and include at least one uppercase letter, one number, and one special character.";

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEmailError("");
    if (!isPasswordValid) {
      setPasswordTouched(true);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }
    if (emailError) return;
    const result = await signup(form);
    if (!result.ok) {
      const message = result.message || "Unable to sign up.";
      if (message.toLowerCase().includes("email")) {
        setEmailError("This email is already registered.");
      } else if (message.toLowerCase().includes("password must be 8-20")) {
        setPasswordTouched(true);
      } else {
        setError(message);
      }
      return;
    }
    navigate("/");
  };

  const handleEmailBlur = async () => {
    const trimmed = form.email.trim();
    if (!trimmed) return;
    setEmailError("");
    const result = await checkEmailAvailability(trimmed);
    if (result.ok && result.exists) {
      setEmailError("This email is already registered.");
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="badge">Get started</p>
        <h1 className="auth-title">Create TeamFlow account</h1>
        <p className="auth-subtitle">
          Start your team workspace with role-based access and task tracking.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Full name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (emailError) setEmailError("");
            }}
            onBlur={handleEmailBlur}
            required
          />
          {emailError && <p className="text-xs font-medium text-rose-600">{emailError}</p>}
          <div className="relative">
            <input
              className="input pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setPasswordTouched(true);
              }}
              onBlur={() => setPasswordTouched(true)}
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
          {passwordTouched && form.password.length > 0 && !isPasswordValid && (
            <p className="text-xs font-medium text-rose-600">{passwordHint}</p>
          )}
          <div className="relative">
            <input
              className="input pr-10"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-500">
          <Link className="font-semibold text-brand-700" to="/">
            Back to Home
          </Link>
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-brand-700" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
