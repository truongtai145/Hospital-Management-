<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy token trong request.'
            ], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            
            $user = User::find($decoded->sub);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại.'
                ], 401);
            }

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản của bạn đang bị khóa hoặc chưa kích hoạt.'
                ], 403);
            }

            // Gán user vào request (cho $request->user())
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            //  Set user vào Auth để Auth::user() hoạt động
            Auth::setUser($user);
            
         
            return $next($request);

        } catch (\Firebase\JWT\ExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token đã hết hạn.',
                'error' => 'token_expired'
            ], 401);

        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Chữ ký token không hợp lệ.'
            ], 401);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ: ' . $e->getMessage()
            ], 401);
        }
    }
}