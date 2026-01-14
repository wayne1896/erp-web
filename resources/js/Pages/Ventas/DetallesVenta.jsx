import React from 'react';
import { Package, DollarSign, Percent } from 'lucide-react';

const DetallesVenta = ({ detalles }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!detalles || detalles.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay productos en esta venta</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Precio</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">ITBIS</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {detalles.map((detalle, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-3 px-4">
                                <div className="flex items-start">
                                    <div className="bg-gradient-to-r from-green-100 to-green-200 p-2 rounded-lg mr-3">
                                        <Package className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {detalle.producto?.nombre || 'Producto eliminado'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Código: {detalle.producto?.codigo || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <p className="text-gray-800">{detalle.cantidad}</p>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center">
                                    <DollarSign className="w-3 h-3 text-gray-500 mr-1" />
                                    <span>{formatCurrency(detalle.precio_unitario)}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center">
                                    <Percent className="w-3 h-3 text-gray-500 mr-1" />
                                    <span>{detalle.descuento}%</span>
                                </div>
                                {detalle.descuento_monto > 0 && (
                                    <div className="text-xs text-red-600 mt-1">
                                        -{formatCurrency(detalle.descuento_monto)}
                                    </div>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <p className="font-medium text-gray-800">
                                    {formatCurrency(detalle.subtotal)}
                                </p>
                            </td>
                            <td className="py-3 px-4">
                                <p className="text-gray-800">{formatCurrency(detalle.itbis_monto)}</p>
                                <div className="text-xs text-gray-500">
                                    {detalle.itbis_porcentaje}%
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <p className="font-bold text-gray-800">
                                    {formatCurrency(detalle.total)}
                                </p>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50">
                    <tr>
                        <td colSpan="6" className="py-3 px-4 text-right font-bold">
                            Total General:
                        </td>
                        <td className="py-3 px-4">
                            <p className="text-xl font-bold text-blue-700">
                                {formatCurrency(detalles.reduce((sum, d) => sum + parseFloat(d.total), 0))}
                            </p>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default DetallesVenta;