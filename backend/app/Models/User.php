<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Conversation;
use Tymon\JWTAuth\Contracts\JWTSubject; 

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'role',
        'is_active',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login' => 'datetime',
    ];

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    public function adminProfile()
    {
        return $this->hasOne(Admin::class);
    }

    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class);
    }
     public function conversations()
    {
        return $this->belongsToMany(Conversation::class);
    }
}
