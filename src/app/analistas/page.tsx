"use client";

import { useEffect, useMemo, useState } from "react";
import { api, Aliado, Solicitud, formatEstado } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AnalistasPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroAliado, setFiltroAliado] = useState("");
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "danger" | "success";
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", variant: "danger", onConfirm: () => {} });

  const esSuperAdmin = user?.rol === "SUPER_ADMIN";

  const cargar = async () => {
    setLoading(true);
    try {
      const ali = await api.aliados.listar();
      setAliados(ali);
      // Solo super admin ve todas las solicitudes; analista solo ve las suyas
      if (esSuperAdmin) {
        const sol = await api.solicitudes.listar();
        setSolicitudes(sol);
      } else if (user?.analistaId) {
        const sol = await api.solicitudes.listarPorAnalista(user.analistaId);
        setSolicitudes(sol);
      } else {
        setSolicitudes([]);
      }
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    return solicitudes.filter((s) => {
      if (filtroEstado && s.estado !== filtroEstado) return false;
      if (filtroAliado && s.aliado.id !== filtroAliado) return false;
      if (busquedaCedula && !s.cedulaCliente.includes(busquedaCedula)) return false;
      return true;
    });
  }, [solicitudes, filtroEstado, filtroAliado, busquedaCedula]);

  const notificar = async (id: string) => {
    try {
      await api.solicitudes.notificarObservacion(id);
      setToast({ message: "Notificación enviada", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const rechazar = (id: string) => {
    setConfirm({
      open: true,
      title: "Rechazar solicitud",
      message: "¿Estás seguro de que deseas rechazar esta solicitud? Esta acción no se puede deshacer.",
      variant: "danger",
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, open: false }));
        try {
          await api.solicitudes.rechazar(id);
          setToast({ message: "Solicitud rechazada", type: "success" });
          cargar();
        } catch (e: any) {
          setToast({ message: e.message, type: "error" });
        }
      },
    });
  };

  const validar = (id: string) => {
    setConfirm({
      open: true,
      title: "Validar solicitud",
      message: "¿Estás seguro de que deseas validar esta solicitud? Se enviará la notificación al grupo del aliado.",
      variant: "success",
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, open: false }));
        try {
          await api.solicitudes.validar(id);
          setToast({ message: "Solicitud validada y notificada", type: "success" });
          cargar();
        } catch (e: any) {
          setToast({ message: e.message, type: "error" });
        }
      },
    });
  };

  const aprobar = (id: string) => {
    setConfirm({
      open: true,
      title: "Aprobar solicitud",
      message: "¿Estás seguro de que deseas aprobar esta solicitud? Esta acción no se puede deshacer.",
      variant: "success",
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, open: false }));
        try {
          await api.solicitudes.aprobar(id);
          setToast({ message: "Solicitud aprobada", type: "success" });
          cargar();
        } catch (e: any) {
          setToast({ message: e.message, type: "error" });
        }
      },
    });
  };

  const eliminarSolicitud = (id: string) => {
    setConfirm({
      open: true,
      title: "Eliminar solicitud",
      message: "¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.",
      variant: "danger",
      onConfirm: async () => {
        setConfirm((c) => ({ ...c, open: false }));
        try {
          await api.solicitudes.eliminar(id);
          setToast({ message: "Solicitud eliminada", type: "success" });
          cargar();
        } catch (e: any) {
          setToast({ message: e.message, type: "error" });
        }
      },
    });
  };

  if (loading) return <LoadingSpinner message="Cargando solicitudes..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Analistas</h1>

      <Card>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Estado</label>
            <Select
              options={[
                { value: "", label: "Todos" },
                { value: "CREADA", label: "Creada" },
                { value: "ASIGNADA", label: "Asignada" },
                { value: "NOTIFICADA", label: "Notificada" },
                { value: "EN_PROCESO", label: "En proceso" },
                { value: "RECHAZADA", label: "Rechazada" },
                { value: "VALIDADA", label: "Validada" },
                { value: "FIRMA_RECIBIDA", label: "Firma recibida" },
                { value: "APROBADA", label: "Aprobada" },
                { value: "ERROR_NOTIFICACION", label: "Error notificación" },
              ]}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="mt-1"
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Aliado</label>
            <Select
              options={[{ value: "", label: "Todos" }, ...aliados.map((a) => ({ value: a.id, label: a.nombre }))]}
              value={filtroAliado}
              onChange={(e) => setFiltroAliado(e.target.value)}
              className="mt-1"
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Cédula</label>
            <Input
              value={busquedaCedula}
              onChange={(e) => setBusquedaCedula(e.target.value)}
              placeholder="Buscar cédula..."
              className="mt-1"
            />
          </div>
        </div>

        <Table
          columns={[
            { header: "Cédula", accessor: (s) => s.cedulaCliente },
            { header: "Aliado", accessor: (s) => s.aliado.nombre },
            { header: "Analista", accessor: (s) => s.analista?.nombre || "-" },
            {
              header: "Estado",
              accessor: (s) => (
                <Badge
                  variant={
                    s.estado === "ASIGNADA"
                      ? "info"
                      : s.estado === "NOTIFICADA"
                      ? "warning"
                      : s.estado === "RECHAZADA"
                      ? "error"
                      : s.estado === "VALIDADA"
                      ? "info"
                      : s.estado === "FIRMA_RECIBIDA"
                      ? "info"
                      : s.estado === "APROBADA"
                      ? "success"
                      : s.estado === "ERROR_NOTIFICACION"
                      ? "error"
                      : "neutral"
                  }
                >
                  {formatEstado(s.estado)}
                </Badge>
              ),
            },
            { header: "Fecha", accessor: (s) => new Date(s.fechaCreacion).toLocaleString() },
            {
              header: "Acciones",
              accessor: (s) => (
                <div className="flex action-group" style={{ flexWrap: "wrap", alignItems: "center", minHeight: 28 }}>
                  {(s.estado === "ASIGNADA" || s.estado === "EN_PROCESO" || s.estado === "FIRMA_RECIBIDA") && (
                    <Button size="sm" variant="info" onClick={() => notificar(s.id)}>
                      Notificar
                    </Button>
                  )}
                  {(s.estado === "ASIGNADA" || s.estado === "EN_PROCESO") && (
                    <Button size="sm" variant="warning" onClick={() => validar(s.id)}>
                      Validar
                    </Button>
                  )}
                  {(s.estado === "ASIGNADA" || s.estado === "EN_PROCESO" || s.estado === "FIRMA_RECIBIDA") && (
                    <Button size="sm" variant="danger" onClick={() => rechazar(s.id)}>
                      Rechazar
                    </Button>
                  )}
                  {s.estado === "FIRMA_RECIBIDA" && (
                    <Button size="sm" variant="success" onClick={() => aprobar(s.id)}>
                      Aprobar
                    </Button>
                  )}
                  {esSuperAdmin && (
                    <Button size="sm" variant="secondary" onClick={() => eliminarSolicitud(s.id)}>
                      Eliminar
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filtradas}
          keyExtractor={(s) => s.id}
          onRefresh={cargar}
        />
      </Card>

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
