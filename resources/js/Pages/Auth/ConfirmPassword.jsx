import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Lock, 
    Shield, 
    Eye, 
    EyeOff, 
    CheckCircle, 
    AlertCircle,
    UserCheck,
    Clock,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const submit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        post(route('password.confirm'), {
            onFinish: () => {
                reset('password');
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
                setAttempts(prev => prev + 1);
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar Identidad" />

            <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-2xl shadow-xl">
                                    <UserCheck className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    🔒
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Verificación de Seguridad
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Confirma tu identidad para continuar
                        </p>
                    </div>

                    {/* Tarjeta de advertencia de seguridad */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 dark:border-amber-700/50 rounded-2xl">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
                                    Zona de Seguridad Crítica
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Esta es una área protegida de la aplicación. Por favor confirma 
                                    tu identidad ingresando tu contraseña para continuar.
                                </p>
                                {attempts > 0 && (
                                    <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                            ⚠️ Intento {attempts} de 3 antes del bloqueo temporal
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Indicador de seguridad */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                                Nivel de seguridad: Alto
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4 mr-1" />
                                60 seg
                            </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: '100%' }}
                            ></div>
                        </div>
                    </div>

                    {/* Errores generales */}
                    {errors.password && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 border border-rose-200 dark:border-rose-700/50 rounded-2xl">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                                        Contraseña incorrecta
                                    </p>
                                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                                        Verifica tu contraseña e intenta nuevamente
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Campo Contraseña */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                    Contraseña Actual
                                </label>
                                {attempts > 0 && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                        {3 - attempts} intentos restantes
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-purple-500 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-purple-500 transition-colors" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Ingresa tu contraseña actual para verificar tu identidad
                            </p>
                        </div>

                        {/* Botón de confirmación */}
                        <button
                            type="submit"
                            disabled={processing || isLoading || attempts >= 3}
                            className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {processing || isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verificando identidad...
                                </>
                            ) : attempts >= 3 ? (
                                <>
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Cuenta temporalmente bloqueada
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Confirmar Identidad
                                </>
                            )}
                        </button>
                    </form>

                    {/* Información de seguridad */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-gray-500" />
                                    ¿Por qué es necesario?
                                </h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                                    <li className="flex items-start">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                                        Protección contra acceso no autorizado
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt=1.5 mr-2"></span>
                                        Verificación de identidad del usuario
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mt=1.5 mr-2"></span>
                                        Cumplimiento de políticas de seguridad
                                    </li>
                                </ul>
                            </div>

                            {/* Temporizador de sesión */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/30 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            Tiempo restante de sesión
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                style={{ width: '75%' }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                            4:30
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Indicadores de seguridad */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Esta verificación protege:
                                </p>
                                <div className="flex items-center justify-center space-x-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center mb-1">
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400">$$</span>
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Datos financieros</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center mb-1">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">👥</span>
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Clientes</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center mb-1">
                                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">📊</span>
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Reportes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información legal */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            Todas las actividades son monitoreadas por nuestro sistema de seguridad
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}