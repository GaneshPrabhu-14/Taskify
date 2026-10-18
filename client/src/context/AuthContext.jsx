import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("taskify:unauthorized", handleUnauthorized);

    const token = localStorage.getItem("taskify-token");
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener("taskify:unauthorized", handleUnauthorized);
    }

    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("taskify-token"))
      .finally(() => setLoading(false));

    return () => window.removeEventListener("taskify:unauthorized", handleUnauthorized);
  }, []);

  async function authenticate(path, credentials) {
    const { data } = await api.post(`/auth/${path}`, credentials);
    localStorage.setItem("taskify-token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("taskify-token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
