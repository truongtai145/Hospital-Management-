<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            
            // liên kết đến bệnh nhân 
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            
            // liên kết đến bác sĩ 
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();

            // liên kết đến khoa )
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            
          
            $table->dateTime('appointment_time'); 
            $table->string('reason'); 
            
          
            $table->text('allergies_at_appointment')->nullable(); 
            $table->text('medical_history_at_appointment')->nullable(); 

            $table->text('doctor_notes')->nullable(); 
            $table->text('prescription')->nullable(); 
            
            $table->enum('status', [
                'pending',      // Chờ xác nhận
                'confirmed',    // Bác sĩ đã xác nhận
                'completed',    // Buổi hẹn đã hoàn thành
                'cancelled',    // Bệnh nhân hoặc bác sĩ đã hủy
                'no_show'       // Bệnh nhân không đến
            ])->default('pending');

            $table->timestamps(); 

            
            $table->index('patient_id');
            $table->index('doctor_id');
            $table->index('appointment_time');
            $table->index('status');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};