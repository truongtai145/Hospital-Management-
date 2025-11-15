<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {

            $table->id();

            // Thông tin đăng nhập
            $table->string('name');                         // tên hiển thị
            $table->string('email')->unique();              // email không trùng
            $table->string('password');                     // mật khẩu đã hash

            // Thông tin liên hệ
            $table->string('phone_number')->nullable();

            // Giới tính: male / female / other
            $table->enum('gender', ['male', 'female', 'other'])->nullable();

            // Địa chỉ nhà
            $table->string('address')->nullable();

            // Ảnh đại diện
            $table->string('profile_url')->nullable();

            // Quyền người dùng: patient / doctor / admin
            $table->enum('role', ['patient', 'doctor', 'admin'])->default('patient');

            // Token để đăng nhập tự động (nếu dùng JWT thì không cần cũng được)
            $table->string('refresh_token')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
