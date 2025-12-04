<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use App\Models\Department;
class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create('vi_VN'); // tiếng việt
        $departmentIds = Department::pluck('id')->toArray();

        if (empty($departmentIds)) {
            $this->command->error('Không tìm thấy Khoa nào. Vui lòng chạy DepartmentSeeder trước.');
            return;
        }


        for ($i = 0; $i < 10; $i++) {
            DB::transaction(function () use ($faker, $departmentIds, $i) {
                // tài khoản User
                $doctorUser = User::create([
                    'email' => 'doctor' . ($i + 1) . '@gmail.com',
                    'password' => Hash::make('123456789'),
                    'role' => 'doctor',
                    'is_active' => true,
                ]);

                //  hồ sơ Bác sĩ
                Doctor::create([
                    'user_id' => $doctorUser->id,
                    'full_name' => 'BS. ' . $faker->name,
                    'phone' => $faker->phoneNumber,
                    'department_id' => $faker->randomElement($departmentIds),
                    'specialization' => $faker->randomElement(['Chuyên khoa I', 'Chuyên khoa II', 'Thạc sĩ', 'Tiến sĩ']),
                    'license_number' => 'CCHN' . $faker->unique()->numberBetween(10000, 99999),
                    'experience_years' => $faker->numberBetween(3, 20),
                ]);
            });
        }
        
        
    }
}
