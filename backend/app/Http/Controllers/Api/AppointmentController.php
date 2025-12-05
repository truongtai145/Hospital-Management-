<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Patient;
use Carbon\Carbon;
use App\Models\Doctor;
class AppointmentController extends Controller
{
    
    public function index(Request $request)
{
    $user = Auth::user();

    $query = Appointment::with(['doctor.department', 'patient']);

    /**
     * 1. Nếu là bệnh nhân → chỉ lấy lịch hẹn của họ
     */
    if ($user->role === 'patient') {
        $patient = Patient::where('user_id', $user->id)->first();

        if (!$patient) {
            return response()->json(['success' => false, 'data' => []]);
        }

        $query->where('patient_id', $patient->id);
    }

    /**
     * 2. Nếu là bác sĩ → chỉ lấy lịch hẹn của bác sĩ đó
     */
    if ($user->role === 'doctor') {
        $doctorProfile = Doctor::where('user_id', $user->id)->first();

        if (!$doctorProfile) {
            return response()->json(['success' => false, 'data' => []]);
        }

        $query->where('doctor_id', $doctorProfile->id);
    }

    /**
     * 3. Nếu có lọc theo ngày
     */
    if ($request->has('date')) {
        $query->whereDate('appointment_time', $request->date);
    }

    /**
     * 4. Trả về danh sách lịch hẹn (sắp xếp tăng dần theo giờ)
     */
    $appointments = $query->orderBy('appointment_time', 'asc')->get();

    return response()->json([
        'success' => true,
        'data' => $appointments,
    ]);
}


    
     // Tạo một lịch hẹn mới.
     
   public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_time' => 'required|date|after:now',
            'reason' => 'required|string',
     
            'full_name' => 'required_without:user_id|string|max:255',
            'email' => 'required_without:user_id|email|max:255',
            'phone' => 'required_without:user_id|string|max:20',
          
            'allergies_at_appointment' => 'nullable|string',
            'medical_history_at_appointment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        // Kiểm tra nếu người dùng đã đăng nhập
        if (Auth::check()) {
            $user = Auth::user();
            // Tìm patient_id từ user_id
            $patient = Patient::where('user_id', $user->id)->first();
            if ($patient) {
                $validatedData['patient_id'] = $patient->id;
            } else {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ bệnh nhân cho tài khoản này.'], 404);
            }
        } else {
         
            // Ở đây, ta yêu cầu đăng nhập để đơn giản hóa
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để đặt lịch.'], 401);
        }

        $appointment = Appointment::create($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Đặt lịch hẹn thành công!',
            'data' => $appointment
        ], 201);
    }


     // Xem chi tiết một lịch hẹn.
     
    public function show(Appointment $appointment)
    {
        $user = Auth::user();

        // Bảo mật: Bệnh nhân chỉ được xem chi tiết lịch hẹn của chính mình
        if ($user->role === 'patient') {
            $patientProfile = Patient::where('user_id', $user->id)->first();
            if (!$patientProfile || $appointment->patient_id !== $patientProfile->id) {
                return response()->json(['success' => false, 'message' => 'Không có quyền xem lịch hẹn này.'], 403);
            }
        }
        
        // logic bảo mật cho bác sĩ

        return response()->json([
            'success' => true,
            'data' => $appointment->load(['doctor.department', 'patient'])
        ]);
    }

    
    public function update(Request $request, Appointment $appointment)
    {
        // Admin có thể cập nhật trạng thái, ghi chú...
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled,no_show',
            'doctor_notes' => 'nullable|string',
            'prescription' => 'nullable|string',
            // Bệnh nhân có thể được phép cập nhật thời gian nếu lịch hẹn chưa được xác nhận
            'appointment_time' => 'sometimes|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $appointment->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật lịch hẹn thành công!',
            'data' => $appointment
        ]);
    }

    /**
     * Hủy một lịch hẹn. 
     */
    public function destroy(Appointment $appointment)
{
    $user = Auth::user();

    //  Bệnh nhân chỉ được hủy lịch hẹn của chính mình
    if ($user->role === 'patient') {
        $patientProfile = Patient::where('user_id', $user->id)->first();
        if (!$patientProfile || $appointment->patient_id !== $patientProfile->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền hủy lịch hẹn này.'], 403);
        }
    }

    //  Trạng thái lịch hẹn phải phù hợp để hủy
    if (!in_array($appointment->status, ['pending', 'confirmed'])) {
        return response()->json(['success' => false, 'message' => 'Không thể hủy lịch hẹn đã hoàn thành hoặc đã bị hủy trước đó.'], 400);
    }
    

    $appointmentTime = Carbon::parse($appointment->appointment_time);
    $now = Carbon::now();

    // Nếu thời gian còn lại lớn hơn hoặc bằng 24 tiếng
    if ($now->diffInHours($appointmentTime, false) >= 24) {
        $appointment->status = 'cancelled';
        $appointment->save();

        return response()->json([
            'success' => true,
            'message' => 'Hủy lịch hẹn thành công!'
        ]);
    } 
    // Nếu thời gian còn lại dưới 24 tiếng
    else {
        // Hiện tại, chúng ta sẽ trả về lỗi. 
        // Logic "chờ admin duyệt" sẽ phức tạp hơn và cần một cột mới trong DB (ví dụ: `cancellation_request_status`)
        return response()->json([
            'success' => false,
            'message' => 'Không thể tự hủy lịch hẹn trong vòng 24 giờ trước giờ khám. Vui lòng liên hệ trực tiếp với phòng khám.'
        ], 400);
    }
}
}