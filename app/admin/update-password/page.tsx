'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
            return;
        }

        if (password.length < 6) {
            setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setCargando(true);
        setMensaje(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setMensaje({
                tipo: 'exito',
                texto: 'Tu contraseña ha sido actualizada exitosamente. Redirigiendo...'
            });

            setTimeout(() => {
                router.push('/admin/login');
            }, 2000);
        } catch (error: any) {
            console.error('Error al actualizar password:', error);
            setMensaje({
                tipo: 'error',
                texto: error.message || 'Error al actualizar la contraseña. Por favor intenta nuevamente.'
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Actualizar Contraseña
                    </h1>

                    <p className="text-gray-600">
                        Ingresa tu nueva contraseña para asegurar tu cuenta.
                    </p>
                </div>

                {mensaje && (
                    <div className={`mb-6 p-4 rounded-lg text-sm ${mensaje.tipo === 'exito'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Repite la contraseña"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando || !password || !confirmPassword}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${cargando || !password || !confirmPassword
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                    >
                        {cargando ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Actualizando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Save className="h-5 w-5" />
                                <span>Guardar Nueva Contraseña</span>
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
