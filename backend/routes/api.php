<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\DB; 


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/test-db', function () {
    try {
        DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        return response()->json([
            'status' => 'success',
            'message' => " Kết nối database thành công!",
            'database' => $dbName
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => " Lỗi kết nối: " . $e->getMessage()
        ], 500);
    }
});

require __DIR__.'/../routes/api/auth.php';
require __DIR__.'/../routes/api/patient.php';