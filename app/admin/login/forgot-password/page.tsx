'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setMensaje(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/admin/update-password`,
            });

            if (error) throw error;

            setMensaje({
                tipo: 'exito',
                texto: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.'
            });
        } catch (error: any) {
            console.error('Error al solicitar reseteo:', error);
            setMensaje({
                tipo: 'error',
                texto: error.message || 'Error al enviar la solicitud. Por favor intenta nuevamente.'
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
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Recuperar Contraseña
                    </h1>

                    <p className="text-gray-600">
                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
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

                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="admin@soporte.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando || !email}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${cargando || !email
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                    >
                        {cargando ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Enviando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Send className="h-5 w-5" />
                                <span>Enviar Instrucciones</span>
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <Link
                        href="/admin/login"
                        className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
