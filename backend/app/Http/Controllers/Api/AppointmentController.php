<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Patient;

class AppointmentController extends Controller
{
    /**
     * Lấy danh sách lịch hẹn.
     * Bệnh nhân chỉ thấy lịch hẹn của mình.
     * Admin/Bác sĩ có thể thấy tất cả (sẽ được phân quyền ở route).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Appointment::with(['doctor.department', 'patient']);

        // Nếu là bệnh nhân, chỉ lấy lịch hẹn của chính họ
        if ($user->role === 'patient') {
            $patient = Patient::where('user_id', $user->id)->first();
            if ($patient) {
                $query->where('patient_id', $patient->id);
            } else {
                return response()->json(['success' => false, 'data' => []]); // Trả về mảng rỗng nếu không có hồ sơ
            }
        }

        // TODO: Thêm logic lọc cho bác sĩ (chỉ thấy lịch hẹn của mình)
        // if ($user->role === 'doctor') { ... }

        // Sắp xếp lịch hẹn mới nhất lên đầu
        $appointments = $query->orderBy('appointment_time', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    /**
     * Tạo một lịch hẹn mới.
     */
   public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'required|exists:departments,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_time' => 'required|date|after:now',
            'reason' => 'required|string',
            // Các trường thông tin bệnh nhân
            'full_name' => 'required_without:user_id|string|max:255',
            'email' => 'required_without:user_id|email|max:255',
            'phone' => 'required_without:user_id|string|max:20',
            // Các trường tùy chọn
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
            // Xử lý cho khách vãng lai (tùy chọn)
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


    /**
     * Xem chi tiết một lịch hẹn.
     */
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
        
        // TODO: Thêm logic bảo mật cho bác sĩ

        return response()->json([
            'success' => true,
            'data' => $appointment->load(['doctor.department', 'patient'])
        ]);
    }

    /**
     * Cập nhật một lịch hẹn. (Thường dành cho Admin/Bác sĩ để thay đổi trạng thái).
     */
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
     * Hủy một lịch hẹn. (Bệnh nhân có thể tự hủy lịch của mình).
     */
    public function destroy(Appointment $appointment)
    {
        $user = Auth::user();

        // Bảo mật: Bệnh nhân chỉ được hủy lịch hẹn của chính mình
        if ($user->role === 'patient') {
            $patientProfile = Patient::where('user_id', $user->id)->first();
            if (!$patientProfile || $appointment->patient_id !== $patientProfile->id) {
                return response()->json(['success' => false, 'message' => 'Không có quyền hủy lịch hẹn này.'], 403);
            }
        }
        
        // Thay vì xóa, chúng ta nên cập nhật trạng thái thành 'cancelled'
        // Đây là cách làm tốt hơn để giữ lại lịch sử
        $appointment->status = 'cancelled';
        $appointment->save();

        // Nếu bạn thực sự muốn xóa khỏi database thì dùng: $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hủy lịch hẹn thành công!'
        ]);
    }
}