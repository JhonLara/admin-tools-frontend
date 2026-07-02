"use client";

import { useEffect, useState } from "react";
import { api, DashboardResumen, formatEstado } from "@/lib/api";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#059669", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9", "#CBD5E1"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.dashboard.resumen();
      setData(res);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (loading) return <LoadingSpinner message="Cargando dashboard..." />;
  if (error) return <div className="empty-state">Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)" }}>
        Dashboard
      </h1>

      <div className="grid-4">
        <div className="stat-card">
          <span className="stat-label">Solicitudes totales</span>
          <span className="stat-value">{data.totalSolicitudes}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value">{data.solicitudesPendientes}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Notificadas</span>
          <span className="stat-value">{data.solicitudesNotificadas}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Errores</span>
          <span className="stat-value">{data.solicitudesError}</span>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-title">Solicitudes por aliado</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.solicitudesPorAliado}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="aliadoNombre" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-title">Solicitudes por estado</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.solicitudesPorEstado.map((s) => ({ ...s, estado: formatEstado(s.estado) }))}
                dataKey="cantidad"
                nameKey="estado"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.solicitudesPorEstado.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Card>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Últimas solicitudes
        </h3>
        <div className="dashboard-table-wrap">
          <Table
          onRefresh={cargar}
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
                      : s.estado === "VALIDADA"
                      ? "info"
                      : s.estado === "FIRMA_RECIBIDA"
                      ? "info"
                      : s.estado === "APROBADA"
                      ? "success"
                      : s.estado === "RECHAZADA"
                      ? "error"
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
          ]}
          data={data.ultimasSolicitudes}
          keyExtractor={(s) => s.id}
        />
        </div>
      </Card>
    </div>
  );
}
