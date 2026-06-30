"use client";

import { useEffect, useState } from "react";
import { api, SesionActiva, SesionResumen } from "@/lib/api";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MonitoreoPage() {
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [resumen, setResumen] = useState<SesionResumen[]>([]);
  const [activas, setActivas] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id: string;
    username: string;
  }>({ open: false, id: "", username: "" });

  const cargar = async () => {
    setLoading(true);
    try {
      const [s, c, r] = await Promise.all([
        api.sesiones.listar(),
        api.sesiones.conteo(),
        api.sesiones.resumen(),
      ]);
      setSesiones(s);
      setActivas(c.activas);
      setTotal(c.total);
      setResumen(r);
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const invalidar = async (id: string) => {
    try {
      await api.sesiones.invalidar(id);
      setToast({ message: "Sesión invalidada", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  if (loading) return <LoadingSpinner message="Cargando monitoreo..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Monitoreo de sesiones</h1>

      <div className="grid-4">
        <div className="stat-card">
          <span className="stat-label">Usuarios en sesión</span>
          <span className="stat-value">{activas}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total sesiones históricas</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Usuarios con sesión</span>
          <span className="stat-value">{resumen.length}</span>
        </div>
      </div>

      <Card>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Resumen por usuario
        </h3>
        <Table
          columns={[
            { header: "Usuario", accessor: (s) => s.username, width: "120px" },
            { header: "Nombre", accessor: (s) => s.nombre, width: "150px" },
            {
              header: "Rol",
              accessor: (s) => (
                <Badge variant={s.rol === "SUPER_ADMIN" ? "success" : s.rol === "ADMINISTRADOR" ? "info" : s.rol === "ANALISTA" ? "warning" : "neutral"}>
                  {s.rol.replace(/_/g, " ")}
                </Badge>
              ),
              width: "120px",
            },
            { header: "Total sesiones", accessor: (s) => s.totalSesiones.toString(), width: "120px" },
            { header: "Sesiones activas", accessor: (s) => s.sesionesActivas.toString(), width: "130px" },
          ]}
          data={resumen}
          keyExtractor={(s) => s.username}
        />
      </Card>

      <Card>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Sesiones activas
        </h3>
        <Table
          columns={[
            { header: "Usuario", accessor: (s) => s.username, width: "120px" },
            { header: "Nombre", accessor: (s) => s.nombre, width: "150px" },
            {
              header: "Rol",
              accessor: (s) => (
                <Badge variant={s.rol === "SUPER_ADMIN" ? "success" : s.rol === "ADMINISTRADOR" ? "info" : s.rol === "ANALISTA" ? "warning" : "neutral"}>
                  {s.rol.replace(/_/g, " ")}
                </Badge>
              ),
              width: "120px",
            },
            { header: "IP", accessor: (s) => s.ipAddress || "-", width: "130px" },
            { header: "Inicio", accessor: (s) => new Date(s.fechaInicio).toLocaleString(), width: "170px" },
            { header: "Expiración", accessor: (s) => new Date(s.fechaExpiracion).toLocaleString(), width: "170px" },
            {
              header: "Acciones",
              accessor: (s) => (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirm({ open: true, id: s.id, username: s.username })}
                >
                  Cerrar sesión
                </Button>
              ),
              width: "130px",
            },
          ]}
          data={sesiones}
          keyExtractor={(s) => s.id}
        />
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        open={confirm.open}
        title="Cerrar sesión"
        message={`¿Estás seguro de que deseas cerrar la sesión de ${confirm.username}?`}
        variant="danger"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setConfirm((c) => ({ ...c, open: false }));
          invalidar(confirm.id);
        }}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
