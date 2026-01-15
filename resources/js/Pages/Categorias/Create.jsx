import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, Save, Tag, Percent, AlertCircle,
    FileText, Grid3x3, CheckCircle, AlertTriangle,
    Info, HelpCircle, Shield, Database
} from 'lucide-react';

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

    // Función para obtener color según la tasa de ITBIS
    const getItbisColor = (tasa) => {
        switch(tasa) {
            case 'ITBIS1': return 'border-red-500 text-red-600 dark:text-red-400';
            case 'ITBIS2': return 'border-orange-500 text-orange-600 dark:text-orange-400';
            case 'ITBIS3': return 'border-green-500 text-green-600 dark:text-green-400';
            case 'EXENTO': return 'border-blue-500 text-blue-600 dark:text-blue-400';
            default: return 'border-gray-500 text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3.5 rounded-xl shadow-lg">
                            <Tag className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Crear Nueva Categoría
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Define una nueva categoría para organizar tus productos
                            </p>
                        </div>
                    </div>
                    
                    <Link
                        href={route('categorias.index')}
                        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al listado
                    </Link>
                </div>
            }
        >
            <Head title="Crear Categoría" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header del formulario */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
                                        <Tag className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            Información de la Categoría
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Completa los datos para crear una nueva categoría
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    Campos obligatorios *
                                </span>
                            </div>
                        </div>

                        <form onSubmit={submit}>
                            <div className="p-6 space-y-8">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Grid3x3 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Información Básica
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Identificación única
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre de la Categoría *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Tag className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.nombre}
                                                    onChange={(e) => setData('nombre', e.target.value)}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.nombre 
                                                            ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500 dark:ring-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="Ej: Electrónica, Alimentos, Ropa"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.nombre && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.nombre}
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Nombre descriptivo para la categoría
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Código Único *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400 font-medium">CAT-</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.codigo}
                                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                                    className={`pl-14 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.codigo 
                                                            ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500 dark:ring-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="ELEC, ALIM, ROPA"
                                                    required
                                                    disabled={processing}
                                                />
                                            </div>
                                            {errors.codigo && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.codigo}
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Código único para identificar la categoría
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuración de Impuestos */}
                                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Percent className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Configuración de Impuestos
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Normativa dominicana
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tasa ITBIS *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {safeTasasItbis.map((tasa) => (
                                                    <button
                                                        key={tasa.value}
                                                        type="button"
                                                        onClick={() => handleTasaItbisChange(tasa.value)}
                                                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                                            data.tasa_itbis === tasa.value
                                                                ? `border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 ${getItbisColor(tasa.value)}`
                                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                                        }`}
                                                        disabled={processing}
                                                    >
                                                        <div className="text-sm font-medium">{tasa.label}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {tasa.value === 'ITBIS1' ? 'Tasa general aplicable' :
                                                             tasa.value === 'ITBIS2' ? 'Tasa reducida' :
                                                             tasa.value === 'ITBIS3' ? 'Tasa mínima' :
                                                             'Libre de impuesto'}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.tasa_itbis && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.tasa_itbis}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Porcentaje ITBIS *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">%</span>
                                                </div>
                                                <select
                                                    value={data.itbis_porcentaje}
                                                    onChange={(e) => setData('itbis_porcentaje', parseFloat(e.target.value))}
                                                    className={`pr-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.itbis_porcentaje 
                                                            ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500 dark:ring-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
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
                                            </div>
                                            {errors.itbis_porcentaje && (
                                                <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.itbis_porcentaje}
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Porcentaje aplicable según normativa
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <Info className="h-5 w-5 text-blue-400 dark:text-blue-300" />
                                            </div>
                                            <div className="ml-3">
                                                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                    Información sobre tasas ITBIS
                                                </h5>
                                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        <li><strong>ITBIS1 (18%):</strong> Tasa general aplicable a la mayoría de bienes y servicios</li>
                                                        <li><strong>ITBIS2 (16%):</strong> Tasa reducida para bienes específicos según normativa</li>
                                                        <li><strong>ITBIS3 (0%):</strong> Tasa mínima para bienes de primera necesidad</li>
                                                        <li><strong>EXENTO (0%):</strong> Bienes y servicios exentos de ITBIS por ley</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Descripción
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Información adicional
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Descripción de la Categoría
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none top-3">
                                                <FileText className="text-gray-400" />
                                            </div>
                                            <textarea
                                                value={data.descripcion}
                                                onChange={(e) => setData('descripcion', e.target.value)}
                                                rows="4"
                                                className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                    errors.descripcion 
                                                        ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500 dark:ring-red-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                                placeholder="Describa el tipo de productos que pertenecen a esta categoría, características comunes, y cualquier información relevante para su clasificación..."
                                                disabled={processing}
                                            />
                                        </div>
                                        {errors.descripcion && (
                                            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.descripcion}
                                            </div>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Opcional: información adicional para identificar mejor la categoría
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Shield className="w-4 h-4 mr-2" />
                                        <span>Los datos se guardarán de forma segura</span>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('categorias.index')}
                                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                            disabled={processing}
                                        >
                                            Cancelar
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}