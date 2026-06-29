"use client";

import { useEffect, useState } from "react";
import { api, Aliado, Solicitud } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

export default function VendedoresPage() {
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [cedula, setCedula] = useState("");
  const [aliadoId, setAliadoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [resultado, setResultado] = useState<Solicitud | null>(null);

  useEffect(() => {
    api.aliados.listarActivos().then(setAliados).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || !aliadoId) return;
    setLoading(true);
    setResultado(null);
    try {
      const sol = await api.solicitudes.crear({ cedulaCliente: cedula, aliadoId });
      setResultado(sol);
      setToast({ message: `Solicitud asignada a ${sol.analista?.nombre}`, type: "success" });
      setCedula("");
      setAliadoId("");
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, width: "100%", maxWidth: 560 }}>Vendedores</h1>

      <Card className="w-full" style={{ maxWidth: 560 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Nueva solicitud</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-main)", marginBottom: "0.4rem" }}>
              Cédula del cliente
            </label>
            <Input
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ej: 123456789"
              required
              style={{ fontSize: "1rem", padding: "0.75rem 1rem" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-main)", marginBottom: "0.4rem" }}>
              Aliado
            </label>
            <Select
              options={aliados.map((a) => ({ value: a.id, label: a.nombre }))}
              value={aliadoId}
              onChange={(e) => setAliadoId(e.target.value)}
              required
              style={{ fontSize: "1rem", padding: "0.75rem 1rem" }}
            />
          </div>
          <Button type="submit" disabled={loading} style={{ width: "100%", padding: "0.85rem 1rem", fontSize: "1rem" }}>
            {loading ? "Enviando..." : "Notificar reporte Telegram"}
          </Button>
        </form>
      </Card>

      {resultado && (
        <Card className="w-full" style={{ maxWidth: 560 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Confirmación</h3>
          <p style={{ marginBottom: "0.4rem" }}>
            <strong>Solicitud creada</strong> con cédula <strong>{resultado.cedulaCliente}</strong>
          </p>
          <p style={{ marginBottom: "0.4rem" }}>
            Asignada al analista: <strong>{resultado.analista?.nombre}</strong> ({resultado.analista?.cedula})
          </p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
            Estado: {resultado.estado}
          </p>
        </Card>
      )}

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
