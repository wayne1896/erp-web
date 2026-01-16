<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PRIMERO: Crear la tabla pedidos con TODOS los campos
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_pedido')->unique();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('sucursal_id')->constrained('sucursales');
            $table->foreignId('user_id')->constrained('users');
            $table->date('fecha_pedido');
            $table->date('fecha_entrega')->nullable();
            $table->enum('estado', ['PENDIENTE', 'PROCESADO', 'ENTREGADO', 'CANCELADO'])->default('PENDIENTE');
            $table->decimal('total', 15, 2);
            $table->text('notas')->nullable();
            
            // Campos de prioridad y tipo
            $table->enum('prioridad', ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])->default('MEDIA');
            $table->enum('tipo_pedido', ['LOCAL', 'DOMICILIO', 'RESERVA', 'PREVENTA'])->default('LOCAL');
            
            // Campos de pago
            $table->enum('condicion_pago', ['CONTADO', 'CREDITO', 'MIXTO'])->default('CONTADO');
            $table->decimal('anticipo', 15, 2)->default(0);
            $table->decimal('saldo_pendiente', 15, 2)->default(0);
            
            // Campos de seguimiento
            $table->foreignId('vendedor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('repartidor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('codigo_seguimiento')->nullable()->unique();
            $table->timestamp('fecha_procesado')->nullable();
            $table->timestamp('fecha_entregado')->nullable();
            $table->timestamp('fecha_cancelado')->nullable();
            
            // Motivos
            $table->text('motivo_cancelacion')->nullable();
            $table->foreignId('cancelado_por')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            
            // Index para búsquedas rápidas (al final)
            $table->index(['estado', 'fecha_entrega']);
            $table->index(['cliente_id', 'fecha_pedido']);
            $table->index(['sucursal_id', 'estado']);
        });

        // SEGUNDO: Crear tablas relacionadas (dependen de pedidos)
        Schema::create('detalle_pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad_solicitada', 15, 2);
            $table->decimal('cantidad_entregada', 15, 2)->default(0);
            $table->decimal('precio_unitario', 15, 2);
            $table->decimal('descuento', 15, 2)->default(0);
            $table->decimal('descuento_monto', 15, 2)->default(0); // Agregar para consistencia con ventas
            $table->decimal('subtotal', 15, 2);
            $table->decimal('itbis_porcentaje', 5, 2)->default(18.00);
            $table->decimal('itbis_monto', 15, 2);
            $table->decimal('total', 15, 2);
            
            // Para seguimiento de inventario
            $table->boolean('reservado_stock')->default(false);
            $table->foreignId('inventario_sucursal_id')->nullable()->constrained('inventario_sucursal')->onDelete('set null');
            
            // Campos adicionales útiles
            $table->decimal('precio_original', 15, 2)->nullable(); // Precio sin descuento
            $table->decimal('costo_unitario', 15, 2)->nullable(); // Para análisis de margen
            $table->text('observaciones')->nullable();
            
            $table->timestamps();
            
            // Índices para mejor performance
            $table->index(['pedido_id', 'producto_id']);
            $table->index(['reservado_stock']);
        });

        Schema::create('log_pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('accion', [
                'CREACION', 
                'ACTUALIZACION', 
                'CANCELACION', 
                'PROCESAMIENTO', 
                'ENTREGA_PARCIAL', 
                'ENTREGA_COMPLETA',
                'DEVOLUCION',
                'PAGO_REGISTRADO',
                'ESTADO_CAMBIADO'
            ]);
            $table->text('descripcion')->nullable();
            $table->json('datos_anteriores')->nullable();
            $table->json('datos_nuevos')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['pedido_id', 'created_at']);
            $table->index(['user_id', 'accion']);
        });

        Schema::create('direcciones_entrega', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->string('nombre_contacto');
            $table->string('telefono_contacto');
            $table->string('direccion');
            $table->string('ciudad');
            $table->string('provincia');
            $table->string('sector')->nullable(); // Agregar sector (común en RD)
            $table->string('codigo_postal')->nullable();
            $table->text('instrucciones_entrega')->nullable();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->timestamps();
            
            $table->unique(['pedido_id']); // Un pedido solo puede tener una dirección
        });

        Schema::create('pagos_pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->string('numero_referencia')->nullable()->unique();
            $table->decimal('monto', 15, 2);
            $table->enum('tipo', ['ANTICIPO', 'ABONO', 'LIQUIDACION', 'DEVOLUCION']);
            $table->enum('metodo_pago', ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'DEPOSITO', 'OTRO']);
            $table->string('banco')->nullable(); // Para transferencias/depósitos
            $table->string('numero_cheque')->nullable(); // Para cheques
            $table->string('ultimos_digitos_tarjeta', 4)->nullable(); // Para tarjetas
            $table->string('autorizacion')->nullable(); // Número de autorización
            $table->date('fecha_pago');
            $table->enum('estado', ['PENDIENTE', 'CONFIRMADO', 'RECHAZADO', 'ANULADO'])->default('CONFIRMADO');
            $table->text('observaciones')->nullable();
            $table->foreignId('caja_id')->nullable()->constrained('cajas')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
            
            $table->index(['pedido_id', 'estado']);
            $table->index(['fecha_pago', 'tipo']);
        });

        Schema::create('pedido_venta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->foreignId('venta_id')->constrained('ventas')->onDelete('cascade');
            $table->enum('tipo_conversion', ['COMPLETO', 'PARCIAL'])->default('COMPLETO');
            $table->decimal('porcentaje_convertido', 5, 2)->default(100); // 100% para completo
            $table->timestamps();
            
            $table->unique(['pedido_id', 'venta_id']);
            $table->index(['venta_id', 'pedido_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // IMPORTANTE: Revertir en orden inverso (primero las dependientes)
        Schema::dropIfExists('pedido_venta');
        Schema::dropIfExists('pagos_pedidos');
        Schema::dropIfExists('direcciones_entrega');
        Schema::dropIfExists('log_pedidos');
        Schema::dropIfExists('detalle_pedidos');
        Schema::dropIfExists('pedidos');
    }
};