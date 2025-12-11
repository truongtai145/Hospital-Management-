<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Kênh broadcast (private channel cho conversation)
     */
    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->message->conversation_id);
    }

    /**
     * Tên event
     */
    public function broadcastAs()
    {
        return 'message.sent';
    }

    /**
     * Dữ liệu broadcast
     */
    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'user_id' => $this->message->user_id,
            'content' => $this->message->content,
            'read_at' => $this->message->read_at,
            'created_at' => $this->message->created_at->toISOString(),
            'user' => [
                'id' => $this->message->user->id,
                'email' => $this->message->user->email,
                'role' => $this->message->user->role,
                'full_name' => $this->getUserFullName($this->message->user),
                'avatar_url' => $this->getUserAvatar($this->message->user),
            ]
        ];
    }

    private function getUserFullName($user)
    {
        if ($user->role === 'patient' && $user->patient) {
            return $user->patient->full_name;
        } elseif ($user->role === 'doctor' && $user->doctor) {
            return $user->doctor->full_name;
        } elseif ($user->role === 'admin' && $user->adminProfile) {
            return $user->adminProfile->full_name;
        }
        return $user->email;
    }

    private function getUserAvatar($user)
    {
        if ($user->role === 'patient' && $user->patient) {
            return $user->patient->avatar_url;
        } elseif ($user->role === 'doctor' && $user->doctor) {
            return $user->doctor->avatar_url;
        } elseif ($user->role === 'admin' && $user->adminProfile) {
            return $user->adminProfile->avatar_url;
        }
        return null;
    }
}