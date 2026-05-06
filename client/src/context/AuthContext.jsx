import { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ttm_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ttm_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("ttm_token", token);
    } else {
      localStorage.removeItem("ttm_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ttm_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ttm_user");
    }
  }, [user]);

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", payload);
      const authData = data?.data;
      setToken(authData?.token || null);
      setUser(authData?.user || null);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to login.",
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", payload);
      const authData = data?.data;
      setToken(authData?.token || null);
      setUser(authData?.user || null);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to sign up.",
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (payload) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", payload);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to reset password.",
      };
    } finally {
      setLoading(false);
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const { data } = await api.get("/auth/check-email", { params: { email } });
      return { ok: true, exists: Boolean(data?.data?.exists) };
    } catch (error) {
      return {
        ok: false,
        exists: false,
        message: error?.response?.data?.message || "Unable to verify email.",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete("/users/me");
      setToken(null);
      setUser(null);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to delete account.",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      signup,
      forgotPassword,
      checkEmailAvailability,
      logout,
      deleteAccount,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
