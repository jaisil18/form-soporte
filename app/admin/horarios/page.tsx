'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Clock, AlertCircle } from 'lucide-react';
import { getHorarioConfiguracion, setHorarioConfiguracion } from '@/lib/supabase';
import { validarHorarioEstatico } from '@/lib/validarHorario';
import type { HorarioConfiguracion } from '@/types';

export default function HorariosPage() {
  const router = useRouter();
  const [horario, setHorario] = useState<HorarioConfiguracion>({
    habilitado: true,
    hora_inicio: 7,
    minuto_inicio: 0,
    hora_fin: 22,
    minuto_fin: 0
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [validacionActual, setValidacionActual] = useState<{ esValido: boolean; mensaje: string } | null>(null);

  useEffect(() => {
    cargarHorario();
  }, []);

  useEffect(() => {
    // Validar horario actual cada vez que cambie la configuración
    const validacion = validarHorarioEstatico(horario);
    setValidacionActual(validacion);
  }, [horario]);

  const cargarHorario = async () => {
    try {
      const horarioData = await getHorarioConfiguracion();
      setHorario(horarioData);
    } catch (error) {
      console.error('Error al cargar horario:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      await setHorarioConfiguracion(horario);
      alert('Horario actualizado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al actualizar el horario');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambioHorario = (campo: keyof HorarioConfiguracion, valor: number) => {
    setHorario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const generarOpcionesHoras = () => {
    return Array.from({ length: 24 }, (_, i) => (
      <option key={i} value={i}>
        {i.toString().padStart(2, '0')}
      </option>
    ));
  };

  const generarOpcionesMinutos = () => {
    return Array.from({ length: 60 }, (_, i) => (
      <option key={i} value={i}>
        {i.toString().padStart(2, '0')}
      </option>
    ));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver al Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Horarios</h1>
                <p className="text-sm text-gray-600">Configurar horarios de disponibilidad del formulario</p>
              </div>
            </div>

            <button
              onClick={handleGuardar}
              disabled={guardando}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                guardando
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {guardando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Configuración de horario */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Configuración de Horario</h2>
              <p className="text-sm text-gray-600 mt-1">
                Establezca el horario durante el cual el formulario estará disponible para los usuarios.
                El horario se aplica en zona horaria de Perú (America/Lima).
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Horario de inicio */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Horario de Inicio</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                      </label>
                      <select
                        value={horario.hora_inicio}
                        onChange={(e) => handleCambioHorario('hora_inicio', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generarOpcionesHoras()}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minutos
                      </label>
                      <select
                        value={horario.minuto_inicio}
                        onChange={(e) => handleCambioHorario('minuto_inicio', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generarOpcionesMinutos()}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Horario de fin */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Horario de Fin</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                      </label>
                      <select
                        value={horario.hora_fin}
                        onChange={(e) => handleCambioHorario('hora_fin', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generarOpcionesHoras()}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minutos
                      </label>
                      <select
                        value={horario.minuto_fin}
                        onChange={(e) => handleCambioHorario('minuto_fin', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generarOpcionesMinutos()}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista previa del horario */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Vista Previa del Horario</h4>
                </div>
                <p className="text-blue-800">
                  El formulario estará disponible de{' '}
                  <span className="font-semibold">
                    {horario.hora_inicio.toString().padStart(2, '0')}:
                    {horario.minuto_inicio.toString().padStart(2, '0')}
                  </span>{' '}
                  hasta{' '}
                  <span className="font-semibold">
                    {horario.hora_fin.toString().padStart(2, '0')}:
                    {horario.minuto_fin.toString().padStart(2, '0')}
                  </span>{' '}
                  (hora de Perú)
                </p>
              </div>
            </div>
          </div>

          {/* Estado actual */}
          {validacionActual && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Estado Actual</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Verificación del estado del formulario con la configuración actual
                </p>
              </div>

              <div className="p-6">
                <div className={`p-4 rounded-lg ${
                  validacionActual.esValido 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validacionActual.esValido ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      validacionActual.esValido ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validacionActual.esValido ? 'Formulario Disponible' : 'Formulario No Disponible'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    validacionActual.esValido ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {validacionActual.mensaje}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Información Importante</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Zona Horaria</h4>
                    <p className="text-sm text-gray-600">
                      Todos los horarios se aplican en zona horaria de Perú (America/Lima, UTC-5).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Formato de Hora</h4>
                    <p className="text-sm text-gray-600">
                      Utilice formato de 24 horas (00:00 a 23:59). Por ejemplo: 07:00 para las 7:00 AM.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Validación en Tiempo Real</h4>
                    <p className="text-sm text-gray-600">
                      El sistema valida automáticamente el horario cada vez que un usuario intenta acceder al formulario.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Horario Recomendado</h4>
                    <p className="text-sm text-gray-600">
                      Se recomienda mantener el formulario disponible durante las horas laborales (7:00 AM - 10:00 PM).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
