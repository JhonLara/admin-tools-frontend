"use client";

import { useEffect, useState } from "react";
import { api, Usuario, Analista } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

const ROLES = [
  { value: "VENDEDOR", label: "Vendedor" },
  { value: "ANALISTA", label: "Analista" },
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "SUPER_ADMIN", label: "Super Administrador" },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [analistas, setAnalistas] = useState<Analista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");
  const [analistaId, setAnalistaId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [usu, ani] = await Promise.all([api.usuarios.listar(), api.analistas.listar()]);
      setUsuarios(usu);
      setAnalistas(ani);
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
    setUsername("");
    setPassword("");
    setNombre("");
    setRol("");
    setAnalistaId("");
    setModalOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditing(u);
    setUsername(u.username);
    setPassword("");
    setNombre(u.nombre);
    setRol(u.rol);
    setAnalistaId(u.analistaId || "");
    setModalOpen(true);
  };

  const guardar = async () => {
    try {
      const data: any = { username, nombre, rol };
      if (analistaId) data.analistaId = analistaId;
      if (editing) {
        if (password) data.password = password;
        await api.usuarios.actualizar(editing.id, data);
        setToast({ message: "Usuario actualizado", type: "success" });
      } else {
        if (!password) {
          setToast({ message: "La contraseña es obligatoria", type: "error" });
          return;
        }
        data.password = password;
        await api.usuarios.crear(data);
        setToast({ message: "Usuario creado", type: "success" });
      }
      setModalOpen(false);
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const cambiarEstado = async (id: string) => {
    try {
      await api.usuarios.cambiarEstado(id);
      setToast({ message: "Estado actualizado", type: "success" });
      cargar();
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    }
  };

  const nombreAnalista = (id?: string) => {
    if (!id) return "-";
    const a = analistas.find((a) => a.id === id);
    return a ? a.nombre : id;
  };

  if (loading) return <div className="loading-state">Cargando usuarios...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center">
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-main)" }}>
          Usuarios
        </h1>
        <Button onClick={abrirCrear}>+ Nuevo usuario</Button>
      </div>

      <Card>
        <Table
          columns={[
            { header: "Username", accessor: (u) => u.username },
            { header: "Nombre", accessor: (u) => u.nombre },
            { header: "Rol", accessor: (u) => u.rol },
            { header: "Analista", accessor: (u) => nombreAnalista(u.analistaId) },
            {
              header: "Estado",
              accessor: (u) => (
                <Badge variant={u.estado === "ACTIVO" ? "success" : "error"}>{u.estado}</Badge>
              ),
            },
            {
              header: "Acciones",
              accessor: (u) => (
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(u)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => cambiarEstado(u.id)}>
                    {u.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              ),
            },
          ]}
          data={usuarios}
          keyExtractor={(u) => u.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? "Editar usuario" : "Nuevo usuario"}
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
              Username
            </label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              Nombre completo
            </label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              Contraseña {editing && "(dejar vacío para no cambiar)"}
            </label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              Rol
            </label>
            <Select options={ROLES} value={rol} onChange={(e) => setRol(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              Analista vinculado (opcional)
            </label>
            <Select
              options={[{ value: "", label: "Ninguno" }, ...analistas.map((a) => ({ value: a.id, label: a.nombre }))]}
              value={analistaId}
              onChange={(e) => setAnalistaId(e.target.value)}
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
