<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;

Route::middleware(['jwt.auth'])->group(function () {
   
    
    Route::middleware(['role:patient'])->group(function () {
        // Lấy danh sách lịch hẹn của bệnh nhân
        Route::get('/patient/appointments', [AppointmentController::class, 'index'])->name('patient.appointments.index');
        
        // Kiểm tra khung giờ trống
        Route::get('/appointments/check-availability', [AppointmentController::class, 'checkAvailability'])->name('appointments.check-availability');
        
        // Đặt lịch hẹn mới
        Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
        
        // Hủy lịch hẹn
        Route::delete('/patient/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('patient.appointments.destroy');
    });

});