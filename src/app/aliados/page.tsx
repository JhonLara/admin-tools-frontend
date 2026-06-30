"use client";

import { useEffect, useState } from "react";
import { api, Aliado, Empresa } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

export default function AliadosPage() {
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aliado | null>(null);
  const [nombre, setNombre] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [empresaIds, setEmpresaIds] = useState<string[]>([]);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [ali, emp] = await Promise.all([api.aliados.listar(), api.empresas.listar()]);
      setAliados(ali);
      setEmpresas(emp);
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
    setEmpresaId("");
    setEmpresaIds([]);
    setTelegramChatId("");
    setModalOpen(true);
  };

  const abrirEditar = (a: Aliado) => {
    setEditing(a);
    setNombre(a.nombre);
    setEmpresaId(a.empresa.id);
    setEmpresaIds(a.empresas.map((e) => e.id));
    setTelegramChatId(a.telegramChatId || "");
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      if (editing) {
        await api.aliados.actualizar(editing.id, { nombre, empresaIds: empresaId ? [empresaId] : empresaIds, telegramChatId });
      } else {
        await api.aliados.crear({ nombre, empresaIds: empresaId ? [empresaId] : [], telegramChatId });
      }
      setModalOpen(false);
      setToast({ message: editing ? "Aliado actualizado" : "Aliado creado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const cambiarEstado = async (id: string) => {
    try {
      await api.aliados.cambiarEstado(id);
      setToast({ message: "Estado actualizado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  if (loading) return <div className="loading-state">Cargando aliados...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Aliados</h1>
        <Button onClick={abrirCrear}>+ Nuevo aliado</Button>
      </div>

      <Card>
        <Table
          columns={[
            { header: "Nombre", accessor: (a) => a.nombre },
            { header: "Empresa", accessor: (a) => a.empresa.nombre },
            { header: "Telegram Chat ID", accessor: (a) => a.telegramChatId || "-" },
            {
              header: "Estado",
              accessor: (a) => (
                <Badge variant={a.estado === "ACTIVO" ? "success" : "neutral"}>{a.estado}</Badge>
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
          data={aliados}
          keyExtractor={(a) => a.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? "Editar aliado" : "Nuevo aliado"}
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
            <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Empresa</label>
            <Select
              options={empresas.map((e) => ({ value: e.id, label: e.nombre }))}
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Telegram Chat ID</label>
            <Input value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} className="mt-1" />
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
