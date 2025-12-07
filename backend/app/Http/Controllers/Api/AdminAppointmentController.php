<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminAppointmentController extends Controller
{
    /**
     * Lấy danh sách tất cả lịch hẹn
     */
    public function index(Request $request)
    {
      $query = Appointment::with(['patient', 'doctor.department']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('appointment_time', $request->date);
        }

        // Filter by doctor
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'appointment_time');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $appointments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    /**
     * Xem chi tiết lịch hẹn
     */
    public function show($id)
    {
        $appointment = Appointment::with(['patient', 'doctor.department'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $appointment
        ]);
    }

    /**
     * Cập nhật lịch hẹn (Admin có full quyền)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled,no_show',
            'doctor_id' => 'sometimes|exists:doctors,id',
            'appointment_time' => 'sometimes|date',
            'doctor_notes' => 'nullable|string',
            'prescription' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = Appointment::findOrFail($id);
        $appointment->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật lịch hẹn thành công!',
            'data' => $appointment->load(['patient', 'doctor'])
        ]);
    }

    /**
     * Xóa lịch hẹn
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa lịch hẹn thành công!'
        ]);
    }

    /**
     * Bulk update status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'appointment_ids' => 'required|array',
            'appointment_ids.*' => 'exists:appointments,id',
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        Appointment::whereIn('id', $request->appointment_ids)
            ->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công!'
        ]);
    }

    /**
     * Get statistics
     */
    public function getStatistics(Request $request)
    {
        $query = Appointment::query();

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('appointment_time', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $stats = [
            'total' => $query->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'confirmed' => (clone $query)->where('status', 'confirmed')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            'no_show' => (clone $query)->where('status', 'no_show')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}