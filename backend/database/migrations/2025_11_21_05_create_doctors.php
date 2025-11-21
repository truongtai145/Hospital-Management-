<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('phone', 20)->nullable();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('specialization')->nullable();
            $table->string('license_number', 100)->unique()->nullable();
            $table->text('education')->nullable();
            $table->unsignedInteger('experience_years')->nullable();
            $table->text('biography')->nullable();
            $table->decimal('consultation_fee', 10, 2)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index('department_id', 'idx_doctors_department');
            $table->index('specialization', 'idx_doctors_specialization');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};

