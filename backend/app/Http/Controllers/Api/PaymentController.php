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

            $consultationFee = $appointment->doctor->consultation_fee ?? 0;
            $medicationCost = $request->medication_cost;
            $subTotal = $consultationFee + $medicationCost;
            $discount = 0;

            if ($appointment->patient->insurance_number) {
                $discount = $subTotal * 0.20;
            }

            $totalAmount = $subTotal - $discount;

            $payment = Payment::where('appointment_id', $appointment->id)->first();

            if ($payment) {
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

    public function index(Request $request)
    {
        $query = Payment::with(['appointment.doctor', 'patient']);
        
        // Lọc theo trạng thái
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // LỌC THEO payment_date THAY VÌ created_at
        if ($request->has('payment_date')) {
            $date = $request->payment_date;
            $query->whereDate('payment_date', $date);
        }
        
        // Lọc theo phương thức thanh toán
        if ($request->has('payment_method')) { 
            $query->where('payment_method', $request->payment_method);
        }
        
        // Tìm kiếm theo tên bệnh nhân hoặc số điện thoại
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        // Sắp xếp
        $sortBy = $request->get('sort_by', 'payment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $payments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    public function show($id)
    {
        $payment = Payment::with(['appointment.doctor.department', 'patient'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

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
            
            if ($paymentMethod === 'cash') {
                // Tiền mặt: chờ admin xác nhận
                $payment->update([
                    'payment_method' => $paymentMethod,
                    'status' => 'processing',
                    'payment_date' => now(),
                ]);
                
                $message = 'Đã ghi nhận thanh toán bằng tiền mặt. Vui lòng chờ xác nhận từ quầy thu ngân.';
                
            } else {
                // Các phương thức khác: hoàn thành ngay
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
                // payment_date đã được set khi processPayment
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

        $payments = Payment::where('patient_id', $patient->id)
            ->with([
                'patient',
                'appointment.doctor.department',
                'appointment'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

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

    public function getStatistics(Request $request)
    {
        $baseQuery = Payment::query();

        // LỌC THEO payment_date THAY VÌ created_at
        if ($request->has('start_date') && $request->has('end_date')) {
            $baseQuery->whereBetween('payment_date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $stats = [
            'total_revenue' => (clone $baseQuery)
                ->where('status', 'completed')
                ->sum('total_amount'),

            'total_pending' => (clone $baseQuery)
                ->where('status', 'pending')
                ->sum('total_amount'),

            'total_payments' => (clone $baseQuery)->count(),

            'completed_payments' => (clone $baseQuery)
                ->where('status', 'completed')
                ->count(),

            'pending_payments' => (clone $baseQuery)
                ->where('status', 'pending')
                ->count(),

            'by_payment_method' => (clone $baseQuery)
                ->where('status', 'completed')
                ->select(
                    'payment_method',
                    DB::raw('count(*) as count'),
                    DB::raw('sum(total_amount) as total')
                )
                ->groupBy('payment_method')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}