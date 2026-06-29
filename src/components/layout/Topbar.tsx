"use client";

import { useAuth } from "@/contexts/AuthContext";

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          className="sidebar-mobile-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-main)" }}>
          Panel de Administración
        </div>
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
