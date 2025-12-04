<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    
        public function run(): void
    {
        DB::transaction(function () {
            //  tài khoản User
            $adminUser = User::create([
                'email' => 'admin@gmail.com',
                'password' => Hash::make('admin123'), 
                'role' => 'admin',
                'is_active' => true,
            ]);

            
            Admin::create([
                'user_id' => $adminUser->id,
                'full_name' => 'Admin Quản Trị Viên',
                'phone' => '0987654321',
                'permission_level' => 'super_admin',
            ]);
        });
        
        $this->command->info('Tạo tài khoản Admin thành công! Email: admin@gmail.com, Pass: admin123');
    }
}
