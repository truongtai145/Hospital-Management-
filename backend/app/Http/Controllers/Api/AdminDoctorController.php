<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminDoctorController extends Controller
{
    /**
     * Lấy danh sách bác sĩ
     */
    public function index(Request $request)
    {
        $query = Doctor::with(['department', 'user']);

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by availability
        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%");
            });
        }

        // Sort
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

    /**
     * Tạo bác sĩ mới
     */
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

        DB::beginTransaction();
        try {
            // Create user account
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'doctor',
            ]);

            // Create doctor profile
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
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết bác sĩ
     */
    public function show($id)
    {
        $doctor = Doctor::with(['department', 'user'])
            ->findOrFail($id);

        // Lấy thống kê
        $stats = [
            'total_appointments' => $doctor->appointments()->count(),
            'completed_appointments' => $doctor->appointments()->where('status', 'completed')->count(),
            'pending_appointments' => $doctor->appointments()->where('status', 'pending')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'doctor' => $doctor,
                'stats' => $stats
            ]
        ]);
    }

    /**
     * Cập nhật thông tin bác sĩ
     */
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

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

    /**
     * Xóa bác sĩ
     */
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

    /**
     * Toggle availability
     */
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

    /**
     * Get doctor statistics
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Doctor::count(),
            'available' => Doctor::where('is_available', true)->count(),
            'unavailable' => Doctor::where('is_available', false)->count(),
            'by_department' => Doctor::select('department_id', DB::raw('count(*) as count'))
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