import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Key, Lock, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-2.5 rounded-lg mr-3">
                        <Key className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            Cambiar Contraseña
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Actualiza tu contraseña para mantener tu cuenta segura
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={updatePassword} className="space-y-6">
                {/* Contraseña Actual */}
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Contraseña Actual"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="text-gray-400" />
                        </div>
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? "text" : "password"}
                            className="pl-10 pr-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                    />
                </div>

                {/* Nueva Contraseña */}
                <div>
                    <InputLabel 
                        htmlFor="password" 
                        value="Nueva Contraseña"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="text-gray-400" />
                        </div>
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showNewPassword ? "text" : "password"}
                            className="pl-10 pr-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>

                    <InputError 
                        message={errors.password} 
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                    />
                </div>

                {/* Confirmar Contraseña */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Nueva Contraseña"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield className="text-gray-400" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 pr-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                    />
                </div>

                {/* Indicadores de fortaleza de contraseña */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Recomendaciones de seguridad
                    </h4>
                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                        <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${data.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Al menos 8 caracteres
                        </li>
                        <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Incluye una letra mayúscula
                        </li>
                        <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Incluye una letra minúscula
                        </li>
                        <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Incluye un número
                        </li>
                        <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[^A-Za-z0-9]/.test(data.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Incluye un carácter especial
                        </li>
                    </ul>
                </div>

                {/* Botón de acción */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <PrimaryButton 
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Actualizar Contraseña
                                </>
                            )}
                        </PrimaryButton>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-300">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">¡Contraseña actualizada!</span>
                            </div>
                        </Transition>
                    </div>

                    <button
                        type="button"
                        onClick={() => reset()}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                    >
                        Limpiar campos
                    </button>
                </div>
            </form>
        </section>
    );
}