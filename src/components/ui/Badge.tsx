export default function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "asignada" | "notificada" | "pendiente" | "finalizada" | "error-notif";
}) {
  const map: Record<string, string> = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info",
    neutral: "badge-neutral",
    asignada: "badge-asignada",
    notificada: "badge-notificada",
    pendiente: "badge-pendiente",
    finalizada: "badge-finalizada",
    "error-notif": "badge-error-notif",
  };
  return <span className={`badge ${map[variant]}`}>{children}</span>;
}
