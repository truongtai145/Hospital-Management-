<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Payment;
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
        $endDate = Carbon::now()->endOfDay();
        $startDate = match($period) {
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            default => $today,
        };
        
        // Tối ưu: Gộp queries appointments trong cùng 1 query với điều kiện khác nhau
        $appointmentStats = Appointment::select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
            )
            ->whereBetween('appointment_time', [$startDate, $endDate])
            ->first();
        
        $todayAppointments = $appointmentStats->total ?? 0;
        $pendingAppointments = $appointmentStats->pending ?? 0;

        // Doanh thu - tối ưu với join
        $revenue = Appointment::where('appointments.status', 'completed')
            ->whereBetween('appointments.appointment_time', [$startDate, $endDate])
            ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
            ->sum('doctors.consultation_fee') ?? 0;

        // Bệnh nhân mới
        $newPatients = Patient::whereDate('created_at', '>=', $startDate)->count();
        
        // Bác sĩ đang hoạt động - gộp 2 queries thành 1
        $doctorStats = Doctor::select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) as active')
            )
            ->first();
        
        $activeDoctors = $doctorStats->active ?? 0;
        $totalDoctors = $doctorStats->total ?? 0;

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
                    'trend' => 12.5, // Có thể tính toán thêm nếu cần
                ],
                'patients' => [
                    'new' => $newPatients,
                    'trend' => -5, // Có thể tính toán thêm nếu cần
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
        $period = $request->get('period', 'week'); // today, week, month
        
        if ($period === 'today') {
            // Biểu đồ theo giờ trong ngày hôm nay
            $today = Carbon::today();
            $todayEnd = Carbon::today()->endOfDay();
            
            // Lấy appointments theo giờ
            $appointmentsData = Appointment::select(
                    DB::raw('HOUR(appointment_time) as hour'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('appointment_time', [$today, $todayEnd])
                ->groupBy('hour')
                ->pluck('count', 'hour')
                ->toArray();
            
            // Lấy revenue từ payments table - tính theo giờ của payment_date hoặc created_at
            $revenueData = Payment::select(
                    DB::raw('HOUR(COALESCE(payment_date, created_at)) as hour'),
                    DB::raw('SUM(total_amount) as total')
                )
                ->where('status', 'completed')
                ->whereDate(DB::raw('COALESCE(payment_date, created_at)'), $today)
                ->groupBy('hour')
                ->pluck('total', 'hour')
                ->toArray();
            
            // Build data array với 24 giờ (hoặc chỉ giờ có data)
            $data = [];
            for ($i = 0; $i < 24; $i++) {
                $data[] = [
                    'label' => sprintf('%02d:00', $i),
                    'value' => $appointmentsData[$i] ?? 0,
                    'revenue' => $revenueData[$i] ?? 0,
                ];
            }
        } elseif ($period === 'week') {
            // Tối ưu: dùng single query với groupBy thay vì loop
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();
            
            // Lấy tất cả appointments trong tuần và group theo ngày
            $appointmentsData = Appointment::select(
                    DB::raw('DATE(appointment_time) as date'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('appointment_time', [$startDate, $endDate])
                ->groupBy('date')
                ->pluck('count', 'date')
                ->toArray();
            
            // Lấy revenue từ payments table (theo ngày)
            $revenueData = Payment::select(
                    DB::raw('DATE(COALESCE(payment_date, created_at)) as date'),
                    DB::raw('SUM(total_amount) as total')
                )
                ->where('status', 'completed')
                ->whereBetween(DB::raw('COALESCE(payment_date, created_at)'), [$startDate, $endDate])
                ->groupBy('date')
                ->pluck('total', 'date')
                ->toArray();
            
            // Build data array với tất cả 7 ngày
            $days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            $data = [];
            
            for ($i = 0; $i < 7; $i++) {
                $date = $startDate->copy()->addDays($i);
                $dateKey = $date->format('Y-m-d');
                
                $data[] = [
                    'label' => $days[$i],
                    'value' => $appointmentsData[$dateKey] ?? 0,
                    'revenue' => $revenueData[$dateKey] ?? 0,
                ];
            }
        } else {
            // Month data - tối ưu với single queries
            $monthStart = Carbon::now()->startOfMonth();
            $monthEnd = Carbon::now()->endOfMonth();
            $weeksInMonth = 4;
            
            // Tính toán tuần
            $data = [];
            
            for ($i = 0; $i < $weeksInMonth; $i++) {
                $weekStart = $monthStart->copy()->addWeeks($i);
                $weekEnd = min($weekStart->copy()->endOfWeek(), $monthEnd);
                
                // Single query cho appointments
                $appointments = Appointment::whereBetween('appointment_time', [$weekStart, $weekEnd])
                    ->count();
                
                // Revenue từ payments table
                $revenue = Payment::where('status', 'completed')
                    ->whereBetween(DB::raw('COALESCE(payment_date, created_at)'), [$weekStart, $weekEnd])
                    ->sum('total_amount');
                
                $data[] = [
                    'label' => 'Tuần ' . ($i + 1),
                    'value' => $appointments,
                    'revenue' => $revenue ?? 0,
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