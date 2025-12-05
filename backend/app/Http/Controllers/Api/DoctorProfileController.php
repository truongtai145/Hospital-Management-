<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;


class DoctorProfileController extends Controller
{
     // GET /api/v1/doctors?department_id=1
     
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
    
     
     // GET /api/v1/doctor/profile
    
    public function show()
    {
        
        $user = Auth::user();

        // 2. Tìm hồ sơ bác sĩ tương ứng, load sẵn thông tin khoa và báo lỗi nếu không tìm thấy
        $doctorProfile = Doctor::where('user_id', $user->id)
                                ->with('department')
                                ->firstOrFail();

        // 3. Trả về dữ liệu
        return response()->json([
            'success' => true,
            'data' => $doctorProfile
        ]);
    }
 public function showdoctor(Doctor $doctor)
    {
        // Load các mối quan hệ để trả về thông tin đầy đủ
        return response()->json([
            'success' => true,
            'data' => $doctor->load('department', 'user')
        ]);
    }
    
    
     // PUT /api/v1/doctor/profile
     
    public function update(Request $request)
    {
       
        $user = Auth::user();
        
        // 2. Tìm hồ sơ bác sĩ tương ứng và báo lỗi nếu không tìm thấy
        $doctorProfile = Doctor::where('user_id', $user->id)->firstOrFail();

        // 3. Validate dữ liệu gửi lên (chỉ các trường bác sĩ được phép tự sửa)
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'education' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'biography' => 'nullable|string',
            // 'consultation_fee' => 'nullable|numeric|min:0', // Admin mới được sửa phí
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
}