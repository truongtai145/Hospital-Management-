<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

   
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'department_id',
        'appointment_time',
        'reason',
        'allergies_at_appointment',
        'medical_history_at_appointment',
        'doctor_notes',
        'prescription',
        'status',
    ];

  
    protected $casts = [
        'appointment_time' => 'datetime', 
    ];

  
    public function patient(): BelongsTo
    {
    
        return $this->belongsTo(Patient::class, 'patient_id');
    }
    public function doctor(): BelongsTo
    {
       
        return $this->belongsTo(Doctor::class, 'doctor_id');
    } 
    public function department(): BelongsTo
    {
       
        return $this->belongsTo(Department::class, 'department_id');
    }
}