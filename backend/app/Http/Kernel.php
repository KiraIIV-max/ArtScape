<?php

class Kernel {
    protected $routeMiddleware = [
        // ...existing middleware...
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ];
}