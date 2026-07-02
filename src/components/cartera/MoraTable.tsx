interface MoraSummary {
  rango1_30: number;
  rango31_60: number;
  rango61_90: number;
  rango91_180: number;
  rango181_360: number;
  rango360plus: number;
  total: number;
}

interface MoraTableProps {
  data?: MoraSummary;
}

function formatCOP(n: number) {
  return "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const rowsConfig = [
  { key: "rango1_30" as keyof MoraSummary, label: "1 - 30", color: "#22c55e" },
  { key: "rango31_60" as keyof MoraSummary, label: "31 - 60", color: "#eab308" },
  { key: "rango61_90" as keyof MoraSummary, label: "61 - 90", color: "#f97316" },
  { key: "rango91_180" as keyof MoraSummary, label: "91 - 180", color: "#ef4444" },
  { key: "rango181_360" as keyof MoraSummary, label: "181 - 360", color: "#b91c1c" },
  { key: "rango360plus" as keyof MoraSummary, label: "360+", color: "#7f1d1d" },
];

export default function MoraTable({ data }: MoraTableProps) {
  const d = data || {
    rango1_30: 0,
    rango31_60: 0,
    rango61_90: 0,
    rango91_180: 0,
    rango181_360: 0,
    rango360plus: 0,
    total: 0,
  };

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 16,
      padding: "1.5rem 2rem",
      boxShadow: "var(--shadow-soft)",
    }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-main)", marginBottom: "1.25rem" }}>
        Cartera en mora por edades
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr>
              <th style={{ padding: "1rem 1.25rem", textAlign: "left", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, background: "var(--color-bg)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Edad de mora <span style={{ fontWeight: 400, textTransform: "none" }}>(días)</span>
              </th>
              <th style={{ padding: "1rem 1.25rem", textAlign: "left", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, background: "var(--color-bg)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Valor vencido <span style={{ fontWeight: 400, textTransform: "none" }}>(COP)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rowsConfig.map((r) => {
              const val = d[r.key] || 0;
              return (
                <tr key={r.key} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-text-main)", verticalAlign: "middle" }}>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: r.color, marginRight: "0.5rem" }} />
                    {r.label}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-text-main)", verticalAlign: "middle" }}>{formatCOP(val)}</td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--color-bg)" }}>
              <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--color-text-main)", borderBottomLeftRadius: 8 }}><strong>Total</strong></td>
              <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--color-text-main)", borderBottomRightRadius: 8 }}><strong>{formatCOP(d.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>ⓘ</span> Los valores se calculan a partir del capital vencido por rango de días.
      </p>
    </div>
  );
}
