<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Đăng ký
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:patient,doctor',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'insurance_number' => 'nullable|string|max:100',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'avatar_url' => 'nullable|url',
            'department_id' => 'nullable|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:100|unique:doctors,license_number',
            'education' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'biography' => 'nullable|string',
            'consultation_fee' => 'nullable|numeric|min:0',
            'device_info' => 'nullable|string|max:255',
        ]);

        $data = $validator->validate();
        $role = $data['role'] ?? 'patient';

        $user = DB::transaction(function () use ($data, $role) {
            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $role,
            ]);

            $profilePayload = [
                'user_id' => $user->id,
                'full_name' => $data['full_name'],
                'phone' => $data['phone'] ?? null,
                'avatar_url' => $data['avatar_url'] ?? null,
            ];

            if ($role === 'doctor') {
                Doctor::create(array_merge($profilePayload, [
                    'department_id' => $data['department_id'] ?? null,
                    'specialization' => $data['specialization'] ?? null,
                    'license_number' => $data['license_number'] ?? null,
                    'education' => $data['education'] ?? null,
                    'experience_years' => $data['experience_years'] ?? null,
                    'biography' => $data['biography'] ?? null,
                    'consultation_fee' => $data['consultation_fee'] ?? null,
                    'is_available' => true,
                ]));
            } else {
                Patient::create(array_merge($profilePayload, [
                    'address' => $data['address'] ?? null,
                    'date_of_birth' => $data['date_of_birth'] ?? null,
                    'gender' => $data['gender'] ?? null,
                    'insurance_number' => $data['insurance_number'] ?? null,
                    'allergies' => $data['allergies'] ?? null,
                    'medical_history' => $data['medical_history'] ?? null,
                ]));
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->issueRefreshToken($user, $request);

        return response()->json([
            'message' => 'Registered successfully',
            'user' => $this->formatUserResponse($user),
            'token' => $token,
            'refresh_token' => $refreshToken,
        ], 201);
    }

    // Đăng nhập
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is disabled'], 403);
        }

        $user->update(['last_login' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->issueRefreshToken($user, $request);

        return response()->json([
            'message' => 'Login successfully',
            'user'    => $this->formatUserResponse($user),
            'token'   => $token,
            'refresh_token' => $refreshToken,
        ]);
    }

    protected function issueRefreshToken(User $user, Request $request): string
    {
        $token = Str::uuid()->toString() . Str::random(40);

        $user->refreshTokens()->create([
            'token' => $token,
            'device_info' => $request->input('device_info', $request->header('User-Agent')),
            'ip_address' => $request->ip(),
            'expires_at' => now()->addDays(30),
        ]);

        return $token;
    }

    protected function formatUserResponse(User $user): array
    {
        $user->loadMissing(['patient', 'doctor', 'adminProfile']);

        return [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'last_login' => $user->last_login,
            'profile' => match ($user->role) {
                'doctor' => $user->doctor,
                'admin' => $user->adminProfile,
                default => $user->patient,
            },
        ];
    }
}
