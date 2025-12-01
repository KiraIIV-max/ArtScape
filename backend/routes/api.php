<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::post(uri: '/register', action: [AuthController::class, 'register']);
Route::post(uri: '/login', action: [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post(uri: '/logout', action: [AuthController::class, 'logout']);
});