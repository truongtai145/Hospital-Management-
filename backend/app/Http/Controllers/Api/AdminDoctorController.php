<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminDoctorController extends Controller
{
    // Lấy tất cả bác sĩ với phân trang, lọc, tìm kiếm và sắp xếp
    public function index(Request $request)
    {
        $query = Doctor::with(['department', 'user']);

        // loc theo khoa
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // loc theo trạng thái sẵn có
        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        // Tìm kiếm theo tên, số điện thoại, chuyên môn
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%");
            });
        }

       // Sắp xếp theo cột và thứ tự thời gian
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $doctors = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $doctors
        ]);
    }

    
     // Tạo bác sĩ mới
     
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => 'required|string|unique:doctors,license_number',
            'education' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'biography' => 'nullable|string',
            'consultation_fee' => 'nullable|numeric|min:0',
            'avatar_url' => 'nullable|url',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        DB::beginTransaction();
        try {
            // tạo user account
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'doctor',
                'is_active' => true,
            ]);

            // tạo doctor profile
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'phone' => $request->phone,
                'department_id' => $request->department_id,
                'specialization' => $request->specialization,
                'license_number' => $request->license_number,
                'education' => $request->education,
                'experience_years' => $request->experience_years ?? 0,
                'biography' => $request->biography,
                'consultation_fee' => $request->consultation_fee ?? 0,
                'avatar_url' => $request->avatar_url,
                'is_available' => $request->is_available ?? true,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Thêm bác sĩ mới thành công!',
                'data' => $doctor->load(['department', 'user'])
            ], 201);
        } catch (\Exception $e) { // Nếu có lỗi, rollback transaction
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    // xem chi tiết bác sĩ
    public function show($id)
    {
        try {
            // Load đầy đủ thông tin doctor
            $doctor = Doctor::with(['department', 'user'])
                ->findOrFail($id);

            
            // Đảm bảo lấy dữ liệu chính xác từ database
            $stats = [
                'total_appointments' => Appointment::where('doctor_id', $id)->count(), // Tổng số lịch hẹn
                
                'completed_appointments' => Appointment::where('doctor_id', $id) // Số lịch hẹn đã hoàn thành
                    ->where('status', 'completed')
                    ->count(),
                
                'pending_appointments' => Appointment::where('doctor_id', $id) // Số lịch hẹn sắp tới
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count(),
                
                'cancelled_appointments' => Appointment::where('doctor_id', $id) // Số lịch hẹn đã hủy
                    ->where('status', 'cancelled')
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'doctor' => $doctor,
                    'stats' => $stats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }


     // Cập nhật thông tin bác sĩ
     
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);
        // Validate đầu vào nếu sai trả về lỗi
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'department_id' => 'sometimes|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => 'sometimes|string|unique:doctors,license_number,' . $id,
            'education' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'biography' => 'nullable|string',
            'consultation_fee' => 'nullable|numeric|min:0',
            'avatar_url' => 'nullable|url',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $doctor->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin bác sĩ thành công!',
            'data' => $doctor->load(['department', 'user'])
        ]);
    }

    
    // Xóa bác sĩ
     
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $doctor = Doctor::findOrFail($id);
            $user = $doctor->user;

            // Xóa doctor profile
            $doctor->delete();

            // Xóa user account
            if ($user) {
                $user->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa bác sĩ thành công!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    // Chặn/Mở chặn bác sĩ
    public function toggleAvailability($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->is_available = !$doctor->is_available;
        $doctor->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công!',
            'data' => $doctor
        ]);
    }
// Thống kê bác sĩ
    public function getStatistics()
    {
        $stats = [
            'total' => Doctor::count(),
            'available' => Doctor::where('is_available', true)->count(),// Số bác sĩ đang làm việc
            'unavailable' => Doctor::where('is_available', false)->count(),// Số bác sĩ không làm việc
            'by_department' => Doctor::select('department_id', DB::raw('count(*) as count'))// Thống kê theo khoa
                ->groupBy('department_id')
                ->with('department:id,name')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}