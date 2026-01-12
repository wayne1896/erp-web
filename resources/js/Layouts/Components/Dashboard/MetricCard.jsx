// resources/js/Components/Dashboard/MetricCard.jsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/20/solid';

const MetricCard = ({ title, value, icon, change, unit, description, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'bg-indigo-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
    };
    
    const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
    const ChangeIcon = change > 0 ? ArrowUpIcon : change < 0 ? ArrowDownIcon : MinusIcon;
    
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
                        {React.cloneElement(icon, { className: 'h-6 w-6 text-white' })}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {typeof value === 'number' && unit === 'RD$' ? `RD$ ${value.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                                     typeof value === 'number' ? value.toLocaleString('es-DO') : value}
                                </div>
                                {change !== undefined && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
                                        <ChangeIcon className="self-center flex-shrink-0 h-4 w-4" />
                                        <span className="ml-1">
                                            {Math.abs(change)}%
                                        </span>
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            {description && (
                <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                        <span className="text-gray-500">{description}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricCard;