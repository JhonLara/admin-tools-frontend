"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  totalValue?: number;
}

export default function DonutChart({ data, totalValue }: DonutChartProps) {
  const total = totalValue ?? data.reduce((acc, d) => acc + d.value, 0);

  const vencidoItem = data.find((d) =>
    d.name.toLowerCase().includes("vencid") || d.name.toLowerCase().includes("mora")
  );
  const vencidoValue = vencidoItem?.value || 0;
  const vencidoPct = total > 0 ? ((vencidoValue / total) * 100).toFixed(1) : "0.0";
  const vencidoColor = vencidoItem?.color || "#ef4444";

  const isColocacion = data.some((d) => d.name.toLowerCase().includes("colocación"));
  const totalLabel = isColocacion ? "Total colocación" : "Total cartera";
  const vencidoLabel = "Cartera Vencida";

  const formatCOP = (v: number) =>
    "$" + v.toLocaleString("es-CO") + " COP";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", margin: 0 }}>{totalLabel}</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-main)", lineHeight: 1.2, margin: 0 }}>
            {formatCOP(total)}
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", margin: 0 }}>COP</p>
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: "0.65rem", color: vencidoColor, margin: 0, fontWeight: 600 }}>
              {vencidoLabel}
            </p>
            <p style={{ fontSize: "0.65rem", color: vencidoColor, margin: 0, fontWeight: 600 }}>
              {vencidoPct}%
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
        {data.map((d) => (
          <div key={d.name} style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{d.name}</span>
            </div>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: d.color }}>
              {formatCOP(d.value)}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              {((d.value / total) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
