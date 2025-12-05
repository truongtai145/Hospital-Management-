<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    
    public const METHOD_CASH = 'cash';
    public const METHOD_CREDIT_CARD = 'credit_card';
    public const METHOD_VNPAY = 'vnpay';
    public const METHOD_INSURANCE = 'insurance';
    
    public const PAYMENT_METHODS = [
        self::METHOD_CASH,
        self::METHOD_CREDIT_CARD,
        self::METHOD_VNPAY,
        self::METHOD_INSURANCE,
    ];

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'amount',
        'payment_method',
        'status',
        'transaction_id',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}