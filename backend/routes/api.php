<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;





// Lấy thông tin user đang đăng nhập
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Đăng ký
Route::post('/register', [AuthController::class, 'register']);

// Đăng nhập
Route::post('/login', [AuthController::class, 'login']);

// Đăng xuất
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


// ==================== ROLE PROTECTED ROUTES ====================

// Chỉ ADMIN
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return response()->json(['message' => 'Hello Admin!']);
    });
});

// Chỉ DOCTOR
Route::middleware(['auth:sanctum', 'role:doctor'])->group(function () {
    Route::get('/doctor/dashboard', function () {
        return response()->json(['message' => 'Hello Doctor!']);
    });
});

// Chỉ PATIENT
Route::middleware(['auth:sanctum', 'role:patient'])->group(function () {
    Route::get('/patient/dashboard', function () {
        return response()->json(['message' => 'Hello Patient!']);
    });
});

// Doctor hoặc Admin đều truy cập
Route::middleware(['auth:sanctum', 'role:doctor,admin'])->group(function () {
    Route::get('/manager-area', function () {
        return response()->json(['message' => 'Doctor or Admin Access']);
    });
});
