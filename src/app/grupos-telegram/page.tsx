"use client";

import { useEffect, useState } from "react";
import { api, Aliado, Empresa, AliadoEmpresaTelegram } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Combinacion {
  aliado: Aliado;
  empresa: Empresa;
  chatId: string;
}

export default function GruposTelegramPage() {
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [combinaciones, setCombinaciones] = useState<Combinacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Combinacion | null>(null);
  const [chatId, setChatId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [ali, emp] = await Promise.all([api.aliados.listar(), api.empresas.listar()]);
      setAliados(ali);
      setEmpresas(emp);

      // Generar todas las combinaciones aliado x empresa
      const combos: Combinacion[] = [];
      for (const a of ali) {
        for (const e of emp.filter((x) => x.estado === "ACTIVA")) {
          try {
            const config = await api.aliadoEmpresaTelegram.obtener(a.id, e.id);
            combos.push({ aliado: a, empresa: e, chatId: config.telegramChatId || "" });
          } catch {
            combos.push({ aliado: a, empresa: e, chatId: "" });
          }
        }
      }
      setCombinaciones(combos);
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirEditar = (c: Combinacion) => {
    setEditing(c);
    setChatId(c.chatId);
    setModalOpen(true);
  };

  const guardar = async () => {
    if (!editing) return;
    try {
      await api.aliadoEmpresaTelegram.guardar({
        aliadoId: editing.aliado.id,
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

  if (loading) return <LoadingSpinner message="Cargando configuraciones..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)" }}>
          Grupos de Telegram
        </h1>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          {combinaciones.length} combinaciones
        </span>
      </div>

      <Card>
        <Table
          columns={[
            { header: "Aliado", accessor: (c) => c.aliado.nombre },
            { header: "Empresa", accessor: (c) => c.empresa.nombre },
            {
              header: "Grupo Telegram",
              accessor: (c) => (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    color: c.chatId ? "var(--color-primary)" : "var(--color-text-secondary)",
                    fontWeight: c.chatId ? 600 : 400,
                  }}
                >
                  {c.chatId || "No configurado"}
                </span>
              ),
            },
            {
              header: "Acciones",
              accessor: (c) => (
                <Button size="sm" variant="secondary" onClick={() => abrirEditar(c)}>
                  Configurar
                </Button>
              ),
            },
          ]}
          data={combinaciones}
          keyExtractor={(c) => `${c.aliado.id}-${c.empresa.id}`}
          onRefresh={cargar}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={`Configurar grupo - ${editing?.aliado.nombre} / ${editing?.empresa.nombre}`}
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
              Usa el ID numérico del grupo de Telegram. Si está vacío, se usará el grupo por defecto del aliado.
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
