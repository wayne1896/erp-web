import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    CheckCircle, 
    AlertCircle,
    Shield,
    Key,
    ArrowRight,
    RefreshCw,
    LucideIcon
} from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
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
        setPasswordStrength(strength * 20);
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
            <Head title="Restablecer Contraseña" />

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
                                    <Lock className="w-4 h-4 mr-2" />
                                    Seguridad de Acceso
                                </div>
                                <h1 className="text-5xl font-bold mb-6 leading-tight">
                                    Restablece tu <span className="text-cyan-300">contraseña</span>
                                </h1>
                                <p className="text-lg text-blue-100 leading-relaxed">
                                    Establece una nueva contraseña segura para recuperar el acceso 
                                    a tu cuenta empresarial y proteger tu información.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Protección Total</h3>
                                        <p className="text-blue-100">Tu nueva contraseña será encriptada con tecnología de grado empresarial</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Acceso Seguro</h3>
                                        <p className="text-blue-100">Recupera el control total de tu cuenta de forma inmediata</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <RefreshCw className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Reinicio Completo</h3>
                                        <p className="text-blue-100">Cierra sesiones activas y establece nueva seguridad</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-blue-200">
                            <p>✓ Encriptación AES-256 para máxima seguridad</p>
                            <p className="mt-1">✓ Cierre automático de sesiones anteriores</p>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Formulario */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center mb-6">
                                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-xl">
                                    <RefreshCw className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Nueva Contraseña
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Establece una nueva contraseña para tu cuenta empresarial
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <form onSubmit={submit} className="space-y-8">
                                {/* Campo Email (oculto o visible) */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <InputLabel 
                                            htmlFor="email" 
                                            value="Correo Empresarial" 
                                            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            <Mail className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                            Correo Empresarial
                                        </InputLabel>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                            autoComplete="username"
                                            onChange={(e) => setData('email', e.target.value)}
                                            readOnly
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                {/* Campo Contraseña */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <InputLabel 
                                            htmlFor="password" 
                                            value="Nueva Contraseña" 
                                            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            <Lock className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                            Nueva Contraseña
                                        </InputLabel>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <TextInput
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                            autoComplete="new-password"
                                            isFocused={true}
                                            onChange={(e) => setData('password', e.target.value)}
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
                                        <div className="mt-4">
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
                                        <div className="mt-4 space-y-2">
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
                                    
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                {/* Campo Confirmar Contraseña */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <InputLabel 
                                            htmlFor="password_confirmation" 
                                            value="Confirmar Contraseña" 
                                            className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            <Key className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                            Confirmar Contraseña
                                        </InputLabel>
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
                                            <Key className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <TextInput
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
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
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                {/* Botón de envío */}
                                <div className="mt-8">
                                    <PrimaryButton 
                                        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Estableciendo contraseña...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-5 h-5 mr-2" />
                                                Establecer Nueva Contraseña
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>

                                {/* Información de seguridad */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                Seguridad Garantizada
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Al establecer tu nueva contraseña, todas las sesiones anteriores 
                                                serán cerradas automáticamente para proteger tu cuenta.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}