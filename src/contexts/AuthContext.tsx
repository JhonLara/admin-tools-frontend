"use client";

import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export type Rol = "VENDEDOR" | "ANALISTA" | "ADMINISTRADOR" | "SUPER_ADMIN";

export interface AuthUser {
  token: string;
  username: string;
  nombre: string;
  rol: Rol;
  analistaId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoading(false);
      return;
    }

    const parsedUser: AuthUser = JSON.parse(storedUser);

    // Validar token contra backend
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((data) => {
        // Actualizar datos del usuario si cambiaron
        setUser({
          token: storedToken,
          username: data.username,
          nombre: data.nombre,
          rol: data.rol as Rol,
          analistaId: data.analistaId,
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (u: AuthUser) => {
    localStorage.setItem("token", u.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
