<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        // 'name' // nếu bạn có cột name
    ];

    /**
     * Những người tham gia vào cuộc trò chuyện này.
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Tất cả tin nhắn trong cuộc trò chuyện này.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Lấy tin nhắn mới nhất của cuộc trò chuyện (rất hữu ích để hiển thị preview).
     */
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }
}