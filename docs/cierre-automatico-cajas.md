# Sistema de Cierre Automático de Cajas

## Descripción
El sistema cierra automáticamente todas las cajas abiertas al finalizar cada día a las 23:59 horas.

## Funcionamiento

### 1. Tarea Programada (Scheduler)
- **Archivo**: `app/Console/Kernel.php`
- **Ejecución**: Todos los días a las 23:59 (11:59 PM)
- **Comando**: `php artisan caja:cerrar-diarias`

### 2. Comando de Cierre
- **Archivo**: `app/Console/Commands/CerrarCajasDiarias.php`
- **Función**: Cierra todas las cajas que quedaron abiertas

### 3. Proceso de Cierre
Para cada caja abierta, el sistema:

1. **Calcula totales del día**:
   - Suma todas las ventas (movimientos tipo INGRESO)
   - Suma otros ingresos adicionales
   - Suma todos los egresos

2. **Calcula efectivo final**:
   ```
   Efectivo Final = Monto Inicial + Ventas + Ingresos - Egresos
   ```

3. **Actualiza la caja**:
   - Cambia estado a 'cerrada'
   - Registra fecha y hora de cierre
   - Guarda el efectivo final calculado

4. **Crea movimiento de registro**:
   - Tipo: 'CIERRE'
   - Descripción: "Cierre automático de caja al finalizar el día"
   - Observaciones: "Cierre automático programado"

### 4. Manejo de Errores
- Si una caja falla al cerrarse, se registra en los logs
- El proceso continúa con las demás cajas
- Al final se muestra un resumen de éxitos y errores

## Características

### ✅ Ventajas
- **Automatización**: No requiere intervención manual
- **Seguridad**: Evita cajas abiertas indefinidamente
- **Control**: Registro completo de todas las operaciones
- **Respaldo**: Transacciones con rollback en caso de error

### 📋 Logs
Todos los errores se registran en:
- Logs de Laravel (`storage/logs/laravel.log`)
- Consola del comando

### 🔧 Mantenimiento
- **Revisión manual**: Se puede ejecutar el comando manualmente para pruebas
- **Monitoreo**: Revisar logs diariamente para detectar problemas
- **Validación**: Verificar que todas las cajas cierren correctamente

## Ejecución Manual

Para probar o ejecutar manualmente:

```bash
php artisan caja:cerrar-diarias
```

## Configuración

Para cambiar la hora de ejecución, modificar en `app/Console/Kernel.php`:

```php
// Ejecutar a las 00:00 (medianoche)
$schedule->command('caja:cerrar-diarias')->dailyAt('00:00');

// Ejecutar cada 6 horas
$schedule->command('caja:cerrar-diarias')->cron('0 */6 * * *');
```

## Notas Importantes

1. **Requisito**: El scheduler de Laravel debe estar configurado en el servidor
2. **Usuario sistema**: Los cierres automáticos se registran con user_id = 1
3. **Zona horaria**: Usa la configuración de timezone del archivo `config/app.php`
4. **Base de datos**: Requiere que las tablas `cajas` y `movimientos_caja` existan
