<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://10.0.2.2:8000',  // Emulador Android
        'http://192.168.1.*:8000'  // Red local
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,  // ← IMPORTANTE: true
];