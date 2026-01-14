import React from 'react';
import { DollarSign, Percent, FileText } from 'lucide-react';

const ResumenVenta = ({ venta }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">
                    {formatCurrency(venta.subtotal)}
                </span>
            </div>
            
            {venta.descuento > 0 && (
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Descuento</span>
                    <span className="font-medium text-red-600">
                        -{formatCurrency(venta.descuento)}
                    </span>
                </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Subtotal con descuentos</span>
                <span className="font-medium text-gray-800">
                    {formatCurrency(venta.subtotal - venta.descuento)}
                </span>
            </div>
            
            {venta.itbis > 0 && (
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">ITBIS</span>
                    <span className="font-medium text-gray-800">
                        {formatCurrency(venta.itbis)}
                    </span>
                </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-700">
                        {formatCurrency(venta.total)}
                    </span>
                </div>
            </div>

            {/* Información adicional si existe */}
            {(venta.notas || venta.estado_dgii) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Información adicional</span>
                    </div>
                    {venta.notas && (
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">Notas:</span> {venta.notas}
                        </div>
                    )}
                    {venta.estado_dgii && (
                        <div className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Estado DGII:</span> {venta.estado_dgii}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumenVenta;