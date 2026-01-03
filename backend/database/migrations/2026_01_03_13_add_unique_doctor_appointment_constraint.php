<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Bước 1: Xóa các bản ghi trùng lặp hiện tại (nếu có)
        DB::statement("
            DELETE t1 FROM appointments t1
            INNER JOIN appointments t2 
            WHERE t1.id > t2.id 
            AND t1.doctor_id = t2.doctor_id 
            AND t1.appointment_time = t2.appointment_time
            AND t1.status IN ('pending', 'confirmed', 'completed')
            AND t2.status IN ('pending', 'confirmed', 'completed')
        ");

        // Bước 2: Thêm unique index
        Schema::table('appointments', function (Blueprint $table) {
            // Tạo unique constraint cho (doctor_id + appointment_time)
            // Điều này đảm bảo 1 bác sĩ KHÔNG THỂ có 2 lịch hẹn cùng 1 thời điểm
            $table->unique(
                ['doctor_id', 'appointment_time'], 
                'unique_doctor_appointment_time'
            );
        });
    }

    public function down()
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique('unique_doctor_appointment_time');
        });
    }
};