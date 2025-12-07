<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Tạo hoặc cập nhật hóa đơn từ appointment (Admin)
     * POST /api/v1/admin/payments/create-or-update
     */
    public function createOrUpdatePayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'appointment_id' => 'required|exists:appointments,id',
            'medication_cost' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $appointment = Appointment::with(['doctor', 'patient'])->findOrFail($request->appointment_id);

            if ($appointment->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Lịch hẹn chưa hoàn thành. Không thể tạo hóa đơn.'
                ], 400);
            }

            // Tính toán
            $consultationFee = $appointment->doctor->consultation_fee ?? 0;
            $medicationCost = $request->medication_cost;
            $subTotal = $consultationFee + $medicationCost;
            $discount = 0;

            if ($appointment->patient->insurance_number) {
                $discount = $subTotal * 0.20;
            }

            $totalAmount = $subTotal - $discount;

            // Kiểm tra xem đã có hóa đơn chưa
            $payment = Payment::where('appointment_id', $appointment->id)->first();

            if ($payment) {
                // Cập nhật hóa đơn hiện có
                if ($payment->status === 'completed') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Không thể cập nhật hóa đơn đã thanh toán.'
                    ], 400);
                }

                $payment->update([
                    'sub_total' => $subTotal,
                    'discount' => $discount,
                    'total_amount' => $totalAmount,
                    'notes' => $request->notes,
                ]);

                $message = 'Cập nhật hóa đơn thành công!';
            } else {
                // Tạo hóa đơn mới
                $payment = Payment::create([
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'sub_total' => $subTotal,
                    'discount' => $discount,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'transaction_id' => 'INV-' . strtoupper(Str::random(10)),
                    'notes' => $request->notes,
                ]);

                $message = 'Tạo hóa đơn thành công!';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $payment->load(['appointment.doctor', 'patient'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách hóa đơn (Admin)
     */
    public function index(Request $request)
    {
        $query = Payment::with(['appointment.doctor', 'patient']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $payments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Xem chi tiết hóa đơn
     */
    public function show($id)
    {
        $payment = Payment::with(['appointment.doctor.department', 'patient'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Lấy hóa đơn theo appointment ID
     */
    public function getByAppointment($appointmentId)
    {
        $payment = Payment::where('appointment_id', $appointmentId)
            ->with(['appointment.doctor', 'patient'])
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa có hóa đơn cho lịch hẹn này.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Bệnh nhân thanh toán
     */
    public function processPayment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|in:cash,credit_card,bank_transfer,momo,vnpay',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $payment = Payment::findOrFail($id);

            if ($payment->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hóa đơn đã được thanh toán.'
                ], 400);
            }

            $paymentMethod = $request->payment_method;
            
            // Logic xử lý theo phương thức thanh toán
            if ($paymentMethod === 'cash') {
                // Tiền mặt: Chuyển sang "processing" - chờ admin xác nhận
                $payment->update([
                    'payment_method' => $paymentMethod,
                    'status' => 'processing',
                    'payment_date' => now(),
                ]);
                
                $message = 'Đã ghi nhận thanh toán bằng tiền mặt. Vui lòng chờ xác nhận từ quầy thu ngân.';
                
            } elseif ($paymentMethod === 'vnpay') {
                // VNPay: Chuyển sang "completed" luôn (giả lập thanh toán thành công)
                // Trong thực tế, bạn sẽ tích hợp với VNPay API
                $payment->update([
                    'payment_method' => $paymentMethod,
                    'status' => 'completed',
                    'payment_date' => now(),
                ]);
                
                $message = 'Thanh toán VNPay thành công!';
                
            } else {
                // Các phương thức khác: Chuyển sang "completed"
                $payment->update([
                    'payment_method' => $paymentMethod,
                    'status' => 'completed',
                    'payment_date' => now(),
                ]);
                
                $message = 'Thanh toán thành công!';
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $payment->load(['appointment.doctor', 'patient'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Thanh toán thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin xác nhận thanh toán (cho thanh toán tiền mặt)
     */
    public function confirmPayment(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $payment = Payment::findOrFail($id);

            if ($payment->status !== 'processing') {
                return response()->json([
                    'success' => false,
                    'message' => 'Chỉ có thể xác nhận hóa đơn đang chờ xác nhận (processing).'
                ], 400);
            }

            $payment->update([
                'status' => 'completed',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã xác nhận thanh toán thành công!',
                'data' => $payment->load(['appointment.doctor', 'patient'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Xác nhận thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy hóa đơn của bệnh nhân hiện tại
     */
    public function getPatientPayments(Request $request)
    {
        $user = $request->user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ bệnh nhân.'
            ], 404);
        }

        // Load đầy đủ relationships như AdminPaymentModal
        $payments = Payment::where('patient_id', $patient->id)
            ->with([
                'patient',  // Thông tin bệnh nhân
                'appointment.doctor.department',  // Thông tin bác sĩ và khoa
                'appointment'  // Thông tin lịch hẹn (reason, doctor_notes, prescription)
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Hủy hóa đơn (chỉ khi chưa thanh toán)
     */
    public function cancel($id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy hóa đơn đã thanh toán.'
            ], 400);
        }

        $payment->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy hóa đơn thành công.'
        ]);
    }

    /**
     * Thống kê thanh toán
     */
    public function getStatistics(Request $request)
    {
        $query = Payment::query();

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $stats = [
            'total_revenue' => $query->where('status', 'completed')->sum('total_amount'),
            'total_pending' => (clone $query)->where('status', 'pending')->sum('total_amount'),
            'total_payments' => $query->count(),
            'completed_payments' => (clone $query)->where('status', 'completed')->count(),
            'pending_payments' => (clone $query)->where('status', 'pending')->count(),
            'by_payment_method' => Payment::select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
                ->where('status', 'completed')
                ->groupBy('payment_method')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}