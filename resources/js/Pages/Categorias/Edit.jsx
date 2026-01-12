// resources/js/Pages/Categorias/Edit.jsx
import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Tag, Percent, Package } from 'lucide-react';

export default function Edit({ auth, categoria, tasas_itbis, porcentajes_itbis }) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: categoria.nombre || '',
        codigo: categoria.codigo || '',
        itbis_porcentaje: categoria.itbis_porcentaje || 18,
        tasa_itbis: categoria.tasa_itbis || 'ITBIS1',
        descripcion: categoria.descripcion || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('categorias.update', categoria.id));
    };

    const handleTasaItbisChange = (value) => {
        setData('tasa_itbis', value);
        
        // Auto-asignar porcentaje según la tasa seleccionada
        if (value === 'ITBIS1') {
            setData('itbis_porcentaje', 18);
        } else if (value === 'ITBIS2') {
            setData('itbis_porcentaje', 16);
        } else if (value === 'ITBIS3' || value === 'EXENTO') {
            setData('itbis_porcentaje', 0);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Tag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Editar Categoría
                            </h2>
                            <p className="text-sm text-gray-600">{categoria.codigo} - {categoria.productos_count} productos</p>
                        </div>
                    </div>
                    <Link
                        href={route('categorias.index')}
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title={`Editar: ${categoria.nombre}`} />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Header de la categoría */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {categoria.nombre}
                                    </h3>
                                    <div className="flex items-center mt-1 space-x-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            data.tasa_itbis === 'EXENTO'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {data.tasa_itbis === 'ITBIS1' ? 'ITBIS 18%' : 
                                             data.tasa_itbis === 'ITBIS2' ? 'ITBIS 16%' :
                                             data.tasa_itbis === 'ITBIS3' ? 'ITBIS 0%' : 'EXENTO'}
                                        </span>
                                        <span className="text-sm text-gray-600 flex items-center">
                                            <Package className="w-4 h-4 mr-1" />
                                            {categoria.productos_count} productos
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Creada: {new Date(categoria.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Última actualización</p>
                                    <p className="text-sm font-medium">
                                        {new Date(categoria.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Información Básica */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Información de la Categoría
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                Código *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.codigo}
                                                onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.codigo ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {errors.codigo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Configuración de Impuestos */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Percent className="w-5 h-5 mr-2 text-gray-400" />
                                        Configuración de Impuestos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tasa ITBIS *
                                            </label>
                                            <select
                                                value={data.tasa_itbis}
                                                onChange={(e) => handleTasaItbisChange(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                {tasas_itbis.map((tasa) => (
                                                    <option key={tasa.value} value={tasa.value}>
                                                        {tasa.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Porcentaje ITBIS *
                                            </label>
                                            <select
                                                value={data.itbis_porcentaje}
                                                onChange={(e) => setData('itbis_porcentaje', parseFloat(e.target.value))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                {porcentajes_itbis.map((porcentaje) => (
                                                    <option key={porcentaje.value} value={porcentaje.value}>
                                                        {porcentaje.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Nota:</strong> El cambio en la tasa ITBIS afectará a todos los productos 
                                            de esta categoría que no tengan una configuración específica de impuestos.
                                        </p>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Descripción
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción de la Categoría
                                        </label>
                                        <textarea
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            rows="4"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describa el tipo de productos que pertenecen a esta categoría..."
                                        />
                                        {errors.descripcion && (
                                            <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('categorias.show', categoria.id)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Ver Detalles
                                    </Link>
                                    <Link
                                        href={route('categorias.index')}
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
                                        {processing ? 'Actualizando...' : 'Actualizar Categoría'}
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