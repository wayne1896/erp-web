import { useState } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Mail, 
    Key, 
    ArrowLeft, 
    Send, 
    Shield, 
    AlertCircle, 
    CheckCircle,
    Smartphone,
    Lock,
    RefreshCw
} from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        post(route('password.email'), {
            onFinish: () => setIsLoading(false),
            onError: () => setIsLoading(false)
        });
    };

    return (
        <GuestLayout>
            <Head title="Recuperar Contraseña" />

            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Volver al inicio de sesión
                        </Link>

                        <div className="inline-flex items-center justify-center mb-6">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-xl">
                                <Key className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Recuperar Acceso
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Recupera el acceso a tu cuenta empresarial
                        </p>
                    </div>

                    {/* Mensaje informativo */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50 rounded-2xl">
                        <div className="flex items-start">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
                                    Recuperación Segura
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Ingresa tu correo electrónico y te enviaremos un enlace seguro 
                                    para restablecer tu contraseña.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje de estado */}
                    {status && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" />
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                    {status}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Errores generales */}
                    {errors.email && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 border border-rose-200 dark:border-rose-700/50 rounded-2xl">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-3 flex-shrink-0" />
                                <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                                    {errors.email}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Campo Email */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                    Correo Electrónico Registrado
                                </label>
                                {errors.email && (
                                    <span className="text-xs text-rose-600 dark:text-rose-400">
                                        Correo no encontrado
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="email"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                    placeholder="usuario@empresa.com"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Ingresa el correo asociado a tu cuenta empresarial
                            </p>
                        </div>

                        {/* Botón de envío */}
                        <button
                            type="submit"
                            disabled={processing || isLoading}
                            className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {processing || isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando enlace...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Enviar Enlace de Recuperación
                                </>
                            )}
                        </button>
                    </form>

                    {/* Información adicional */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-gray-500" />
                                    ¿Qué sucede después?
                                </h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                                    <li className="flex items-start">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                                        Recibirás un correo con enlace seguro
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                                        El enlace expira en 60 minutos
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt=1.5 mr-2"></span>
                                        Crea una nueva contraseña segura
                                    </li>
                                </ul>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ¿No recibes el correo?{' '}
                                    <button
                                        onClick={submit}
                                        disabled={processing || isLoading}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                                    >
                                        Reenviar enlace
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Indicadores de seguridad */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Shield className="w-4 h-4 mr-1.5 text-green-500" />
                                <span>Proceso de recuperación 100% seguro</span>
                            </div>
                            
                            <div className="flex items-center justify-center space-x-6">
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <RefreshCw className="w-4 h-4 mr-1.5 text-blue-500" />
                                    <span>Enlace temporal</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Smartphone className="w-4 h-4 mr-1.5 text-purple-500" />
                                    <span>Soporte 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información legal */}
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-500 mb-2">
                            <Link href="/terminos" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                Términos
                            </Link>
                            <span>•</span>
                            <Link href="/privacidad" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                Privacidad
                            </Link>
                            <span>•</span>
                            <Link href="/seguridad" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                Seguridad
                            </Link>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            Protegemos tus datos según el RGPD y normativas locales
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}