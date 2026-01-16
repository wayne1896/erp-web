import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft, ShoppingCart, Plus, Trash2, Search,
    Calculator, User, Package, DollarSign, CreditCard,
    AlertCircle, CheckCircle, XCircle, RefreshCw, ChevronRight,
    FileText, Calendar, Clock, Tag, Percent, Shield,
    BarChart3, FileCheck, Download, Printer, Eye, Edit2,
    Users, Building, Phone, Mail, MapPin, 
    Truck, PackageCheck, ClipboardList, FileBarChart, Wallet, 
    MessageSquare, HelpCircle, Info, Check, X, AlertTriangle,
    ChevronDown, ChevronUp, ExternalLink, Maximize2, Minimize2,
    RotateCcw, Save, Upload, Image, Camera,
    Star, Heart, ThumbsUp, ThumbsDown,
    Flag, Bookmark, Share2, Send,
    PhoneCall, MessageCircle, AtSign, Hash, Lock, Unlock, Key,
    EyeOff, Bell, Settings, UserPlus, UserCheck,
    UserX, UserMinus, UserCog,
    // Iconos para tipos de pago
    Banknote, // Para efectivo
    Landmark, // Para transferencia
    Smartphone // Para pago móvil
} from 'lucide-react';
import axios from 'axios';

