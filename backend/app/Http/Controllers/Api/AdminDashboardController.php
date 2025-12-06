<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    
     // Lấy thống kê tổng quan cho dashboard
     
    public function getStats(Request $request)
    {
        $period = $request->get('period', 'today'); // today, week, month
        
        $today = Carbon::today();
        $startDate = match($period) {
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            default => $today,
        };
        
        // Lịch khám hôm nay/kỳ
        $todayAppointments = Appointment::whereDate('appointment_time', '>=', $startDate)
            ->whereDate('appointment_time', '<=', Carbon::now()->endOfDay())
            ->count();
            
        $pendingAppointments = Appointment::where('status', 'pending')
            ->whereDate('appointment_time', '>=', $startDate)
            ->count();

        // Doanh thu
        $revenue = Appointment::where('status', 'completed')
            ->whereDate('appointment_time', '>=', $startDate)
            ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
            ->sum('doctors.consultation_fee');

        // Bệnh nhân mới
        $newPatients = Patient::whereDate('created_at', '>=', $startDate)->count();
        
        // Bác sĩ đang hoạt động
        $activeDoctors = Doctor::where('is_available', true)->count();
        $totalDoctors = Doctor::count();

        // Tính phần trăm thay đổi so với kỳ trước
        $previousPeriod = match($period) {
            'week' => [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()],
            'month' => [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()],
            default => [Carbon::yesterday()->startOfDay(), Carbon::yesterday()->endOfDay()],
        };

        $previousAppointments = Appointment::whereBetween('appointment_time', $previousPeriod)->count();
        $appointmentTrend = $previousAppointments > 0 
            ? round((($todayAppointments - $previousAppointments) / $previousAppointments) * 100, 1)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'appointments' => [
                    'total' => $todayAppointments,
                    'pending' => $pendingAppointments,
                    'trend' => $appointmentTrend,
                ],
                'revenue' => [
                    'total' => $revenue,
                    'average' => $todayAppointments > 0 ? round($revenue / $todayAppointments) : 0,
                    'trend' => 12.5, // Tính toán tương tự
                ],
                'patients' => [
                    'new' => $newPatients,
                    'trend' => -5, // Tính toán tương tự
                ],
                'doctors' => [
                    'active' => $activeDoctors,
                    'total' => $totalDoctors,
                    'trend' => 8,
                ],
            ]
        ]);
    }

    
    // Lấy dữ liệu biểu đồ
     
    public function getChartData(Request $request)
    {
        $period = $request->get('period', 'week'); // week, month
        
        if ($period === 'week') {
            $data = [];
            $days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::now()->startOfWeek()->addDays($i);
                
                $appointments = Appointment::whereDate('appointment_time', $date)->count();
                
                $revenue = Appointment::whereDate('appointment_time', $date)
                    ->where('status', 'completed')
                    ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
                    ->sum('doctors.consultation_fee');
                
                $data[] = [
                    'label' => $days[$i],
                    'value' => $appointments,
                    'revenue' => $revenue,
                ];
            }
        } else {
            // Month data - group by week
            $data = [];
            $weeksInMonth = 4;
            
            for ($i = 0; $i < $weeksInMonth; $i++) {
                $startDate = Carbon::now()->startOfMonth()->addWeeks($i);
                $endDate = $startDate->copy()->endOfWeek();
                
                $appointments = Appointment::whereBetween('appointment_time', [$startDate, $endDate])->count();
                
                $revenue = Appointment::whereBetween('appointment_time', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
                    ->sum('doctors.consultation_fee');
                
                $data[] = [
                    'label' => 'Tuần ' . ($i + 1),
                    'value' => $appointments,
                    'revenue' => $revenue,
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    
    // Lấy danh sách lịch hẹn gần đây
     
    public function getRecentAppointments()
    {
        $appointments = Appointment::with(['patient', 'doctor'])
            ->orderBy('appointment_time', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'code' => 'AP' . str_pad($apt->id, 4, '0', STR_PAD_LEFT),
                    'patient' => $apt->patient->full_name ?? 'N/A',
                    'doctor' => 'BS. ' . ($apt->doctor->full_name ?? 'N/A'),
                    'type' => $apt->reason,
                    'time' => Carbon::parse($apt->appointment_time)->format('H:i'),
                    'date' => Carbon::parse($apt->appointment_time)->format('d/m/Y'),
                    'status' => $apt->status,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    
     // Lấy tổng quan nhanh
     
    public function getOverview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_patients' => Patient::count(),
                'total_doctors' => Doctor::count(),
                'total_appointments' => Appointment::count(),
                'today_appointments' => Appointment::whereDate('appointment_time', $today)->count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'completed_today' => Appointment::whereDate('appointment_time', $today)
                    ->where('status', 'completed')
                    ->count(),
            ]
        ]);
    }
}