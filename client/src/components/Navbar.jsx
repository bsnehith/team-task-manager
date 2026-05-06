import { Bell, ChevronDown, LogOut, Menu, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import api from "../api/axios.js";

const navItems = [
  { to: "/app", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { user, logout, deleteAccount, loading } = useAuth();

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This will remove your projects and tasks.",
    );
    if (!confirmed) return;
    const result = await deleteAccount();
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    navigate("/signup");
  };

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data?.data || []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    } catch {
      // no-op
    }
  };

  return (
    <header className="topbar-surface sticky top-0 z-30">
      <div className="container-app flex h-16 items-center justify-between gap-2">
        <Link to="/app" className="text-lg font-bold tracking-wide text-slate-900">
          Team<span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Flow</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="relative hidden items-center gap-2 lg:flex">
          <div className="relative">
            <button className="btn-secondary px-3" onClick={() => setNotificationOpen((prev) => !prev)}>
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-rose-600 px-1.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-slate-500">No notifications</p>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`mb-2 w-full rounded-lg border p-2 text-left ${
                        item.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"
                      }`}
                      onClick={() => markNotificationRead(item.id)}
                    >
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-600">{item.body}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            className="btn-secondary w-[220px] max-w-[28vw] justify-between"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <UserRound size={16} />
              <span className="block max-w-[150px] truncate">
                {user?.name} ({user?.role || "MEMBER"})
              </span>
            </span>
            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <p className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account
              </p>
              <button
                className="btn-secondary mb-2 w-full justify-start border-rose-300 text-rose-700 hover:bg-rose-50"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                <Trash2 size={16} />
                Delete Account
              </button>
              <button
                className="btn-secondary w-full justify-start"
                onClick={logout}
                disabled={loading}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

        <button className="btn-secondary px-2.5 lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-app space-y-2 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className="btn-secondary w-full justify-center border-rose-300 text-rose-700 hover:bg-rose-50"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              <Trash2 size={16} />
              Delete Account
            </button>
            <button className="btn-secondary w-full justify-center" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
