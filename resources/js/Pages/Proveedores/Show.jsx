// resources/js/Pages/Proveedores/Show.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, Edit, Building, Globe, Phone, Mail, MapPin, 
    User, CreditCard, Package, DollarSign, Calendar, FileText, Truck 
} from 'lucide-react';

export default function Show({ auth, proveedor, productos, estadisticas }) {
    
    const formatRNC = (rnc) => {
        if (!rnc || rnc.length !== 9) return rnc || 'No registrado';
        return `${rnc.substring(0, 1)}-${rnc.substring(1, 3)}-${rnc.substring(3, 8)}-${rnc.substring(8, 9)}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                            proveedor.tipo_proveedor === 'LOCAL' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                            {proveedor.tipo_proveedor === 'LOCAL' ? (
                                <Building className="w-6 h-6 text-blue-600" />
                            ) : (
                                <Globe className="w-6 h-6 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {proveedor.nombre}
                            </h2>
                            <p className="text-sm text-gray-600">Detalles del proveedor</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('proveedores.edit', proveedor.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Link>
                        <Link
                            href={route('proveedores.index')}
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Proveedor: ${proveedor.nombre}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna izquierda - Información del proveedor */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tarjeta de información principal */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {proveedor.nombre}
                                            </h3>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                    proveedor.activo 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {proveedor.activo ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                    proveedor.tipo_proveedor === 'LOCAL'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {proveedor.tipo_proveedor === 'LOCAL' ? 'PROVEEDOR LOCAL' : 'PROVEEDOR INTERNACIONAL'}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                                                    Código: {proveedor.codigo}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Proveedor desde</p>
                                            <p className="text-lg font-semibold">
                                                {new Date(proveedor.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Información de contacto */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">RNC</p>
                                                    <p className="font-medium">{formatRNC(proveedor.rnc)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Teléfono</p>
                                                    <p className="font-medium">{proveedor.telefono || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium">{proveedor.email || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Contacto Principal</p>
                                                    <p className="font-medium">{proveedor.contacto_nombre || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Teléfono de Contacto</p>
                                                    <p className="font-medium">{proveedor.contacto_telefono || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Dirección</p>
                                                    <p className="font-medium">{proveedor.direccion || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                                            <Package className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Productos</p>
                                            <p className="text-2xl font-bold">{estadisticas.total_productos || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                            <Package className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Productos Activos</p>
                                            <p className="text-2xl font-bold">{estadisticas.productos_activos || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                            <DollarSign className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Valor Inventario</p>
                                            <p className="text-2xl font-bold">
                                                ${parseFloat(estadisticas.valor_inventario || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Productos recientes */}
                            {productos && productos.length > 0 && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Productos del Proveedor</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Código
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Producto
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Precio Compra
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Estado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {productos.map((producto) => (
                                                    <tr key={producto.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-blue-600">
                                                                {producto.codigo}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {producto.nombre}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {producto.descripcion?.substring(0, 50)}...
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">
                                                            ${parseFloat(producto.precio_compra || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                producto.activo
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {producto.activo ? 'ACTIVO' : 'INACTIVO'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Información adicional */}
                        <div className="space-y-6">
                            {/* Condiciones comerciales */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Condiciones Comerciales
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600 flex items-center">
                                                    <CreditCard className="w-4 h-4 mr-1" />
                                                    Límite de Crédito
                                                </span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    ${parseFloat(proveedor.limite_credito || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ 
                                                        width: `${Math.min((proveedor.limite_credito / 100000) * 100, 100)}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Días de Crédito
                                                </span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    {proveedor.dias_credito || 0} días
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-500 mb-2">Términos de pago:</p>
                                            <ul className="text-sm text-gray-700 space-y-1">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    {proveedor.dias_credito > 0 
                                                        ? `Crédito a ${proveedor.dias_credito} días` 
                                                        : 'Contado'}
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                    {proveedor.limite_credito > 0 
                                                        ? `Límite: $${parseFloat(proveedor.limite_credito).toFixed(2)}` 
                                                        : 'Sin límite establecido'}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información del sistema */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Información del Sistema
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha de creación</p>
                                            <p className="font-medium">
                                                {new Date(proveedor.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Última actualización</p>
                                            <p className="font-medium">
                                                {new Date(proveedor.updated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Acciones
                                    </h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/productos/crear?proveedor_id=${proveedor.id}`}
                                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Nuevo Producto
                                        </Link>
                                        <Link
                                            href={route('proveedores.edit', proveedor.id)}
                                            className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Editar Proveedor
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (proveedor.productos_count > 0) {
                                                    alert('No se puede eliminar porque tiene productos asociados');
                                                    return;
                                                }
                                                if (confirm('¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
                                                    router.delete(route('proveedores.destroy', proveedor.id));
                                                }
                                            }}
                                            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Eliminar Proveedor
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Información técnica */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Información Técnica
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">ID de Proveedor</p>
                                            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {proveedor.id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Código interno</p>
                                            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {proveedor.codigo}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tipo interno</p>
                                            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {proveedor.tipo_proveedor}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}