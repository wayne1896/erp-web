import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Shield, CheckCircle, ArrowRight, Clock, Users } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verificación de Email" />

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* Panel izquierdo - Información */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">ERP Business</h2>
                                <p className="text-blue-100 text-sm">Sistema de Gestión Integral</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <div className="mb-8">
                                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Seguridad en 2 pasos
                                </div>
                                <h1 className="text-5xl font-bold mb-6 leading-tight">
                                    Verifica tu <span className="text-cyan-300">identidad</span>
                                </h1>
                                <p className="text-lg text-blue-100 leading-relaxed">
                                    Para proteger tu cuenta empresarial y todos tus datos, 
                                    necesitamos confirmar que eres el propietario de esta 
                                    dirección de correo electrónico.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Protección de Cuenta</h3>
                                        <p className="text-blue-100">Evita el acceso no autorizado a tu información empresarial</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Autenticidad Garantizada</h3>
                                        <p className="text-blue-100">Confirma que eres un usuario legítimo del sistema</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Comunicación Segura</h3>
                                        <p className="text-blue-100">Recibe notificaciones importantes en tu correo verificado</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-blue-200">
                            <p>✓ Todas las cuentas empresariales requieren verificación</p>
                            <p className="mt-1">✓ Proceso rápido y seguro</p>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Verificación */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Verifica tu Email
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Último paso para activar tu cuenta empresarial
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    ¡Registro Completo!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Tu cuenta ha sido creada exitosamente
                                </p>
                            </div>

                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Verificación de Seguridad
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    <strong className="text-gray-900 dark:text-gray-100">Antes de comenzar, necesitamos verificar tu dirección de email.</strong> 
                                    Hemos enviado un enlace de verificación a tu correo electrónico. 
                                    Por favor haz clic en ese enlace para confirmar tu identidad y 
                                    activar todas las funciones de tu cuenta empresarial.
                                </p>

                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                ¿No recibiste el email?
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Revisa tu carpeta de spam o solicita un nuevo enlace
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {status === 'verification-link-sent' && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                                ¡Enlace de verificación enviado!
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                            Hemos enviado un nuevo enlace de verificación a tu correo electrónico.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="flex flex-col space-y-4">
                                    <PrimaryButton 
                                        disabled={processing}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-5 h-5 mr-2" />
                                                Reenviar Email de Verificación
                                            </>
                                        )}
                                    </PrimaryButton>

                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            ¿Problemas con la verificación?{' '}
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center justify-center group"
                                            >
                                                Cerrar sesión y reintentar
                                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Después de verificar, tu cuenta incluye:
                                </p>
                                <div className="flex items-center justify-center space-x-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-2">
                                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Acceso inmediato</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center mb-2">
                                            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Cuenta protegida</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mb-2">
                                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Todas las funciones</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}