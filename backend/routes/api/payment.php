<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;

// Routes cho Admin
Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::prefix('payments')->group(function () {
        Route::post('/create-or-update', [PaymentController::class, 'createOrUpdatePayment']);
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::put('/{id}', [PaymentController::class, 'update']);
        Route::post('/{id}/cancel', [PaymentController::class, 'cancel']);
        Route::post('/{id}/confirm', [PaymentController::class, 'confirmPayment']); // Xác nhận thanh toán
        Route::get('/statistics/overview', [PaymentController::class, 'getStatistics']);
    });
});

// Routes cho Bệnh nhân
Route::middleware(['jwt.auth', 'role:patient'])->prefix('patient')->group(function () {
    Route::get('/payments', [PaymentController::class, 'getPatientPayments']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments/{id}/pay', [PaymentController::class, 'processPayment']);
});

// Routes chung
Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/appointments/{appointmentId}/payment', [PaymentController::class, 'getByAppointment']);
});