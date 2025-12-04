<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
 
     
    public function run()
    {
        Department::create(['name' => 'Khoa Tim mạch', 'description' => 'Chuyên điều trị các bệnh về tim và mạch máu.']);
        Department::create(['name' => 'Khoa Nhi', 'description' => 'Chăm sóc sức khỏe cho trẻ em và trẻ sơ sinh.']);
        Department::create(['name' => 'Khoa Da liễu', 'description' => 'Điều trị các bệnh về da, tóc và móng.']);
        Department::create(['name' => 'Khoa Tai Mũi Họng', 'description' => 'Chuyên khám và điều trị các bệnh liên quan đến tai, mũi, họng.']);
        Department::create(['name' => 'Khoa Chấn thương chỉnh hình', 'description' => 'Điều trị các chấn thương và bệnh lý của hệ cơ xương khớp.']);
        $this->command->info('Tạo 5 Khoa (Department) thành công!');
    }

}
