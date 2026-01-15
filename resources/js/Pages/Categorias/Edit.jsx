import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, Save, Tag, Percent, AlertCircle,
    FileText, Grid3x3, CheckCircle, AlertTriangle,
    Info, Shield, Database, Clock, ChevronRight,
    BarChart3, TrendingUp, Layers, Package,
    Hash, Building, Edit as EditIcon
} from 'lucide-react';

export default function Edit({ auth, categoria, tasas_itbis = [], porcentajes_itbis = [] }) {
    // Manejo seguro de datos
    const safeCategoria = categoria || {};
    
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

    const [activeTab, setActiveTab] = useState('basico');

    const { data, setData, put, processing, errors } = useForm({
        nombre: safeCategoria.nombre || '',
        codigo: safeCategoria.codigo || '',
        itbis_porcentaje: safeCategoria.itbis_porcentaje || 18,
        tasa_itbis: safeCategoria.tasa_itbis || 'ITBIS1',
        descripcion: safeCategoria.descripcion || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('categorias.update', safeCategoria.id));
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
            case 'ITBIS1': return 'from-red-500 to-red-600 text-white';
            case 'ITBIS2': return 'from-orange-500 to-orange-600 text-white';
            case 'ITBIS3': return 'from-green-500 to-emerald-600 text-white';
            case 'EXENTO': return 'from-blue-500 to-blue-600 text-white';
            default: return 'from-gray-500 to-gray-600 text-white';
        }
    };

    // Verificar si la categoría existe
    if (!categoria) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Categoría no encontrada" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Categoría no encontrada
                            </h2>
                            <Link 
                                href={route('categorias.index')}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver a la lista de categorías
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

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
                                Editar Categoría
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {safeCategoria.codigo} - {safeCategoria.productos_count || 0} productos
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('categorias.show', safeCategoria.id)}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Ver Detalles
                        </Link>
                        <Link
                            href={route('categorias.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white font-medium rounded-lg hover:from-gray-900 hover:to-gray-950 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al listado
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Editar: ${safeCategoria.nombre}`} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado de la categoría */}
                    <div className="mb-6 bg-gradient-to-r from-indigo-800 to-purple-900 dark:from-indigo-900 dark:to-purple-900 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-white truncate">
                                            {safeCategoria.nombre}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getItbisColor(safeCategoria.tasa_itbis)}`}>
                                            {data.tasa_itbis === 'ITBIS1' ? 'ITBIS 18%' : 
                                             data.tasa_itbis === 'ITBIS2' ? 'ITBIS 16%' : 
                                             data.tasa_itbis === 'ITBIS3' ? 'ITBIS 0%' : 
                                             'Exento'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center text-indigo-200">
                                            <Package className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm">{safeCategoria.productos_count || 0} productos</span>
                                                <span className="text-xs text-indigo-300 block">
                                                    en esta categoría
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-indigo-200">
                                            <Percent className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm">ITBIS {safeCategoria.itbis_porcentaje || 0}%</span>
                                                <span className="text-xs text-indigo-300 block">
                                                    tasa aplicada
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-indigo-200">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <div>
                                                <span className="text-sm">
                                                    {new Date(safeCategoria.updated_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-indigo-300 block">
                                                    última actualización
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black/30 rounded-lg p-4 min-w-[200px]">
                                    <div className="text-center">
                                        <p className="text-sm text-indigo-300 mb-1">Código</p>
                                        <p className="text-2xl font-bold text-white mb-2">
                                            {safeCategoria.codigo}
                                        </p>
                                        <div className="flex items-center justify-center text-sm text-indigo-300">
                                            <Hash className="w-4 h-4 mr-1" />
                                            <span>Identificador único</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pestañas de navegación */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basico')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'basico'
                                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Grid3x3 className="w-4 h-4 mr-2" />
                                        Información Básica
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('impuestos')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'impuestos'
                                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <Percent className="w-4 h-4 mr-2" />
                                        Impuestos
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('descripcion')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'descripcion'
                                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Descripción
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Indicador de progreso */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activeTab === 'basico' 
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <Grid3x3 className="w-4 h-4" />
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${
                                            activeTab !== 'basico' ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}></div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activeTab === 'impuestos' 
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <Percent className="w-4 h-4" />
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${
                                            activeTab === 'descripcion' ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}></div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activeTab === 'descripcion' 
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Paso {activeTab === 'basico' ? '1' : activeTab === 'impuestos' ? '2' : '3'} de 3
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Información Básica */}
                                <div className={`space-y-6 ${activeTab !== 'basico' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Grid3x3 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Información Básica
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Campos obligatorios *
                                        </span>
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
                                                    <Hash className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.codigo}
                                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                                    className={`pl-10 mt-1 block w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                                        errors.codigo 
                                                            ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500 dark:ring-red-500' 
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                    placeholder="Ej: ELEC, ALIM, ROPA"
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
                                <div className={`space-y-6 ${activeTab !== 'impuestos' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <Percent className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Configuración de Impuestos
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            Normativa dominicana
                                        </span>
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
                                                                ? `border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 ${getItbisColor(tasa.value).replace('text-white', 'text-indigo-700 dark:text-indigo-300')}`
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
                                <div className={`space-y-6 ${activeTab !== 'descripcion' ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                            Descripción
                                        </h3>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
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

                                {/* Navegación entre pestañas */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    {activeTab !== 'basico' && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'descripcion' ? 'impuestos' : 'basico'
                                            )}
                                            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Anterior
                                        </button>
                                    )}
                                    
                                    {activeTab !== 'descripcion' ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(
                                                activeTab === 'basico' ? 'impuestos' : 'descripcion'
                                            )}
                                            className="ml-auto inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            Siguiente
                                            <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
                                        </button>
                                    ) : (
                                        <div className="ml-auto space-x-3">
                                            <Link
                                                href={route('categorias.show', safeCategoria.id)}
                                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                            >
                                                Ver Detalles
                                            </Link>
                                            <Link
                                                href={route('categorias.index')}
                                                className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                                            >
                                                Cancelar
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Actualizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Actualizar Categoría
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}