export default function VentasCreate({ caja, clienteDefault, tiposComprobante, condicionesPago, tiposPago }) {
    // Agrega esto para debug
    useEffect(() => {
      
    }, []);
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
    const [clienteInfo, setClienteInfo] = useState(() => {
        // Si no hay cliente default, usar Consumidor Final
        if (!clienteDefault || !clienteDefault.id) {
            return {
                id: null,
                nombre_completo: 'Consumidor Final',
                tipo: 'FISICA',
                cedula: '000-0000000-0',
                email: '',
                telefono: '',
                direccion: ''
            };
        }
        return clienteDefault;
    });
    const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
    const [clientesLista, setClientesLista] = useState([]);
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [modoBusquedaCliente, setModoBusquedaCliente] = useState('nombre');
    const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
    const [nuevoCliente, setNuevoCliente] = useState({
        tipo: 'FISICA',
        cedula: '',
        nombre_completo: '',
        email: '',
        telefono: '',
        direccion: ''
    });
    const [descuentoGlobal, setDescuentoGlobal] = useState(0);
    const [descuentoPorProducto, setDescuentoPorProducto] = useState({});
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(false);
    
    const buscadorRef = useRef(null);

 // CORRECTO: Pasar el componente directamente
 const tiposPagoDefault = tiposPago || [
    { key: 'EFECTIVO', nombre: 'Efectivo', icono: Banknote, color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
    { key: 'TARJETA_DEBITO', nombre: 'Tarjeta Débito', icono: CreditCard, color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
    { key: 'TARJETA_CREDITO', nombre: 'Tarjeta Crédito', icono: CreditCard, color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' },
    { key: 'TRANSFERENCIA', nombre: 'Transferencia', icono: Landmark, color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30' },
    { key: 'CHEQUE', nombre: 'Cheque', icono: FileCheck, color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' },
    { key: 'PAGO_MOVIL', nombre: 'Pago Móvil', icono: Smartphone, color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30' },
    { key: 'CREDITO', nombre: 'Crédito', icono: Clock, color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' }, // AÑADIDO
];

    const { data, setData, post, processing, errors, reset } = useForm({
        cliente_id: clienteInfo.id || '',
        tipo_comprobante: 'FACTURA',
        condicion_pago: 'CONTADO',
        tipo_pago: 'EFECTIVO',
        dias_credito: 0,
        fecha_venta: new Date().toISOString().slice(0, 16), // Formato: "2024-01-16T14:30"
        productos: [],
        notas: '',
        descuento_global: 0,
    });

    // Inicializar cliente_id con Consumidor Final si no hay cliente
    useEffect(() => {
        if (!clienteInfo.id) {
            setData('cliente_id', ''); // Dejar vacío para cliente genérico
        }
    }, [clienteInfo]);

    // Formatear moneda
    const formatCurrency = (amount) => {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(num);
    };

    // Actualiza la función formatDate existente (si la usas en otros lugares):
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        // Si tiene hora, mostrar ambas
        if (dateString.includes('T') || dateString.includes(' ')) {
            return date.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Solo fecha
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
};
    // Buscar productos
    const buscarProductos = async (query) => {
        if (query.length < 2) {
            setResultadosBusqueda([]);
            return;
        }

        setCargandoBusqueda(true);
        setError(null);
        try {
            const response = await axios.get(route('ventas.buscar-productos'), {
                params: { q: query }
            });
            setResultadosBusqueda(response.data);
        } catch (error) {
            console.error('Error buscando productos:', error);
            setError('Error al buscar productos. Verifica tu conexión.');
            setResultadosBusqueda([]);
        } finally {
            setCargandoBusqueda(false);
        }
    };

    // Buscar clientes
    const buscarClientes = async (query) => {
        if (query.length < 2) {
            setClientesLista([]);
            return;
        }

        try {
            const response = await axios.get(route('ventas.buscar-clientes'), { // Cambié la ruta
                params: { 
                    q: query,
                    modo: modoBusquedaCliente 
                }
            });
            setClientesLista(response.data);
        } catch (error) {
            console.error('Error buscando clientes:', error);
            setClientesLista([]);
        }
    };

    // Crear nuevo cliente
    const crearCliente = async () => {
        try {
            // Validar campos requeridos
            if (!nuevoCliente.nombre_completo.trim()) {
                alert('❌ El nombre del cliente es requerido');
                return;
            }

            const response = await axios.post(route('clientes.store.api'), nuevoCliente);
            setClienteInfo(response.data.cliente);
            setData('cliente_id', response.data.cliente.id);
            setMostrarFormCliente(false);
            setMostrarModalClientes(false);
            setNuevoCliente({
                tipo: 'FISICA',
                cedula: '',
                nombre_completo: '',
                email: '',
                telefono: '',
                direccion: ''
            });
            
            // Actualizar lista de clientes
            buscarClientes(nuevoCliente.nombre_completo);
        } catch (error) {
            console.error('Error creando cliente:', error);
            alert('Error al crear cliente: ' + (error.response?.data?.message || error.message));
        }
    };

    // Seleccionar producto
    const seleccionarProducto = (producto) => {
        if (!producto || !producto.id) {
            alert('❌ Producto no válido');
            return;
        }

        setProductoSeleccionado({
            ...producto,
            cantidad: 1,
            precio_unitario: parseFloat(producto.precio_venta) || 0,
        });
        setBusqueda('');
        setResultadosBusqueda([]);
        setMostrarResultados(false);
    };

    // Seleccionar cliente
    const seleccionarCliente = (cliente) => {
        if (!cliente || !cliente.id) {
            alert('❌ Cliente no válido');
            return;
        }

        setClienteInfo(cliente);
        setData('cliente_id', cliente.id);
        setMostrarModalClientes(false);
        setBusquedaCliente('');
        setClientesLista([]);
    };

    // Seleccionar Consumidor Final
    const seleccionarConsumidorFinal = () => {
        setClienteInfo({
            id: null,
            nombre_completo: 'Consumidor Final',
            tipo: 'FISICA',
            cedula: '000-0000000-0',
            email: '',
            telefono: '',
            direccion: ''
        });
        setData('cliente_id', ''); // Vacío para cliente genérico
        setMostrarModalClientes(false);
    };

    // Agregar producto a la lista
    const agregarProducto = () => {
        if (!productoSeleccionado || !productoSeleccionado.id) {
            alert('❌ No hay producto seleccionado');
            return;
        }

        const productoExistente = data.productos.find(
            p => p.producto_id === productoSeleccionado.id
        );

        const cantidad = parseFloat(productoSeleccionado.cantidad) || 0;
        const stockDisponible = parseFloat(productoSeleccionado.stock_disponible) || 0;

        if (cantidad <= 0) {
            alert('❌ La cantidad debe ser mayor a 0');
            return;
        }

        if (cantidad > stockDisponible) {
            alert(`⚠️ Stock insuficiente. Disponible: ${stockDisponible}`);
            return;
        }

        if (productoExistente) {
            // Actualizar cantidad si ya existe
            const nuevosProductos = data.productos.map(p => 
                p.producto_id === productoSeleccionado.id
                    ? { 
                        ...p, 
                        cantidad: (parseFloat(p.cantidad) || 0) + cantidad,
                        precio_unitario: parseFloat(productoSeleccionado.precio_venta) || 0
                    }
                    : p
            );
            setData('productos', nuevosProductos);
        } else {
            // Agregar nuevo producto
            setData('productos', [
                ...data.productos,
                {
                    producto_id: productoSeleccionado.id,
                    cantidad: cantidad,
                    precio_unitario: parseFloat(productoSeleccionado.precio_venta) || 0,
                    precio_original: parseFloat(productoSeleccionado.precio_venta) || 0,
                    nombre: productoSeleccionado.nombre || 'Producto sin nombre',
                    codigo: productoSeleccionado.codigo || '',
                    codigo_barras: productoSeleccionado.codigo_barras || '',
                    stock_disponible: stockDisponible,
                    itbis_porcentaje: parseFloat(productoSeleccionado.itbis_porcentaje) || 0,
                    descuento: 0,
                }
            ]);
        }

        setProductoSeleccionado(null);
    };

    // Eliminar producto de la lista
    const eliminarProducto = (index) => {
        if (index < 0 || index >= data.productos.length) {
            return;
        }

        const nuevosProductos = data.productos.filter((_, i) => i !== index);
        setData('productos', nuevosProductos);
        
        const nuevosDescuentos = { ...descuentoPorProducto };
        delete nuevosDescuentos[index];
        setDescuentoPorProducto(nuevosDescuentos);
    };

    // Actualizar cantidad de producto
    const actualizarCantidad = (index, cantidad) => {
        const numCantidad = parseFloat(cantidad) || 0;
        
        if (numCantidad < 0.01) {
            alert('❌ La cantidad debe ser al menos 0.01');
            return;
        }

        const nuevosProductos = [...data.productos];
        const producto = nuevosProductos[index];
        
        if (numCantidad > producto.stock_disponible) {
            alert(`⚠️ Stock insuficiente. Disponible: ${producto.stock_disponible}`);
            return;
        }

        producto.cantidad = numCantidad;
        setData('productos', nuevosProductos);
    };

    // Actualizar descuento por producto
    const actualizarDescuentoProducto = (index, descuento) => {
        const numDescuento = parseFloat(descuento) || 0;
        
        if (numDescuento < 0) return;
        if (numDescuento > 100) {
            alert('❌ El descuento no puede ser mayor al 100%');
            return;
        }
        
        const nuevosProductos = [...data.productos];
        nuevosProductos[index].descuento = numDescuento;
        setData('productos', nuevosProductos);
        
        setDescuentoPorProducto({
            ...descuentoPorProducto,
            [index]: numDescuento
        });
    };

    // Actualizar descuento global
    const actualizarDescuentoGlobal = (descuento) => {
        const numDescuento = parseFloat(descuento) || 0;
        
        if (numDescuento < 0) return;
        if (numDescuento > 100) {
            alert('❌ El descuento global no puede ser mayor al 100%');
            return;
        }
        
        setDescuentoGlobal(numDescuento);
        setData('descuento_global', numDescuento);
    };

    // Calcular totales
    const calcularTotales = () => {
        let subtotal = 0;
        let itbis = 0;
        let descuentoProductos = 0;
        let descuentoGlobalMonto = 0;

        data.productos.forEach(producto => {
            const cantidad = parseFloat(producto.cantidad) || 0;
            const precio = parseFloat(producto.precio_unitario) || 0;
            const descuentoPorcentaje = parseFloat(producto.descuento) || 0;
            const itbisPorcentaje = parseFloat(producto.itbis_porcentaje) || 0;
            
            const subtotalProducto = cantidad * precio;
            const descuentoProducto = subtotalProducto * (descuentoPorcentaje / 100);
            const subtotalConDescuento = subtotalProducto - descuentoProducto;
            const itbisProducto = subtotalConDescuento * (itbisPorcentaje / 100);
            
            subtotal += subtotalProducto;
            itbis += itbisProducto;
            descuentoProductos += descuentoProducto;
        });

        // Calcular descuento global
        const subtotalDespuesDescuentos = subtotal - descuentoProductos;
        descuentoGlobalMonto = subtotalDespuesDescuentos * (descuentoGlobal / 100);
        
        const total = (subtotal - descuentoProductos - descuentoGlobalMonto) + itbis;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            itbis: parseFloat(itbis.toFixed(2)),
            descuentoProductos: parseFloat(descuentoProductos.toFixed(2)),
            descuentoGlobal: parseFloat(descuentoGlobalMonto.toFixed(2)),
            descuentoTotal: parseFloat((descuentoProductos + descuentoGlobalMonto).toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    };

    // Función para obtener icono de tipo de pago
    const obtenerIconoTipoPago = (tipo) => {
        const tipoPago = tiposPagoDefault.find(tp => tp.key === tipo);
        if (tipoPago && tipoPago.icono) {
            return tipoPago.icono;
        }
        
        // Fallback si no se encuentra
        switch(tipo) {
            case 'EFECTIVO': return Banknote;
            case 'TARJETA_DEBITO': return CreditCard;
            case 'TARJETA_CREDITO': return CreditCard;
            case 'TRANSFERENCIA': return Landmark;
            case 'CHEQUE': return FileCheck;
            case 'PAGO_MOVIL': return Smartphone;
            default: return Banknote;
        }
    };

    // Función para obtener color de tipo de pago
    const obtenerColorTipoPago = (tipo) => {
        const tipoPago = tiposPagoDefault.find(tp => tp.key === tipo);
        if (tipoPago && tipoPago.color) {
            return tipoPago.color;
        }
        
        // Fallback si no se encuentra
        switch(tipo) {
            case 'EFECTIVO': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'TARJETA_DEBITO': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'TARJETA_CREDITO': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
            case 'TRANSFERENCIA': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
            case 'CHEQUE': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            case 'PAGO_MOVIL': return 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
        }
    };

    // Función para obtener nombre de tipo de pago
    const obtenerNombreTipoPago = (tipo) => {
        const tipoPago = tiposPagoDefault.find(tp => tp.key === tipo);
        if (tipoPago && tipoPago.nombre) {
            return tipoPago.nombre;
        }
        return tipo.replace('_', ' ');
    };

    const totales = calcularTotales();

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setProcesando(true);
        
        if (data.productos.length === 0) {
            alert('❌ Debe agregar al menos un producto');
            setProcesando(false);
            return;
        }
    
        if (!caja) {
            alert('❌ Debe tener una caja abierta para realizar ventas');
            setProcesando(false);
            return;
        }
    
        // Validar stock antes de enviar
        for (const producto of data.productos) {
            if (producto.cantidad > producto.stock_disponible) {
                alert(`❌ Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_disponible}, Solicitado: ${producto.cantidad}`);
                setProcesando(false);
                return;
            }
        }
    
        // ⬇️⬇️⬇️ DEFINIR productosParaEnviar AQUÍ ⬇️⬇️⬇️
        const productosParaEnviar = data.productos.map(producto => ({
            producto_id: producto.producto_id,
            cantidad: parseFloat(producto.cantidad) || 0,
            precio_unitario: parseFloat(producto.precio_unitario) || 0,
            descuento: parseFloat(producto.descuento) || 0,
        }));
    
        // Preparar datos del formulario
        const formDataToSend = {
            tipo_comprobante: data.tipo_comprobante,
            cliente_id: data.cliente_id || null,
            condicion_pago: data.condicion_pago,
            tipo_pago: data.tipo_pago,
            dias_credito: data.dias_credito || 0,
            fecha_venta: data.fecha_venta,
            productos: productosParaEnviar, // <-- Usar la variable definida arriba
            descuento_global: parseFloat(descuentoGlobal) || 0,
            notas: data.notas || '',
        };
    
        // Asegurar formato correcto de fecha si es necesario
        if (formDataToSend.fecha_venta && !formDataToSend.fecha_venta.includes('T')) {
            const fecha = new Date(formDataToSend.fecha_venta);
            formDataToSend.fecha_venta = fecha.toISOString().slice(0, 16);
        }
    
        try {
            const response = await axios.post(route('ventas.store'), formDataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
    
            if (response.data.success) {
                alert(`✅ ${response.data.message} Factura #${response.data.numero_factura}`);
                
                // Resetear formulario
                reset();
                setData({
                    cliente_id: '',
                    tipo_comprobante: 'FACTURA',
                    condicion_pago: 'CONTADO',
                    tipo_pago: 'EFECTIVO',
                    dias_credito: 0,
                    fecha_venta: new Date().toISOString().slice(0, 16),
                    productos: [],
                    notas: '',
                    descuento_global: 0,
                });
                setProductos([]);
                setProductoSeleccionado(null);
                setDescuentoGlobal(0);
                setDescuentoPorProducto({});
                setClienteInfo({
                    id: null,
                    nombre_completo: 'Consumidor Final',
                    tipo: 'FISICA',
                    cedula: '000-0000000-0',
                    email: '',
                    telefono: '',
                    direccion: ''
                });
                
                // Redirigir a la venta creada
                if (response.data.venta && response.data.venta.id) {
                    router.visit(route('ventas.show', response.data.venta.id));
                } else if (response.data.id) {
                    router.visit(route('ventas.show', response.data.id));
                } else {
                    router.visit(route('ventas.index'));
                }
            } else {
                setError(response.data.message || 'Error al procesar la venta');
                alert(`❌ ${response.data.message || 'Error al procesar la venta'}`);
            }
            
            setProcesando(false);
            
        } catch (error) {
            setProcesando(false);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error ||
                                   'Error al procesar la venta';
                setError(errorMessage);
                alert(`❌ ${errorMessage}`);
            } else if (error.request) {
                setError('No se recibió respuesta del servidor. Verifica tu conexión.');
                alert('❌ No se recibió respuesta del servidor');
            } else {
                setError('Error al configurar la petición: ' + error.message);
                alert('❌ Error de configuración: ' + error.message);
            }
        }
    };
    // Agrega esta función en tu Create.jsx:
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    try {
        const date = new Date(dateTimeString);
        
        // Formato: "16/01/2024, 14:30:00"
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
};
    // Efecto para buscar productos
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (busqueda) {
                buscarProductos(busqueda);
            } else {
                setResultadosBusqueda([]);
                setMostrarResultados(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [busqueda]);

    // Efecto para buscar clientes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (busquedaCliente) {
                buscarClientes(busquedaCliente);
            } else {
                setClientesLista([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [busquedaCliente, modoBusquedaCliente]);

    // Cerrar resultados al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
                setMostrarResultados(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Aplicar estilo para el z-index del buscador
    useEffect(() => {
        if (mostrarResultados) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mostrarResultados]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <ShoppingCart className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                                Nueva Venta
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(data.fecha_venta)}
                                </div>
                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <FileText className="w-4 h-4 mr-1" />
                                    {data.tipo_comprobante}
                                </div>
                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <CreditCard className="w-4 h-4 mr-1" />
                                    {data.condicion_pago}
                                </div>
                                <span className="text-gray-400 dark:text-gray-600">•</span>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    {(() => {
                                        const Icon = obtenerIconoTipoPago(data.tipo_pago);
                                        return <Icon className="w-4 h-4 mr-1" />;
                                    })()}
                                    <span>{obtenerNombreTipoPago(data.tipo_pago)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 px-4 py-2 rounded-xl">
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                                <span className="font-bold text-green-700 dark:text-green-300">
                                    {formatCurrency(caja?.efectivo || 0)}
                                </span>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Efectivo en caja</p>
                        </div>
                        <Link
                            href={route('caja.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Nueva Venta" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Alertas de error */}
                    {error && (
                        <div className="mb-6">
                            <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-r-xl">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                                    <div>
                                        <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alertas de caja cerrada */}
                    {!caja && (
                        <div className="mb-6 animate-pulse">
                            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-r-xl shadow-sm">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-800 dark:text-red-200">Caja cerrada</h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                            Debes abrir caja para registrar ventas. No podrás procesar ninguna transacción sin caja abierta.
                                        </p>
                                        <div className="mt-3">
                                            <Link
                                                href={route('caja.create')}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Abrir caja ahora
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Panel izquierdo: Información de cliente y venta (4 columnas) */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Tarjeta de información del cliente */}
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Cliente</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Información del comprador</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setMostrarModalClientes(true)}
                                                className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-800 transition text-sm font-medium"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Cambiar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 rounded-xl mr-4">
                                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                                                        {clienteInfo.nombre_completo}
                                                    </h4>
                                                    <div className="flex items-center mt-2 space-x-4">
                                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                                            {clienteInfo.tipo}
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {clienteInfo.cedula}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {clienteInfo.email && (
                                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" />
                                                        <span>{clienteInfo.email}</span>
                                                    </div>
                                                )}
                                                {clienteInfo.telefono && (
                                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" />
                                                        <span>{clienteInfo.telefono}</span>
                                                    </div>
                                                )}
                                                {clienteInfo.direccion && (
                                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3" />
                                                        <span className="truncate">{clienteInfo.direccion}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuración de la venta */}
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                                        <div className="flex items-center">
                                            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                                                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Configuración</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Parámetros de la venta</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Tipo de comprobante */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                                Tipo de Comprobante
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {tiposComprobante && tiposComprobante.map((tipo) => (
                                                    <button
                                                        key={tipo}
                                                        type="button"
                                                        onClick={() => setData('tipo_comprobante', tipo)}
                                                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                                            data.tipo_comprobante === tipo
                                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shadow-sm'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        <div className="text-sm font-medium">
                                                            {tipo.replace('_', ' ')}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Fecha de venta - actualizar a datetime-local */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                                Fecha y Hora de Venta
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition"
                                                    value={data.fecha_venta}
                                                    onChange={(e) => setData('fecha_venta', e.target.value)}
                                                    required
                                                />
                                                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        </div>

                                        {/* Condición de pago */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                <CreditCard className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                                Condición de Pago
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {condicionesPago && condicionesPago.map((condicion) => (
                                                    <button
                                                        key={condicion}
                                                        type="button"
                                                        onClick={() => {
                                                            setData('condicion_pago', condicion);
                                                            if (condicion === 'CONTADO') {
                                                                setData('dias_credito', 0);
                                                                setData('tipo_pago', 'EFECTIVO');
                                                            } else {
                                                                setData('tipo_pago', 'CREDITO');
                                                            }
                                                        }}
                                                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                                            data.condicion_pago === condicion
                                                                ? condicion === 'CREDITO'
                                                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-300 shadow-sm'
                                                                    : 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-sm'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        <div className="text-sm font-medium">{condicion}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* TIPO DE PAGO - NUEVA SECCIÓN */}
                                        {data.condicion_pago === 'CONTADO' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                    <Banknote className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                                    Tipo de Pago
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {tiposPagoDefault.map((tipoPago) => {
                                                        const Icon = tipoPago.icono;
                                                        return (
                                                            <button
                                                                key={tipoPago.key}
                                                                type="button"
                                                                onClick={() => setData('tipo_pago', tipoPago.key)}
                                                                className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                                                                    data.tipo_pago === tipoPago.key
                                                                        ? tipoPago.key === 'EFECTIVO'
                                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-sm'
                                                                            : tipoPago.key === 'TARJETA_DEBITO'
                                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm'
                                                                            : tipoPago.key === 'TARJETA_CREDITO'
                                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shadow-sm'
                                                                            : tipoPago.key === 'TRANSFERENCIA'
                                                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-300 shadow-sm'
                                                                            : tipoPago.key === 'CHEQUE'
                                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 shadow-sm'
                                                                            : 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 shadow-sm'
                                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                <Icon className="w-4 h-4 mr-2" />
                                                                <div className="text-sm font-medium">{tipoPago.nombre}</div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {data.condicion_pago === 'CREDITO' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                                                    Días de Crédito
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-4 py-3 pl-11 border-2 border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition"
                                                        value={data.dias_credito}
                                                        onChange={(e) => setData('dias_credito', parseInt(e.target.value) || 0)}
                                                        required
                                                    />
                                                    <Clock className="absolute left-3 top-3.5 w-5 h-5 text-amber-400 dark:text-amber-500" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Notas */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                                Notas (Opcional)
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition"
                                                rows="3"
                                                value={data.notas}
                                                onChange={(e) => setData('notas', e.target.value)}
                                                placeholder="Observaciones adicionales de la venta..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel central: Productos (5 columnas) */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Buscador de productos */}
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-0 z-40">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg mr-3">
                                                    <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Buscar Productos</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Agrega productos a la venta</p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {data.productos.length} productos
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="relative" ref={buscadorRef}>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition text-lg"
                                                    placeholder="🔍 Buscar por nombre, código o código de barras..."
                                                    value={busqueda}
                                                    onChange={(e) => {
                                                        setBusqueda(e.target.value);
                                                        setMostrarResultados(true);
                                                    }}
                                                    onFocus={() => setMostrarResultados(true)}
                                                />
                                                <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                
                                                {cargandoBusqueda && (
                                                    <RefreshCw className="absolute right-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
                                                )}
                                                
                                                {!cargandoBusqueda && busqueda && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setBusqueda('');
                                                            setResultadosBusqueda([]);
                                                        }}
                                                        className="absolute right-12 top-4 w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Producto seleccionado */}
                                        {productoSeleccionado && (
                                            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900 dark:to-green-800 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 animate-fadeIn">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-start">
                                                        <div className="bg-green-200 dark:bg-green-700 p-3 rounded-xl mr-4">
                                                            <PackageCheck className="w-6 h-6 text-green-700 dark:text-green-300" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                                                                {productoSeleccionado.nombre}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded">
                                                                    {productoSeleccionado.codigo}
                                                                </span>
                                                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">
                                                                    Stock: {productoSeleccionado.stock_disponible}
                                                                </span>
                                                                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded">
                                                                    ITBIS {productoSeleccionado.itbis_porcentaje}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={agregarProducto}
                                                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-md hover:shadow-lg"
                                                    >
                                                        <Plus className="w-5 h-5 mr-2" />
                                                        Agregar
                                                    </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                            <Calculator className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                                            Cantidad
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                max={productoSeleccionado.stock_disponible}
                                                                className="w-full px-4 py-3 pl-11 border-2 border-green-200 dark:border-green-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition"
                                                                value={productoSeleccionado.cantidad}
                                                                onChange={(e) => setProductoSeleccionado({
                                                                    ...productoSeleccionado,
                                                                    cantidad: parseFloat(e.target.value) || 0
                                                                })}
                                                            />
                                                            <Package className="absolute left-3 top-3.5 w-5 h-5 text-green-500 dark:text-green-400" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                            <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                                            Precio Unitario
                                                        </label>
                                                        <div className="relative">
                                                            <div className="flex items-center justify-center h-full pl-3">
                                                                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                                                                    {formatCurrency(productoSeleccionado.precio_venta)}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                                                                Precio fijo del producto
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resultados de búsqueda - FUERA DEL CARD */}
                                {mostrarResultados && (
                                    <div className="relative" ref={buscadorRef}>
                                        {/* Resultados de búsqueda */}
                                        {resultadosBusqueda.length > 0 && (
                                            <div className="absolute z-[9999] w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                                                {resultadosBusqueda.map((producto) => (
                                                    <div
                                                        key={producto.id}
                                                        className="px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            seleccionarProducto(producto);
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center">
                                                                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg mr-3">
                                                                    <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-800 dark:group-hover:text-green-300">
                                                                        {producto.nombre}
                                                                    </p>
                                                                    <div className="flex items-center mt-1 space-x-3">
                                                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                                            {producto.codigo}
                                                                        </span>
                                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                                            producto.stock_disponible > 10 
                                                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                                                : producto.stock_disponible > 0
                                                                                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                                        }`}>
                                                                            Stock: {producto.stock_disponible}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-green-700 dark:text-green-400">
                                                                    {formatCurrency(producto.precio_venta)}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    +ITBIS {producto.itbis_porcentaje}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Mensaje de no resultados */}
                                        {mostrarResultados && busqueda.length >= 2 && resultadosBusqueda.length === 0 && !cargandoBusqueda && (
                                            <div 
                                                className="absolute z-[9999] w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="text-center py-3">
                                                    <Package className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                    <p className="text-gray-600 dark:text-gray-400">No se encontraron productos</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Intenta con otros términos de búsqueda
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Lista de productos en la venta */}
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
                                                    <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Productos en la Venta</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {data.productos.length} productos agregados
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                Total: {formatCurrency(totales.total)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {data.productos.length > 0 ? (
                                        <div className="overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                                            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Producto</th>
                                                            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cantidad</th>
                                                            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Precio</th>
                                                            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Descuento %</th>
                                                            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Subtotal</th>
                                                            <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.productos.map((producto, index) => {
                                                            const cantidad = parseFloat(producto.cantidad) || 0;
                                                            const precio = parseFloat(producto.precio_unitario) || 0;
                                                            const descuentoPorcentaje = parseFloat(producto.descuento) || 0;
                                                            const itbisPorcentaje = parseFloat(producto.itbis_porcentaje) || 0;
                                                            
                                                            const subtotal = cantidad * precio;
                                                            const descuentoProducto = subtotal * (descuentoPorcentaje / 100);
                                                            const subtotalConDescuento = subtotal - descuentoProducto;
                                                            const itbis = subtotalConDescuento * (itbisPorcentaje / 100);
                                                            const total = subtotalConDescuento + itbis;
                                                            
                                                            return (
                                                                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                                    <td className="py-4 px-4">
                                                                        <div className="flex items-start">
                                                                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-2 rounded-lg mr-3">
                                                                                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-gray-800 dark:text-gray-200">{producto.nombre}</p>
                                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                                                        {producto.codigo}
                                                                                    </span>
                                                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                                                                                        ITBIS {producto.itbis_porcentaje}%
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-4">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0.01"
                                                                                max={producto.stock_disponible}
                                                                                className="w-24 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition text-center"
                                                                                value={producto.cantidad}
                                                                                onChange={(e) => actualizarCantidad(index, e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-4">
                                                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                                                            {formatCurrency(producto.precio_unitario)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Precio fijo
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-4">
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                max="100"
                                                                                className="w-20 px-3 py-2 border-2 border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition text-center"
                                                                                value={producto.descuento || 0}
                                                                                onChange={(e) => actualizarDescuentoProducto(index, e.target.value)}
                                                                                placeholder="0%"
                                                                            />
                                                                            <span className="ml-1 text-gray-600 dark:text-gray-400">%</span>
                                                                        </div>
                                                                        {descuentoProducto > 0 && (
                                                                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                                -{formatCurrency(descuentoProducto)}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-4">
                                                                        <div>
                                                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                                                {formatCurrency(total)}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {descuentoProducto > 0 && (
                                                                                    <span className="text-red-600 dark:text-red-400">
                                                                                        -{formatCurrency(descuentoProducto)} desc.
                                                                                    </span>
                                                                                )}
                                                                                {descuentoProducto > 0 && <br />}
                                                                                +ITBIS {formatCurrency(itbis)}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-4">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => eliminarProducto(index)}
                                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition"
                                                                            title="Eliminar producto"
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
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="mb-4">
                                                <div className="relative mx-auto w-16 h-16">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl opacity-50"></div>
                                                    <Package className="relative w-8 h-8 mx-auto mt-4 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">No hay productos agregados</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                Busca y agrega productos usando el buscador superior
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel derecho: Resumen y acciones (3 columnas) */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Resumen de la venta */}
                                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-6">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                                        <div className="flex items-center">
                                            <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-lg mr-3">
                                                <FileBarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Resumen</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Totales de la venta</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Información del tipo de pago */}
                                        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 rounded-xl">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-lg ${obtenerColorTipoPago(data.tipo_pago).split(' ')[0]} ${obtenerColorTipoPago(data.tipo_pago).split(' ')[1]}`}>
                                                    {(() => {
                                                        const Icon = obtenerIconoTipoPago(data.tipo_pago);
                                                        return <Icon className="w-4 h-4" />;
                                                    })()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de pago</div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{obtenerNombreTipoPago(data.tipo_pago)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(totales.subtotal)}
                                                </span>
                                            </div>
                                            
                                            {/* Descuento por productos */}
                                            {totales.descuentoProductos > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Descuento productos</span>
                                                    <span className="font-medium text-red-600 dark:text-red-400">
                                                        -{formatCurrency(totales.descuentoProductos)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Descuento global */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-600 dark:text-gray-400">Descuento global</span>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm"
                                                            value={descuentoGlobal}
                                                            onChange={(e) => actualizarDescuentoGlobal(e.target.value)}
                                                            placeholder="0%"
                                                        />
                                                        <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">%</span>
                                                    </div>
                                                </div>
                                                <span className="font-medium text-red-600 dark:text-red-400">
                                                    -{formatCurrency(totales.descuentoGlobal)}
                                                </span>
                                            </div>
                                            
                                            {/* Subtotal después de descuentos */}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Subtotal con descuentos</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(totales.subtotal - totales.descuentoTotal)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">ITBIS</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(totales.itbis)}
                                                </span>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Total</span>
                                                    <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                                        {formatCurrency(totales.total)}
                                                    </span>
                                                </div>
                                                {totales.descuentoTotal > 0 && (
                                                    <div className="text-sm text-green-600 dark:text-green-400 mt-2 text-right">
                                                        Ahorro total: {formatCurrency(totales.descuentoTotal)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Información adicional */}
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <div className="space-y-3">
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <Shield className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                                    <span>Venta garantizada</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <Truck className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                    <span>Entrega inmediata</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <FileCheck className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                                    <span>Factura electrónica</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                        <div className="space-y-3">
                                        <button
                                                type="submit"
                                                disabled={procesando || data.productos.length === 0 || !caja}
                                                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                                            >
                                                {procesando ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 mr-3" />
                                                        <div className="text-left">
                                                            <div className="font-bold">Finalizar Venta</div>
                                                            <div className="text-xs opacity-90">Procesar transacción</div>
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                            
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (data.productos.length > 0 && confirm('¿Está seguro de limpiar todos los productos de la venta?')) {
                                                        setData('productos', []);
                                                        setDescuentoGlobal(0);
                                                        setDescuentoPorProducto({});
                                                        setProductoSeleccionado(null);
                                                    }
                                                }}
                                                disabled={data.productos.length === 0}
                                                className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RotateCcw className="w-5 h-5 mr-3" />
                                                <div className="text-left">
                                                    <div className="font-medium">Limpiar todo</div>
                                                </div>
                                            </button>
                                            
                                            <Link
                                                href={route('caja.index')}
                                                className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                            >
                                                <ArrowLeft className="w-5 h-5 mr-3" />
                                                <div className="text-left">
                                                    <div className="font-medium">Cancelar</div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de la caja */}
                                {caja && (
                                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
                                                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Estado de Caja</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Información actual</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Monto inicial</span>
                                                    <span className="font-medium text-green-700 dark:text-green-400">
                                                        {formatCurrency(caja.monto_inicial || 0)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Efectivo actual</span>
                                                    <span className="font-bold text-blue-700 dark:text-blue-400">
                                                        {formatCurrency(caja.efectivo || 0)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Nueva venta</span>
                                                    <span className="font-bold text-purple-700 dark:text-purple-400">
                                                        +{formatCurrency(totales.total)}
                                                    </span>
                                                </div>
                                                
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-gray-800 dark:text-gray-200">Total después</span>
                                                        <span className="text-xl font-bold text-green-700 dark:text-green-400">
                                                            {formatCurrency((parseFloat(caja.efectivo) || 0) + (parseFloat(totales.total) || 0))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de selección de cliente */}
            {mostrarModalClientes && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Seleccionar Cliente</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Busca o crea un nuevo cliente</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMostrarModalClientes(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                                >
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Botón para Consumidor Final */}
                            <div className="mb-6">
                                <button
                                    onClick={seleccionarConsumidorFinal}
                                    className="w-full inline-flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-2 rounded-lg mr-4">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Consumidor Final</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Cliente genérico para ventas rápidas</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </button>
                            </div>

                            {/* Buscador de clientes */}
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                            placeholder="Buscar cliente por nombre, cédula o email..."
                                            value={busquedaCliente}
                                            onChange={(e) => setBusquedaCliente(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <select
                                        className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                                        value={modoBusquedaCliente}
                                        onChange={(e) => setModoBusquedaCliente(e.target.value)}
                                    >
                                        <option value="nombre">Por Nombre</option>
                                        <option value="cedula">Por Cédula</option>
                                        <option value="email">Por Email</option>
                                    </select>
                                </div>
                                
                                {/* Botón para crear nuevo cliente */}
                                <button
                                    onClick={() => setMostrarFormCliente(!mostrarFormCliente)}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition mb-6"
                                >
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    {mostrarFormCliente ? 'Cancelar creación' : 'Crear nuevo cliente'}
                                </button>
                            </div>

                            {/* Formulario para nuevo cliente */}
                            {mostrarFormCliente && (
                                <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                        <UserPlus className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                                        Nuevo Cliente
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                                                value={nuevoCliente.tipo}
                                                onChange={(e) => setNuevoCliente({...nuevoCliente, tipo: e.target.value})}
                                            >
                                                <option value="FISICA">Persona Física</option>
                                                <option value="JURIDICA">Persona Jurídica</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cédula/RNC</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                                                placeholder="000-0000000-0"
                                                value={nuevoCliente.cedula}
                                                onChange={(e) => setNuevoCliente({...nuevoCliente, cedula: e.target.value})}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                                                placeholder="Nombre del cliente"
                                                value={nuevoCliente.nombre_completo}
                                                onChange={(e) => setNuevoCliente({...nuevoCliente, nombre_completo: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                                                placeholder="email@ejemplo.com"
                                                value={nuevoCliente.email}
                                                onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                            <input
                                                type="tel"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                                                placeholder="(809) 000-0000"
                                                value={nuevoCliente.telefono}
                                                onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                                                rows="2"
                                                placeholder="Dirección completa"
                                                value={nuevoCliente.direccion}
                                                onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={crearCliente}
                                            className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition"
                                        >
                                            <Save className="w-5 h-5 mr-2" />
                                            Guardar Cliente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Lista de clientes */}
                            <div className="max-h-96 overflow-y-auto">
                                {clientesLista.length > 0 ? (
                                    <div className="space-y-3">
                                        {clientesLista.map((cliente) => (
                                            <div
                                                key={cliente.id}
                                                onClick={() => seleccionarCliente(cliente)}
                                                className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start">
                                                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-2 rounded-lg mr-4">
                                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{cliente.nombre_completo}</h4>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                                    {cliente.cedula}
                                                                </span>
                                                                {cliente.email && (
                                                                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                                                        {cliente.email}
                                                                    </span>
                                                                )}
                                                                <span className={`text-xs px-2 py-1 rounded ${
                                                                    cliente.tipo === 'FISICA' 
                                                                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                                                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                                                }`}>
                                                                    {cliente.tipo}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : busquedaCliente ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">No se encontraron clientes</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Intenta con otros términos de búsqueda
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">Comienza a buscar clientes</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Escribe el nombre, cédula o email del cliente
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <button
                                onClick={() => setMostrarModalClientes(false)}
                                className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}