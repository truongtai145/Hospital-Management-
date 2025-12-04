<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;

use App\Models\Admin;
Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
// Lấy thông tin chi tiết của một khoa
Route::get('/departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');


// --- API ROUTES CHO QUẢN TRỊ VIÊN (ADMIN) ---
Route::middleware(['jwt.auth', 'role:admin'])->group(function () {
    // Tạo một khoa mới
    Route::post('/departments', [DepartmentController::class, 'store'])->name('departments.store');
    
    // Cập nhật thông tin một khoa
    Route::put('/departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    
    // Xóa một khoa
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
});