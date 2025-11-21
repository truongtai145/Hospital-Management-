<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token', 500)->unique();
            $table->string('device_info')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->boolean('is_revoked')->default(false);
            $table->dateTime('expires_at');
            $table->timestamps();

            $table->index('user_id', 'idx_refresh_tokens_user');
            $table->index('token', 'idx_refresh_tokens_token');
            $table->index('expires_at', 'idx_refresh_tokens_expires');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
    }
};

