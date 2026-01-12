import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, Edit, User, Mail, Phone, MapPin, 
    FileText, DollarSign, Calendar, CreditCard, ShoppingBag,
    Tag, Building, Percent, Clock
} from 'lucide-react';

export default function Show({ auth, cliente, ventas_recientes, estadisticas }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {cliente.nombre_completo}
                            </h2>
                            <p className="text-sm text-gray-600">{cliente.codigo} - Detalles del cliente</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('clientes.edit', cliente.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </Link>
                        <Link
                            href={route('clientes.index')}
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Cliente: ${cliente.nombre_completo}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna izquierda - Información del cliente */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tarjeta de información principal */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {cliente.nombre_completo}
                                            </h3>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                    cliente.activo 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                                    {cliente.tipo_cliente === 'NATURAL' ? 'PERSONA NATURAL' : 'PERSONA JURÍDICA'}
                                                </span>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                                                    {cliente.tipo_contribuyente}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Cliente desde</p>
                                            <p className="text-lg font-semibold">
                                                {new Date(cliente.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Información de contacto */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <Tag className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Código</p>
                                                    <p className="font-medium">{cliente.codigo}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Documento</p>
                                                    <p className="font-medium">{cliente.cedula_rnc}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium">{cliente.email || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Teléfono</p>
                                                    <p className="font-medium">{cliente.telefono || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Teléfono Alternativo</p>
                                                    <p className="font-medium">{cliente.telefono_alternativo || 'No especificado'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Dirección</p>
                                                    <p className="font-medium">{cliente.direccion || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Información de ubicación */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Ubicación</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Provincia</p>
                                                <p className="font-medium">{cliente.provincia}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Municipio</p>
                                                <p className="font-medium">{cliente.municipio}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Sector</p>
                                                <p className="font-medium">{cliente.sector}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas financieras */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                                            <ShoppingBag className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Ventas</p>
                                            <p className="text-2xl font-bold">{estadisticas.total_ventas || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                            <DollarSign className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Monto Total</p>
                                            <p className="text-2xl font-bold">
                                                ${parseFloat(estadisticas.monto_total || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                            <CreditCard className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Saldo Pendiente</p>
                                            <p className="text-2xl font-bold">
                                                ${parseFloat(estadisticas.saldo_actual || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ventas recientes */}
                            {ventas_recientes && ventas_recientes.length > 0 && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Factura
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Fecha
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Total
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Estado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {ventas_recientes.map((venta) => (
                                                    <tr key={venta.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-blue-600">
                                                                {venta.numero_factura || `V-${venta.id}`}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {new Date(venta.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">
                                                            ${parseFloat(venta.total || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                venta.estado === 'PROCESADA' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : venta.estado === 'PENDIENTE'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {venta.estado || 'PROCESADA'}
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
                            {/* Información de crédito */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Información de Crédito
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600 flex items-center">
                                                    <DollarSign className="w-4 h-4 mr-1" />
                                                    Límite de Crédito
                                                </span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    ${parseFloat(cliente.limite_credito || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600 flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Días de Crédito
                                                </span>
                                                <span className="text-lg font-bold text-gray-800">
                                                    {cliente.dias_credito || 0} días
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600 flex items-center">
                                                    <Percent className="w-4 h-4 mr-1" />
                                                    Descuento
                                                </span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {parseFloat(cliente.descuento || 0).toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        {cliente.limite_credito > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="mb-2 flex justify-between text-sm">
                                                    <span className="text-gray-600">Saldo Utilizado</span>
                                                    <span className="font-medium">
                                                        ${parseFloat(cliente.saldo_pendiente || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ 
                                                            width: `${Math.min(((cliente.saldo_pendiente || 0) / cliente.limite_credito) * 100, 100)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    {(((cliente.saldo_pendiente || 0) / cliente.limite_credito) * 100).toFixed(1)}% utilizado
                                                </p>
                                            </div>
                                        )}
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
                                                {new Date(cliente.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Última actualización</p>
                                            <p className="font-medium">
                                                {new Date(cliente.updated_at).toLocaleString()}
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
                                            href={`/ventas/crear?cliente_id=${cliente.id}`}
                                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Nueva Venta
                                        </Link>
                                        <Link
                                            href={route('clientes.edit', cliente.id)}
                                            className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Editar Cliente
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
                                                    router.delete(route('clientes.destroy', cliente.id));
                                                }
                                            }}
                                            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                        >
                                            Eliminar Cliente
                                        </button>
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