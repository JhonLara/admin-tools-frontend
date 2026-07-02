"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login({ username, password });
      const userRol = res.rol as any;
      login({
        token: res.token,
        username: res.username,
        nombre: res.nombre,
        rol: userRol,
        analistaId: res.analistaId,
      });

      if (userRol === "VENDEDOR") {
        router.push("/vendedores");
      } else if (userRol === "ANALISTA") {
        router.push("/analistas");
      } else {
        router.push("/resumen");
      }
    } catch (e: any) {
      setError(e.message || "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "1.5rem 0",
        overflow: "auto",
      }}
    >
      <div style={{ width: "100%", maxWidth: "460px", padding: "0 1rem" }}>
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              AT
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--color-text-main)",
                marginBottom: "0.3rem",
                letterSpacing: "-0.02em",
              }}
            >
              Admin Tools
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                Usuario
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Escribe tu usuario"
                required
                autoComplete="off"
                style={{ fontSize: "1rem", padding: "0.85rem 1rem" }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--color-text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={{ fontSize: "1rem", padding: "0.85rem 1rem" }}
              />
            </div>
            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  color: "#991B1B",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  border: "1px solid #FECACA",
                }}
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "0.85rem 1rem", fontSize: "1rem" }}
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
