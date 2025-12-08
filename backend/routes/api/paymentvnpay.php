<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentVnpayController;

// Route cho bệnh nhân tạo thanh toán VNPay (yêu cầu đăng nhập)
Route::middleware(['jwt.auth', 'role:patient'])->group(function () {
    Route::post('/patient/payments/create-vnpay', [PaymentVnpayController::class, 'createPayment']);
});

// Routes callback từ VNPay (KHÔNG cần auth vì là callback từ VNPay)
Route::get('/payment/vnpay-return', [PaymentVnpayController::class, 'vnpayReturn'])->name('vnpay.return');
Route::get('/payment/vnpay-ipn', [PaymentVnpayController::class, 'vnpayIpn'])->name('vnpay.ipn');