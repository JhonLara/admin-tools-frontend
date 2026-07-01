"use client";

import { useEffect, useMemo, useState } from "react";
import { api, Analista, HorarioAnalista } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
  const [selectedAnalistaId, setSelectedAnalistaId] = useState<string | null>(null);
  const [expandedDias, setExpandedDias] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HorarioAnalista | null>(null);
  const [selectedDia, setSelectedDia] = useState<string>("LUNES");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("17:00");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [ani, hor] = await Promise.all([api.analistas.listar(), api.horariosAnalistas.listar()]);
      setAnalistas(ani);
      setHorarios(hor);
      // No auto-seleccionar; el usuario debe elegir un analista
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAnalista = useMemo(
    () => analistas.find((a) => a.id === selectedAnalistaId),
    [analistas, selectedAnalistaId]
  );

  const horariosPorAnalista = useMemo(() => {
    const map = new Map<string, HorarioAnalista[]>();
    analistas.forEach((a) => {
      map.set(a.id, horarios.filter((h) => h.analistaId === a.id && h.activo));
    });
    return map;
  }, [analistas, horarios]);

  const horariosPorDia = useMemo(() => {
    if (!selectedAnalistaId) return new Map<string, HorarioAnalista[]>();
    const hrs = horariosPorAnalista.get(selectedAnalistaId) || [];
    const map = new Map<string, HorarioAnalista[]>();
    DIAS_SEMANA.forEach((d) => map.set(d.value, []));
    hrs.forEach((h) => {
      const arr = map.get(h.diaSemana);
      if (arr) arr.push(h);
    });
    DIAS_SEMANA.forEach((d) => {
      const arr = map.get(d.value)!;
      arr.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    });
    return map;
  }, [horariosPorAnalista, selectedAnalistaId]);

  const abrirCrear = (dia: string) => {
    setEditing(null);
    setSelectedDia(dia);
    setHoraInicio("08:00");
    setHoraFin("17:00");
    setModalOpen(true);
  };

  const abrirEditar = (h: HorarioAnalista) => {
    setEditing(h);
    setSelectedDia(h.diaSemana);
    setHoraInicio(h.horaInicio);
    setHoraFin(h.horaFin);
    setModalOpen(true);
  };

  const guardar = async () => {
    if (!selectedAnalistaId) return;
    try {
      if (editing) {
        await api.horariosAnalistas.actualizar(editing.id, {
          analistaId: selectedAnalistaId,
          diasSemana: [selectedDia],
          horaInicio,
          horaFin,
        });
        setToast({ message: "Horario actualizado", type: "success" });
      } else {
        await api.horariosAnalistas.crear({
          analistaId: selectedAnalistaId,
          diasSemana: [selectedDia],
          horaInicio,
          horaFin,
        });
        setToast({ message: "Horario creado", type: "success" });
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

  if (loading) return <LoadingSpinner message="Cargando horarios..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)" }}>
        Horarios de analistas
      </h1>

      <div className="horarios-layout">
        {/* Sidebar: lista de analistas */}
        <div className="horarios-sidebar">
          {analistas.map((a) => {
            const count = (horariosPorAnalista.get(a.id) || []).length;
            const isActive = a.id === selectedAnalistaId;
            return (
              <div
                key={a.id}
                className={`horarios-analista-item ${isActive ? "active" : ""}`}
                onClick={() => setSelectedAnalistaId(a.id)}
              >
                <div className="horarios-analista-avatar">
                  {a.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="horarios-analista-info">
                  <div className="horarios-analista-name">{a.nombre}</div>
                  <div className="horarios-analista-meta">
                    {count > 0 ? `${count} horario(s)` : "Sin horarios"} · {a.cedula}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel: días del analista seleccionado */}
        <div className="horarios-panel">
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-main)" }}>
                {selectedAnalista?.nombre ?? "Selecciona un analista"}
              </h2>
            </div>

            {!selectedAnalista ? (
              <div className="empty-state" style={{ padding: "2rem 0", textAlign: "center" }}>
                Selecciona un analista de la lista para ver y gestionar sus horarios.
              </div>
            ) : (
            <div className="horarios-dia-list">
              {DIAS_SEMANA.map((dia) => {
                const hrs = horariosPorDia.get(dia.value) || [];
                const isExpanded = expandedDias.has(dia.value);
                const toggle = () => {
                  setExpandedDias((prev) => {
                    const next = new Set(prev);
                    if (next.has(dia.value)) next.delete(dia.value);
                    else next.add(dia.value);
                    return next;
                  });
                };
                return (
                  <div
                    key={dia.value}
                    className={`horarios-dia-row ${isExpanded ? "expanded" : ""}`}
                    onClick={toggle}
                  >
                    <div className="horarios-dia-label">
                      <span className="horarios-dia-arrow">{isExpanded ? "▼" : "▶"}</span>
                      {dia.label}
                    </div>
                    <div className="horarios-dia-summary">
                      {hrs.length === 0
                        ? "Sin horarios"
                        : `${hrs.length} horario(s)`}
                    </div>
                    {isExpanded && (
                      <div className="horarios-dia-content" onClick={(e) => e.stopPropagation()}>
                        {hrs.length === 0 ? (
                          <span className="horarios-dia-empty">Sin horarios configurados</span>
                        ) : (
                          <div className="horarios-intervalos">
                            {hrs.map((h) => (
                              <span key={h.id} className="horario-pill">
                                {h.horaInicio} – {h.horaFin}
                                <span className="horario-pill-actions">
                                  <button
                                    className="horario-pill-btn"
                                    onClick={() => abrirEditar(h)}
                                    title="Editar"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    className="horario-pill-btn"
                                    onClick={() => eliminar(h.id)}
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                        <div>
                          <Button size="sm" variant="secondary" onClick={() => abrirCrear(dia.value)}>
                            + Agregar horario
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </Card>
        </div>
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
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              Día de la semana
            </label>
            <select
              className="select"
              value={selectedDia}
              onChange={(e) => setSelectedDia(e.target.value)}
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.4rem",
                }}
              >
                Hora inicio
              </label>
              <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.4rem",
                }}
              >
                Hora fin
              </label>
              <Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
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
