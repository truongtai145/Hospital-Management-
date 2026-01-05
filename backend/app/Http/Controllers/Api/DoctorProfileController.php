<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DoctorProfileController extends Controller
{
    // GET /api/v1/doctors?department_id=1
    public function index(Request $request)
    {
        $query = Doctor::with('department')->where('is_available', true);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $doctors = $query->orderBy('full_name')->get();

        return response()->json([
            'success' => true,
            'data' => $doctors,
        ]);
    }
    
    // GET /api/v1/doctor/profile
    public function show()
    {
        $user = Auth::user();

        $doctorProfile = Doctor::where('user_id', $user->id)
                                ->with('department')
                                ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $doctorProfile
        ]);
    }

    // GET /api/v1/doctors/{doctor}
    public function showdoctor(Doctor $doctor)
    {
        return response()->json([
            'success' => true,
            'data' => $doctor->load('department', 'user')
        ]);
    }
    
    // PUT /api/v1/doctor/profile
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $doctorProfile = Doctor::where('user_id', $user->id)->firstOrFail();//nếu không có trả lỗi 404

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'education' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'biography' => 'nullable|string',
            'avatar_url' => 'nullable|string|url|max:500',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $doctorProfile->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công!',
            'data' => $doctorProfile->load('department')
        ]);
    }

    /* GET /api/v1/doctor/patients/{id} */
    public function showPatient($id)
    {
        try {
            $user = Auth::user();
            
            // Lấy thông tin bác sĩ hiện tại
            $doctor = Doctor::where('user_id', $user->id)->firstOrFail();
            
            // Lấy thông tin bệnh nhân
            $patient = Patient::with('user')->findOrFail($id);
            
            // Kiểm tra xem bác sĩ có từng khám bệnh nhân này không
            $appointments = $patient->appointments()
                ->where('doctor_id', $doctor->id)
                ->with(['doctor', 'department'])
                ->orderBy('appointment_time', 'desc')
                ->get();
            
            // Nếu bác sĩ chưa từng khám bệnh nhân này, không cho phép xem
            if ($appointments->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xem thông tin bệnh nhân này'
                ], 403);
            }
            
            // Tính toán thống kê
            $stats = [
                'total_appointments' => $appointments->count(),
                'completed' => $appointments->where('status', 'completed')->count(),
                'upcoming' => $appointments->whereIn('status', ['pending', 'confirmed'])->count(),
                'cancelled' => $appointments->where('status', 'cancelled')->count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => $patient,
                    'appointments' => $appointments,
                    'stats' => $stats
                ]
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bệnh nhân'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}