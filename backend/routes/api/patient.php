<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PatientController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;

use App\Models\Patient;
use Symfony\Component\HttpKernel\Profiler\Profile;

Route::middleware(['jwt.auth', 'role:patient'])->group(function () {
    
    // Lấy hồ sơ bệnh nhân hiện tại
    Route::get('/patient/profile', [PatientController::class, 'show'])->name('patient.profile.show');

    // Cập nhật hồ sơ bệnh nhân hiện tại
    Route::put('/patient/profile', [PatientController::class, 'update'])->name('patient.profile.update');
});