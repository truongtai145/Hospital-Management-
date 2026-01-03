<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoctorProfileController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;


Route::get('/doctors', [DoctorProfileController::class, 'index'])->name('doctor.index');
Route::get('/doctors/{doctor}', [DoctorProfileController::class, 'showdoctor'])->name('doctor.showdoctor');


Route::middleware(['jwt.auth', 'role:doctor'])->prefix('doctor')->group(function() {
    
    // ---------- PROFILE ----------
    Route::get('/profile', [DoctorProfileController::class, 'show'])->name('doctor.profile.show');
    Route::put('/profile', [DoctorProfileController::class, 'update'])->name('doctor.profile.update');
    

    // Lấy danh sách lịch hẹn của bác sĩ
    Route::get('/appointments', [AppointmentController::class, 'index'])->name('doctor.appointments.index');
    
    // Xem chi tiết một lịch hẹn cụ thể
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])->name('doctor.appointments.show');
    
    // Cập nhật lịch hẹn (ghi chú, đơn thuốc, trạng thái)
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update'])->name('doctor.appointments.update');
    
  
    // Xem chi tiết bệnh nhân (chỉ xem được bệnh nhân đã từng khám)
    Route::get('/patients/{id}', [DoctorProfileController::class, 'showPatient'])->name('doctor.patient.show');
});