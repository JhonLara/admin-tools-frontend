const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function formatEstado(estado: string): string {
  return estado.replace(/_/g, " ");
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function fetchVoid(path: string, options?: RequestInit): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Error ${res.status}`);
  }
}

export interface Empresa {
  id: string;
  nombre: string;
  estado: string;
}

export interface Aliado {
  id: string;
  nombre: string;
  empresa: { id: string; nombre: string };
  empresas: { id: string; nombre: string }[];
  telegramChatId: string;
  estado: string;
}

export interface Analista {
  id: string;
  nombre: string;
  cedula: string;
  ordenAsignacion: number;
  estado: string;
  disponible?: boolean;
}

export interface Solicitud {
  id: string;
  cedulaCliente: string;
  aliado: { id: string; nombre: string };
  empresa: { id: string; nombre: string };
  analista: { id: string; nombre: string; cedula: string } | null;
  estado: string;
  fechaCreacion: string;
  fechaAsignacion: string | null;
  fechaFinalizacion: string | null;
  mensaje?: string;
}

export interface HistorialNotificacion {
  id: string;
  solicitudId: string;
  cedulaCliente: string;
  nombreAliado: string;
  canal: string;
  origen: string;
  destino: string;
  mensajeEnviado: string;
  estadoEnvio: string;
  respuestaIntegracion: string | null;
  fechaEnvio: string;
}

export interface Usuario {
  token: string;
  username: string;
  nombre: string;
  rol: string;
  analistaId?: string;
}

export interface HorarioAnalista {
  id: string;
  analistaId: string;
  analistaNombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  analistaId?: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface SesionResumen {
  username: string;
  nombre: string;
  rol: string;
  totalSesiones: number;
  sesionesActivas: number;
}

export interface DashboardResumen {
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesNotificadas: number;
  solicitudesError: number;
  solicitudesPorAliado: { aliadoNombre: string; cantidad: number }[];
  solicitudesPorEstado: { estado: string; cantidad: number }[];
  ultimasSolicitudes: Solicitud[];
}

export interface SesionActiva {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  ipAddress: string;
  userAgent: string;
  fechaInicio: string;
  fechaExpiracion: string;
  activa: boolean;
}

export interface AliadoEmpresaTelegram {
  id: string;
  aliadoId: string;
  empresaId: string;
  telegramChatId: string;
}

export const api = {
  auth: {
    login: (data: { username: string; password: string }) => fetchJson<Usuario>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => fetchJson<{ username: string; nombre: string; rol: string }>("/auth/me"),
  },
  empresas: {
    listar: () => fetchJson<Empresa[]>("/empresas"),
    crear: (data: { nombre: string }) => fetchJson<Empresa>("/empresas", { method: "POST", body: JSON.stringify(data) }),
    actualizar: (id: string, data: { nombre: string }) => fetchJson<Empresa>(`/empresas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    cambiarEstado: (id: string) => fetchJson<Empresa>(`/empresas/${id}/estado`, { method: "PATCH" }),
    eliminar: (id: string) => fetchVoid(`/empresas/${id}`, { method: "DELETE" }),
  },
  aliados: {
    listar: () => fetchJson<Aliado[]>("/aliados"),
    listarActivos: () => fetchJson<Aliado[]>("/aliados/activos"),
    crear: (data: { nombre: string; empresaIds: string[]; telegramChatId?: string }) => fetchJson<Aliado>("/aliados", { method: "POST", body: JSON.stringify(data) }),
    actualizar: (id: string, data: { nombre: string; empresaIds: string[]; telegramChatId?: string }) => fetchJson<Aliado>(`/aliados/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    cambiarEstado: (id: string) => fetchJson<Aliado>(`/aliados/${id}/estado`, { method: "PATCH" }),
    eliminar: (id: string) => fetchVoid(`/aliados/${id}`, { method: "DELETE" }),
  },
  analistas: {
    listar: () => fetchJson<Analista[]>("/analistas"),
    listarActivos: () => fetchJson<Analista[]>("/analistas/activos"),
    crear: (data: { nombre: string; cedula: string; ordenAsignacion: number }) => fetchJson<Analista>("/analistas", { method: "POST", body: JSON.stringify(data) }),
    actualizar: (id: string, data: { nombre: string; cedula: string; ordenAsignacion: number }) => fetchJson<Analista>(`/analistas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    cambiarEstado: (id: string) => fetchJson<Analista>(`/analistas/${id}/estado`, { method: "PATCH" }),
    eliminar: (id: string) => fetchVoid(`/analistas/${id}`, { method: "DELETE" }),
  },
  solicitudes: {
    listar: () => fetchJson<Solicitud[]>("/solicitudes"),
    listarPorAnalista: (analistaId: string) => fetchJson<Solicitud[]>(`/solicitudes/mis-solicitudes?analistaId=${analistaId}`),
    obtener: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}`),
    crear: (data: { cedulaCliente: string; aliadoId: string; empresaId: string }) => fetchJson<Solicitud>("/solicitudes", { method: "POST", body: JSON.stringify(data) }),
    listarPorVendedor: () => fetchJson<Solicitud[]>("/solicitudes/mis-solicitudes-vendedor"),
    notificarObservacion: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}/notificar-observacion`, { method: "POST" }),
    validar: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}/validar`, { method: "PATCH" }),
    rechazar: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}/rechazar`, { method: "PATCH" }),
    aprobar: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}/aprobar`, { method: "PATCH" }),
    firmaRecibida: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}/firma-recibida`, { method: "PATCH" }),
    revisar: (id: string) => fetchJson<Solicitud>(`/solicitudes/${id}/revisado`, { method: "PATCH" }),
    eliminar: (id: string) => fetchVoid(`/solicitudes/${id}`, { method: "DELETE" }),
  },
  historial: {
    listar: () => fetchJson<HistorialNotificacion[]>("/historial-notificaciones"),
  },
  dashboard: {
    resumen: () => fetchJson<DashboardResumen>("/dashboard/resumen"),
  },
  horariosAnalistas: {
    listar: () => fetchJson<HorarioAnalista[]>("/horarios-analistas"),
    listarPorAnalista: (analistaId: string) => fetchJson<HorarioAnalista[]>(`/horarios-analistas/analista/${analistaId}`),
    crear: (data: { analistaId: string; diasSemana: string[]; horaInicio: string; horaFin: string }) => fetchJson<HorarioAnalista[]>("/horarios-analistas", { method: "POST", body: JSON.stringify(data) }),
    actualizar: (id: string, data: { analistaId: string; diasSemana: string[]; horaInicio: string; horaFin: string }) => fetchJson<HorarioAnalista>(`/horarios-analistas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    eliminar: (id: string) => fetchVoid(`/horarios-analistas/${id}`, { method: "DELETE" }),
  },
  usuarios: {
    listar: () => fetchJson<Usuario[]>("/usuarios"),
    crear: (data: { username: string; password: string; nombre: string; rol: string; analistaId?: string }) => fetchJson<Usuario>("/usuarios", { method: "POST", body: JSON.stringify(data) }),
    actualizar: (id: string, data: { username: string; password?: string; nombre: string; rol: string; analistaId?: string }) => fetchJson<Usuario>(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    cambiarEstado: (id: string) => fetchJson<Usuario>(`/usuarios/${id}/estado`, { method: "PATCH" }),
    eliminar: (id: string) => fetchVoid(`/usuarios/${id}`, { method: "DELETE" }),
  },
  sesiones: {
    listar: () => fetchJson<SesionActiva[]>("/sesiones"),
    conteo: () => fetchJson<{ activas: number; total: number }>("/sesiones/conteo"),
    resumen: () => fetchJson<SesionResumen[]>("/sesiones/resumen"),
    invalidar: (id: string) => fetchVoid(`/sesiones/${id}`, { method: "DELETE" }),
  },
  aliadoEmpresaTelegram: {
    obtener: (aliadoId: string, empresaId: string) => fetchJson<AliadoEmpresaTelegram>(`/aliado-empresa-telegram?aliadoId=${aliadoId}&empresaId=${empresaId}`),
    guardar: (data: { aliadoId: string; empresaId: string; telegramChatId: string }) => fetchJson<AliadoEmpresaTelegram>("/aliado-empresa-telegram", { method: "POST", body: JSON.stringify(data) }),
  },
};
