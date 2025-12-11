<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\RefreshToken;
use App\Models\PasswordResetToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
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
     * Gửi email reset password
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email không tồn tại trong hệ thống',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản đã bị khóa'
                ], 403);
            }

            // Xóa các token cũ chưa sử dụng của user này
            PasswordResetToken::where('email', $request->email)
                ->where('is_used', false)
                ->delete();

            // Tạo token reset mới (6 số ngẫu nhiên)
            $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Lưu token vào database (hết hạn sau 15 phút)
            PasswordResetToken::create([
                'email' => $request->email,
                'token' => Hash::make($token),
                'expires_at' => Carbon::now()->addMinutes(15),
                'is_used' => false
            ]);

            // Gửi email
            Mail::send('emails.reset-password', [
                'user' => $user,
                'token' => $token,
                'expires_in' => 15
            ], function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Yêu cầu đặt lại mật khẩu - Meddical Hospital');
            });

            return response()->json([
                'success' => true,
                'message' => 'Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xác thực OTP code
     */
    public function verifyResetToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tìm token chưa sử dụng và chưa hết hạn
        $resetToken = PasswordResetToken::where('email', $request->email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$resetToken) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác thực không hợp lệ hoặc đã hết hạn'
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetToken->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác thực không chính xác'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mã xác thực hợp lệ',
        ], 200);
    }

    /**
     * Reset password với token đã verify
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Tìm token
            $resetToken = PasswordResetToken::where('email', $request->email)
                ->where('is_used', false)
                ->where('expires_at', '>', now())
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$resetToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mã xác thực không hợp lệ hoặc đã hết hạn'
                ], 400);
            }

            // Verify token
            if (!Hash::check($request->token, $resetToken->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mã xác thực không chính xác'
                ], 400);
            }

            // Tìm user và update password
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }

            // Cập nhật mật khẩu
            $user->password = Hash::make($request->password);
            $user->save();

            // Đánh dấu token đã sử dụng
            $resetToken->is_used = true;
            $resetToken->save();

            // Revoke tất cả refresh tokens của user
            RefreshToken::where('user_id', $user->id)->update(['is_revoked' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo JWT Access Token
     */
   private function createAccessToken(User $user)
{
    $jwtSecret = env('JWT_SECRET');
    
    // Debug: Check if JWT_SECRET exists
    if (empty($jwtSecret)) {
        throw new \Exception('JWT_SECRET is not configured in .env file');
    }
    
    $payload = [
        'iss' => env('APP_URL'),
        'sub' => $user->id,
        'iat' => time(),
        'exp' => time() + (15 * 60),
        'email' => $user->email,
        'role' => $user->role,
    ];

    return JWT::encode($payload, $jwtSecret, 'HS256');
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
     public function pusherAuth(Request $request)
    {
        try {
            // Lấy token từ header
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Decode JWT
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $user = User::find($decoded->sub);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 401);
            }

            // Set user vào request để Broadcast::auth có thể dùng
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Gọi Broadcast::auth
            return \Illuminate\Support\Facades\Broadcast::auth($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed'
            ], 401);
        }
    }
}
