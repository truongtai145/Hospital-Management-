<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminAppointmentController;
use App\Http\Controllers\Api\AdminDoctorController;
use App\Http\Controllers\Api\AdminPatientController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;
// Tất cả routes admin yêu cầu authentication và role admin
Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
    
    // Dashboard Statistics
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getStats']);
    Route::get('/dashboard/chart', [AdminDashboardController::class, 'getChartData']);
    Route::get('/dashboard/recent-appointments', [AdminDashboardController::class, 'getRecentAppointments']);
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'getOverview']);
    
    // Appointments Management
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AdminAppointmentController::class, 'index']);
        Route::get('/{id}', [AdminAppointmentController::class, 'show']);
        Route::put('/{id}', [AdminAppointmentController::class, 'update']);
        Route::delete('/{id}', [AdminAppointmentController::class, 'destroy']);
        Route::post('/bulk-update', [AdminAppointmentController::class, 'bulkUpdateStatus']);
        Route::get('/statistics/overview', [AdminAppointmentController::class, 'getStatistics']);
    });
    
    // Doctors Management
    Route::prefix('doctors')->group(function () {
        Route::get('/', [AdminDoctorController::class, 'index']);
        Route::post('/', [AdminDoctorController::class, 'store']);
        Route::get('/{id}', [AdminDoctorController::class, 'show']);
        Route::put('/{id}', [AdminDoctorController::class, 'update']);
        Route::delete('/{id}', [AdminDoctorController::class, 'destroy']);
        Route::post('/{id}/toggle-availability', [AdminDoctorController::class, 'toggleAvailability']);
        Route::get('/statistics/overview', [AdminDoctorController::class, 'getStatistics']);
    });
    
    // Patients Management
    Route::prefix('patients')->group(function () {
        Route::get('/', [AdminPatientController::class, 'index']);
        Route::get('/{id}', [AdminPatientController::class, 'show']);
        Route::put('/{id}', [AdminPatientController::class, 'update']);
        Route::delete('/{id}', [AdminPatientController::class, 'destroy']);
        Route::get('/statistics/overview', [AdminPatientController::class, 'getStatistics']);
    });
});