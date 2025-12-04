<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('vi_VN'); //  tiếng Việt

       
        for ($i = 0; $i < 10; $i++) {
            DB::transaction(function () use ($faker, $i) {
                // tài khoản User
                $patientUser = User::create([
                    'email' => 'patient' . ($i + 1) . '@gmail.com',
                    'password' => Hash::make('123456789'),
                    'role' => 'patient',
                    'is_active' => true,
                ]);

                //  hồ sơ Bệnh nhân
                Patient::create([
                    'user_id' => $patientUser->id,
                    'full_name' => $faker->name,
                    'phone' => $faker->phoneNumber,
                    'address' => $faker->address,
                    'date_of_birth' => $faker->dateTimeBetween('-60 years', '-10 years')->format('Y-m-d'),
                    'gender' => $faker->randomElement(['male', 'female', 'other']),
                    'insurance_number' => 'BHYT' . $faker->unique()->numerify('##########'),
                ]);
            });
        }
        
  
    }
}