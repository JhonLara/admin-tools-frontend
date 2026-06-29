"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-main)" }}>
        Panel de Administración
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {user && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--color-primary-soft)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {user.nombre.charAt(0)}
          </div>
        )}
        <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
          {user ? user.nombre : "Admin Tools v1.0"}
        </span>
      </div>
    </header>
  );
}
