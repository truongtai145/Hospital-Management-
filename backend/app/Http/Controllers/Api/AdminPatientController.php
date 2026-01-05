<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminPatientController extends Controller
{
   // Lấy tất cả bệnh nhân
    public function index(Request $request)
    {
        $query = Patient::with('user');

        // tìm kiếm theo tên hoặc số điện thoại hoặc số bảo hiểm
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('insurance_number', 'like', "%{$search}%");
            });
        }

        // lọc theo giới tính
        if ($request->has('gender')) {
            $query->where('gender', $request->gender);
        }

        // sắp xếp theo cột và thứ tự thời gian
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $patients = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

   // xem chi tiết bệnh nhân và lịch sử lịch hẹn
public function show($id)
{
    try {
        $patient = Patient::with('user')->findOrFail($id);

        // Kiểm tra xem model có relationship 'appointments' không
        $appointments = $patient->appointments()
            ->with(['doctor', 'department'])
            ->orderBy('appointment_time', 'desc')// sắp xếp theo thời gian cuộc hẹn mới nhất
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'patient' => $patient,
                'appointments' => $appointments,
                'stats' => [
                    'total_appointments' => $appointments->count(),
                    'completed' => $appointments->where('status', 'completed')->count(),
                    'upcoming' => $appointments->whereIn('status', ['pending', 'confirmed'])->count(),
                ]
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
        ], 500);
    }
}

   // Cập nhật thông tin bệnh nhân
    public function update(Request $request, $id)
    {     // Validate đầu vào 
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'insurance_number' => 'nullable|string|max:50',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'avatar_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $patient = Patient::findOrFail($id);
        $patient->update($validator->validated());// Cập nhật thông tin bệnh nhân

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin bệnh nhân thành công!',
            'data' => $patient
        ]);
    }

  // Xóa bệnh nhân
    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        
       // Kiểm tra nếu bệnh nhân có lịch hẹn thì không cho xóa
        if ($patient->appointments()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa bệnh nhân đã có lịch hẹn. Vui lòng hủy tất cả lịch hẹn trước.'
            ], 400);
        }

        $patient->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa bệnh nhân thành công!'
        ]);
    }

    // Thống kê bệnh nhân
    public function getStatistics()
    {
        $total = Patient::count();
        
        $stats = [
            'total' => $total,
            'male' => Patient::where('gender', 'male')->count(),
            'female' => Patient::where('gender', 'female')->count(),
            'with_insurance' => Patient::whereNotNull('insurance_number')->count(),
            'new_this_month' => Patient::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

public function toggleBlock($id)
{
    $patient = Patient::findOrFail($id);
    
  
    $patient->is_blocked = !$patient->is_blocked;
    $patient->save();

    return response()->json([
        'success' => true,
        'message' => $patient->is_blocked 
            ? 'Đã chặn bệnh nhân!' 
            : 'Đã mở chặn bệnh nhân!',
        'data' => $patient
    ]);
}
}