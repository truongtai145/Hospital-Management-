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

            $table->decimal('amount', 15, 2); 
            
            
            $table->enum('payment_method', [
                'cash',         
                'credit_card',   
                'vnpay',         
                'insurance'      
            ]);

            $table->enum('status', [
                'pending',
                'completed',
                'failed',
                'refunded'
            ])->default('pending');

            $table->string('transaction_id')->unique()->nullable(); 
            $table->datetime('payment_date')->nullable(); 
            $table->text('notes')->nullable(); 

            $table->timestamps();

            $table->index('appointment_id');
            $table->index('patient_id');
            $table->index('status');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};