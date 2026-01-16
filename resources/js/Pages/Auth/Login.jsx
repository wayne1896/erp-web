import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Eye, 
    EyeOff, 
    Lock, 
    Mail, 
    User, 
    LogIn, 
    AlertCircle, 
    CheckCircle,
    Smartphone,
    Building,
    Shield,
    TrendingUp
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        post(route('login'), {
            onFinish: () => {
                reset('password');
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* Panel izquierdo - Ilustración/Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Patrón decorativo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">ERP Business</h2>
                                <p className="text-blue-100 text-sm">Sistema de Gestión Integral</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <div className="mb-8">
                                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Plataforma empresarial segura
                                </div>
                                <h1 className="text-5xl font-bold mb-6 leading-tight">
                                    Gestiona tu negocio con <span className="text-cyan-300">potencia</span>
                                </h1>
                                <p className="text-lg text-blue-100 leading-relaxed">
                                    Accede a todas las herramientas necesarias para optimizar tus operaciones, 
                                    aumentar productividad y tomar decisiones informadas.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Building className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Gestión Multi-sucursal</h3>
                                        <p className="text-blue-100">Controla todas tus ubicaciones desde un solo lugar</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Analíticas en tiempo real</h3>
                                        <p className="text-blue-100">Toma decisiones basadas en datos actualizados</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Acceso desde cualquier dispositivo</h3>
                                        <p className="text-blue-100">Trabaja desde tu computadora, tablet o móvil</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-blue-200">
                            <p>© {new Date().getFullYear()} ERP Business Suite. Todos los derechos reservados.</p>
                            <p className="mt-1">v2.5.1 • Sistema optimizado</p>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Formulario */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-xl">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Acceder al Sistema
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Ingresa tus credenciales para acceder al panel de control
                            </p>
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
                                        Correo Electrónico
                                    </label>
                                    {errors.email && (
                                        <span className="text-xs text-rose-600 dark:text-rose-400">
                                            Credenciales inválidas
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
                            </div>

                            {/* Campo Contraseña */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                        Contraseña
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Recordar sesión */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                            data.remember
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
                                        }`}>
                                            {data.remember && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="ms-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                        Mantener sesión activa
                                    </span>
                                </label>
                            </div>

                            {/* Botón de envío */}
                            <button
                                type="submit"
                                disabled={processing || isLoading}
                                className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing || isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verificando credenciales...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Iniciar Sesión
                                    </>
                                )}
                            </button>

                            {/* Información adicional */}
                            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    ¿Necesitas ayuda?{' '}
                                    <Link
                                        href="/contacto"
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                    >
                                        Contacta con soporte
                                    </Link>
                                </p>
                                
                                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
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
                            </div>
                        </form>

                        {/* Indicadores de seguridad */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center space-x-6">
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Shield className="w-4 h-4 mr-1.5 text-green-500" />
                                    <span>Conexión segura</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Lock className="w-4 h-4 mr-1.5 text-blue-500" />
                                    <span>Encriptado SSL</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <User className="w-4 h-4 mr-1.5 text-purple-500" />
                                    <span>Autenticación 2FA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}