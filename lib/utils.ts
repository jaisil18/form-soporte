import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearFecha(fecha: string | Date): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return fechaObj.toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatearFechaHora(fecha: string | Date): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return fechaObj.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function capitalizarPrimeraLetra(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function generarIdUnico(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function truncarTexto(texto: string, longitud: number): string {
  if (texto.length <= longitud) return texto;
  return texto.substring(0, longitud) + '...';
}

export function obtenerColorPorTipoActividad(tipo: string): string {
  const colores: Record<string, string> = {
    'Incidencia': 'bg-red-100 text-red-800',
    'Mudanza': 'bg-blue-100 text-blue-800',
    'Visita técnica/campo': 'bg-green-100 text-green-800',
    'Soporte evento': 'bg-purple-100 text-purple-800'
  };
  
  return colores[tipo] || 'bg-gray-100 text-gray-800';
}

export function obtenerColorPorSede(sede: string): string {
  const colores: Record<string, string> = {
    'Moche': 'bg-yellow-100 text-yellow-800',
    'Mansiche': 'bg-blue-100 text-blue-800',
    'Colón': 'bg-green-100 text-green-800'
  };
  
  return colores[sede] || 'bg-gray-100 text-gray-800';
}

export function calcularTiempoTranscurrido(fecha: string | Date): string {
  const ahora = new Date();
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const diferencia = ahora.getTime() - fechaObj.getTime();
  
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  
  if (dias > 0) {
    return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  } else if (horas > 0) {
    return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  } else if (minutos > 0) {
    return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  } else {
    return 'ahora mismo';
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function ordenarPorPrioridad<T extends { tipo_actividad: string; created_at: string }>(items: T[]): T[] {
  const prioridades: Record<string, number> = {
    'Incidencia': 1,
    'Mudanza': 2,
    'Visita técnica/campo': 3,
    'Soporte evento': 4
  };
  
  return items.sort((a, b) => {
    const prioridadA = prioridades[a.tipo_actividad] || 999;
    const prioridadB = prioridades[b.tipo_actividad] || 999;
    
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB;
    }
    
    // Si tienen la misma prioridad, ordenar por fecha (más reciente primero)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

export function exportarComoCSV(datos: unknown[], nombreArchivo: string): void {
  if (datos.length === 0) return;
  
  const headers = Object.keys(datos[0] as Record<string, unknown>);
  const csvContent = [
    headers.join(','),
    ...datos.map(row => 
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header];
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value || '');
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
