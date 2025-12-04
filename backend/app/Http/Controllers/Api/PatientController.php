<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    public function show(Request $request)
    {
        $user = Auth::user(); // Hoặc $request->user()
        
        if (!$user) {
            return response()->json([
                'success' => false, // ← Đổi từ 'status' thành 'success'
                'message' => 'Unauthorized'
            ], 401);
        }

        $patient = Patient::where('user_id', $user->id)->first();
        
        if (!$patient) {
            return response()->json([
                'success' => false, // ← Đổi từ 'status' thành 'success'
                'data' => null,
                'message' => 'Không tìm thấy hồ sơ bệnh nhân'
            ], 404);
        }
            
        return response()->json([
            'success' => true, // ← Đổi từ 'status' thành 'success'
            'data' => $patient,
            'message' => 'Lấy hồ sơ bệnh nhân thành công'
        ], 200);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $patient = Patient::where('user_id', $user->id)->first();
        
        if (!$patient) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Không tìm thấy hồ sơ bệnh nhân'
            ], 404);
        }
    
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'insurance_number' => 'nullable|string|max:100',
            'avatar_url' => 'nullable|string|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Dữ liệu không hợp lệ'
            ], 422);
        }
        
        $patient->update($validator->validated());
        
        return response()->json([
            'success' => true,
            'data' => $patient->fresh(), 
            'message' => 'Cập nhật hồ sơ bệnh nhân thành công'
        ], 200);
    }
}