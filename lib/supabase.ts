import { createClient } from '@supabase/supabase-js';
import type {
  UsuarioSoporte,
  Incidencia,
  FormularioData,
  HorarioConfiguracion,
  OpcionesFormulario,
  FiltrosReporte,
  EstadisticasReporte,
  UsuarioAdmin
} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flmudobluiyzllvgrwhs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbXVkb2JsdWl5emxsdmdyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjEzMzcsImV4cCI6MjA3NTkzNzMzN30.UnoJlCpU4xZgFFCTmvEYHhf9AmIZ2WwgaoemWVjpT4o';

// Cliente para componentes del lado del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para componentes del servidor
export const createServerClient = () => {
  return supabase;
};

// Funciones para usuarios de soporte
export const getUsuariosSoporte = async (): Promise<UsuarioSoporte[]> => {
  const { data, error } = await supabase
    .from('usuarios_soporte')
    .select('*')
    .eq('activo', true)
    .order('nombre_completo');

  if (error) throw error;
  return data || [];
};

export const createUsuarioSoporte = async (usuario: Omit<UsuarioSoporte, 'id' | 'created_at'>): Promise<UsuarioSoporte> => {
  const { data, error } = await supabase
    .from('usuarios_soporte')
    .insert(usuario)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUsuarioSoporte = async (id: string, updates: Partial<UsuarioSoporte>): Promise<UsuarioSoporte | null> => {
  const { data, error } = await supabase
    .from('usuarios_soporte')
    .update(updates)
    .eq('id', id)
    .select()
    .select();

  if (error) throw error;
  return data && data[0] ? data[0] : null;
};

// Funciones para incidencias
export const deleteUsuarioSoporte = async (id: string): Promise<void> => {
  const { data, error } = await supabase
    .from('usuarios_soporte')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No se pudo eliminar: El usuario no existe o no tienes permisos para eliminarlo.');
  }
};

