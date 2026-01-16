import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    CheckCircle, 
    AlertCircle,
    Building,
    Users,
    Shield,
    Key,
    TrendingUp,
    ArrowRight,
    Clock,
    Check
} from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const submit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                setIsLoading(false);
            },
            onError: () => setIsLoading(false)
        });
    };

    // Calcular fortaleza de contraseña
    useEffect(() => {
        const checks = {
            length: data.password.length >= 8,
            uppercase: /[A-Z]/.test(data.password),
            lowercase: /[a-z]/.test(data.password),
            number: /[0-9]/.test(data.password),
            special: /[^A-Za-z0-9]/.test(data.password)
        };
        
        setPasswordChecks(checks);
        
        const strength = Object.values(checks).filter(Boolean).length;
        setPasswordStrength(strength * 20); // 0-100%
    }, [data.password]);

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 20) return 'from-red-500 to-red-600';
        if (passwordStrength <= 40) return 'from-orange-500 to-orange-600';
        if (passwordStrength <= 60) return 'from-yellow-500 to-yellow-600';
        if (passwordStrength <= 80) return 'from-blue-500 to-blue-600';
        return 'from-green-500 to-emerald-600';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 20) return 'Muy débil';
        if (passwordStrength <= 40) return 'Débil';
        if (passwordStrength <= 60) return 'Regular';
        if (passwordStrength <= 80) return 'Fuerte';
        return 'Muy fuerte';
    };

    return (
        <GuestLayout>
            <Head title="Crear Cuenta Empresarial" />

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* Panel izquierdo - Beneficios */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Patrón decorativo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
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
                                    <Building className="w-4 h-4 mr-2" />
                                    Potencia tu negocio
                                </div>
                                <h1 className="text-5xl font-bold mb-6 leading-tight">
                                    Únete a la <span className="text-cyan-300">revolución digital</span>
                                </h1>
                                <p className="text-lg text-blue-100 leading-relaxed">
                                    Crea tu cuenta y accede a todas las herramientas para optimizar 
                                    operaciones, aumentar productividad y escalar tu negocio.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Seguridad Empresarial</h3>
                                        <p className="text-blue-100">Encriptación de grado militar y autenticación 2FA</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Equipos Colaborativos</h3>
                                        <p className="text-blue-100">Gestiona múltiples usuarios y permisos por rol</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Crecimiento Escalable</h3>
                                        <p className="text-blue-100">Adapta el sistema a medida que tu negocio crece</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-blue-200">
                            <p>✓ Más de 5,000 empresas confían en nuestra plataforma</p>
                            <p className="mt-1">✓ Soporte técnico 24/7 incluido</p>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Formulario */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-xl">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Crear Cuenta Empresarial
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Regístrate para acceder al sistema de gestión completo
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Campo Nombre */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                        Nombre Completo
                                    </label>
                                    {errors.name && (
                                        <span className="text-xs text-rose-600 dark:text-rose-400">
                                            Campo requerido
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        autoComplete="name"
                                        autoFocus
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Campo Email */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                        Correo Empresarial
                                    </label>
                                    {errors.email && (
                                        <span className="text-xs text-rose-600 dark:text-rose-400">
                                            Correo inválido
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
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                        placeholder="usuario@empresa.com"
                                        required
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
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {getPasswordStrengthText()}
                                    </span>
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
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                        placeholder="••••••••"
                                        required
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
                                
                                {/* Indicador de fortaleza */}
                                {data.password && (
                                    <div className="mt-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Fortaleza</span>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {passwordStrength}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()} rounded-full transition-all duration-300`}
                                                style={{ width: `${passwordStrength}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Lista de requisitos */}
                                {data.password && (
                                    <div className="mt-3 space-y-1">
                                        <div className="flex items-center text-xs">
                                            {passwordChecks.length ? (
                                                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-gray-400 mr-2" />
                                            )}
                                            <span className={passwordChecks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                Mínimo 8 caracteres
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            {passwordChecks.uppercase ? (
                                                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-gray-400 mr-2" />
                                            )}
                                            <span className={passwordChecks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                Una letra mayúscula
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            {passwordChecks.number ? (
                                                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-gray-400 mr-2" />
                                            )}
                                            <span className={passwordChecks.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                Un número
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {errors.password && (
                                    <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Campo Confirmar Contraseña */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <Key className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                        Confirmar Contraseña
                                    </label>
                                    {data.password_confirmation && data.password === data.password_confirmation ? (
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3 inline mr-1" />
                                            Coinciden
                                        </span>
                                    ) : data.password_confirmation ? (
                                        <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                                            <AlertCircle className="w-3 h-3 inline mr-1" />
                                            No coinciden
                                        </span>
                                    ) : null}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Términos y condiciones */}
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            required
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <label htmlFor="terms" className="ms-3 text-sm text-gray-700 dark:text-gray-300">
                                        Acepto los{' '}
                                        <Link href="/terminos" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                            Términos de Servicio
                                        </Link>{' '}
                                        y la{' '}
                                        <Link href="/privacidad" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                            Política de Privacidad
                                        </Link>
                                        . Entiendo que todos los datos serán protegidos según RGPD.
                                    </label>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col space-y-4">
                                <button
                                    type="submit"
                                    disabled={processing || isLoading}
                                    className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {processing || isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creando cuenta...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Crear Cuenta Empresarial
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ¿Ya tienes una cuenta?{' '}
                                        <Link
                                            href={route('login')}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center justify-center group"
                                        >
                                            Inicia sesión aquí
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>

                        {/* Información adicional */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Tu cuenta incluye:
                                </p>
                                <div className="flex items-center justify-center space-x-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-2">
                                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">14 días gratis</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center mb-2">
                                            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Seguridad máxima</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mb-2">
                                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">+3 usuarios</span>
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