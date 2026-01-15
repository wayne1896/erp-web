import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { 
    User, 
    Shield, 
    Key, 
    AlertCircle,
    Settings,
    CheckCircle,
    Clock
} from 'lucide-react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-3.5 rounded-xl shadow-lg">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Perfil de Usuario
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Administra tu información personal, seguridad y preferencias
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Última actualización: {auth.user?.updated_at ? 
                                new Date(auth.user.updated_at).toLocaleDateString('es-DO', {
                                    dateStyle: 'medium'
                                }) : 
                                'N/A'
                            }
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Mi Perfil" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Mensaje de bienvenida */}
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg mr-4">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                                    Hola, {auth.user?.name || 'Usuario'}
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Bienvenido a la configuración de tu perfil. Aquí puedes actualizar tu información personal, 
                                    gestionar la seguridad de tu cuenta y configurar tus preferencias.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Indicador de pestañas */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800`}>
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-blue-700 dark:text-blue-300">Información Personal</span>
                            </div>
                            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800`}>
                                <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-700 dark:text-green-300">Seguridad</span>
                            </div>
                            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800`}>
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="font-medium text-red-700 dark:text-red-300">Cuenta</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna izquierda - Información Personal */}
                        <div className="space-y-6">
                            {/* Información Personal */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg mr-3">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                Información Personal
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Actualiza tu nombre, correo electrónico y foto de perfil
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-full"
                                    />
                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                                        <span>Tu información personal está protegida y solo tú puedes modificarla.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Preferencias */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg mr-3">
                                            <Settings className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                Preferencias de Cuenta
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Configura notificaciones y preferencias del sistema
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                                                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Notificaciones por correo
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Recibe actualizaciones importantes por email
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Verificación en dos pasos
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Añade una capa extra de seguridad
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200">
                                                Activar
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                                                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Historial de actividad
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Revisa tu actividad reciente
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200">
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha - Seguridad y Cuenta */}
                        <div className="space-y-6">
                            {/* Seguridad */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-lg mr-3">
                                            <Key className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                Seguridad de la Cuenta
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Cambia tu contraseña y protege tu cuenta
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdatePasswordForm className="max-w-full" />
                                    
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                            Consejos de seguridad
                                        </h4>
                                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>Usa contraseñas largas y complejas</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>No compartas tu contraseña con nadie</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>Cambia tu contraseña periódicamente</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Cuenta - Peligro */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-2.5 rounded-lg mr-3">
                                            <AlertCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                Zona de Peligro
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Acciones irreversibles que afectan tu cuenta
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Eliminar Cuenta
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Una vez que elimines tu cuenta, no podrás recuperarla. 
                                            Todos tus datos, configuraciones y actividad serán 
                                            eliminados permanentemente.
                                        </p>
                                        <DeleteUserForm className="max-w-full" />
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                            Información importante
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                                        Datos eliminados
                                                    </p>
                                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                        Se eliminarán todos tus datos personales, preferencias 
                                                        y configuraciones del sistema.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                                        Proceso irreversible
                                                    </p>
                                                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                                                        Esta acción no se puede deshacer. Considera descargar 
                                                        tus datos importantes antes de proceder.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {auth.user?.created_at ? 
                                        Math.floor((new Date() - new Date(auth.user.created_at)) / (1000 * 60 * 60 * 24 * 365)) : 0
                                    }
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Años en la plataforma
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {auth.user?.email_verified_at ? 'Verificado' : 'Pendiente'}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Estado del correo
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {new Date(auth.user?.created_at || new Date()).getFullYear()}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Año de registro
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}