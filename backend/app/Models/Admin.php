<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'permission_level',
        'avatar_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

