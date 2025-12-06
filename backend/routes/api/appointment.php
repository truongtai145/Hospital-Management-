<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;
Route::middleware(['jwt.auth'])->group(function () {
   
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');

    // NHÓM API DÀNH CHO BỆNH NHÂN
    Route::middleware(['role:patient'])->group(function () {
        // Lấy danh sách lịch hẹn của chính bệnh nhân đó
        Route::get('/patient/appointments', [AppointmentController::class, 'index'])->name('patient.appointments.index');
        Route::get('/appointments/check-availability', [AppointmentController::class, 'checkAvailability'])->name('appointments.check-availability');
    
        Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
        // Hủy một lịch hẹn của chính bệnh nhân đó
        Route::delete('/patient/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('patient.appointments.destroy');
    });

    // NHÓM API DÀNH CHO ADMIN & BÁC SĨ (Để quản lý)
    Route::middleware(['role:admin,doctor'])->group(function () {
        // Lấy danh sách TẤT CẢ lịch hẹn (với logic lọc trong controller)
        Route::get('/admin/appointments', [AppointmentController::class, 'index'])->name('admin.appointments.index');
        
        // Xem chi tiết một lịch hẹn bất kỳ
        Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
        
        // Cập nhật một lịch hẹn (ví dụ: xác nhận, ghi chú...)
        Route::put('/appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
    });

});