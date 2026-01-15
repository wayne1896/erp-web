import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { AlertCircle, Trash2, Shield, Download } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Eliminar Cuenta Permanentemente
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Esta acción eliminará todos tus datos de forma permanente y no se puede deshacer.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-medium text-red-800 dark:text-red-300">
                            Antes de proceder
                        </h4>
                        <ul className="mt-2 space-y-2 text-sm text-red-700 dark:text-red-400">
                            <li className="flex items-start">
                                <Download className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Descarga cualquier dato que desees conservar</span>
                            </li>
                            <li className="flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Todos tus archivos, configuraciones y preferencias serán eliminados</span>
                            </li>
                            <li className="flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>No podrás recuperar tu cuenta después de este proceso</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Eliminar Cuenta
                </button>
                <button
                    type="button"
                    className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Descargar Datos
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-xl mr-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Confirmar Eliminación de Cuenta
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Esta acción no se puede deshacer. Por favor, confirma tu contraseña.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                    Al eliminar tu cuenta:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                                    <li>• Todos tus datos personales serán eliminados permanentemente</li>
                                    <li>• Perderás acceso a todas las funcionalidades del sistema</li>
                                    <li>• No podrás recuperar tu cuenta ni tus datos</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={deleteUser}>
                        <div className="mb-6">
                            <InputLabel
                                htmlFor="password"
                                value="Confirmar Contraseña"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            />

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="text-gray-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="pl-10 mt-1 block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    placeholder="Ingresa tu contraseña para confirmar"
                                    isFocused
                                />
                            </div>

                            <InputError
                                message={errors.password}
                                className="mt-2 text-sm text-red-600 dark:text-red-400"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <SecondaryButton 
                                onClick={closeModal}
                                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                Cancelar
                            </SecondaryButton>

                            <DangerButton 
                                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar Cuenta Permanentemente
                                    </>
                                )}
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}