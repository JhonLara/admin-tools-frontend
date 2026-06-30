"use client";

import { useEffect, useState } from "react";
import { api, Analista } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminAnalistasPage() {
  const [analistas, setAnalistas] = useState<Analista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Analista | null>(null);
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [orden, setOrden] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.analistas.listar();
      setAnalistas(data);
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
    setNombre("");
    setCedula("");
    setOrden("");
    setModalOpen(true);
  };

  const abrirEditar = (a: Analista) => {
    setEditing(a);
    setNombre(a.nombre);
    setCedula(a.cedula);
    setOrden(String(a.ordenAsignacion));
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      if (editing) {
        await api.analistas.actualizar(editing.id, { nombre, cedula, ordenAsignacion: Number(orden) });
      } else {
        await api.analistas.crear({ nombre, cedula, ordenAsignacion: Number(orden) });
      }
      setModalOpen(false);
      setToast({ message: editing ? "Analista actualizado" : "Analista creado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const cambiarEstado = async (id: string) => {
    try {
      await api.analistas.cambiarEstado(id);
      setToast({ message: "Estado actualizado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  if (loading) return <LoadingSpinner message="Cargando analistas..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Administración de analistas</h1>
        <Button onClick={abrirCrear}>+ Nuevo analista</Button>
      </div>

      <Card>
        <Table
          columns={[
            { header: "Nombre", accessor: (a) => a.nombre },
            { header: "Cédula", accessor: (a) => a.cedula },
            { header: "Orden", accessor: (a) => a.ordenAsignacion },
            {
              header: "Estado",
              accessor: (a) => (
                <Badge variant={a.estado === "ACTIVO" ? "success" : "neutral"}>{a.estado}</Badge>
              ),
            },
            {
              header: "Disponibilidad",
              accessor: (a) => (
                <Badge variant={a.disponible ? "success" : "error"}>
                  {a.disponible ? "Libre" : "Ocupado"}
                </Badge>
              ),
            },
            {
              header: "Acciones",
              accessor: (a) => (
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(a)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => cambiarEstado(a.id)}>
                    Cambiar estado
                  </Button>
                </div>
              ),
            },
          ]}
          data={analistas}
          keyExtractor={(a) => a.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? "Editar analista" : "Nuevo analista"}
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
            <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Cédula</label>
            <Input value={cedula} onChange={(e) => setCedula(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Orden de asignación</label>
            <Input
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="mt-1"
            />
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
