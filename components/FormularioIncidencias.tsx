'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Paso1SeleccionUsuario from './Paso1_SeleccionUsuario';
import Paso2DetallesIncidencia from './Paso2_DetallesIncidencia';
import { getUsuariosSoporte } from '@/lib/supabase';
import { createIncidencia } from '@/lib/supabase';
import type { UsuarioSoporte, FormularioData } from '@/types';

interface FormularioIncidenciasProps {
  onVolver: () => void;
}

export default function FormularioIncidencias({ onVolver }: FormularioIncidenciasProps) {
  const [pasoActual, setPasoActual] = useState(1);
  const [usuarios, setUsuarios] = useState<UsuarioSoporte[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioSoporte | null>(null);
  const [datosFormulario, setDatosFormulario] = useState<Partial<FormularioData>>({});
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const usuariosData = await getUsuariosSoporte();
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };

    cargarUsuarios();
  }, []);

  const handleSiguientePaso = () => {
    setPasoActual(2);
  };

  const handlePasoAnterior = () => {
    setPasoActual(1);
  };

  const handleSeleccionarUsuario = (usuario: UsuarioSoporte) => {
    setUsuarioSeleccionado(usuario);
  };

  const handleActualizarDatos = (datos: Partial<FormularioData>) => {
    setDatosFormulario(prev => ({ ...prev, ...datos }));
  };

  const handleEnviarFormulario = async () => {
    console.log('🚀 INTENTANDO ENVIAR FORMULARIO');
    console.log('👤 Usuario seleccionado:', usuarioSeleccionado);
    console.log('📋 Datos del formulario:', datosFormulario);

    // Validación simplificada - solo los campos básicos
    // La validación completa se hace en Paso2_DetallesIncidencia
    if (!usuarioSeleccionado || !datosFormulario.sede || !datosFormulario.tipo_actividad || !datosFormulario.tiempo_aproximado) {
      console.log('❌ Validación fallida - campos básicos faltantes:');
      console.log('   Usuario:', !!usuarioSeleccionado);
      console.log('   Sede:', !!datosFormulario.sede);
      console.log('   Tipo de Actividad:', !!datosFormulario.tipo_actividad);
      console.log('   Tiempo Aproximado:', !!datosFormulario.tiempo_aproximado);
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Para sedes que no tienen pabellones (Mansiche, Colón), pabellon puede ser undefined
    // Solo verificar pabellon si es requerido por la sede
    const sedesConPabellones = ['Moche'];
    const requierePabellon = sedesConPabellones.includes(datosFormulario.sede);
    
    if (requierePabellon && !datosFormulario.pabellon) {
      console.log('❌ Validación fallida - pabellón requerido para sede:', datosFormulario.sede);
      alert('Por favor seleccione un pabellón para la sede seleccionada');
      return;
    }

    console.log('✅ Validación exitosa - procediendo con el envío');
    console.log('📍 Sede:', datosFormulario.sede, '- Requiere pabellón:', requierePabellon);
    console.log('🏢 Pabellón:', datosFormulario.pabellon || 'No aplica para esta sede');
    
    setCargando(true);

    try {
      const datosCompletos: FormularioData = {
        usuario_id: usuarioSeleccionado.id,
        usuario_nombre: usuarioSeleccionado.nombre_completo,
        usuario_email: usuarioSeleccionado.email,
        sede: datosFormulario.sede,
        pabellon: datosFormulario.pabellon || null, // Puede ser null para Mansiche/Colón
        tipo_actividad: datosFormulario.tipo_actividad,
        ambiente_incidencia: datosFormulario.ambiente_incidencia,
        tipo_incidencia: datosFormulario.tipo_incidencia,
        equipo_afectado: datosFormulario.equipo_afectado,
        tiempo_aproximado: datosFormulario.tiempo_aproximado,
        fecha_hora: new Date().toISOString()
      };

      console.log('📤 Datos completos a enviar:', datosCompletos);
      console.log('🔄 Enviando a la base de datos...');

      await createIncidencia(datosCompletos);
      
      console.log('✅ Formulario enviado exitosamente');
      setEnviado(true);
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      alert('Error al enviar el formulario. Por favor intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const handleVolverAlInicio = () => {
    setEnviado(false);
    setPasoActual(1);
    setUsuarioSeleccionado(null);
    setDatosFormulario({});
    onVolver();
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Formulario Enviado!
            </h2>
            
            <p className="text-gray-600 mb-8">
              Su incidencia ha sido registrada exitosamente. 
              El equipo de soporte revisará su solicitud a la brevedad.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleVolverAlInicio}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Volver al Inicio
              </button>
              
              <button
                onClick={() => setEnviado(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Registrar Otra Incidencia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onVolver}
                className="flex items-center gap-2 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver</span>
              </button>
              
              <div className="text-white">
                <h1 className="text-xl font-bold">Formulario de Incidencias</h1>
                <p className="text-sm text-white/80">
                  {usuarioSeleccionado ? `Usuario: ${usuarioSeleccionado.nombre_completo}` : 'Seleccione su usuario'}
                </p>
              </div>
            </div>

            {/* Indicador de progreso */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                pasoActual >= 1 ? 'bg-white text-blue-900' : 'bg-white/20 text-white'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${pasoActual >= 2 ? 'bg-white' : 'bg-white/20'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                pasoActual >= 2 ? 'bg-white text-blue-900' : 'bg-white/20 text-white'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {pasoActual === 1 && (
          <Paso1SeleccionUsuario
            usuarios={usuarios}
            usuarioSeleccionado={usuarioSeleccionado}
            onSeleccionarUsuario={handleSeleccionarUsuario}
            onSiguiente={handleSiguientePaso}
          />
        )}

        {pasoActual === 2 && (
          <Paso2DetallesIncidencia
            usuario={usuarioSeleccionado}
            datosFormulario={datosFormulario}
            onActualizarDatos={handleActualizarDatos}
            onAnterior={handlePasoAnterior}
            onEnviar={handleEnviarFormulario}
            cargando={cargando}
          />
        )}
      </div>
    </div>
  );
}
