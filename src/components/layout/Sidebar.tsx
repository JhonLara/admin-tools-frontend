"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, Rol } from "@/contexts/AuthContext";

const allLinks: { href: string; label: string; roles: Rol[] }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
  { href: "/vendedores", label: "Vendedores", roles: ["VENDEDOR", "SUPER_ADMIN"] },
  { href: "/analistas", label: "Analistas", roles: ["ANALISTA", "SUPER_ADMIN"] },
  { href: "/empresas", label: "Empresas", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
  { href: "/aliados", label: "Aliados", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
  { href: "/administracion-analistas", label: "Administración de analistas", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
  { href: "/horarios-analistas", label: "Horarios de analistas", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
  { href: "/grupos-telegram", label: "Grupos de Telegram", roles: ["SUPER_ADMIN"] },
  { href: "/usuarios", label: "Usuarios", roles: ["SUPER_ADMIN"] },
  { href: "/monitoreo", label: "Monitoreo", roles: ["SUPER_ADMIN"] },
  { href: "/historial", label: "Historial de notificaciones", roles: ["ADMINISTRADOR", "SUPER_ADMIN"] },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleLinks = allLinks.filter((l) => user && l.roles.includes(user.rol));

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AT</div>
          Admin Tools
        </div>
        <nav className="sidebar-nav">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
              onClick={onClose}
            >
              {link.label}
            </Link>
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
        </div>
      </aside>
    </>
  );
}
