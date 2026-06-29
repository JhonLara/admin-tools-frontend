"use client";

import { useEffect, useState } from "react";
import { api, Analista, HorarioAnalista } from "@/lib/api";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";

const DIAS_SEMANA = [
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIERCOLES", label: "Miércoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
  { value: "SABADO", label: "Sábado" },
  { value: "DOMINGO", label: "Domingo" },
];

export default function HorariosAnalistasPage() {
  const [analistas, setAnalistas] = useState<Analista[]>([]);
  const [horarios, setHorarios] = useState<HorarioAnalista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HorarioAnalista | null>(null);
  const [analistaId, setAnalistaId] = useState("");
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("17:00");
  const [filtroAnalista, setFiltroAnalista] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [ani, hor] = await Promise.all([api.analistas.listar(), api.horariosAnalistas.listar()]);
      setAnalistas(ani);
      setHorarios(hor);
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditing(null);
    setAnalistaId("");
    setDiasSemana([]);
    setHoraInicio("08:00");
    setHoraFin("17:00");
    setModalOpen(true);
  };

  const abrirEditar = (h: HorarioAnalista) => {
    setEditing(h);
    setAnalistaId(h.analistaId);
    setDiasSemana([h.diaSemana]);
    setHoraInicio(h.horaInicio);
    setHoraFin(h.horaFin);
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      if (editing) {
        await api.horariosAnalistas.actualizar(editing.id, { analistaId, diasSemana, horaInicio, horaFin });
        setToast({ message: "Horario actualizado", type: "success" });
      } else {
        await api.horariosAnalistas.crear({ analistaId, diasSemana, horaInicio, horaFin });
        setToast({ message: `${diasSemana.length} horario(s) creado(s)`, type: "success" });
      }
      setModalOpen(false);
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await api.horariosAnalistas.eliminar(id);
      setToast({ message: "Horario eliminado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const filtrados = filtroAnalista
    ? horarios.filter((h) => h.analistaId === filtroAnalista)
    : horarios;

  const horariosPorAnalista = analistas.map((a) => ({
    analista: a,
    horarios: horarios.filter((h) => h.analistaId === a.id && h.activo),
  }));

  if (loading) return <div className="loading-state">Cargando horarios...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)" }}>
          Horarios de analistas
        </h1>
        <Button onClick={abrirCrear}>+ Nuevo horario</Button>
      </div>

      <Card>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Filtrar por analista
          </label>
          <Select
            options={[{ value: "", label: "Todos" }, ...analistas.map((a) => ({ value: a.id, label: a.nombre }))]}
            value={filtroAnalista}
            onChange={(e) => setFiltroAnalista(e.target.value)}
            className="mt-1"
          />
        </div>

        <Table
          columns={[
            { header: "Analista", accessor: (h) => h.analistaNombre },
            { header: "Día", accessor: (h) => DIAS_SEMANA.find((d) => d.value === h.diaSemana)?.label || h.diaSemana },
            { header: "Hora inicio", accessor: (h) => h.horaInicio },
            { header: "Hora fin", accessor: (h) => h.horaFin },
            {
              header: "Acciones",
              accessor: (h) => (
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(h)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => eliminar(h.id)}>
                    Eliminar
                  </Button>
                </div>
              ),
            },
          ]}
          data={filtrados}
          keyExtractor={(h) => h.id}
        />
      </Card>

      {/* Vista por analista */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {horariosPorAnalista.map(({ analista, horarios }) => (
          <Card key={analista.id}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-text-main)" }}>
              {analista.nombre}
            </h3>
            {horarios.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Sin horarios configurados</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {horarios.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem 0.75rem",
                      background: "var(--color-bg)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {DIAS_SEMANA.find((d) => d.value === h.diaSemana)?.label}
                    </span>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      {h.horaInicio} - {h.horaFin}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Editar horario" : "Nuevo horario"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar}>Guardar</Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              Analista
            </label>
            <Select
              options={analistas.map((a) => ({ value: a.id, label: a.nombre }))}
              value={analistaId}
              onChange={(e) => setAnalistaId(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              {editing ? "Día de la semana" : "Días de la semana"}
            </label>
            {editing ? (
              <Select
                options={DIAS_SEMANA}
                value={diasSemana[0] || ""}
                onChange={(e) => setDiasSemana([e.target.value])}
              />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {DIAS_SEMANA.map((dia) => (
                  <label
                    key={dia.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "6px",
                      border: `1px solid ${diasSemana.includes(dia.value) ? "var(--color-primary)" : "var(--color-border-subtle)"}`,
                      background: diasSemana.includes(dia.value) ? "rgba(4,120,87,0.1)" : "transparent",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      userSelect: "none",
                      color: diasSemana.includes(dia.value) ? "var(--color-primary)" : "var(--color-text-secondary)",
                      fontWeight: diasSemana.includes(dia.value) ? 600 : 400,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={diasSemana.includes(dia.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDiasSemana((prev) => [...prev, dia.value]);
                        } else {
                          setDiasSemana((prev) => prev.filter((d) => d !== dia.value));
                        }
                      }}
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    {dia.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                Hora inicio
              </label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                Hora fin
              </label>
              <Input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
