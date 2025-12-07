<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();

            // --- CÁC CỘT TÀI CHÍNH ---
            $table->decimal('sub_total', 15, 2)->comment('Tổng tiền tạm tính (phí khám + thuốc)');
            $table->decimal('discount', 15, 2)->default(0)->comment('Số tiền giảm giá (ví dụ: BHYT, khuyến mãi)');
            $table->decimal('total_amount', 15, 2)->comment('Tổng tiền cuối cùng phải trả');

            $table->enum('payment_method', ['cash', 'credit_card', 'vnpay', 'insurance'])->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('transaction_id')->unique()->nullable(); 
            $table->datetime('payment_date')->nullable(); 
            $table->text('notes')->nullable(); 

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};