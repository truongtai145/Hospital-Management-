<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;



Route::prefix('auth')->name('auth.')->group(function () {
    
  
    
    // Đăng ký tài khoản mới
    Route::post('/register', [AuthController::class, 'register'])
        ->name('register')
        ->middleware('throttle:5,1'); // 5 requests per minute
    
    // Đăng nhập
    Route::post('/login', [AuthController::class, 'login'])
        ->name('login')
        ->middleware('throttle:5,1'); // 5 requests per minute
    
    // Refresh access token
    Route::post('/refresh', [AuthController::class, 'refresh'])
        ->name('refresh');
    Route::middleware('auth:sanctum')->group(function () {
        
        // Đăng xuất
        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('logout');
        
        // Lấy thông tin user hiện tại
        Route::get('/me', [AuthController::class, 'me'])
            ->name('me');
    });
});