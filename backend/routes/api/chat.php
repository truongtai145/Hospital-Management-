<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

Route::prefix('chat')->middleware('jwt.auth')->group(function () {
    
    // Lấy danh sách conversations
    Route::get('/conversations', [ChatController::class, 'getConversations']);
    
    // Tạo hoặc lấy conversation với user khác
    Route::post('/conversations', [ChatController::class, 'getOrCreateConversation']);
    
    // Lấy messages của conversation
    Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
    
    // Gửi message
    Route::post('/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);
    
    // Đánh dấu đã đọc
    Route::post('/conversations/{conversationId}/read', [ChatController::class, 'markAsRead']);
    
    // Tìm kiếm users để chat (Admin)
    Route::get('/search/users', [ChatController::class, 'searchUsers'])
        ->middleware('role:admin');
    
    // Tìm kiếm users để chat (Doctor)
    Route::get('/search/users-for-doctor', [ChatController::class, 'searchUsersForDoctor'])
        ->middleware('role:doctor');
});