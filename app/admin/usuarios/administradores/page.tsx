'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Edit,
  Shield,
  UserPlus,
  UserCheck,
  UserX,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getUsuariosAdmin, 
  createUsuarioAdmin, 
  updateUsuarioAdmin, 
  updatePasswordAdmin,
  desactivarUsuarioAdmin,
  activarUsuarioAdmin
} from '@/lib/supabase';
import { obtenerIniciales } from '@/lib/utils';
import type { UsuarioAdmin } from '@/types';

export default function AdministradoresPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAdmin | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formulario, setFormulario] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'admin'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const usuariosData = await getUsuariosAdmin();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error al cargar usuarios admin:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('🚀 Iniciando creación/actualización de usuario admin...');
      console.log('📋 Datos del formulario:', formulario);
      console.log('👤 Usuario editando:', usuarioEditando);
      
      if (usuarioEditando) {
        console.log('✏️ Actualizando usuario existente...');
        await updateUsuarioAdmin(usuarioEditando.id, {
          email: formulario.email,
          nombre_completo: formulario.nombre_completo,
          rol: formulario.rol
        });
        console.log('✅ Usuario actualizado exitosamente');
        alert('Usuario administrador actualizado exitosamente');
      } else {
        console.log('➕ Creando nuevo usuario...');
        const nuevoUsuario = await createUsuarioAdmin({
          email: formulario.email,
          password: formulario.password,
          nombre_completo: formulario.nombre_completo,
          rol: formulario.rol
        });
        console.log('✅ Usuario creado exitosamente:', nuevoUsuario);
        alert(`Usuario administrador creado exitosamente.\n\nIMPORTANTE: El usuario debe registrarse manualmente en Supabase Auth para poder hacer login.\n\nEmail: ${formulario.email}\nContraseña: ${formulario.password}\n\nPuede activar el usuario una vez que se haya registrado.`);
      }
      
      console.log('🔄 Recargando lista de usuarios...');
      await cargarUsuarios();
      setMostrarFormulario(false);
      setUsuarioEditando(null);
      setFormulario({ email: '', password: '', nombre_completo: '', rol: 'admin' });
      console.log('🎉 Proceso completado exitosamente');
    } catch (error) {
      console.error('❌ Error detallado al guardar usuario admin:', error);
      console.error('❌ Tipo de error:', typeof error);
      console.error('❌ Mensaje de error:', (error as Error)?.message);
      console.error('❌ Stack trace:', (error as Error)?.stack);
      alert(`Error al guardar el usuario administrador: ${(error as Error)?.message || 'Error desconocido'}`);
    }
  };

  const handleEditarUsuario = (usuario: UsuarioAdmin) => {
    setUsuarioEditando(usuario);
    setFormulario({
      email: usuario.email,
      password: '', // No mostrar contraseña existente
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol
    });
    setMostrarFormulario(true);
  };

  const handleCambiarPassword = async (email: string) => {
    alert(`Para cambiar la contraseña de ${email}:\n\n1. Ve a Supabase Dashboard > Authentication > Users\n2. Busca el email: ${email}\n3. Haz clic en "Reset Password"\n4. O usa la función "Forgot Password" en el login\n\nEsta funcionalidad será mejorada en futuras versiones.`);
  };

  const handleActivarUsuario = async (usuario: UsuarioAdmin) => {
    try {
      await activarUsuarioAdmin(usuario.id);
      await cargarUsuarios();
      alert('Usuario administrador activado exitosamente');
    } catch (error) {
      console.error('Error al activar usuario:', error);
      alert('Error al activar el usuario');
    }
  };

  const handleDesactivarUsuario = async (usuario: UsuarioAdmin) => {
    if (!confirm(`¿Está seguro de que desea desactivar al administrador ${usuario.nombre_completo}?`)) {
      return;
    }

    try {
      await desactivarUsuarioAdmin(usuario.id);
      await cargarUsuarios();
      alert('Usuario administrador desactivado exitosamente');
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      alert('Error al desactivar el usuario');
    }
  };

  const cancelarEdicion = () => {
    setMostrarFormulario(false);
    setUsuarioEditando(null);
    setFormulario({ email: '', password: '', nombre_completo: '', rol: 'admin' });
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando administradores...</p>
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
                onClick={() => router.push('/admin/usuarios')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver a Usuarios</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Administradores</h1>
                <p className="text-sm text-gray-600">Administrar usuarios con permisos de administración</p>
              </div>
            </div>

            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nuevo Administrador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de administradores */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Administradores del Sistema ({usuarios.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {usuario.nombre_completo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {usuario.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rol: {usuario.rol} • Registrado: {new Date(usuario.created_at).toLocaleDateString('es-PE')}
                          </p>
                          <p className="text-xs text-gray-400">
                            Estado Auth: {usuario.password_hash === 'N/A' || usuario.password_hash === 'Registrado' ? '✅ Registrado' : '⚠️ Pendiente de registro'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditarUsuario(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar administrador"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleCambiarPassword(usuario.email)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Información sobre cambio de contraseña"
                          >
                            <Key className="h-4 w-4" />
                          </button>

                          {usuario.activo ? (
                            <button
                              onClick={() => handleDesactivarUsuario(usuario)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desactivar administrador"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivarUsuario(usuario)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activar administrador"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {usuarios.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay administradores</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comience agregando un nuevo usuario administrador.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de administrador */}
          <div className="lg:col-span-1">
            {mostrarFormulario && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {usuarioEditando ? 'Editar Administrador' : 'Nuevo Administrador'}
                  </h2>
                </div>

                <form onSubmit={handleCrearUsuario} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formulario.nombre_completo}
                      onChange={(e) => setFormulario(prev => ({ ...prev, nombre_completo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: ADMINISTRADOR PRINCIPAL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={formulario.email}
                      onChange={(e) => setFormulario(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="admin@uct.edu.pe"
                    />
                  </div>

                  {!usuarioEditando && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarPassword ? 'text' : 'password'}
                          required
                          value={formulario.password}
                          onChange={(e) => setFormulario(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Mínimo 6 caracteres"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres. Para usuarios existentes, use el botón &quot;Cambiar contraseña&quot;
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <select
                      value={formulario.rol}
                      onChange={(e) => setFormulario(prev => ({ ...prev, rol: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Super Administrador</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4 inline mr-2" />
                      Guardar
                    </button>
                    
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Información */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información sobre Administradores
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900">Proceso de Creación</h4>
                  <p>1. Crear usuario en esta interfaz<br/>
                     2. Registrar en Supabase Auth manualmente<br/>
                     3. Activar el usuario</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Estados</h4>
                  <p>✅ Registrado: Puede hacer login<br/>
                     ⚠️ Pendiente: Necesita registro en Supabase</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Cambio de Contraseña</h4>
                  <p>Use Supabase Dashboard {'>'} Authentication {'>'} Users {'>'} Reset Password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
