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
use Illuminate\Support\Facades\DB;
class AppointmentController extends Controller
{
    
    public function index(Request $request)
{
    $user = Auth::user();

    $query = Appointment::with(['doctor.department', 'patient']);

    // 1. Nếu là bệnh nhân , chỉ lấy lịch hẹn của chính mình
    if ($user->role === 'patient') {
        $patient = Patient::where('user_id', $user->id)->first();

        if (!$patient) {
            return response()->json(['success' => false, 'data' => []]);
        }

        $query->where('patient_id', $patient->id);
    }

   // 2. Nếu là bác sĩ, chỉ lấy lịch hẹn của chính mình
    if ($user->role === 'doctor') {
        $doctorProfile = Doctor::where('user_id', $user->id)->first();

        if (!$doctorProfile) {
            return response()->json(['success' => false, 'data' => []]);
        }

        $query->where('doctor_id', $doctorProfile->id);
    }
    // 3. Lọc theo ngày nếu có
    if ($request->has('date')) {
        $query->whereDate('appointment_time', $request->date);
    }
    // Lấy danh sách lịch hẹn và sắp xếp theo thời gian hẹn
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
            return response()->json([
                'success' => false, 
                'errors' => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();

        // Kiểm tra user đã đăng nhập
        if (Auth::check()) {
            $user = Auth::user();
            $patient = Patient::where('user_id', $user->id)->first();
            
            if ($patient) {
                $validatedData['patient_id'] = $patient->id;
            } else {
                return response()->json([
                    'success' => false, 
                    'message' => 'Không tìm thấy hồ sơ bệnh nhân cho tài khoản này.'
                ], 404);
            }
        } else {
            return response()->json([
                'success' => false, 
                'message' => 'Bạn cần đăng nhập để đặt lịch.'
            ], 401);
        }

        //  SỬ DỤNG TRANSACTION + LOCK ĐỂ TRÁNH RACE CONDITION
        try {
            return DB::transaction(function () use ($validatedData) {
                $appointmentTime = Carbon::parse($validatedData['appointment_time']);
                
                //  Chặn các request khác đang cố đặt cùng thời điểm
                // lockForUpdate() sẽ khóa row cho đến khi transaction hoàn tất
                $existingAppointment = Appointment::where('doctor_id', $validatedData['doctor_id'])
                    ->where('appointment_time', $appointmentTime)
                    ->whereIn('status', ['pending', 'confirmed', 'completed'])
                    ->lockForUpdate() // Lock để tránh 2 request cùng lúc
                    ->exists();

                if ($existingAppointment) {
                    throw new \Exception('Khung giờ này đã được đặt bởi người khác. Vui lòng chọn khung giờ khác.');
                }

                $appointment = Appointment::create($validatedData);

                return response()->json([
                    'success' => true,
                    'message' => 'Đặt lịch hẹn thành công!',
                    'data' => $appointment
                ], 201);
            });
            
        } catch (\Illuminate\Database\QueryException $e) {
            // Bắt lỗi duplicate từ unique constraint
            if ($e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'Khung giờ này đã được đặt bởi người khác. Vui lòng chọn khung giờ khác.'
                ], 409);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi đặt lịch: ' . $e->getMessage()
            ], 500);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 409);
        }
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
    $validator = Validator::make($request->all(), [
        'status' => 'sometimes|in:pending,confirmed,completed,cancelled,no_show',
        'doctor_notes' => 'nullable|string',
        'prescription' => 'nullable|string',
        'appointment_time' => 'sometimes|date|after:now',
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $oldStatus = $appointment->status;
    $appointment->update($validator->validated());

    // **QUAN TRỌNG: Tự động tạo payment khi chuyển sang completed**
    if ($request->status === 'completed' && $oldStatus !== 'completed') {
        // Kiểm tra xem đã có payment chưa
        $existingPayment = \App\Models\Payment::where('appointment_id', $appointment->id)->first();
        
        if (!$existingPayment) {
           
            $consultationFee = $appointment->doctor->consultation_fee ?? 0;
            $medicationCost = 0;
            
            \App\Models\Payment::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'consultation_fee' => $consultationFee,
                'medication_cost' => $medicationCost,
                'sub_total' => $consultationFee + $medicationCost, 
                'amount' => $consultationFee + $medicationCost,
                'payment_method' => null,
                'status' => 'pending',
                'transaction_id' => 'INV-' . strtoupper(\Illuminate\Support\Str::random(10)),
                'notes' => 'Tự động tạo từ lịch hẹn #' . $appointment->id,
            ]);
        }
    }

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật lịch hẹn thành công!',
        'data' => $appointment->load(['doctor.department', 'patient.user'])
    ]);
}
   // Hủy một lịch hẹn.
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
        
       
        return response()->json([
            'success' => false,
            'message' => 'Không thể tự hủy lịch hẹn trong vòng 24 giờ trước giờ khám. Vui lòng liên hệ trực tiếp với phòng khám.'
        ], 400);
    }
    
}
public function checkAvailability(Request $request)
{
    $validator = Validator::make($request->all(), [
        'doctor_id' => 'required|exists:doctors,id',
        'date' => 'required|date|after_or_equal:today',
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $doctorId = $request->doctor_id;
    $date = Carbon::parse($request->date)->startOfDay();



    // Lấy tất cả lịch hẹn đã đặt 
    $bookedAppointments = Appointment::where('doctor_id', $doctorId)
        ->whereDate('appointment_time', $date)
        ->whereIn('status', ['pending', 'confirmed']) // Chỉ lấy lịch chưa hủy
        ->get()
        ->pluck('appointment_time')
        ->map(function($time) {
            return Carbon::parse($time)->format('H:i');
        })
        ->toArray();

    // Tạo danh sách các khung giờ làm việc
    $timeSlots = [];
    
    // Ca sáng: 8:00 - 11:00
    for ($hour = 8; $hour < 11; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $timeSlots[] = sprintf('%02d:%02d', $hour, $minute);
        }
    }
    
    // Ca chiều: 13:00 - 20:00
    for ($hour = 13; $hour < 20; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $timeSlots[] = sprintf('%02d:%02d', $hour, $minute);
        }
    }

    // Lọc ra các khung giờ còn trống
    $availableSlots = array_values(array_diff($timeSlots, $bookedAppointments));

    // Lọc các khung giờ đã qua (nếu là ngày hôm nay)
    if ($date->isToday()) {
        $now = Carbon::now();
        $availableSlots = array_filter($availableSlots, function($slot) use ($now, $date) {
            $slotTime = Carbon::parse($date->format('Y-m-d') . ' ' . $slot);
            return $slotTime->greaterThan($now);
        });
        $availableSlots = array_values($availableSlots);
    }

    return response()->json([
        'success' => true,
        'data' => [
            'date' => $date->format('Y-m-d'),
            'doctor_id' => $doctorId,
            'available_slots' => $availableSlots,
            'booked_slots' => $bookedAppointments,
            'total_available' => count($availableSlots)
        ]
    ]);
}
}