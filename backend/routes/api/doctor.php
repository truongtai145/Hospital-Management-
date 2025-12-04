<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;
Route::get('/doctors', [DoctorController::class, 'index'])->name('doctors.index');
// Lấy thông tin chi tiết của một bác sĩ
Route::get('/doctors/{doctor}', [DoctorController::class, 'show'])->name('doctors.show');


// --- API ROUTES CHO QUẢN TRỊ VIÊN (ADMIN) ---
Route::middleware(['jwt.auth', 'role:admin'])->group(function () {
    // Tạo một hồ sơ bác sĩ mới
    Route::post('/doctors', [DoctorController::class, 'store'])->name('doctors.store');
    
    // Cập nhật thông tin một bác sĩ
    Route::put('/doctors/{doctor}', [DoctorController::class, 'update'])->name('doctors.update');
    
    // Xóa một bác sĩ
    Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy'])->name('doctors.destroy');
});