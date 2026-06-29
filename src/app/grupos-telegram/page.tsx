"use client";

import { useEffect, useState } from "react";
import { api, Aliado, Empresa } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";

export default function GruposTelegramPage() {
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aliado | null>(null);
  const [chatId, setChatId] = useState("");
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

  const abrirEditar = (a: Aliado) => {
    setEditing(a);
    setChatId(a.telegramChatId || "");
    setModalOpen(true);
  };

  const guardar = async () => {
    if (!editing) return;
    try {
      await api.aliados.actualizar(editing.id, {
        nombre: editing.nombre,
        empresaId: editing.empresa.id,
        telegramChatId: chatId,
      });
      setModalOpen(false);
      setToast({ message: "Grupo de Telegram actualizado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const nombreEmpresa = (empresaId: string) => {
    const e = empresas.find((e) => e.id === empresaId);
    return e ? e.nombre : empresaId;
  };

  if (loading) return <div className="loading-state">Cargando aliados...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)" }}>
          Grupos de Telegram
        </h1>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          {aliados.length} aliados registrados
        </span>
      </div>

      <Card>
        <Table
          columns={[
            { header: "Aliado", accessor: (a) => a.nombre },
            { header: "Empresa", accessor: (a) => nombreEmpresa(a.empresa.id) },
            {
              header: "Grupo Telegram",
              accessor: (a) => (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    color: a.telegramChatId ? "var(--color-primary)" : "var(--color-text-secondary)",
                    fontWeight: a.telegramChatId ? 600 : 400,
                  }}
                >
                  {a.telegramChatId || "No configurado"}
                </span>
              ),
            },
            {
              header: "Acciones",
              accessor: (a) => (
                <Button size="sm" variant="secondary" onClick={() => abrirEditar(a)}>
                  Configurar
                </Button>
              ),
            },
          ]}
          data={aliados}
          keyExtractor={(a) => a.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={`Configurar grupo - ${editing?.nombre}`}
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
              Telegram Chat ID
            </label>
            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Ej: -5430015388"
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.35rem" }}>
              Usa el ID numérico del grupo de Telegram. Si está vacío, se usará el grupo por defecto.
            </p>
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
