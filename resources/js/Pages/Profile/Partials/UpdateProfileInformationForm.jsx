import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [previewImage, setPreviewImage] = useState(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className={className}>
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-2.5 rounded-lg mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            Información del Perfil
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Actualiza tu información personal y foto de perfil
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Foto de perfil */}
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-800 dark:to-indigo-900 flex items-center justify-center overflow-hidden">
                            {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : user.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12 text-white" />
                            )}
                        </div>
                        <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-full cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                            <Camera className="w-4 h-4" />
                            <input
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Foto de perfil</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Haz clic en la cámara para cambiar tu foto
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Recomendado: 500x500px, JPG o PNG
                        </p>
                    </div>
                </div>

                {/* Nombre */}
                <div>
                    <InputLabel 
                        htmlFor="name" 
                        value="Nombre Completo"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" />
                        </div>
                        <TextInput
                            id="name"
                            className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                            placeholder="Ingresa tu nombre completo"
                        />
                    </div>

                    <InputError 
                        className="mt-2 text-sm text-red-600 dark:text-red-400" 
                        message={errors.name} 
                    />
                </div>

                {/* Correo electrónico */}
                <div>
                    <InputLabel 
                        htmlFor="email" 
                        value="Correo Electrónico"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    />

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="text-gray-400" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <InputError 
                        className="mt-2 text-sm text-red-600 dark:text-red-400" 
                        message={errors.email} 
                    />
                </div>

                {/* Verificación de correo */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                    Tu correo electrónico no está verificado.
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                    Por favor, verifica tu dirección de correo electrónico para acceder a todas las funciones.
                                </p>
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="mt-2 inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white text-sm font-medium rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200"
                                >
                                    Reenviar correo de verificación
                                </Link>
                            </div>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        ¡Correo enviado!
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                        Se ha enviado un nuevo enlace de verificación a tu dirección de correo electrónico.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Botón de acción */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <PrimaryButton 
                            disabled={processing}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Guardar Cambios
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
                                <span className="text-sm font-medium">¡Cambios guardados!</span>
                            </div>
                        </Transition>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setData({
                                name: user.name,
                                email: user.email,
                                avatar: null,
                            });
                            setPreviewImage(null);
                        }}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                    >
                        Restablecer cambios
                    </button>
                </div>
            </form>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Información de tu cuenta
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">ID de Usuario</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Fecha de registro</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-DO') : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Correo verificado</p>
                        <p className={`font-medium ${user.email_verified_at ? 'text-green-600' : 'text-yellow-600'}`}>
                            {user.email_verified_at ? 'Sí' : 'No'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Última actualización</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-DO') : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}