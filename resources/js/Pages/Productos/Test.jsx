// resources/js/Pages/Productos/SimpleIndex.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SimpleIndex({ productos }) {
    // Solo renderiza algo básico
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800">Productos Simples</h2>}
        >
            <Head title="Productos Simples" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">
                            Total de productos: {productos?.total || 0}
                        </h3>
                        
                        <div className="space-y-4">
                            {productos?.data?.map((producto) => (
                                <div key={producto.id} className="border p-4 rounded">
                                    <h4 className="font-medium">{producto.nombre}</h4>
                                    <p className="text-sm text-gray-600">Código: {producto.codigo}</p>
                                    <p className="text-sm text-gray-600">
                                        Precio: ${parseFloat(producto.precio_venta || 0).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}