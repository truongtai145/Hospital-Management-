<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'token',
        'expires_at',
        'is_used'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean'
    ];

  // Kiểm tra token đã hết hạn chưa
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

   
     // Kiểm tra token còn valid không
    
    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }
}