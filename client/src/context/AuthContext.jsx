// src/context/AuthContext.jsx — keeps the logged-in user available across the whole app.
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/endpoints";
import { setToken, getToken } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, fetch the current user.
  useEffect(() => {
    async function load() {
      if (getToken()) {
        try {
          const { user } = await authApi.me();
          setUser(user);
        } catch {
          setToken(null);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const login = async (identifier, password) => {
    const { token, user } = await authApi.login({ identifier, password });
    setToken(token);
    setUser(user);
  };

  const register = async (data) => {
    const { token, user } = await authApi.register(data);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
