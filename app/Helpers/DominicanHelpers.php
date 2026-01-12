<?php

namespace App\Helpers;

class DominicanHelpers
{
    /**
     * Formatear RNC: 1-30-12345-9
     *
     * @param string $rnc
     * @return string
     */
    public static function formatRNC($rnc)
    {
        // Eliminar guiones y espacios
        $rnc = preg_replace('/[-\s]/', '', $rnc);
        
        if (strlen($rnc) == 9) {
            return substr($rnc, 0, 1) . '-' . substr($rnc, 1, 2) . '-' . substr($rnc, 3, 5) . '-' . substr($rnc, 8, 1);
        }
        return $rnc;
    }

    /**
     * Formatear cédula: 001-1234567-9
     *
     * @param string $cedula
     * @return string
     */
    public static function formatCedula($cedula)
    {
        // Eliminar guiones y espacios
        $cedula = preg_replace('/[-\s]/', '', $cedula);
        
        if (strlen($cedula) == 11) {
            return substr($cedula, 0, 3) . '-' . substr($cedula, 3, 7) . '-' . substr($cedula, 10, 1);
        }
        return $cedula;
    }

    /**
     * Validar cédula dominicana
     *
     * @param string $cedula
     * @return bool
     */
    public static function validarCedula($cedula)
    {
        // Eliminar guiones y espacios
        $cedula = preg_replace('/[-\s]/', '', $cedula);
        
        // Debe tener 11 dígitos
        if (strlen($cedula) !== 11 || !ctype_digit($cedula)) {
            return false;
        }
        
        // Validar algoritmo de verificación de cédula dominicana
        $suma = 0;
        $multiplicadores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
        
        for ($i = 0; $i < 10; $i++) {
            $resultado = (int)$cedula[$i] * $multiplicadores[$i];
            if ($resultado > 9) {
                $resultado = (int)($resultado / 10) + ($resultado % 10);
            }
            $suma += $resultado;
        }
        
        $digitoVerificador = (10 - ($suma % 10)) % 10;
        
        return $digitoVerificador === (int)$cedula[10];
    }

    /**
     * Formatear teléfono dominicano
     *
     * @param string $telefono
     * @return string
     */
    public static function formatearTelefono($telefono)
    {
        // Eliminar espacios, guiones y paréntesis
        $telefono = preg_replace('/[\s\-\(\)\+]/', '', $telefono);
        
        // Si tiene código de país, removerlo
        if (strpos($telefono, '1') === 0 && strlen($telefono) === 11) {
            $telefono = substr($telefono, 1);
        }
        
        if (strlen($telefono) === 10) {
            return '(' . substr($telefono, 0, 3) . ') ' . substr($telefono, 3, 3) . '-' . substr($telefono, 6, 4);
        }
        
        return $telefono;
    }

    /**
     * Validar teléfono dominicano
     *
     * @param string $telefono
     * @return bool
     */
    public static function validarTelefono($telefono)
    {
        // Eliminar espacios, guiones y paréntesis
        $telefono = preg_replace('/[\s\-\(\)]/', '', $telefono);

        // Debe tener 10 dígitos y comenzar con 809, 829 o 849
        if (strlen($telefono) === 10 && preg_match('/^(809|829|849)\d{7}$/', $telefono)) {
            return true;
        }

        // También acepta formato internacional +1
        if (preg_match('/^\+1(809|829|849)\d{7}$/', $telefono)) {
            return true;
        }

        return false;
    }

    /**
     * Calcular ITBIS
     *
     * @param float $monto
     * @param string $tasa
     * @return float
     */
    public static function calcularITBIS($monto, $tasa = 'ITBIS1')
    {
        $tasas = [
            'ITBIS1' => 0.18, // 18% General
            'ITBIS2' => 0.16, // 16% Turismo
            'ITBIS3' => 0.00, // 0% Selectivos
            'EXENTO' => 0.00,
        ];
        
        return $monto * ($tasas[$tasa] ?? 0.18);
    }

