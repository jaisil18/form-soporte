export interface UsuarioSoporte {
  id: string;
  nombre_completo: string;
  email?: string;
  activo: boolean;
  created_at: string;
}

export interface Incidencia {
  id: string;
  usuario_id: string;
  usuario_nombre?: string;
  usuario_email?: string;
  sede: string;
  pabellon: string;
  tipo_actividad: string;
  ambiente_incidencia?: string;
  tipo_incidencia?: string;
  equipo_afectado?: string;
  tiempo_aproximado: string;
  descripcion?: string;
  estado?: 'pendiente' | 'en progreso' | 'resuelto';
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_hora: string;
  created_at: string;
  updated_at?: string;
}

export interface ConfiguracionSistema {
  id: string;
  clave: string;
  valor: any;
  descripcion: string;
  updated_at: string;
}

export interface FormularioData {
  usuario_id: string;
  usuario_nombre?: string;
  usuario_email?: string;
  sede: string;
  pabellon: string | null;
  tipo_actividad: string;
  ambiente_incidencia?: string;
  tipo_incidencia?: string;
  equipo_afectado?: string;
  tiempo_aproximado: string;
  fecha_hora: string;
}

export interface HorarioConfiguracion {
  habilitado: boolean;
  hora_inicio: number;
  minuto_inicio: number;
  hora_fin: number;
  minuto_fin: number;
}

export interface UsuarioAdmin {
  id: string;
  email: string;
  password_hash: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpcionesFormulario {
  sedes: string[];
  pabellones: Record<string, string[]>;
  tipos_actividad: string[];
  ambientes: Record<string, string[]>;
  tipos_incidencia: string[];
  equipos: Record<string, string[]>;
  tiempos_aproximados: string[];
}

export interface FiltrosReporte {
  fecha_desde?: string;
  fecha_hasta?: string;
  sede?: string;
  usuario_id?: string;
  tipo_actividad?: string;
}

export interface EstadisticasReporte {
  total_incidencias: number;
  incidencias_por_sede: Record<string, number>;
  tipos_actividad: Record<string, number>;
  equipos_mas_afectados: Record<string, number>;
  tiempo_promedio: Record<string, number>;
  tendencia_temporal: Array<{
    fecha: string;
    cantidad: number;
  }>;
}
