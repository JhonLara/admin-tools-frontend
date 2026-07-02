"use client";

import { useEffect, useState } from "react";
import { api, BackupConfig, BackupEjecucion } from "@/lib/api";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const TIPO_LABELS: Record<string, string> = {
  SOLICITUDES: "Solicitudes",
  HISTORIAL_NOTIFICACIONES: "Historial de notificaciones",
  SESIONES: "Sesiones",
  MONITOREO: "Monitoreo",
};

const ESTADO_COLORS: Record<string, "success" | "error" | "warning" | "info" | "neutral"> = {
  EXITOSO: "success",
  FALLIDO: "error",
  EN_PROCESO: "warning",
  PENDIENTE: "neutral",
};

export default function BackupPage() {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [ejecuciones, setEjecuciones] = useState<BackupEjecucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [c, e] = await Promise.all([api.backup.listarConfig(), api.backup.listarEjecuciones()]);
      setConfigs(c);
      setEjecuciones(e);
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const toggleActivo = async (config: BackupConfig) => {
    setSaving(config.id);
    try {
      const updated = await api.backup.actualizarConfig(config.id, {
        activo: !config.activo,
        retencionDias: config.retencionDias,
        generarReporte: config.generarReporte,
        destinoReporte: config.destinoReporte,
      });
      setConfigs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setToast({ message: `Backup ${updated.activo ? "activado" : "desactivado"}`, type: "success" });
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const ejecutarManual = async (tipo: string) => {
    setRunning(tipo);
    try {
      await api.backup.ejecutarManual(tipo);
      setToast({ message: `Backup ${TIPO_LABELS[tipo]} iniciado manualmente`, type: "success" });
      setTimeout(cargar, 2000);
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setRunning(null);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando backup..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Administración de backup</h1>

      <Card>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Configuración de procesos
        </h3>
        <Table
          columns={[
            { header: "Proceso", accessor: (c) => TIPO_LABELS[c.tipo] || c.tipo, width: "220px" },
            {
              header: "Estado",
              accessor: (c) => (
                <Badge variant={c.activo ? "success" : "neutral"}>
                  {c.activo ? "ACTIVO" : "INACTIVO"}
                </Badge>
              ),
              width: "100px",
            },
            { header: "Retención (días)", accessor: (c) => c.retencionDias.toString(), width: "130px" },
            {
              header: "Reporte",
              accessor: (c) => (c.generarReporte ? "Sí" : "No"),
              width: "80px",
            },
            {
              header: "Última ejecución",
              accessor: (c) => (c.ultimaEjecucion ? new Date(c.ultimaEjecucion).toLocaleString() : "Nunca"),
              width: "170px",
            },
            {
              header: "Acciones",
              accessor: (c) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Button
                    size="sm"
                    variant={c.activo ? "secondary" : "success"}
                    onClick={() => toggleActivo(c)}
                    disabled={saving === c.id}
                  >
                    {c.activo ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => ejecutarManual(c.tipo)}
                    disabled={running === c.tipo}
                  >
                    Ejecutar ahora
                  </Button>
                </div>
              ),
              width: "220px",
            },
          ]}
          data={configs}
          keyExtractor={(c) => c.id}
          onRefresh={cargar}
        />
      </Card>

      <Card>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Últimas ejecuciones
        </h3>
        <Table
          columns={[
            { header: "Proceso", accessor: (e) => TIPO_LABELS[e.tipo] || e.tipo, width: "220px" },
            {
              header: "Estado",
              accessor: (e) => (
                <Badge variant={ESTADO_COLORS[e.estado] || "neutral"}>
                  {e.estado}
                </Badge>
              ),
              width: "110px",
            },
            { header: "Periodo", accessor: (e) => e.periodo, width: "90px" },
            { header: "Registros", accessor: (e) => e.registrosProcesados.toString(), width: "90px" },
            {
              header: "Reporte",
              accessor: (e) => (e.reporteGenerado ? "Sí" : "No"),
              width: "80px",
            },
            {
              header: "Fecha ejecución",
              accessor: (e) => new Date(e.fechaEjecucion).toLocaleString(),
              width: "170px",
            },
            {
              header: "Error",
              accessor: (e) => e.mensajeError || "-",
              width: "200px",
            },
          ]}
          data={ejecuciones}
          keyExtractor={(e) => e.id}
          onRefresh={cargar}
        />
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
