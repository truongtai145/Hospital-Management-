<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;

class JwtMiddleware
{
    /**
     * Handle an incoming request:
     * - Kiểm tra token trong header Authorization
     * - Giải mã JWT
     * - Xác thực người dùng trong DB
     * - Gán user vào request để dùng ở controller
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Lấy token dạng Bearer Token từ header (Authorization: Bearer xxxx)
        $token = $request->bearerToken();

        // Nếu không có token → từ chối request
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy token trong request.'
            ], 401);
        }

        try {
            /**
             * Giải mã và verify JWT:
             * - env('JWT_SECRET'): khóa bí mật
             * - HS256: thuật toán mã hóa token
             *
             * Nếu token hết hạn hoặc sai signature → ném exception
             */
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            
            /**
             * Tìm user trong hệ thống dựa vào "sub" trong payload.
             * Theo chuẩn JWT, "sub" = user_id.
             */
            $user = User::find($decoded->sub);
            
            // Không tìm thấy user tương ứng với token
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại.'
                ], 401);
            }

            // User bị khóa hoặc chưa kích hoạt → không cho đăng nhập
            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản của bạn đang bị khóa hoặc chưa kích hoạt.'
                ], 403);
            }

            /**
             * Gán user vào request để dễ truy cập trong controller:
             * - $request->auth_user (tùy chỉnh)
             * - $request->user() (chuẩn Laravel)
             */
            $request->merge(['auth_user' => $user]);
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Cho phép request tiếp tục đi tiếp vào controller
            return $next($request);

        } catch (\Firebase\JWT\ExpiredException $e) {
            // Token hết hạn
            return response()->json([
                'success' => false,
                'message' => 'Token đã hết hạn.',
                'error' => 'token_expired'
            ], 401);

        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            // Token bị giả mạo hoặc sai signature
            return response()->json([
                'success' => false,
                'message' => 'Chữ ký token không hợp lệ.'
            ], 401);

        } catch (\Exception $e) {
            // Lỗi token không xác định 
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ: ' . $e->getMessage()
            ], 401);
        }
    }
}
