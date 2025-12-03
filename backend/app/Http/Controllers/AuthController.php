<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\RefreshToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController extends Controller
{
    /**
     * Đăng ký tài khoản mới
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:patient',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Tạo user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => true,
            ]);

            // Tạo patient profile
            Patient::create([
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'phone' => $request->phone,
                'address' => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký thành công',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng nhập với JWT
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tìm user
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không chính xác'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa'
            ], 403);
        }

        // Tạo JWT Access Token (15 phút)
        $accessToken = $this->createAccessToken($user);

        // Tạo Refresh Token (30 ngày) và lưu vào DB
        $refreshToken = $this->createRefreshToken($user, $request);

        // Cập nhật last_login
        $user->update(['last_login' => now()]);

        // Load profile
        $profile = null;
        switch ($user->role) {
            case 'patient':
                $profile = $user->patient;
                break;
            case 'doctor':
                $profile = $user->doctor;
                break;
            case 'admin':
                $profile = $user->adminProfile;
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken->token,
            'token_type' => 'Bearer',
            'expires_in' => 900, // 15 phút
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'profile' => $profile,
            ]
        ], 200);
    }

    /**
     * Đăng xuất
     */
    public function logout(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not provided'
                ], 400);
            }

            // Decode token để lấy user_id
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            
            // Revoke refresh token
            if ($request->has('refresh_token')) {
                RefreshToken::where('token', $request->refresh_token)
                    ->where('user_id', $decoded->sub)
                    ->update(['is_revoked' => true]);
            }

            // JWT không thể invalidate, nhưng ta đã revoke refresh token
            // Client phải tự xóa token

            return response()->json([
                'success' => true,
                'message' => 'Đăng xuất thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đăng xuất thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thông tin user từ token
     */
    public function me(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not provided'
                ], 401);
            }

            // Decode và verify token
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            
            // Lấy user từ DB
            $user = User::find($decoded->sub);
            
            if (!$user || !$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found or inactive'
                ], 401);
            }

            // Load profile
            $profile = null;
            switch ($user->role) {
                case 'patient':
                    $profile = $user->patient;
                    break;
                case 'doctor':
                    $profile = $user->doctor;
                    break;
                case 'admin':
                    $profile = $user->adminProfile;
                    break;
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'last_login' => $user->last_login,
                    'profile' => $profile,
                ]
            ], 200);

        } catch (\Firebase\JWT\ExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token expired'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);
        }
    }

    /**
     * Refresh access token
     */
    public function refresh(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token is required'
            ], 422);
        }

        // Kiểm tra refresh token trong DB
        $refreshToken = RefreshToken::where('token', $request->refresh_token)
            ->where('is_revoked', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$refreshToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired refresh token'
            ], 401);
        }

        $user = $refreshToken->user;

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'User account is inactive'
            ], 403);
        }

        // Tạo access token mới
        $newAccessToken = $this->createAccessToken($user);

        return response()->json([
            'success' => true,
            'access_token' => $newAccessToken,
            'token_type' => 'Bearer',
            'expires_in' => 900, // 15 phút
        ], 200);
    }

    /**
     * Tạo JWT Access Token
     */
    private function createAccessToken(User $user)
    {
        $payload = [
            'iss' => env('APP_URL'), // Issuer
            'sub' => $user->id, // Subject (user ID)
            'iat' => time(), // Issued at
            'exp' => time() + (15 * 60), // Expiration (15 phút)
            'email' => $user->email,
            'role' => $user->role,
        ];

        return JWT::encode($payload, env('JWT_SECRET'), 'HS256');
    }

    /**
     * Tạo Refresh Token
     */
    private function createRefreshToken(User $user, Request $request)
    {
        return RefreshToken::create([
            'user_id' => $user->id,
            'token' => Str::random(100),
            'device_info' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'expires_at' => Carbon::now()->addDays(30),
            'is_revoked' => false,
        ]);
    }
}