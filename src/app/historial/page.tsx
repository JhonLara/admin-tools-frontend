"use client";

import { useEffect, useMemo, useState } from "react";
import { api, HistorialNotificacion } from "@/lib/api";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HistorialPage() {
  const [historial, setHistorial] = useState<HistorialNotificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroOrigen, setFiltroOrigen] = useState("");
  const [filtroDestino, setFiltroDestino] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.historial.listar();
      setHistorial(data);
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrado = useMemo(() => {
    return historial.filter((h) => {
      if (filtroOrigen && h.origen !== filtroOrigen) return false;
      if (filtroDestino && h.destino !== filtroDestino) return false;
      if (filtroEstado && h.estadoEnvio !== filtroEstado) return false;
      return true;
    });
  }, [historial, filtroOrigen, filtroDestino, filtroEstado]);

  if (loading) return <LoadingSpinner message="Cargando historial..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Historial de notificaciones</h1>

      <Card>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Origen</label>
            <Select
              options={[
                { value: "", label: "Todos" },
                { value: "VENDEDOR", label: "Vendedor" },
                { value: "ANALISTA", label: "Analista" },
              ]}
              value={filtroOrigen}
              onChange={(e) => setFiltroOrigen(e.target.value)}
              className="mt-1"
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Destino</label>
            <Select
              options={[
                { value: "", label: "Todos" },
                { value: "GRUPO_ANALISTAS", label: "Grupo analistas" },
                { value: "GRUPO_ALIADO", label: "Grupo aliado" },
              ]}
              value={filtroDestino}
              onChange={(e) => setFiltroDestino(e.target.value)}
              className="mt-1"
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Estado envío</label>
            <Select
              options={[
                { value: "", label: "Todos" },
                { value: "ENVIADO", label: "Enviado" },
                { value: "ERROR", label: "Error" },
              ]}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Table
          onRefresh={cargar}
          columns={[
            { header: "Fecha", accessor: (h) => new Date(h.fechaEnvio).toLocaleString() },
            { header: "Cédula", accessor: (h) => h.cedulaCliente },
            { header: "Aliado", accessor: (h) => h.nombreAliado },
            { header: "Origen", accessor: (h) => h.origen },
            { header: "Destino", accessor: (h) => h.destino },
            {
              header: "Estado",
              accessor: (h) => (
                <Badge variant={h.estadoEnvio === "ENVIADO" ? "success" : "error"}>{h.estadoEnvio}</Badge>
              ),
            },
            { header: "Mensaje", accessor: (h) => <span style={{ maxWidth: 300, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.mensajeEnviado}</span> },
          ]}
          data={filtrado}
          keyExtractor={(h) => h.id}
        />
      </Card>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
