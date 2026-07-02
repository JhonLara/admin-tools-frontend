"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { month: "Febrero 2025", value: 1485230000 },
  { month: "Marzo 2025", value: 1612870000 },
  { month: "Abril 2025", value: 1805210000 },
  { month: "Mayo 2025", value: 1987450000 },
];

export default function TrendLineChart() {
  const formatY = (v: number) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "M";
    return v.toString();
  };

  const formatCOP = (v: number) => "$" + v.toLocaleString("es-CO");

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value: any) => [typeof value === "number" ? formatCOP(value) : value, "Recaudo"]}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
