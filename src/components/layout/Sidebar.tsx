"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, Rol } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface MenuItem {
  href: string;
  label: string;
  roles: Rol[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Solicitudes",
    items: [
      { href: "/dashboard", label: "Dashboard", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
      { href: "/vendedores", label: "Vendedores", roles: ["VENDEDOR", "SUPER_ADMIN"] },
      { href: "/analistas", label: "Analistas", roles: ["ANALISTA", "SUPER_ADMIN"] },
      { href: "/empresas", label: "Empresas", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
      { href: "/aliados", label: "Aliados", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
      { href: "/administracion-analistas", label: "Administración de analistas", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
      { href: "/horarios-analistas", label: "Horarios de analistas", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
      { href: "/historial", label: "Historial de notificaciones", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
    ],
  },
  {
    title: "Cartera",
    items: [
      { href: "/cartera", label: "Dashboard", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/grupos-telegram", label: "Grupos de Telegram", roles: ["SUPER_ADMIN"] },
      { href: "/usuarios", label: "Usuarios", roles: ["SUPER_ADMIN"] },
      { href: "/monitoreo", label: "Monitoreo", roles: ["SUPER_ADMIN"] },
      { href: "/backup", label: "Backup", roles: ["SUPER_ADMIN"] },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [version, setVersion] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Solicitudes"]));

  useEffect(() => {
    api.version.obtener()
      .then((res) => setVersion(res.version))
      .catch(() => setVersion(""));
  }, []);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => user && item.roles.includes(user.rol)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AT</div>
          Admin Tools
        </div>
        <nav className="sidebar-nav">
          {visibleGroups.map((group) => (
            <div key={group.title} className="sidebar-group">
              <button
                className="sidebar-group-title"
                onClick={() => toggleGroup(group.title)}
                type="button"
              >
                <span>{group.title}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: expandedGroups.has(group.title) ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedGroups.has(group.title) && (
                <div className="sidebar-group-items">
                  {group.items.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <span className="sidebar-username">{user.nombre}</span>
              <span className="sidebar-role">{user.rol.replace(/_/g, " ")}</span>
            </div>
          )}
          <button className="sidebar-logout" onClick={logout}>
            Cerrar sesión
          </button>
          {version && (
            <span className="sidebar-version">v{version}</span>
          )}
        </div>
      </aside>
    </>
  );
}
