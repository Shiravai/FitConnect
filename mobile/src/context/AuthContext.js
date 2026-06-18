// src/context/AuthContext.js — current user available across the app.
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/endpoints";
import { setToken, loadToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      if (t) {
        try {
          const { user } = await authApi.me();
          setUser(user);
        } catch {
          await setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (identifier, password) => {
    const { token, user } = await authApi.login({ identifier, password });
    await setToken(token);
    setUser(user);
  };

  const register = async (data) => {
    const { token, user } = await authApi.register(data);
    await setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
