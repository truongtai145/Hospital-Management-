<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Xử lý request trước khi vào controller.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string ...$roles  Danh sách các role được phép truy cập (truyền từ route)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Kiểm tra người dùng đã đăng nhập hay chưa
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chưa đăng nhập.'
            ], 401);
        }

        // Lấy role của user hiện tại
        $userRole = $request->user()->role;

        // Nếu role của user không nằm trong danh sách role được phép
        if (!in_array($userRole, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền truy cập tài nguyên này.',
                'required_roles' => $roles,  // Các role được phép
                'your_role' => $userRole    // Role hiện tại của user
            ], 403);
        }

        // Nếu hợp lệ thì cho phép request đi tiếp
        return $next($request);
    }
}
