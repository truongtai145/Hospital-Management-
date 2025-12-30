<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoctorProfileController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Middleware\RoleMiddleware;
    Route::get('/doctors',[DoctorProfileController::class,'index']) ->name('doctor.index');
    Route::get('/doctors/{doctor}',[DoctorProfileController::class ,'showdoctor']) ->name('doctor.showdoctor');
Route::middleware(['jwt.auth','role:doctor']) ->prefix('doctor') ->group(function(){
    Route::get('/profile',[DoctorProfileController::class,'show']) ->name('doctor.profile.show');
    Route::put('/profile',[DoctorProfileController::class,'update']) -> name('doctor.profile.update');
    Route::get('/appointments', [App\Http\Controllers\Api\AppointmentController::class, 'index']);
    Route::get('/patients/{id}', [DoctorProfileController::class, 'showPatient'])->name('doctor.patient.show');
});