    /**
     * Obtener porcentaje de ITBIS por código
     *
     * @param string $tasa
     * @return float
     */
    public static function getPorcentajeITBIS($tasa = 'ITBIS1')
    {
        $tasas = [
            'ITBIS1' => 18.00,
            'ITBIS2' => 16.00,
            'ITBIS3' => 0.00,
            'EXENTO' => 0.00,
        ];
        
        return $tasas[$tasa] ?? 18.00;
    }

    /**
     * Generar NCF: B01 000 0000001
     *
     * @param string $tipo
     * @param int $secuencia
     * @return string
     */
    public static function generarNCF($tipo = 'B01', $secuencia)
    {
        return $tipo . str_pad($secuencia, 10, '0', STR_PAD_LEFT);
    }

    /**
     * Formatear moneda dominicana
     *
     * @param float $monto
     * @param int $decimales
     * @return string
     */
    public static function formatearMoneda($monto, $decimales = 2)
    {
        return 'RD$ ' . number_format($monto, $decimales, '.', ',');
    }

    /**
     * Parsear moneda a float
     *
     * @param string $monto
     * @return float
     */
    public static function parsearMoneda($monto)
    {
        // Remover símbolos y espacios
        $monto = preg_replace('/[RD$\s,]/', '', $monto);
        return (float) $monto;
    }

    /**
     * Obtener todas las provincias de República Dominicana
     *
     * @return array
     */
    public static function getProvincias()
    {
        return [
            '01' => 'Distrito Nacional',
            '02' => 'Azua',
            '03' => 'Baoruco',
            '04' => 'Barahona',
            '05' => 'Dajabón',
            '06' => 'Duarte',
            '07' => 'Elías Piña',
            '08' => 'Espaillat',
            '09' => 'Hato Mayor',
            '10' => 'Independencia',
            '11' => 'La Altagracia',
            '12' => 'La Romana',
            '13' => 'La Vega',
            '14' => 'María Trinidad Sánchez',
            '15' => 'Monte Cristi',
            '16' => 'Pedernales',
            '17' => 'Peravia',
            '18' => 'Puerto Plata',
            '19' => 'Hermanas Mirabal',
            '20' => 'Samaná',
            '21' => 'San Cristóbal',
            '22' => 'San Juan',
            '23' => 'San Pedro de Macorís',
            '24' => 'Sánchez Ramírez',
            '25' => 'Santiago',
            '26' => 'Santiago Rodríguez',
            '27' => 'Valverde',
            '28' => 'Monseñor Nouel',
            '29' => 'Monte Plata',
            '30' => 'San José de Ocoa',
            '31' => 'Santo Domingo',
        ];
    }

    /**
     * Obtener nombre de provincia por código
     *
     * @param string $codigo
     * @return string|null
     */
    public static function getProvinciaPorCodigo($codigo)
    {
        $provincias = self::getProvincias();
        return $provincias[$codigo] ?? null;
    }

    /**
     * Obtener unidades de medida comunes en RD
     *
     * @return array
     */
    public static function getUnidadesMedida()
    {
        return [
            'UNIDAD' => 'Unidad',
            'PAR' => 'Par',
            'JUEGO' => 'Juego',
            'KILOGRAMO' => 'Kilogramo',
            'GRAMO' => 'Gramo',
            'LIBRA' => 'Libra',
            'ONZA' => 'Onza',
            'LITRO' => 'Litro',
            'MILILITRO' => 'Mililitro',
            'GALON' => 'Galón',
            'METRO' => 'Metro',
            'CENTIMETRO' => 'Centímetro',
            'PULGADA' => 'Pulgada',
            'CAJA' => 'Caja',
            'PAQUETE' => 'Paquete',
            'ROLLO' => 'Rollo',
            'DOCENA' => 'Docena',
        ];
    }
}