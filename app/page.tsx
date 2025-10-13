'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, Settings } from 'lucide-react';
import { validarHorario } from '@/lib/validarHorario';
import FormularioIncidencias from '@/components/FormularioIncidencias';
import type { ResultadoValidacionHorario } from '@/lib/validarHorario';

export default function HomePage() {
  const router = useRouter();
  const [validacionHorario, setValidacionHorario] = useState<ResultadoValidacionHorario | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarHorario = async () => {
      try {
        const resultado = await validarHorario();
        setValidacionHorario(resultado);
      } catch (error) {
        console.error('Error al validar horario:', error);
        // En caso de error, permitir acceso
        setValidacionHorario({
          esValido: true,
          mensaje: 'El formulario está disponible',
          horaActual: new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima' }),
          horarioPermitido: '07:00 - 22:00'
        });
      } finally {
        setCargando(false);
      }
    };

    verificarHorario();
  }, []);

  const handleEmpezarFormulario = () => {
    setMostrarFormulario(true);
  };

  const handleIrAPanelAdmin = () => {
    router.push('/admin/login');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Verificando disponibilidad...</p>
        </div>
      </div>
    );
  }

  if (mostrarFormulario) {
    return <FormularioIncidencias onVolver={() => setMostrarFormulario(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header con logo UCT */}
      <div className="relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleIrAPanelAdmin}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Panel de Administración"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center pt-8 pb-4">
          {/* Logo UCT */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <div className="relative w-10 h-10">
                {/* Cruz estilizada */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-8 bg-blue-500"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-1 bg-yellow-400"></div>
                </div>
                {/* Diamante */}
                <div className="absolute inset-0 border-2 border-blue-600 transform rotate-45"></div>
              </div>
            </div>
            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-wider">UCT</h1>
              <p className="text-sm font-light tracking-widest">UNIVERSIDAD CATÓLICA DE TRUJILLO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Formulario de Registro de Incidencias
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Estimado(a) auxiliar/asistente de soporte, se le solicita completar el siguiente formulario para el registro de incidencias detectadas.
            </p>

            {/* Estado del horario */}
            <div className={`p-4 rounded-lg mb-8 ${
              validacionHorario?.esValido 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className={`h-5 w-5 ${
                  validacionHorario?.esValido ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  validacionHorario?.esValido ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validacionHorario?.esValido ? 'Formulario Disponible' : 'Formulario No Disponible'}
                </span>
              </div>
              <p className={`text-sm ${
                validacionHorario?.esValido ? 'text-green-700' : 'text-red-700'
              }`}>
                {validacionHorario?.mensaje}
              </p>
            </div>

            {/* Botón de acción */}
            {validacionHorario?.esValido ? (
              <button
                onClick={handleEmpezarFormulario}
                className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Users className="h-5 w-5 inline mr-2" />
                Empezar ahora
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    El formulario estará disponible nuevamente mañana durante el horario establecido.
                  </p>
                </div>
                <button
                  onClick={handleIrAPanelAdmin}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Acceder al Panel Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-white/80 py-4">
        <p className="text-sm">
          Sistema de Registro de Incidencias - Universidad Católica de Trujillo
        </p>
        <p className="text-xs mt-1">
          © 2024 UCT. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}