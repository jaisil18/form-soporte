'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { getOpcionesFormulario } from '@/lib/supabase';
import type { UsuarioSoporte, FormularioData, OpcionesFormulario } from '@/types';

interface Paso2DetallesIncidenciaProps {
  usuario: UsuarioSoporte | null;
  datosFormulario: Partial<FormularioData>;
  onActualizarDatos: (datos: Partial<FormularioData>) => void;
  onAnterior: () => void;
  onEnviar: () => void;
  cargando: boolean;
}

export default function Paso2DetallesIncidencia({
  usuario,
  datosFormulario,
  onActualizarDatos,
  onAnterior,
  onEnviar,
  cargando
}: Paso2DetallesIncidenciaProps) {
  const [opciones, setOpciones] = useState<OpcionesFormulario | null>(null);
  const [dropdownsAbiertos, setDropdownsAbiertos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const opcionesData = await getOpcionesFormulario();
        setOpciones(opcionesData);
      } catch (error) {
        console.error('Error al cargar opciones:', error);
      }
    };

    cargarOpciones();
  }, []);

  const toggleDropdown = (campo: string) => {
    setDropdownsAbiertos(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handleSeleccionar = (campo: string, valor: string) => {
    console.log(`📝 Seleccionando ${campo}:`, valor);
    
    const nuevosDatos: Partial<FormularioData> = { [campo]: valor };
    
    // Si se cambia la sede, limpiar pabellón y campos dependientes
    if (campo === 'sede') {
      console.log('🔄 Cambio de sede detectado, limpiando campos dependientes');
      nuevosDatos.pabellon = undefined;
      nuevosDatos.ambiente_incidencia = undefined;
      nuevosDatos.tipo_incidencia = undefined;
      nuevosDatos.equipo_afectado = undefined;
    }
    
    // Si se cambia el pabellón, limpiar ambiente
    if (campo === 'pabellon') {
      console.log('🔄 Cambio de pabellón detectado, limpiando ambiente');
      nuevosDatos.ambiente_incidencia = undefined;
    }
    
    // Si se cambia el tipo de actividad, limpiar campos de incidencia
    if (campo === 'tipo_actividad') {
      console.log('🔄 Cambio de tipo de actividad detectado:', valor);
      if (valor !== 'Incidencia') {
        console.log('⚠️ No es "Incidencia", limpiando campos específicos de incidencia');
        nuevosDatos.ambiente_incidencia = undefined;
        nuevosDatos.tipo_incidencia = undefined;
        nuevosDatos.equipo_afectado = undefined;
      } else {
        console.log('✅ Es "Incidencia", manteniendo campos específicos');
      }
    }
    
    // Si se cambia el tipo de incidencia, limpiar equipo
    if (campo === 'tipo_incidencia') {
      console.log('🔄 Cambio de tipo de incidencia detectado, limpiando equipo');
      nuevosDatos.equipo_afectado = undefined;
    }
    
    console.log('📤 Datos actualizados:', nuevosDatos);
    onActualizarDatos(nuevosDatos);
    setDropdownsAbiertos(prev => ({ ...prev, [campo]: false }));
  };

  const esIncidencia = datosFormulario.tipo_actividad === 'Incidencia';
  const esActividadEspecial = ['Mudanza', 'Visita técnica/campo', 'Soporte evento'].includes(datosFormulario.tipo_actividad || '');

  // Solo mostrar campos de incidencia si se ha seleccionado "Incidencia" como tipo de actividad
  const mostrarCamposIncidencia = esIncidencia;
  
  // Determinar si la sede seleccionada tiene pabellones
  const sedeTienePabellones = opciones && datosFormulario.sede && 
    opciones.pabellones[datosFormulario.sede] && 
    opciones.pabellones[datosFormulario.sede].length > 0;

  // Debug solo cuando los datos cambien significativamente
  useEffect(() => {
    if (opciones) { // Solo debug cuando las opciones estén cargadas
      debugValidacion();
    }
  }, [datosFormulario.sede, datosFormulario.tipo_actividad, datosFormulario.tiempo_aproximado, sedeTienePabellones, mostrarCamposIncidencia]);

  const validarFormulario = () => {
    const camposObligatorios = ['sede', 'tipo_actividad', 'tiempo_aproximado'];
    
    // Solo requerir pabellón si la sede tiene pabellones
    if (sedeTienePabellones) {
      camposObligatorios.push('pabellon');
    }
    
    if (mostrarCamposIncidencia) {
      camposObligatorios.push('ambiente_incidencia', 'tipo_incidencia', 'equipo_afectado');
    }

    return camposObligatorios.every(campo => datosFormulario[campo as keyof FormularioData]);
  };

  // Función separada para logging de debug (solo cuando sea necesario)
  const debugValidacion = () => {
    const camposObligatorios = ['sede', 'tipo_actividad', 'tiempo_aproximado'];
    
    if (sedeTienePabellones) {
      camposObligatorios.push('pabellon');
    }
    
    if (mostrarCamposIncidencia) {
      camposObligatorios.push('ambiente_incidencia', 'tipo_incidencia', 'equipo_afectado');
    }

    console.log('🔍 VALIDACIÓN DEL FORMULARIO');
    console.log('👤 Usuario:', usuario?.nombre_completo);
    console.log('📋 Datos actuales:', datosFormulario);
    console.log('✅ Sede tiene pabellones:', sedeTienePabellones);
    console.log('🔧 Mostrar campos de incidencia:', mostrarCamposIncidencia);
    console.log('📝 Campos obligatorios:', camposObligatorios);
    
    const camposFaltantes = camposObligatorios.filter(campo => !datosFormulario[campo as keyof FormularioData]);
    if (camposFaltantes.length > 0) {
      console.log('❌ Campos faltantes:', camposFaltantes);
      console.log('📊 Estado por campo:');
      camposObligatorios.forEach(campo => {
        const valor = datosFormulario[campo as keyof FormularioData];
        console.log(`   ${campo}: ${valor ? '✅ Lleno' : '❌ Vacío'} (${valor || 'sin valor'})`);
      });
    } else {
      console.log('✅ Todos los campos obligatorios están llenos');
    }
  };

  const obtenerOpcionesEquipo = () => {
    if (!opciones || !datosFormulario.tipo_incidencia) return [];
    return opciones.equipos[datosFormulario.tipo_incidencia] || [];
  };

  const obtenerOpcionesAmbiente = () => {
    console.log('🔍 DEBUG obtenerOpcionesAmbiente:');
    console.log('   - opciones:', opciones);
    console.log('   - sedeTienePabellones:', sedeTienePabellones);
    console.log('   - pabellon seleccionado:', datosFormulario.pabellon);
    
    if (!opciones) {
      console.log('   ❌ No hay opciones cargadas');
      return [];
    }
    
    // Si la sede tiene pabellones, usar el pabellón seleccionado
    if (sedeTienePabellones && datosFormulario.pabellon) {
      console.log('   🔍 Buscando ambientes para pabellón:', datosFormulario.pabellon);
      console.log('   🔍 opciones.ambientes:', opciones.ambientes);
      console.log('   🔍 opciones.ambientes[pabellon]:', opciones.ambientes[datosFormulario.pabellon]);
      
      let ambientes = opciones.ambientes[datosFormulario.pabellon];
      
      // Si no hay ambientes específicos para este pabellón, usar ambientes por defecto
      if (!ambientes || ambientes.length === 0) {
        console.log('   ⚠️ No hay ambientes específicos para este pabellón, usando ambientes por defecto');
        // Obtener todos los ambientes únicos disponibles en el sistema
        const todosLosAmbientes = Object.values(opciones.ambientes).flat();
        ambientes = [...new Set(todosLosAmbientes)]; // Eliminar duplicados
        console.log('   🔄 Ambientes por defecto encontrados:', ambientes);
      }
      
      console.log('   ✅ Ambientes finales:', ambientes);
      return ambientes || [];
    }
    
    // Si la sede no tiene pabellones, mostrar todos los ambientes disponibles
    if (!sedeTienePabellones) {
      console.log('   🔍 Sede sin pabellones, obteniendo todos los ambientes');
      const todosLosAmbientes = Object.values(opciones.ambientes).flat();
      const ambientesUnicos = [...new Set(todosLosAmbientes)]; // Eliminar duplicados
      console.log('   ✅ Todos los ambientes:', ambientesUnicos);
      return ambientesUnicos;
    }
    
    console.log('   ❌ No se encontraron ambientes');
    return [];
  };

  if (!opciones) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando opciones del formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Detalles de la Incidencia
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Hola, {usuario?.nombre_completo}.</strong> Complete los siguientes campos para registrar la incidencia.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Sede */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            1. Sede <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('sede')}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors select-dropdown"
            >
              <div className="flex items-center justify-between">
                <span className={`select-text ${datosFormulario.sede ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                  {datosFormulario.sede || 'Seleccione una sede'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                  dropdownsAbiertos.sede ? 'rotate-180' : ''
                }`} />
              </div>
            </button>

            {dropdownsAbiertos.sede && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                {opciones.sedes.map((sede) => (
                  <button
                    key={sede}
                    type="button"
                    onClick={() => handleSeleccionar('sede', sede)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                  >
                    {sede}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Pabellón (solo si la sede tiene pabellones) */}
        {sedeTienePabellones && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              2. Pabellón <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('pabellon')}
                disabled={!datosFormulario.sede}
                className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed select-dropdown"
              >
                <div className="flex items-center justify-between">
                  <span className={`select-text ${datosFormulario.pabellon ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                    {datosFormulario.pabellon || 'Seleccione un pabellón'}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                    dropdownsAbiertos.pabellon ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {dropdownsAbiertos.pabellon && datosFormulario.sede && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                  {(opciones.pabellones[datosFormulario.sede] || []).map((pabellon) => (
                    <button
                      key={pabellon}
                      type="button"
                      onClick={() => handleSeleccionar('pabellon', pabellon)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                    >
                      {pabellon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tipo de Actividad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {sedeTienePabellones ? '3. Tipo de Actividad' : '2. Tipo de Actividad'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('tipo_actividad')}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors select-dropdown"
            >
              <div className="flex items-center justify-between">
                <span className={`select-text ${datosFormulario.tipo_actividad ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                  {datosFormulario.tipo_actividad || 'Seleccione el tipo de actividad'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                  dropdownsAbiertos.tipo_actividad ? 'rotate-180' : ''
                }`} />
              </div>
            </button>

            {dropdownsAbiertos.tipo_actividad && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                {opciones.tipos_actividad.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleSeleccionar('tipo_actividad', tipo)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mensaje especial para actividades que saltan campos */}
          {esActividadEspecial && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ⚠️ Al seleccionar &quot;{datosFormulario.tipo_actividad}&quot;, el formulario saltará directamente al tiempo aproximado.
              </p>
            </div>
          )}
        </div>

        {/* Ambiente (solo si es Incidencia) */}
        {mostrarCamposIncidencia && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {sedeTienePabellones ? '4. Ambiente de la Incidencia' : '3. Ambiente de la Incidencia'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('ambiente_incidencia')}
                disabled={!!(sedeTienePabellones && !datosFormulario.pabellon)}
                className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed select-dropdown"
              >
                <div className="flex items-center justify-between">
                  <span className={`select-text ${datosFormulario.ambiente_incidencia ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                    {datosFormulario.ambiente_incidencia || 'Seleccione el ambiente'}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                    dropdownsAbiertos.ambiente_incidencia ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {dropdownsAbiertos.ambiente_incidencia && (sedeTienePabellones ? datosFormulario.pabellon : true) && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                  {obtenerOpcionesAmbiente().map((ambiente) => (
                    <button
                      key={ambiente}
                      type="button"
                      onClick={() => handleSeleccionar('ambiente_incidencia', ambiente)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                    >
                      {ambiente}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Tipo de Incidencia (solo si es Incidencia) */}
        {mostrarCamposIncidencia && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {sedeTienePabellones ? '5. Tipo de Incidencia' : '4. Tipo de Incidencia'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('tipo_incidencia')}
                className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors select-dropdown"
              >
                <div className="flex items-center justify-between">
                  <span className={`select-text ${datosFormulario.tipo_incidencia ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                    {datosFormulario.tipo_incidencia || 'Seleccione el tipo de incidencia'}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                    dropdownsAbiertos.tipo_incidencia ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {dropdownsAbiertos.tipo_incidencia && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                  {opciones.tipos_incidencia.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => handleSeleccionar('tipo_incidencia', tipo)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Equipo o Recurso Tecnológico (solo si es Incidencia) */}
        {mostrarCamposIncidencia && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {sedeTienePabellones ? '6. Equipo o Recurso Tecnológico' : '5. Equipo o Recurso Tecnológico'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('equipo_afectado')}
                disabled={!datosFormulario.tipo_incidencia}
                className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed select-dropdown"
              >
                <div className="flex items-center justify-between">
                  <span className={`select-text ${datosFormulario.equipo_afectado ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                    {datosFormulario.equipo_afectado || 'Seleccione el equipo afectado'}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                    dropdownsAbiertos.equipo_afectado ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {dropdownsAbiertos.equipo_afectado && datosFormulario.tipo_incidencia && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                  {obtenerOpcionesEquipo().map((equipo) => (
                    <button
                      key={equipo}
                      type="button"
                      onClick={() => handleSeleccionar('equipo_afectado', equipo)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                    >
                      {equipo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tiempo Aproximado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mostrarCamposIncidencia ? (sedeTienePabellones ? '7' : '6') : (sedeTienePabellones ? '4' : '3')}. Tiempo Aproximado de la Actividad <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('tiempo_aproximado')}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors select-dropdown"
            >
              <div className="flex items-center justify-between">
                <span className={`select-text ${datosFormulario.tiempo_aproximado ? 'text-gray-900 dark:text-white' : 'placeholder text-gray-500 dark:text-gray-400'}`}>
                  {datosFormulario.tiempo_aproximado || 'Seleccione el tiempo aproximado'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-400 transition-transform select-chevron ${
                  dropdownsAbiertos.tiempo_aproximado ? 'rotate-180' : ''
                }`} />
              </div>
            </button>

            {dropdownsAbiertos.tiempo_aproximado && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto select-dropdown-options">
                {opciones.tiempos_aproximados.map((tiempo) => (
                  <button
                    key={tiempo}
                    type="button"
                    onClick={() => handleSeleccionar('tiempo_aproximado', tiempo)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors select-dropdown-option text-gray-900 dark:text-white"
                  >
                    {tiempo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onAnterior}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Anterior</span>
        </button>

        <button
          onClick={onEnviar}
          disabled={!validarFormulario() || cargando}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            validarFormulario() && !cargando
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <span>Enviar Formulario</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
