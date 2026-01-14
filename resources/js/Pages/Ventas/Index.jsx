// resources/js/Pages/Ventas/Index.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Plus, Search, Calendar, FileText, User, DollarSign, 
    Eye, Edit, ArrowLeft 
} from 'lucide-react';

export default function VentasIndex({ ventas }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-800 leading-tight">
                                Ventas
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Gestión de facturas y ventas registradas
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('ventas.create')}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Venta
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Ventas" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabla de ventas */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-800">Ventas Registradas</h3>
                        </div>

                        {ventas && ventas.data && ventas.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="py-3 px-6 text-left">Factura</th>
                                            <th className="py-3 px-6 text-left">Cliente</th>
                                            <th className="py-3 px-6 text-left">Fecha</th>
                                            <th className="py-3 px-6 text-left">Total</th>
                                            <th className="py-3 px-6 text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ventas.data.map((venta) => (
                                            <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-6">
                                                    <p className="font-medium">{venta.numero_factura}</p>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <p className="text-gray-800">
                                                        {venta.cliente?.nombre_completo || 'Cliente no disponible'}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <p className="text-gray-600">{formatDate(venta.fecha_venta)}</p>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <p className="font-bold text-blue-700">{formatCurrency(venta.total)}</p>
                                                </td>
                                                <td className="py-3 px-6">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('ventas.show', venta.id)}
                                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                                                            title="Ver detalle"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('ventas.edit', venta.id)}
                                                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No hay ventas registradas</p>
                                <Link
                                    href={route('ventas.create')}
                                    className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear primera venta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}