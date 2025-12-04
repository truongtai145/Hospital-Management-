<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
class DoctorController extends Controller
{
    /**
    
     * GET /api/v1/doctors
     * GET /api/v1/doctors?department_id=1
     */
    public function index(Request $request)
    {
        // Bắt đầu câu truy vấn với việc load sẵn thông tin department
        $query = Doctor::with('department')->where('is_available', true);

        // Kiểm tra nếu có tham số department_id trong URL
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $doctors = $query->orderBy('full_name')->get();

        return response()->json([
            'success' => true,
            'data' => $doctors,
        ]);
    }

    /**
   
     * POST /api/v1/doctors
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Thông tin cho bảng users
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',

            // Thông tin cho bảng doctors
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:100|unique:doctors,license_number',
            'consultation_fee' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Dùng transaction để đảm bảo cả 2 bảng được tạo thành công
        $doctor = DB::transaction(function () use ($request) {
            // 1. Tạo tài khoản user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'doctor',
            ]);

            // 2. Tạo hồ sơ doctor
            $doctorData = $request->only([
                'full_name', 'phone', 'department_id', 'specialization',
                'license_number', 'consultation_fee', 'is_available'
            ]);
            $doctorData['user_id'] = $user->id;
            
            return Doctor::create($doctorData);
        });

        return response()->json([
            'success' => true,
            'message' => 'Tạo hồ sơ bác sĩ thành công!',
            'data' => $doctor->load('department', 'user') 
        ], 201);
    }

    
     
     // GET /api/v1/doctors/{id}
     
    public function show(Doctor $doctor)
    {
        // Load các mối quan hệ để trả về thông tin đầy đủ
        return response()->json([
            'success' => true,
            'data' => $doctor->load('department', 'user')
        ]);
    }

    
     
     // PUT /api/v1/doctors/{id}
     
    public function update(Request $request, Doctor $doctor)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'sometimes|required|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('doctors')->ignore($doctor->id),
            ],
            'consultation_fee' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $doctor->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin bác sĩ thành công!',
            'data' => $doctor->load('department', 'user')
        ]);
    }

    
    
     // DELETE /api/v1/doctors/{id}
     
    public function destroy(Doctor $doctor)
    {
        // Nhờ `cascadeOnDelete` trong migration, khi user bị xóa,
        // hồ sơ doctor cũng sẽ tự động bị xóa theo.
        DB::transaction(function () use ($doctor) {
            $doctor->user->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Xóa hồ sơ bác sĩ thành công!'
        ], 200);
    }
}