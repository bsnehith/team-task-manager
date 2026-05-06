import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import Projects from "./pages/Projects.jsx";
import Signup from "./pages/Signup.jsx";
import { useAuth } from "./hooks/useAuth.js";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-surface relative min-h-screen overflow-hidden text-slate-900">
      <Navbar />
      <main className="container-app relative z-10 py-6 md:py-8">
        <Routes>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <Home />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <Signup />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <ForgotPassword />}
      />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
