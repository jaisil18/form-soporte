import { toZonedTime } from 'date-fns-tz';
import { getHorarioConfiguracion } from './supabase';
import type { HorarioConfiguracion } from '@/types';

const ZONA_HORARIA_PERU = 'America/Lima';

export interface ResultadoValidacionHorario {
  esValido: boolean;
  mensaje: string;
  horaActual: string;
  horarioPermitido: string;
}

export const validarHorario = async (): Promise<ResultadoValidacionHorario> => {
  try {
    // Obtener configuración de horario desde Supabase
    const configHorario = await getHorarioConfiguracion();
    
    // Obtener hora actual en zona horaria de Perú
    const ahora = new Date();
    const horaPeru = toZonedTime(ahora, ZONA_HORARIA_PERU);
    
    const horaActual = horaPeru.getHours();
    const minutoActual = horaPeru.getMinutes();
    
    // Calcular minutos totales para facilitar comparación
    const minutosActuales = horaActual * 60 + minutoActual;
    const minutosInicio = configHorario.hora_inicio * 60 + configHorario.minuto_inicio;
    const minutosFin = configHorario.hora_fin * 60 + configHorario.minuto_fin;
    
    // Validar si está dentro del horario permitido
    const esValido = minutosActuales >= minutosInicio && minutosActuales <= minutosFin;
    
    // Formatear hora actual para mostrar
    const horaActualStr = horaPeru.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: ZONA_HORARIA_PERU
    });
    
    // Formatear horario permitido para mostrar
    const horarioPermitidoStr = `${configHorario.hora_inicio.toString().padStart(2, '0')}:${configHorario.minuto_inicio.toString().padStart(2, '0')} - ${configHorario.hora_fin.toString().padStart(2, '0')}:${configHorario.minuto_fin.toString().padStart(2, '0')}`;
    
    let mensaje = '';
    if (esValido) {
      mensaje = `El formulario está disponible. Hora actual: ${horaActualStr} (Perú)`;
    } else {
      mensaje = `El formulario solo está disponible de ${horarioPermitidoStr} (hora Perú). Hora actual: ${horaActualStr}`;
    }
    
    return {
      esValido,
      mensaje,
      horaActual: horaActualStr,
      horarioPermitido: horarioPermitidoStr
    };
  } catch (error) {
    console.error('Error al validar horario:', error);
    
    // En caso de error, usar horario por defecto
    const ahora = new Date();
    const horaPeru = toZonedTime(ahora, ZONA_HORARIA_PERU);
    const horaActual = horaPeru.getHours();
    // const minutoActual = horaPeru.getMinutes(); // No se usa actualmente
    
    const horaActualStr = horaPeru.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: ZONA_HORARIA_PERU
    });
    
    // Horario por defecto: 7:00 AM - 10:00 PM
    const esValido = horaActual >= 7 && horaActual <= 22;
    const mensaje = esValido 
      ? `El formulario está disponible. Hora actual: ${horaActualStr} (Perú)`
      : `El formulario solo está disponible de 07:00 - 22:00 (hora Perú). Hora actual: ${horaActualStr}`;
    
    return {
      esValido,
      mensaje,
      horaActual: horaActualStr,
      horarioPermitido: '07:00 - 22:00'
    };
  }
};

export const validarHorarioEstatico = (configHorario: HorarioConfiguracion): ResultadoValidacionHorario => {
  // Obtener hora actual en zona horaria de Perú
  const ahora = new Date();
  const horaPeru = toZonedTime(ahora, ZONA_HORARIA_PERU);
  
  const horaActual = horaPeru.getHours();
  const minutoActual = horaPeru.getMinutes();
  
  // Calcular minutos totales para facilitar comparación
  const minutosActuales = horaActual * 60 + minutoActual;
  const minutosInicio = configHorario.hora_inicio * 60 + configHorario.minuto_inicio;
  const minutosFin = configHorario.hora_fin * 60 + configHorario.minuto_fin;
  
  // Validar si está dentro del horario permitido
  const esValido = minutosActuales >= minutosInicio && minutosActuales <= minutosFin;
  
  // Formatear hora actual para mostrar
  const horaActualStr = horaPeru.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: ZONA_HORARIA_PERU
  });
  
  // Formatear horario permitido para mostrar
  const horarioPermitidoStr = `${configHorario.hora_inicio.toString().padStart(2, '0')}:${configHorario.minuto_inicio.toString().padStart(2, '0')} - ${configHorario.hora_fin.toString().padStart(2, '0')}:${configHorario.minuto_fin.toString().padStart(2, '0')}`;
  
  let mensaje = '';
  if (esValido) {
    mensaje = `El formulario está disponible. Hora actual: ${horaActualStr} (Perú)`;
  } else {
    mensaje = `El formulario solo está disponible de ${horarioPermitidoStr} (hora Perú). Hora actual: ${horaActualStr}`;
  }
  
  return {
    esValido,
    mensaje,
    horaActual: horaActualStr,
    horarioPermitido: horarioPermitidoStr
  };
};
