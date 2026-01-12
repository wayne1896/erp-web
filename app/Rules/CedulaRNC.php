<?php
// app/Rules/CedulaRNC.php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class CedulaRNC implements Rule
{
    public function passes($attribute, $value)
    {
        // Limpiar guiones y espacios
        $cedulaRnc = preg_replace('/[^0-9]/', '', $value);
        
        // Validar longitud
        if (strlen($cedulaRnc) == 11) {
            return $this->validarCedulaDominicana($cedulaRnc);
        } elseif (strlen($cedulaRnc) == 9) {
            return $this->validarRNC($cedulaRnc);
        }
        
        return false;
    }
    
    private function validarCedulaDominicana($cedula)
    {
        // Verificar que los primeros 3 dígitos sean válidos (provincia)
        $provincia = substr($cedula, 0, 3);
        if ($provincia < '001' || $provincia > '032') {
            return false;
        }
        
        // Algoritmo de validación de cédula dominicana
        $suma = 0;
        $verificador = (int) substr($cedula, 10, 1);
        
        for ($i = 0; $i < 10; $i++) {
            $digito = (int) $cedula[$i];
            $multiplicador = ($i % 2 == 0) ? 1 : 2;
            $producto = $digito * $multiplicador;
            
            if ($producto > 9) {
                $producto -= 9;
            }
            
            $suma += $producto;
        }
        
        $digitoVerificador = (10 - ($suma % 10)) % 10;
        
        return $digitoVerificador == $verificador;
    }
    
    private function validarRNC($rnc)
    {
        // Algoritmo de validación de RNC
        $base = '123456789';
        $suma = 0;
        
        for ($i = 0; $i < 8; $i++) {
            $digito = (int) $rnc[$i];
            $multiplicador = (int) $base[$i];
            $suma += $digito * $multiplicador;
        }
        
        $resto = $suma % 11;
        $digitoVerificador = (int) $rnc[8];
        
        if ($resto == 0) {
            return $digitoVerificador == 1;
        } elseif ($resto == 1) {
            return $digitoVerificador == 1;
        } else {
            return $digitoVerificador == (11 - $resto);
        }
    }
    
    public function message()
    {
        return 'La cédula o RNC no es válido.';
    }
}