import * as XLSX from 'xlsx';

export const exportarIncidenciasExcel = (incidencias: unknown[]): void => {
  const wb = XLSX.utils.book_new();
  
  // Preparar datos para exportación
  const datosExportacion = incidencias.map((incidencia: unknown) => {
    const item = incidencia as Record<string, unknown>;
    return {
      'ID': item.id || '',
      'Usuario': item.usuario_nombre || '',
      'Email': item.usuario_email || '',
      'Sede': item.sede || '',
      'Pabellón': item.pabellon || 'N/A',
      'Tipo de Actividad': item.tipo_actividad || '',
      'Ambiente': item.ambiente_incidencia || 'N/A',
      'Tipo de Incidencia': item.tipo_incidencia || 'N/A',
      'Equipo Afectado': item.equipo_afectado || 'N/A',
      'Tiempo Aproximado': item.tiempo_aproximado || '',
      'Estado': item.estado || '',
      'Prioridad': item.prioridad || '',
      'Fecha y Hora': item.fecha_hora ? new Date(item.fecha_hora as string).toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
      'Fecha de Creación': item.created_at ? new Date(item.created_at as string).toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(datosExportacion);
  
  // Configurar ancho de columnas
  ws['!cols'] = [
    { wch: 15 }, // ID
    { wch: 25 }, // Usuario
    { wch: 30 }, // Email
    { wch: 15 }, // Sede
    { wch: 20 }, // Pabellón
    { wch: 20 }, // Tipo de Actividad
    { wch: 20 }, // Ambiente
    { wch: 20 }, // Tipo de Incidencia
    { wch: 20 }, // Equipo Afectado
    { wch: 18 }, // Tiempo Aproximado
    { wch: 12 }, // Estado
    { wch: 12 }, // Prioridad
    { wch: 20 }, // Fecha y Hora
    { wch: 20 }  // Fecha de Creación
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Incidencias');
  
  // Generar nombre de archivo con fecha actual
  const fechaActual = new Date().toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  
  const nombreArchivo = `incidencias_${fechaActual}.xlsx`;
  
  XLSX.writeFile(wb, nombreArchivo);
};

export const exportarEstadisticasExcel = (estadisticas: Record<string, unknown>): void => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen General
  const resumenGeneral = [
    { 'Métrica': 'Total de Incidencias', 'Valor': estadisticas.total_incidencias || 0 },
    { 'Métrica': 'Fecha de Generación', 'Valor': new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) }
  ];
  
  const wsResumen = XLSX.utils.json_to_sheet(resumenGeneral);
  wsResumen['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');
  
  // Hoja 2: Incidencias por Sede
  if (estadisticas.incidencias_por_sede) {
    const datosSedes = Object.entries(estadisticas.incidencias_por_sede as Record<string, number>).map(([sede, cantidad]) => ({
      'Sede': sede,
      'Cantidad de Incidencias': cantidad
    }));
    
    const wsSedes = XLSX.utils.json_to_sheet(datosSedes);
    wsSedes['!cols'] = [{ wch: 20 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsSedes, 'Incidencias por Sede');
  }
  
  // Hoja 3: Tipos de Actividad
  if (estadisticas.tipos_actividad) {
    const datosTipos = Object.entries(estadisticas.tipos_actividad as Record<string, number>).map(([tipo, cantidad]) => ({
      'Tipo de Actividad': tipo,
      'Cantidad': cantidad
    }));
    
    const wsTipos = XLSX.utils.json_to_sheet(datosTipos);
    wsTipos['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsTipos, 'Tipos de Actividad');
  }
  
  // Hoja 4: Estados
  if (estadisticas.estados) {
    const datosEstados = Object.entries(estadisticas.estados as Record<string, number>).map(([estado, cantidad]) => ({
      'Estado': estado,
      'Cantidad': cantidad
    }));
    
    const wsEstados = XLSX.utils.json_to_sheet(datosEstados);
    wsEstados['!cols'] = [{ wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsEstados, 'Estados');
  }
  
  // Hoja 5: Incidencias por Fecha
  if (estadisticas.incidencias_por_fecha) {
    const datosFechas = Object.entries(estadisticas.incidencias_por_fecha as Record<string, number>).map(([fecha, cantidad]) => ({
      'Fecha': fecha,
      'Cantidad': cantidad
    }));
    
    const wsFechas = XLSX.utils.json_to_sheet(datosFechas);
    wsFechas['!cols'] = [{ wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsFechas, 'Incidencias por Fecha');
  }
  
  // Generar nombre de archivo con fecha actual
  const fechaActual = new Date().toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  
  const nombreArchivo = `estadisticas_${fechaActual}.xlsx`;
  
  XLSX.writeFile(wb, nombreArchivo);
};