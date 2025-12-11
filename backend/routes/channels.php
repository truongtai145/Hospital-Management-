<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
// Private channel cho mỗi conversation
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Kiểm tra user có trong conversation này không
    $conversation = Conversation::whereHas('users', function($query) use ($user) {
        $query->where('user_id', $user->id);
    })->find($conversationId);
    
    return $conversation !== null;
});