export const createIncidencia = async (incidencia: FormularioData): Promise<Incidencia> => {
  console.log('🔧 createIncidencia: Iniciando creación de incidencia');
  console.log('🔧 createIncidencia: Datos recibidos:', incidencia);

  try {
    const datosInsertar = {
      usuario_id: incidencia.usuario_id,
      usuario_nombre: incidencia.usuario_nombre,
      usuario_email: incidencia.usuario_email,
      sede: incidencia.sede,
      pabellon: incidencia.pabellon,
      tipo_actividad: incidencia.tipo_actividad,
      ambiente_incidencia: incidencia.ambiente_incidencia,
      tipo_incidencia: incidencia.tipo_incidencia,
      equipo_afectado: incidencia.equipo_afectado,
      tiempo_aproximado: incidencia.tiempo_aproximado,
      fecha_hora: incidencia.fecha_hora,
      estado: 'pendiente',
      prioridad: 'media'
    };

    console.log('🔧 createIncidencia: Datos a insertar:', datosInsertar);

    const { data, error } = await supabase
      .from('incidencias')
      .insert(datosInsertar)
      .select()
      .single();

    if (error) {
      console.error('❌ createIncidencia: Error de Supabase:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }

    console.log('✅ createIncidencia: Incidencia creada exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ createIncidencia: Error general:', error);
    throw error;
  }
};

export const getIncidencias = async (filtros?: FiltrosReporte): Promise<Incidencia[]> => {
  let query = supabase
    .from('incidencias')
    .select('*')
    .order('created_at', { ascending: false });

  if (filtros?.fecha_desde) {
    query = query.gte('fecha_hora', filtros.fecha_desde);
  }
  if (filtros?.fecha_hasta) {
    query = query.lte('fecha_hora', filtros.fecha_hasta);
  }
  if (filtros?.sede) {
    query = query.eq('sede', filtros.sede);
  }
  if (filtros?.usuario_id) {
    query = query.eq('usuario_id', filtros.usuario_id);
  }
  if (filtros?.tipo_actividad) {
    query = query.eq('tipo_actividad', filtros.tipo_actividad);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Funciones para configuración del sistema
export const getConfiguracion = async (clave: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', clave)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.valor || null;
};

export const setConfiguracion = async (clave: string, valor: unknown, descripcion: string): Promise<void> => {
  const { error } = await supabase
    .from('configuracion_sistema')
    .upsert({
      clave,
      valor,
      descripcion,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clave'
    });

  if (error) throw error;
};

export const getHorarioConfiguracion = async (): Promise<HorarioConfiguracion> => {
  const config = await getConfiguracion('horario_formulario');
  return (config as HorarioConfiguracion) || {
    hora_inicio: 7,
    minuto_inicio: 0,
    hora_fin: 22,
    minuto_fin: 0
  };
};

export const setHorarioConfiguracion = async (horario: HorarioConfiguracion): Promise<void> => {
  await setConfiguracion(
    'horario_formulario',
    horario,
    'Horario permitido para llenar el formulario (formato 24h, zona horaria Perú)'
  );
};

// Funciones para opciones del formulario
export const getOpcionesFormulario = async (): Promise<OpcionesFormulario> => {
  const [
    sedes,
    pabellones,
    tipos_actividad,
    ambientes,
    tipos_incidencia,
    equipos,
    tiempos_aproximados
  ] = await Promise.all([
    getConfiguracion('sedes'),
    getConfiguracion('pabellones'),
    getConfiguracion('tipos_actividad'),
    getConfiguracion('ambientes'),
    getConfiguracion('tipos_incidencia'),
    getConfiguracion('equipos'),
    getConfiguracion('tiempos_aproximados')
  ]);

  return {
    sedes: (sedes as string[]) || ['Moche', 'Mansiche', 'Colón'],
    pabellones: (pabellones as Record<string, string[]>) || {
      'Moche': ['P. Principal', 'P. Santo Toribio', 'P. San Francisco', 'Explanada'],
      'Mansiche': ['P. Principal', 'P. Santo Toribio', 'P. San Francisco', 'Explanada'],
      'Colón': ['P. Principal', 'P. Santo Toribio', 'P. San Francisco', 'Explanada']
    },
    tipos_actividad: (tipos_actividad as string[]) || ['Incidencia', 'Mudanza', 'Visita técnica/campo', 'Soporte evento'],
    ambientes: (ambientes as Record<string, string[]>) || {
      'P. Principal': ['Sala de Reuniones', 'Administrativo'],
      'P. Santo Toribio': ['Aula/Laboratorio', 'Administrativo'],
      'P. San Francisco': ['Aula/Laboratorio', 'Administrativo'],
      'Explanada': ['Aula/Laboratorio', 'Administrativo']
    },
    tipos_incidencia: (tipos_incidencia as string[]) || ['Hardware', 'Software', 'Red / Conectividad', 'Acceso / Seguridad', 'Impresión / Escaneo', 'Infraestructura'],
    equipos: (equipos as Record<string, string[]>) || {
      'Hardware': ['Proyector', 'Monitor', 'PC', 'Laptop', 'Impresora', 'Mouse', 'Teclado', 'Cámara', 'Audífonos', 'Pizarra'],
      'Software': ['Office', 'Programa', 'Plataforma (ERP/Blackboard)', 'Licencia de cuenta'],
      'Red / Conectividad': ['Conectividad', 'Internet', 'Wifi', 'Antena Wifi'],
      'Acceso / Seguridad': ['Plataforma (ERP/Blackboard)', 'Licencia de cuenta'],
      'Impresión / Escaneo': ['Impresora', 'Supresor', 'Extensión'],
      'Infraestructura': ['Pizarra', 'Plumones', 'Extensión', 'Supresor']
    },
    tiempos_aproximados: (tiempos_aproximados as string[]) || ['5 minutos', '10 minutos', '15 minutos', '20 minutos', 'Mayor a 20 minutos']
  };
};

// ===== FUNCIONES PARA GESTIÓN DE USUARIOS ADMINISTRADORES =====

export const getUsuariosAdmin = async (): Promise<UsuarioAdmin[]> => {
  const { data, error } = await supabase
    .from('usuarios_admin')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createUsuarioAdmin = async (datos: {
  email: string;
  password: string;
  nombre_completo: string;
  rol?: string;
}): Promise<UsuarioAdmin> => {
  console.log('🔧 createUsuarioAdmin: Iniciando creación de usuario admin');
  console.log('🔧 createUsuarioAdmin: Datos recibidos:', datos);

  try {
    // Crear solo el registro en nuestra tabla personalizada
    // El usuario deberá registrarse manualmente en Supabase Auth o usar el método alternativo
    const { data, error } = await supabase
      .from('usuarios_admin')
      .insert({
        email: datos.email,
        password_hash: 'Pendiente de registro', // Indicar que necesita registro
        nombre_completo: datos.nombre_completo,
        rol: datos.rol || 'admin',
        activo: false // Inactivo hasta que se registre en Supabase Auth
      })
      .select()
      .single();

    if (error) {
      console.error('❌ createUsuarioAdmin: Error de Supabase:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }

    console.log('✅ createUsuarioAdmin: Usuario creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ createUsuarioAdmin: Error general:', error);
    throw error;
  }
};

// Función alternativa para crear administrador usando signup normal
export const createUsuarioAdminConSignup = async (datos: {
  email: string;
  password: string;
  nombre_completo: string;
  rol?: string;
}): Promise<UsuarioAdmin> => {
  // Crear el usuario usando signup normal (requiere email confirmation)
  const { error: authError } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      data: {
        nombre_completo: datos.nombre_completo,
        rol: datos.rol || 'admin'
      }
    }
  });

  if (authError) throw authError;

  // Crear el registro en nuestra tabla personalizada
  const { data, error } = await supabase
    .from('usuarios_admin')
    .insert({
      email: datos.email,
      password_hash: 'Registrado', // Usuario registrado en Supabase Auth
      nombre_completo: datos.nombre_completo,
      rol: datos.rol || 'admin',
      activo: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUsuarioAdmin = async (id: string, datos: Partial<{
  email: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
}>): Promise<UsuarioAdmin> => {
  const { data, error } = await supabase
    .from('usuarios_admin')
    .update({
      ...datos,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePasswordAdmin = async (email: string): Promise<void> => {
  // Método alternativo: actualizar solo en nuestra tabla personalizada
  // El usuario deberá cambiar su contraseña manualmente en Supabase Auth
  const { error } = await supabase
    .from('usuarios_admin')
    .update({
      password_hash: 'Contraseña actualizada',
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  if (error) throw error;

  // Nota: Para cambiar la contraseña real, el usuario debe:
  // 1. Ir a Supabase Dashboard > Authentication > Users
  // 2. Buscar su email y hacer clic en "Reset Password"
  // 3. O usar la función de "Forgot Password" en el login
};

export const desactivarUsuarioAdmin = async (id: string): Promise<UsuarioAdmin> => {
  const { data, error } = await supabase
    .from('usuarios_admin')
    .update({
      activo: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const activarUsuarioAdmin = async (id: string): Promise<UsuarioAdmin> => {
  const { data, error } = await supabase
    .from('usuarios_admin')
    .update({
      activo: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOpcionesFormulario = async (opciones: Partial<OpcionesFormulario>): Promise<void> => {
  const promises = Object.entries(opciones).map(([clave, valor]) =>
    setConfiguracion(clave, valor, `Configuración de ${clave} para el formulario`)
  );

  await Promise.all(promises);
};

// Funciones para estadísticas y reportes
export const getEstadisticasReporte = async (filtros?: FiltrosReporte): Promise<EstadisticasReporte> => {
  const incidencias = await getIncidencias(filtros);

  // Estadísticas básicas
  const total_incidencias = incidencias.length;

  // Incidencias por sede
  const incidencias_por_sede = incidencias.reduce((acc, incidencia) => {
    acc[incidencia.sede] = (acc[incidencia.sede] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tipos de actividad
  const tipos_actividad = incidencias.reduce((acc, incidencia) => {
    acc[incidencia.tipo_actividad] = (acc[incidencia.tipo_actividad] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tipos de incidencia (solo para actividades de tipo "Incidencia")
  const tipos_incidencia = incidencias
    .filter(i => i.tipo_actividad === 'Incidencia')
    .reduce((acc, incidencia) => {
      const tipo = incidencia.tipo_incidencia || 'Sin especificar';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Equipos más afectados
  const equipos_mas_afectados = incidencias
    .filter(i => i.equipo_afectado)
    .reduce((acc, incidencia) => {
      acc[incidencia.equipo_afectado!] = (acc[incidencia.equipo_afectado!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Tiempo promedio por actividad
  const tiempo_promedio: Record<string, number> = {};
  const tiempos_numericos: Record<string, number[]> = {};

  incidencias.forEach(incidencia => {
    const tiempo = incidencia.tiempo_aproximado;
    let minutos = 0;

    if (tiempo.includes('5 minutos')) minutos = 5;
    else if (tiempo.includes('10 minutos')) minutos = 10;
    else if (tiempo.includes('15 minutos')) minutos = 15;
    else if (tiempo.includes('20 minutos')) minutos = 20;
    else if (tiempo.includes('Mayor a 20 minutos')) minutos = 30; // Estimación

    if (!tiempos_numericos[incidencia.tipo_actividad]) {
      tiempos_numericos[incidencia.tipo_actividad] = [];
    }
    tiempos_numericos[incidencia.tipo_actividad].push(minutos);
  });

  Object.entries(tiempos_numericos).forEach(([actividad, tiempos]) => {
    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    tiempo_promedio[actividad] = Math.round(promedio * 10) / 10;
  });

  // Incidencias por usuario
  const incidencias_por_usuario = incidencias.reduce((acc, incidencia) => {
    const nombre = incidencia.usuario_nombre || incidencia.usuario_email || 'Usuario desconocido';
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Incidencias por pabellón
  const incidencias_por_pabellon = incidencias.reduce((acc, incidencia) => {
    acc[incidencia.pabellon] = (acc[incidencia.pabellon] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Lugares más concurridos (ambientes)
  const lugares_mas_concurridos = incidencias
    .filter(i => i.ambiente_incidencia)
    .reduce((acc, incidencia) => {
      acc[incidencia.ambiente_incidencia!] = (acc[incidencia.ambiente_incidencia!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Tendencia temporal (últimos 30 días)
  const tendencia_temporal = [];
  const hoy = new Date();

  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const fechaStr = fecha.toISOString().split('T')[0];

    const cantidad = incidencias.filter(incidencia =>
      incidencia.fecha_hora.startsWith(fechaStr)
    ).length;

    tendencia_temporal.push({
      fecha: fechaStr,
      cantidad
    });
  }

  return {
    total_incidencias,
    incidencias_por_sede,
    tipos_actividad,
    tipos_incidencia,
    equipos_mas_afectados,
    tiempo_promedio,
    tendencia_temporal,
    incidencias_por_usuario,
    incidencias_por_pabellon,
    lugares_mas_concurridos
  };
};

// Función para obtener estadísticas con filtros temporales específicos
export const getEstadisticasConFiltroTemporal = async (
  periodo: 'mes' | 'trimestre' | 'año',
  filtrosEspecificos?: {
    año?: number | 'todos';
    trimestre?: number | 'todos';
    mes?: number | 'todos';
  }
): Promise<EstadisticasReporte> => {
  const hoy = new Date();
  let fechaDesde: Date;
  let fechaHasta: Date;

  // Si no hay filtros específicos, usar el comportamiento anterior
  if (!filtrosEspecificos) {
    switch (periodo) {
      case 'mes':
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaHasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      case 'trimestre':
        const trimestreActual = Math.floor(hoy.getMonth() / 3);
        fechaDesde = new Date(hoy.getFullYear(), trimestreActual * 3, 1);
        fechaHasta = new Date(hoy.getFullYear(), (trimestreActual + 1) * 3, 0);
        break;
      case 'año':
        fechaDesde = new Date(hoy.getFullYear(), 0, 1);
        fechaHasta = new Date(hoy.getFullYear(), 11, 31);
        break;
      default:
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaHasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    }
  } else {
    // Usar filtros específicos
    const año = filtrosEspecificos.año === 'todos' ? hoy.getFullYear() : filtrosEspecificos.año || hoy.getFullYear();
    const trimestre = filtrosEspecificos.trimestre === 'todos' ? null : filtrosEspecificos.trimestre;
    const mes = filtrosEspecificos.mes === 'todos' ? null : filtrosEspecificos.mes;

    if (mes !== null && mes !== undefined) {
      // Filtro por mes específico
      fechaDesde = new Date(año, mes - 1, 1);
      fechaHasta = new Date(año, mes, 0);
    } else if (trimestre !== null && trimestre !== undefined) {
      // Filtro por trimestre específico
      const mesInicio = (trimestre - 1) * 3;
      const mesFin = trimestre * 3 - 1;
      fechaDesde = new Date(año, mesInicio, 1);
      fechaHasta = new Date(año, mesFin + 1, 0);
    } else {
      // Filtro por año específico
      fechaDesde = new Date(año, 0, 1);
      fechaHasta = new Date(año, 11, 31);
    }
  }

  const filtros: FiltrosReporte = {
    fecha_desde: fechaDesde.toISOString().split('T')[0],
    fecha_hasta: fechaHasta.toISOString().split('T')[0]
  };

  console.log('🔍 getEstadisticasConFiltroTemporal:', {
    periodo,
    filtrosEspecificos,
    fechaDesde: filtros.fecha_desde,
    fechaHasta: filtros.fecha_hasta
  });

  return await getEstadisticasReporte(filtros);
};
