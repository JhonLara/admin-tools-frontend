"use client";

import { useEffect, useState } from "react";
import { api, DashboardResumen } from "@/lib/api";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
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

  useEffect(() => {
    api.dashboard
      .resumen()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Cargando dashboard...</div>;
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                data={data.solicitudesPorEstado}
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
                      ? "asignada"
                      : s.estado === "NOTIFICADA"
                      ? "notificada"
                      : s.estado === "FINALIZADA"
                      ? "finalizada"
                      : s.estado === "ERROR_NOTIFICACION"
                      ? "error-notif"
                      : "pendiente"
                  }
                >
                  {s.estado}
                </Badge>
              ),
            },
            { header: "Fecha", accessor: (s) => new Date(s.fechaCreacion).toLocaleString() },
          ]}
          data={data.ultimasSolicitudes}
          keyExtractor={(s) => s.id}
        />
      </Card>
    </div>
  );
}
