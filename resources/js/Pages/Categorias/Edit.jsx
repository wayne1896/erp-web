import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ auth, proveedor }) {
    // Manejo seguro de datos
    const safeProveedor = proveedor || {};
    
    const { data, setData, put, processing, errors } = useForm({
        nombre: safeProveedor.nombre || '',
        codigo: safeProveedor.codigo || '',
        ruc: safeProveedor.ruc || '',
        telefono: safeProveedor.telefono || '',
        email: safeProveedor.email || '',
        direccion: safeProveedor.direccion || '',
        activo: safeProveedor.activo ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('proveedores.update', safeProveedor.id));
    };

    // Verificar si el proveedor existe
    if (!proveedor) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Proveedor no encontrado" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Proveedor no encontrado</h2>
                            <Link href={route('proveedores.index')} className="text-blue-600 hover:text-blue-800">
                                ← Volver a la lista de proveedores
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Editar Proveedor
                            </h2>
                            <p className="text-sm text-gray-600">
                                {safeProveedor.codigo || 'N/A'} - {safeProveedor.nombre || 'Proveedor'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('proveedores.show', safeProveedor.id)} // AQUÍ ESTÁ LA SOLUCIÓN
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title={`Editar: ${safeProveedor.nombre || 'Proveedor'}`} />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {safeProveedor.nombre || 'Proveedor'}
                                    </h3>
                                    <div className="flex items-center mt-1 space-x-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            data.activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {data.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            RUC: {safeProveedor.ruc || 'No asignado'}
                                        </span>
                                        {safeProveedor.created_at && (
                                            <span className="text-sm text-gray-600">
                                                Registrado: {new Date(safeProveedor.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Información Básica */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Información del Proveedor
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo}
                                                onChange={(e) => setData('codigo', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.codigo ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.codigo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                RUC
                                            </label>
                                            <input
                                                type="text"
                                                value={data.ruc}
                                                onChange={(e) => setData('ruc', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.telefono}
                                                onChange={(e) => setData('telefono', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Dirección
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dirección Completa
                                        </label>
                                        <textarea
                                            value={data.direccion}
                                            onChange={(e) => setData('direccion', e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Ingrese la dirección completa del proveedor..."
                                        />
                                        {errors.direccion && (
                                            <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Estado del Proveedor
                                    </h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="activo"
                                            checked={data.activo}
                                            onChange={(e) => setData('activo', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                            Proveedor Activo
                                        </label>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('proveedores.index')}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Actualizando...' : 'Actualizar Proveedor'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}