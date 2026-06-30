"use client";

import { useEffect, useState } from "react";
import { api, Aliado, Empresa, Solicitud } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

const ESTADO_LABEL: Record<string, string> = {
  CREADA: "Creada",
  ASIGNADA: "Asignada",
  NOTIFICADA: "Novedad",
  EN_PROCESO: "En proceso",
  VALIDADA: "Firma pendiente",
  FIRMA_RECIBIDA: "Firma recibida",
  RECHAZADA: "Rechazada",
  APROBADA: "Aprobada",
  FINALIZADA: "Finalizada",
};

const ESTADO_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  CREADA: "neutral",
  ASIGNADA: "info",
  NOTIFICADA: "warning",
  EN_PROCESO: "info",
  VALIDADA: "info",
  FIRMA_RECIBIDA: "info",
  RECHAZADA: "error",
  APROBADA: "success",
  FINALIZADA: "success",
};

export default function VendedoresPage() {
  const { user } = useAuth();
  const esSuperAdmin = user?.rol === "SUPER_ADMIN";

  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [misSolicitudes, setMisSolicitudes] = useState<Solicitud[]>([]);
  const [cedula, setCedula] = useState("");
  const [aliadoId, setAliadoId] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [resultado, setResultado] = useState<Solicitud | null>(null);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const cargar = async () => {
    try {
      const [ali, emp] = await Promise.all([
        api.aliados.listarActivos(),
        api.empresas.listar(),
      ]);
      setAliados(ali);
      setEmpresas(emp.filter((e) => e.estado === "ACTIVA"));

      // Super Admin ve todas las solicitudes; vendedor solo las suyas
      const sols = esSuperAdmin
        ? await api.solicitudes.listar()
        : await api.solicitudes.listarPorVendedor();
      setMisSolicitudes(sols);
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleAliadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAliadoId(e.target.value);
    setEmpresaId("");
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setCedula(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || !aliadoId || !empresaId) return;
    setLoading(true);
    setResultado(null);
    try {
      const sol = await api.solicitudes.crear({ cedulaCliente: cedula, aliadoId, empresaId });
      setResultado(sol);
      setToast({ message: `Solicitud asignada a ${sol.analista?.nombre}`, type: "success" });
      setCedula("");
      setAliadoId("");
      setEmpresaId("");
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const marcarFirmaRecibida = async (id: string) => {
    try {
      await api.solicitudes.firmaRecibida(id);
      setToast({ message: "Firma marcada como recibida", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const eliminarSolicitud = (id: string) => {
    setConfirm({
      open: true,
      title: "Eliminar solicitud",
      message: "¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.",
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Vendedores</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* Formulario — izquierda en escritorio */}
        <div style={{ flex: "0 0 320px", minWidth: 280 }}>
          <Card>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Nueva solicitud</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                  Cédula del cliente
                </label>
                <Input
                  value={cedula}
                  onChange={handleCedulaChange}
                  placeholder="Ej: 123456789"
                  required
                  inputMode="numeric"
                  style={{ fontSize: "0.9rem", padding: "0.6rem 0.75rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                  Aliado
                </label>
                <Select
                  options={aliados.map((a) => ({ value: a.id, label: a.nombre }))}
                  value={aliadoId}
                  onChange={handleAliadoChange}
                  required
                  style={{ fontSize: "0.9rem", padding: "0.6rem 0.75rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                  Empresa
                </label>
                <Select
                  options={empresas.map((e) => ({ value: e.id, label: e.nombre }))}
                  value={empresaId}
                  onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => setEmpresaId(ev.target.value)}
                  required
                  disabled={!aliadoId}
                  style={{ fontSize: "0.9rem", padding: "0.6rem 0.75rem" }}
                />
              </div>
              <Button type="submit" disabled={loading} style={{ width: "100%", padding: "0.7rem 1rem", fontSize: "0.9rem" }}>
                {loading ? "Enviando..." : "Notificar Telegram"}
              </Button>
            </form>
          </Card>

          {resultado && (
            <Card style={{ marginTop: "1rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem" }}>Confirmación</h3>
              <p style={{ marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                <strong>Solicitud creada</strong> — cédula <strong>{resultado.cedulaCliente}</strong>
              </p>
              <p style={{ marginBottom: "0.3rem", fontSize: "0.85rem" }}>
                Analista: <strong>{resultado.analista?.nombre}</strong>
              </p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                Estado: {resultado.estado}
              </p>
            </Card>
          )}
        </div>

        {/* Tabla — derecha en escritorio, todo el ancho */}
        <div style={{ flex: "1 1 500px", minWidth: 280 }}>
          <Card>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Mis solicitudes</h3>
            <Table
              columns={[
                { header: "Cédula", accessor: (s) => s.cedulaCliente, width: "110px" },
                { header: "Aliado", accessor: (s) => s.aliado.nombre, width: "140px" },
                { header: "Empresa", accessor: (s) => s.empresa.nombre, width: "140px" },
                { header: "Analista", accessor: (s) => s.analista?.nombre || "-", width: "130px" },
                {
                  header: "Estado",
                  accessor: (s) => (
                    <Badge variant={ESTADO_VARIANT[s.estado] || "neutral"}>
                      {ESTADO_LABEL[s.estado] || s.estado}
                    </Badge>
                  ),
                  width: "120px",
                },
                {
                  header: "Acciones",
                  accessor: (s) => (
                    <div className="flex action-group" style={{ flexWrap: "wrap", alignItems: "center", minHeight: 28 }}>
                      {s.estado === "VALIDADA" && (
                        <Button size="sm" variant="success" onClick={() => marcarFirmaRecibida(s.id)}>
                          Firmó
                        </Button>
                      )}
                      {esSuperAdmin && (
                        <Button size="sm" variant="danger" onClick={() => eliminarSolicitud(s.id)}>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  ),
                  width: "130px",
                },
              ]}
              data={misSolicitudes}
              keyExtractor={(s) => s.id}
            />
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        variant="danger"
        confirmLabel="Eliminar"
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
