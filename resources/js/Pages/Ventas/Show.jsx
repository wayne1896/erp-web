// resources/js/Pages/Ventas/Show.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Printer, FileText, User, Calendar,
    DollarSign, Package, CreditCard,
    MapPin, Phone, Mail, Building
} from 'lucide-react';

export default function VentasShow({ venta }) {
    // SI venta es undefined, mostrar mensaje de error
    if (!venta) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-800 leading-tight">
                                Error: Venta no encontrada
                            </h2>
                        </div>
                    </div>
                }
            >
                <Head title="Venta no encontrada" />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-700 mb-4">
                                No se pudo cargar la información de la venta.
                            </p>
                            <Link
                                href={route('ventas.index')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a ventas
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Si venta existe, mostrar la información
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
                                Factura #{venta.numero_factura}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="text-sm text-gray-600">
                                    {formatDate(venta.fecha_venta)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('ventas.imprimir', venta.id)}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                        </Link>
                        <Link
                            href={route('ventas.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Factura ${venta.numero_factura}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información del cliente */}
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Cliente
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-800">
                                        {venta.cliente?.nombre_completo || 'Cliente no disponible'}
                                    </p>
                                    <p className="text-gray-600">
                                        {venta.cliente?.cedula || 'Sin cédula'}
                                    </p>
                                    {venta.cliente?.email && (
                                        <p className="text-gray-600 flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {venta.cliente.email}
                                        </p>
                                    )}
                                    {venta.cliente?.telefono && (
                                        <p className="text-gray-600 flex items-center">
                                            <Phone className="w-4 h-4 mr-2" />
                                            {venta.cliente.telefono}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Información de la venta */}
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Información de la venta
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">NCF:</span> {venta.ncf || 'No disponible'}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Condición:</span> {venta.condicion_pago}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Estado:</span> {venta.estado}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Vendedor:</span> {venta.vendedor?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de productos */}
                        <div className="mt-8">
                            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-blue-600" />
                                Productos
                            </h3>
                            {venta.detalles?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Producto</th>
                                                <th className="px-4 py-2 text-left">Cantidad</th>
                                                <th className="px-4 py-2 text-left">Precio</th>
                                                <th className="px-4 py-2 text-left">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {venta.detalles.map((detalle, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-4 py-2">
                                                        {detalle.producto?.nombre || 'Producto eliminado'}
                                                    </td>
                                                    <td className="px-4 py-2">{detalle.cantidad}</td>
                                                    <td className="px-4 py-2">{formatCurrency(detalle.precio_unitario)}</td>
                                                    <td className="px-4 py-2">{formatCurrency(detalle.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-600">No hay productos en esta venta</p>
                            )}
                        </div>

                        {/* Totales */}
                        <div className="mt-8 pt-6 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-800">Total:</span>
                                <span className="text-2xl font-bold text-blue-700">
                                    {formatCurrency(venta.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}