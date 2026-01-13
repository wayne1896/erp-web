// resources/js/Pages/Categorias/Create.jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Tag, Percent, AlertCircle } from 'lucide-react';

export default function Create({ auth, tasas_itbis = [], porcentajes_itbis = [] }) {
    // Definir valores por defecto si no llegan del servidor
    const defaultTasasItbis = [
        { value: 'ITBIS1', label: 'ITBIS General (18%)' },
        { value: 'ITBIS2', label: 'ITBIS Reducido (16%)' },
        { value: 'ITBIS3', label: 'ITBIS Mínimo (0%)' },
        { value: 'EXENTO', label: 'Exento de ITBIS (0%)' }
    ];

    const defaultPorcentajes = [
        { value: 0, label: '0%' },
        { value: 16, label: '16%' },
        { value: 18, label: '18%' }
    ];

    // Usar las props o los valores por defecto
    const safeTasasItbis = tasas_itbis?.length > 0 ? tasas_itbis : defaultTasasItbis;
    const safePorcentajesItbis = porcentajes_itbis?.length > 0 ? porcentajes_itbis : defaultPorcentajes;

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        itbis_porcentaje: 18,
        tasa_itbis: 'ITBIS1',
        descripcion: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categorias.store'), {
            onError: (errors) => {
                console.log('Errores en el formulario:', errors);
            },
            onSuccess: () => {
                console.log('Categoría creada exitosamente');
            }
        });
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
                                Crear Nueva Categoría
                            </h2>
                            <p className="text-sm text-gray-600">Definir categoría de productos</p>
                        </div>
                    </div>
                    <Link
                        href={route('categorias.index')}
                        className="text-gray-600 hover:text-gray-900 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title="Crear Categoría" />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    {/* Debug info - Quitar en producción */}
                    {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="font-medium">Debug Info:</span>
                        </div>
                        <div className="mt-2 text-sm">
                            <p>Tasas ITBIS: {JSON.stringify(safeTasasItbis)}</p>
                            <p>Porcentajes: {JSON.stringify(safePorcentajesItbis)}</p>
                        </div>
                    </div> */}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit}>
                            <div className="p-6 space-y-6">
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
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.nombre ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Ej: Electrónica, Alimentos, Ropa"
                                                required
                                                disabled={processing}
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.nombre}
                                                </p>
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
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.codigo ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="Ej: ELEC, ALIM, ROPA"
                                                required
                                                disabled={processing}
                                            />
                                            {errors.codigo && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.codigo}
                                                </p>
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
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.tasa_itbis ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                                disabled={processing}
                                            >
                                                {safeTasasItbis.map((tasa) => (
                                                    <option key={tasa.value} value={tasa.value}>
                                                        {tasa.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.tasa_itbis && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.tasa_itbis}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Porcentaje ITBIS *
                                            </label>
                                            <select
                                                value={data.itbis_porcentaje}
                                                onChange={(e) => setData('itbis_porcentaje', parseFloat(e.target.value))}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors.itbis_porcentaje ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                                disabled={processing}
                                            >
                                                {safePorcentajesItbis.map((porcentaje) => (
                                                    <option key={porcentaje.value} value={porcentaje.value}>
                                                        {porcentaje.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.itbis_porcentaje && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.itbis_porcentaje}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            <strong>Nota:</strong> La tasa ITBIS determina el tipo de impuesto aplicable según la normativa dominicana. 
                                            Seleccione la opción correspondiente a la naturaleza de los productos en esta categoría.
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
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                errors.descripcion ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Describa el tipo de productos que pertenecen a esta categoría..."
                                            disabled={processing}
                                        />
                                        {errors.descripcion && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.descripcion}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('categorias.index')}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={processing}
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Crear Categoría
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}