<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;

// Routes cho Admin
Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::prefix('payments')->group(function () {
         Route::post('/create-or-update', [PaymentController::class, 'createOrUpdatePayment']);
        Route::get('/', [PaymentController::class, 'index']); // Danh sách hóa đơn
        Route::get('/{id}', [PaymentController::class, 'show']); // Chi tiết hóa đơn
        Route::put('/{id}', [PaymentController::class, 'update']); // Cập nhật giá thuốc
        Route::post('/{id}/cancel', [PaymentController::class, 'cancel']); // Hủy hóa đơn
        Route::get('/statistics/overview', [PaymentController::class, 'getStatistics']); // Thống kê
        
        // Tạo hóa đơn từ appointment
       // Thay route cũ bằng route mới
       
    });
   
});

// Routes cho Bệnh nhân
Route::middleware(['jwt.auth', 'role:patient'])->prefix('patient')->group(function () {
    Route::get('/payments', [PaymentController::class, 'getPatientPayments']); // Lịch sử hóa đơn
    Route::get('/payments/{id}', [PaymentController::class, 'show']); // Chi tiết hóa đơn
    Route::post('/payments/{id}/pay', [PaymentController::class, 'processPayment']); // Thanh toán
});

// Routes chung (cần auth)
Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/appointments/{appointmentId}/payment', [PaymentController::class, 'getByAppointment']); // Lấy hóa đơn theo appointment
});