// resources/js/Components/Dashboard/RecentSales.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    XCircleIcon,
    CreditCardIcon,
    CashIcon,
} from '@heroicons/react/20/solid';

const RecentSales = ({ sales }) => {
    const getStatusIcon = (status, paymentMethod) => {
        if (status === 'ANULADA') {
            return <XCircleIcon className="h-5 w-5 text-red-500" />;
        }
        
        if (paymentMethod === 'CREDITO') {
            return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        }
        
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    };
    
    const getPaymentIcon = (method) => {
        return method === 'CREDITO' ? 
            <CreditCardIcon className="h-4 w-4 text-gray-400" /> : 
            <CashIcon className="h-4 w-4 text-gray-400" />;
    };
    
    const formatCurrency = (amount) => {
        return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ventas Recientes</h3>
                <Link 
                    href="/ventas" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Ver todas
                </Link>
            </div>
            
            <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                    {sales.map((sale) => (
                        <li key={sale.id} className="py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(sale.estado, sale.condicion_pago)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        #{sale.numero_factura} - {sale.cliente_nombre}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getPaymentIcon(sale.condicion_pago)}
                                        <span className="text-xs text-gray-500">
                                            {sale.condicion_pago === 'CREDITO' ? 'Crédito' : 'Contado'}
                                        </span>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(sale.fecha_venta).toLocaleDateString('es-DO')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(sale.total)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {sale.items_count} items
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RecentSales;