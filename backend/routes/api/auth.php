<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;



Route::prefix('auth')->name('auth.')->group(function () {
    
   
    // Đăng ký tài khoản mới
    Route::post('/register', [AuthController::class, 'register']);
       
    
    // Đăng nhập
    Route::post('/login', [AuthController::class, 'login']);
      
      
    
    // Refresh access token
    Route::post('/refresh', [AuthController::class, 'refresh'])
        ->name('refresh');
    
 
    
    Route::middleware('jwt.auth')->group(function () {
        
        // Đăng xuất
        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('logout');
        
        // Lấy thông tin user hiện tại
        Route::get('/me', [AuthController::class, 'me'])
            ->name('me');
    });
});