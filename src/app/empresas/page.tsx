"use client";

import { useEffect, useState } from "react";
import { api, Empresa } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [nombre, setNombre] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id: string; nombre: string }>({ open: false, id: "", nombre: "" });

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.empresas.listar();
      setEmpresas(data);
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
    setModalOpen(true);
  };

  const abrirEditar = (emp: Empresa) => {
    setEditing(emp);
    setNombre(emp.nombre);
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      if (editing) {
        await api.empresas.actualizar(editing.id, { nombre });
      } else {
        await api.empresas.crear({ nombre });
      }
      setModalOpen(false);
      setToast({ message: editing ? "Empresa actualizada" : "Empresa creada", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const cambiarEstado = async (id: string) => {
    try {
      await api.empresas.cambiarEstado(id);
      setToast({ message: "Estado actualizado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  if (loading) return <LoadingSpinner message="Cargando empresas..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Empresas</h1>
        <Button onClick={abrirCrear}>+ Nueva empresa</Button>
      </div>

      <Card>
        <Table
          columns={[
            { header: "Nombre", accessor: (e) => e.nombre },
            {
              header: "Estado",
              accessor: (e) => (
                <Badge variant={e.estado === "ACTIVA" ? "success" : "neutral"}>{e.estado}</Badge>
              ),
            },
            {
              header: "Acciones",
              accessor: (e) => (
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(e)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => cambiarEstado(e.id)}>
                    Cambiar estado
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirm({ open: true, id: e.id, nombre: e.nombre })}>
                    Eliminar
                  </Button>
                </div>
              ),
            },
          ]}
          data={empresas}
          keyExtractor={(e) => e.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? "Editar empresa" : "Nueva empresa"}
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
        <div>
          <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            Nombre
          </label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1" />
        </div>
      </Modal>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        title="Eliminar empresa"
        message={`¿Estás seguro de que deseas eliminar la empresa ${confirm.nombre}?`}
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          setConfirm((c) => ({ ...c, open: false }));
          try {
            await api.empresas.eliminar(confirm.id);
            setToast({ message: "Empresa eliminada", type: "success" });
            cargar();
          } catch (e: any) {
            setToast({ message: e.message, type: "error" });
          }
        }}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
