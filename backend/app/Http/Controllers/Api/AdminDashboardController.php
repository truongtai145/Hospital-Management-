<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $period = $request->get('period', 'today');
        
        $today = Carbon::today();
        $endDate = Carbon::now()->endOfDay();
        $startDate = match($period) {
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            default => $today,
        };
        
        // Xác định kỳ trước để so sánh
        [$previousStart, $previousEnd] = $this->getPreviousPeriod($period);

        // ============ APPOINTMENTS ============
        // Chỉ tính các lịch hẹn KHÔNG bị hủy
        $appointmentStats = Appointment::select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
            )
            ->where('status', '!=', 'cancelled') // Loại bỏ lịch đã hủy
            ->whereBetween('appointment_time', [$startDate, $endDate])
            ->first();
        
        $currentAppointments = $appointmentStats->total ?? 0;
        $pendingAppointments = $appointmentStats->pending ?? 0;

        $previousAppointments = Appointment::where('status', '!=', 'cancelled')
            ->whereBetween('appointment_time', [$previousStart, $previousEnd])
            ->count();
        
        $appointmentTrend = $this->calculateTrend($currentAppointments, $previousAppointments);

        // ============ REVENUE ============
        // SỬ DỤNG payment_date THAY VÌ created_at
        $currentRevenue = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('total_amount') ?? 0;

        $previousRevenue = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$previousStart, $previousEnd])
            ->sum('total_amount') ?? 0;

        $revenueTrend = $this->calculateTrend($currentRevenue, $previousRevenue);

        // Average revenue per appointment
        $averageRevenue = $currentAppointments > 0 
            ? round($currentRevenue / $currentAppointments) 
            : 0;

        // ============ PATIENTS ============
        $newPatients = Patient::whereBetween('created_at', [$startDate, $endDate])->count();
        
        $previousNewPatients = Patient::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        
        $patientsTrend = $this->calculateTrend($newPatients, $previousNewPatients);

        // ============ DOCTORS ============
        $doctorStats = Doctor::select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) as active')
            )
            ->first();
        
        $activeDoctors = $doctorStats->active ?? 0;
        $totalDoctors = $doctorStats->total ?? 0;

        $previousActiveDoctors = Doctor::where('is_available', true)
            ->where('created_at', '<', $startDate)
            ->count();
        
        $doctorsTrend = $this->calculateTrend($activeDoctors, $previousActiveDoctors);

        return response()->json([
            'success' => true,
            'data' => [
                'appointments' => [
                    'total' => $currentAppointments,
                    'pending' => $pendingAppointments,
                    'trend' => $appointmentTrend,
                ],
                'revenue' => [
                    'total' => $currentRevenue,
                    'average' => $averageRevenue,
                    'trend' => $revenueTrend,
                ],
                'patients' => [
                    'new' => $newPatients,
                    'trend' => $patientsTrend,
                ],
                'doctors' => [
                    'active' => $activeDoctors,
                    'total' => $totalDoctors,
                    'trend' => $doctorsTrend,
                ],
            ]
        ]);
    }

    private function getPreviousPeriod($period)
    {
        return match($period) {
            'week' => [
                Carbon::now()->subWeek()->startOfWeek(),
                Carbon::now()->subWeek()->endOfWeek()
            ],
            'month' => [
                Carbon::now()->subMonth()->startOfMonth(),
                Carbon::now()->subMonth()->endOfMonth()
            ],
            default => [ // today
                Carbon::yesterday()->startOfDay(),
                Carbon::yesterday()->endOfDay()
            ],
        };
    }

    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 1);
    }

    public function getChartData(Request $request)
    {
        $period = $request->get('period', 'week');
        
        if ($period === 'today') {
            $today = Carbon::today();
            $todayEnd = Carbon::today()->endOfDay();
            
            // Chỉ tính lịch hẹn KHÔNG bị hủy
            $appointmentsData = Appointment::select(
                    DB::raw('HOUR(appointment_time) as hour'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('status', '!=', 'cancelled') // Loại bỏ lịch đã hủy
                ->whereBetween('appointment_time', [$today, $todayEnd])
                ->groupBy('hour')
                ->pluck('count', 'hour')
                ->toArray();
            
            // SỬ DỤNG payment_date THAY VÌ created_at
            $revenueData = Payment::select(
                    DB::raw('HOUR(payment_date) as hour'),
                    DB::raw('SUM(total_amount) as total')
                )
                ->where('status', 'completed')
                ->whereDate('payment_date', $today)
                ->groupBy('hour')
                ->pluck('total', 'hour')
                ->toArray();
            
            $data = [];
            for ($i = 0; $i < 24; $i++) {
                $data[] = [
                    'label' => sprintf('%02d:00', $i),
                    'value' => $appointmentsData[$i] ?? 0,
                    'revenue' => $revenueData[$i] ?? 0,
                ];
            }
        } elseif ($period === 'week') {
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();
            
            // Chỉ tính lịch hẹn KHÔNG bị hủy
            $appointmentsData = Appointment::select(
                    DB::raw('DATE(appointment_time) as date'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('status', '!=', 'cancelled') // Loại bỏ lịch đã hủy
                ->whereBetween('appointment_time', [$startDate, $endDate])
                ->groupBy('date')
                ->pluck('count', 'date')
                ->toArray();
            
            // SỬ DỤNG payment_date THAY VÌ created_at
            $revenueData = Payment::select(
                    DB::raw('DATE(payment_date) as date'),
                    DB::raw('SUM(total_amount) as total')
                )
                ->where('status', 'completed')
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->groupBy('date')
                ->pluck('total', 'date')
                ->toArray();
            
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
            $monthStart = Carbon::now()->startOfMonth();
            $monthEnd = Carbon::now()->endOfMonth();
            $weeksInMonth = 4;
            
            $data = [];
            
            for ($i = 0; $i < $weeksInMonth; $i++) {
                $weekStart = $monthStart->copy()->addWeeks($i);
                $weekEnd = min($weekStart->copy()->endOfWeek(), $monthEnd);
                
                // Chỉ tính lịch hẹn KHÔNG bị hủy
                $appointments = Appointment::where('status', '!=', 'cancelled')
                    ->whereBetween('appointment_time', [$weekStart, $weekEnd])
                    ->count();
                
                // SỬ DỤNG payment_date THAY VÌ created_at
                $revenue = Payment::where('status', 'completed')
                    ->whereBetween('payment_date', [$weekStart, $weekEnd])
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

    public function getRecentAppointments()
    {
        // Chỉ lấy các lịch hẹn KHÔNG bị hủy
        $appointments = Appointment::with(['patient', 'doctor'])
            ->where('status', '!=', 'cancelled') // Loại bỏ lịch đã hủy
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

    public function getOverview()
    {
        $today = Carbon::today();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_patients' => Patient::count(),
                'total_doctors' => Doctor::count(),
                'total_appointments' => Appointment::where('status', '!=', 'cancelled')->count(),
                'today_appointments' => Appointment::where('status', '!=', 'cancelled')
                    ->whereDate('appointment_time', $today)
                    ->count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'completed_today' => Appointment::whereDate('appointment_time', $today)
                    ->where('status', 'completed')
                    ->count(),
            ]
        ]);
    }
}