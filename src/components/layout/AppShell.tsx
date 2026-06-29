"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, Rol } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const ROLE_ROUTES: Record<Rol, string[]> = {
  VENDEDOR: ["/vendedores"],
  ANALISTA: ["/analistas"],
  ADMINISTRADOR: ["/dashboard", "/empresas", "/aliados", "/administracion-analistas", "/horarios-analistas", "/historial"],
  SUPER_ADMIN: ["/dashboard", "/vendedores", "/analistas", "/empresas", "/aliados", "/administracion-analistas", "/horarios-analistas", "/grupos-telegram", "/usuarios", "/historial"],
};

function getHomeRoute(rol: Rol): string {
  if (rol === "VENDEDOR") return "/vendedores";
  if (rol === "ANALISTA") return "/analistas";
  return "/dashboard";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push("/login");
      return;
    }

    if (!isLoading && user && !isLoginPage) {
      const allowed = ROLE_ROUTES[user.rol];
      const isAllowed = allowed.some((route) => pathname === route || pathname.startsWith(route + "/"));
      if (!isAllowed) {
        router.push(getHomeRoute(user.rol));
      }
    }
  }, [isLoading, user, isLoginPage, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Cargando...
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}
