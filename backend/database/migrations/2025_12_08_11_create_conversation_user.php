<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('conversation_user', function (Blueprint $table) {
            // Không cần id(), khóa chính sẽ là cặp (user_id, conversation_id)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');

            // Định nghĩa khóa chính
            $table->primary(['user_id', 'conversation_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('conversation_user');
    }
};