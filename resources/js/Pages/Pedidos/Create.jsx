import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Plus,
    X,
    User,
    Package,
    Calendar,
    DollarSign,
    Percent,
    MapPin,
    Truck,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Clock,
    ShoppingCart,
    Layers,
    Hash,
    BarChart,
    FileText,
    Save,
    PlusCircle,
    MinusCircle,
    Trash2,
    Info,
    Shield,
    PackagePlus,
    CheckSquare,
    Settings,
    XSquare
} from 'lucide-react';

export default function PedidosCreate({ 
    clientes, 
    productos, 
    sucursal, 
    numero_pedido,
    estados = [],
    prioridades = [],
    tipos_pedido = [],
    condiciones_pago = []
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        cliente_id: '',
        fecha_entrega: '',
        prioridad: 'MEDIA',
        tipo_pedido: 'LOCAL',
        condicion_pago: 'CONTADO',
        anticipo: 0,
        notas: '',
        direccion_entrega: {
            nombre_contacto: '',
            telefono_contacto: '',
            direccion: '',
            ciudad: '',
            provincia: '',
            sector: '',
            codigo_postal: '',
            instrucciones_entrega: ''
        },
        detalles: []
    });

    const [selectedCliente, setSelectedCliente] = useState(null);
    const [searchProduct, setSearchProduct] = useState('');
    const [filteredProductos, setFilteredProductos] = useState(productos || []);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productoData, setProductoData] = useState({
        cantidad_solicitada: 1,
        precio_unitario: 0,
        descuento: 0
    });

    // Formateadores
    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Filtrar productos
    useEffect(() => {
        if (!productos) return;
        
        const filtered = productos.filter(producto => {
            const searchLower = searchProduct.toLowerCase();
            return (
                producto.nombre.toLowerCase().includes(searchLower) ||
                producto.codigo?.toLowerCase().includes(searchLower) ||
                producto.descripcion?.toLowerCase().includes(searchLower)
            );
        });
        setFilteredProductos(filtered);
    }, [searchProduct, productos]);

    // Seleccionar cliente
    const handleSelectCliente = (clienteId) => {
        const cliente = clientes.find(c => c.id == clienteId);
        setSelectedCliente(cliente);
        setData('cliente_id', clienteId);
    };

    // Seleccionar producto para agregar
    const handleSelectProduct = (producto) => {
        const inventario = producto.inventarios?.[0];
        const stockDisponible = inventario?.stock_disponible || 0;
        
        setSelectedProduct({
            ...producto,
            stock_disponible: stockDisponible
        });
        
        setProductoData({
            cantidad_solicitada: 1,
            precio_unitario: producto.precio_venta || 0,
            descuento: 0
        });
    };

    // Calcular total del producto
    const calcularTotalProducto = () => {
        const cantidad = parseFloat(productoData.cantidad_solicitada) || 0;
        const precio = parseFloat(productoData.precio_unitario) || 0;
        const descuento = parseFloat(productoData.descuento) || 0;
        
        const subtotal = cantidad * precio;
        const descuentoMonto = (subtotal * descuento) / 100;
        const subtotalConDescuento = subtotal - descuentoMonto;
        const itbis = subtotalConDescuento * 0.18; // 18% ITBIS
        const total = subtotalConDescuento + itbis;
        
        return {
            subtotal,
            descuentoMonto,
            subtotalConDescuento,
            itbis,
            total
        };
    };

    // Agregar producto al pedido
    const handleAddProduct = () => {
        if (!selectedProduct) return;
        
        const calculos = calcularTotalProducto();
        
        const nuevoDetalle = {
            producto_id: selectedProduct.id,
            producto_nombre: selectedProduct.nombre,
            producto_codigo: selectedProduct.codigo,
            producto_stock: selectedProduct.stock_disponible,
            cantidad_solicitada: productoData.cantidad_solicitada,
            precio_unitario: productoData.precio_unitario,
            descuento: productoData.descuento,
            descuento_monto: calculos.descuentoMonto,
            subtotal: calculos.subtotalConDescuento,
            itbis_porcentaje: 18.00,
            itbis_monto: calculos.itbis,
            total: calculos.total,
            temporal_id: Date.now() // ID temporal para React
        };

        setData('detalles', [...data.detalles, nuevoDetalle]);
        setSelectedProduct(null);
        setProductoData({
            cantidad_solicitada: 1,
            precio_unitario: 0,
            descuento: 0
        });
        setSearchProduct('');
    };

    // Remover producto del pedido
    const handleRemoveProduct = (index) => {
        const nuevosDetalles = data.detalles.filter((_, i) => i !== index);
        setData('detalles', nuevosDetalles);
    };

    // Calcular totales del pedido
    const calcularTotalesPedido = () => {
        let subtotal = 0;
        let descuentoTotal = 0;
        let itbisTotal = 0;
        let total = 0;

        data.detalles.forEach(detalle => {
            subtotal += parseFloat(detalle.subtotal) || 0;
            descuentoTotal += parseFloat(detalle.descuento_monto) || 0;
            itbisTotal += parseFloat(detalle.itbis_monto) || 0;
            total += parseFloat(detalle.total) || 0;
        });

        return { subtotal, descuentoTotal, itbisTotal, total };
    };

    const totales = calcularTotalesPedido();
    const saldoPendiente = totales.total - (parseFloat(data.anticipo) || 0);

    // Enviar formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (data.detalles.length === 0) {
            alert('Debe agregar al menos un producto al pedido');
            return;
        }
        
        if (!data.cliente_id) {
            alert('Debe seleccionar un cliente');
            return;
        }
        
        if (!data.fecha_entrega) {
            alert('Debe especificar una fecha de entrega');
            return;
        }
        
        post(route('pedidos.store'), {
            onSuccess: () => {
                reset();
                setSelectedCliente(null);
                setSelectedProduct(null);
            }
        });
    };

    // Validar stock
    const validarStock = (productoId, cantidad) => {
        const producto = productos.find(p => p.id == productoId);
        if (!producto || !producto.control_stock) return true;
        
        const inventario = producto.inventarios?.[0];
        return inventario && inventario.stock_disponible >= cantidad;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('pedidos.index')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                            <PackagePlus className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Nuevo Pedido
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                #{numero_pedido} • {sucursal?.nombre || 'Sucursal'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Nuevo Pedido" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Columna izquierda: Información del pedido */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Información del cliente */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Información del Cliente
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Seleccionar Cliente *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={data.cliente_id}
                                                    onChange={(e) => handleSelectCliente(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                                                    required
                                                >
                                                    <option value="">Seleccione un cliente</option>
                                                    {clientes?.map(cliente => (
                                                        <option key={cliente.id} value={cliente.id}>
                                                            {cliente.nombre_completo} - {cliente.cedula_rnc || 'Sin cédula'}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                            {errors.cliente_id && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cliente_id}</p>
                                            )}
                                        </div>

                                        {selectedCliente && (
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {selectedCliente.nombre_completo}
                                                        </h4>
                                                        <div className="mt-2 space-y-2">
                                                            <div className="flex items-center text-sm">
                                                                <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    Cédula/RNC: {selectedCliente.cedula_rnc || 'No especificado'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-sm">
                                                                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {selectedCliente.direccion || 'Sin dirección'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-sm">
                                                                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    Crédito disponible: {formatCurrency(selectedCliente.limite_credito - (selectedCliente.saldo_pendiente || 0))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {data.condicion_pago === 'CREDITO' && selectedCliente.limite_credito < totales.total && (
                                                        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm flex items-center">
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            Supera límite
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Productos del pedido */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <ShoppingCart className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                                        Productos del Pedido
                                    </h3>
                                    
                                    {/* Buscar y agregar producto */}
                                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div className="md:col-span-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Buscar Producto
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={searchProduct}
                                                        onChange={(e) => setSearchProduct(e.target.value)}
                                                        placeholder="Nombre, código o descripción..."
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                    />
                                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchProduct('')}
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lista de productos filtrados */}
                                        {searchProduct && (
                                            <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                                {filteredProductos.length > 0 ? (
                                                    filteredProductos.map(producto => {
                                                        const inventario = producto.inventarios?.[0];
                                                        const stockDisponible = inventario?.stock_disponible || 0;
                                                        const sinStock = producto.control_stock && stockDisponible <= 0;
                                                        
                                                        return (
                                                            <div
                                                                key={producto.id}
                                                                onClick={() => handleSelectProduct(producto)}
                                                                className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                                    sinStock ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                                            {producto.nombre}
                                                                        </p>
                                                                        <div className="flex items-center space-x-4 mt-1">
                                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                Código: {producto.codigo || 'N/A'}
                                                                            </span>
                                                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                                {formatCurrency(producto.precio_venta || 0)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                                                            sinStock 
                                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                        }`}>
                                                                            {sinStock ? 'Sin stock' : `Stock: ${stockDisponible}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                        No se encontraron productos
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Producto seleccionado para agregar */}
                                    {selectedProduct && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-lg border border-green-200 dark:border-green-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    Agregar: {selectedProduct.nombre}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProduct(null)}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-red-600 dark:text-red-400"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Cantidad
                                                    </label>
                                                    <div className="flex items-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setProductoData({
                                                                ...productoData,
                                                                cantidad_solicitada: Math.max(1, productoData.cantidad_solicitada - 1)
                                                            })}
                                                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <MinusCircle className="w-4 h-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={productoData.cantidad_solicitada}
                                                            onChange={(e) => setProductoData({
                                                                ...productoData,
                                                                cantidad_solicitada: parseFloat(e.target.value) || 1
                                                            })}
                                                            className="w-full px-3 py-2 border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setProductoData({
                                                                ...productoData,
                                                                cantidad_solicitada: productoData.cantidad_solicitada + 1
                                                            })}
                                                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <PlusCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {selectedProduct.control_stock && productoData.cantidad_solicitada > selectedProduct.stock_disponible && (
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                            Stock insuficiente. Disponible: {selectedProduct.stock_disponible}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Precio Unitario
                                                    </label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={productoData.precio_unitario}
                                                            onChange={(e) => setProductoData({
                                                                ...productoData,
                                                                precio_unitario: parseFloat(e.target.value) || 0
                                                            })}
                                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Descuento %
                                                    </label>
                                                    <div className="relative">
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={productoData.descuento}
                                                            onChange={(e) => setProductoData({
                                                                ...productoData,
                                                                descuento: parseFloat(e.target.value) || 0
                                                            })}
                                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddProduct}
                                                        disabled={selectedProduct.control_stock && productoData.cantidad_solicitada > selectedProduct.stock_disponible}
                                                        className={`w-full px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center ${
                                                            selectedProduct.control_stock && productoData.cantidad_solicitada > selectedProduct.stock_disponible
                                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg'
                                                        }`}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Agregar
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Vista previa del producto */}
                                            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="grid grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
                                                        <p className="font-medium">{formatCurrency(calcularTotalProducto().subtotal)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Descuento</p>
                                                        <p className="font-medium text-red-600 dark:text-red-400">
                                                            {formatCurrency(calcularTotalProducto().descuentoMonto)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">ITBIS (18%)</p>
                                                        <p className="font-medium">{formatCurrency(calcularTotalProducto().itbis)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Total</p>
                                                        <p className="font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(calcularTotalProducto().total)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lista de productos agregados */}
                                    {data.detalles.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Producto</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Cantidad</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Precio</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Descuento</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Subtotal</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">ITBIS</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Total</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {data.detalles.map((detalle, index) => {
                                                        const tieneStock = validarStock(detalle.producto_id, detalle.cantidad_solicitada);
                                                        return (
                                                            <tr key={detalle.temporal_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                                <td className="py-3 px-4">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                                            {detalle.producto_nombre}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {detalle.producto_codigo}
                                                                        </p>
                                                                        {!tieneStock && (
                                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                                                                Sin stock suficiente
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center">
                                                                        <span className="font-medium">{detalle.cantidad_solicitada}</span>
                                                                        {detalle.producto_stock !== null && (
                                                                            <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                                                                detalle.cantidad_solicitada > detalle.producto_stock
                                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                            }`}>
                                                                                Stock: {detalle.producto_stock}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 font-medium">
                                                                    {formatCurrency(detalle.precio_unitario)}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="text-red-600 dark:text-red-400">
                                                                        {detalle.descuento}%
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {formatCurrency(detalle.descuento_monto)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 font-medium">
                                                                    {formatCurrency(detalle.subtotal)}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="text-amber-600 dark:text-amber-400">
                                                                        18%
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {formatCurrency(detalle.itbis_monto)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 font-bold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(detalle.total)}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveProduct(index)}
                                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                            <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                                                No hay productos en el pedido
                                            </p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                Busca y agrega productos para comenzar
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Columna derecha: Configuración y resumen */}
                            <div className="space-y-6">
                                {/* Configuración del pedido */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
                                        <SettingsIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                        Configuración
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha de Entrega *
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={data.fecha_entrega}
                                                    onChange={(e) => setData('fecha_entrega', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                            {errors.fecha_entrega && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha_entrega}</p>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Prioridad
                                                </label>
                                                <select
                                                    value={data.prioridad}
                                                    onChange={(e) => setData('prioridad', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    {prioridades.map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tipo de Pedido
                                                </label>
                                                <select
                                                    value={data.tipo_pedido}
                                                    onChange={(e) => setData('tipo_pedido', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    {tipos_pedido.map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Condición de Pago
                                            </label>
                                            <select
                                                value={data.condicion_pago}
                                                onChange={(e) => setData('condicion_pago', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                {condiciones_pago.map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {data.condicion_pago === 'CREDITO' || data.condicion_pago === 'MIXTO' ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Anticipo
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.anticipo}
                                                        onChange={(e) => setData('anticipo', parseFloat(e.target.value) || 0)}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                        
                                        {data.tipo_pedido === 'DOMICILIO' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Dirección de Entrega
                                                </label>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        value={data.direccion_entrega.nombre_contacto}
                                                        onChange={(e) => setData('direccion_entrega', {
                                                            ...data.direccion_entrega,
                                                            nombre_contacto: e.target.value
                                                        })}
                                                        placeholder="Nombre del contacto"
                                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={data.direccion_entrega.telefono_contacto}
                                                        onChange={(e) => setData('direccion_entrega', {
                                                            ...data.direccion_entrega,
                                                            telefono_contacto: e.target.value
                                                        })}
                                                        placeholder="Teléfono de contacto"
                                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                    />
                                                    <textarea
                                                        value={data.direccion_entrega.direccion}
                                                        onChange={(e) => setData('direccion_entrega', {
                                                            ...data.direccion_entrega,
                                                            direccion: e.target.value
                                                        })}
                                                        placeholder="Dirección completa"
                                                        rows="2"
                                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notas u Observaciones
                                            </label>
                                            <textarea
                                                value={data.notas}
                                                onChange={(e) => setData('notas', e.target.value)}
                                                placeholder="Notas adicionales sobre el pedido..."
                                                rows="3"
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen del pedido */}
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-white mb-4 flex items-center">
                                            <BarChart className="w-5 h-5 mr-2 text-white" />
                                            Resumen del Pedido
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-100">Subtotal</span>
                                                <span className="font-bold text-white">
                                                    {formatCurrency(totales.subtotal)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-100">Descuento</span>
                                                <span className="font-bold text-red-300">
                                                    -{formatCurrency(totales.descuentoTotal)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-purple-100">ITBIS (18%)</span>
                                                <span className="font-bold text-white">
                                                    {formatCurrency(totales.itbisTotal)}
                                                </span>
                                            </div>
                                            
                                            <div className="pt-3 border-t border-purple-500">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-purple-100 font-semibold">Total</span>
                                                    <span className="text-xl font-bold text-white">
                                                        {formatCurrency(totales.total)}
                                                    </span>
                                                </div>
                                                
                                                {data.condicion_pago !== 'CONTADO' && (
                                                    <>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-purple-100 text-sm">Anticipo</span>
                                                            <span className="font-semibold text-green-300">
                                                                {formatCurrency(data.anticipo)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-purple-100 text-sm">Saldo Pendiente</span>
                                                            <span className="font-semibold text-yellow-300">
                                                                {formatCurrency(saldoPendiente)}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <div className="pt-4">
                                                <div className="text-xs text-purple-200 space-y-1">
                                                    <div className="flex items-center">
                                                        <Package className="w-3 h-3 mr-2" />
                                                        <span>{data.detalles.length} productos</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-2" />
                                                        <span>Entrega: {formatDate(data.fecha_entrega)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Shield className="w-3 h-3 mr-2" />
                                                        <span>Estado: Pendiente</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/10 p-6">
                                        <button
                                            type="submit"
                                            disabled={processing || data.detalles.length === 0}
                                            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                                                processing || data.detalles.length === 0
                                                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                                    : 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl'
                                            }`}
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 mr-2" />
                                                    Crear Pedido
                                                </>
                                            )}
                                        </button>
                                        
                                        {data.detalles.length === 0 && (
                                            <p className="mt-2 text-xs text-red-200 text-center">
                                                Debe agregar al menos un producto
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Agregar el ícono Settings que falta
function SettingsIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}