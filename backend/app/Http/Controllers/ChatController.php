<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Lấy danh sách conversations của user hiện tại
     */
    public function getConversations(Request $request)
    {
        try {
            $user = $request->user();
            
            $conversations = $user->conversations()
                ->with(['users' => function($query) use ($user) {
                    // Lấy user khác (không phải current user)
                    $query->where('users.id', '!=', $user->id)
                        ->with(['patient', 'doctor', 'adminProfile']);
                }])
                ->withCount(['messages as unread_count' => function($query) use ($user) {
                    $query->whereNull('read_at')
                        ->where('user_id', '!=', $user->id);
                }])
                ->with(['latestMessage.user' => function($query) {
                    $query->with(['patient', 'doctor', 'adminProfile']);
                }])
                ->orderBy('updated_at', 'desc')
                ->get();

            // Format dữ liệu
            $formatted = $conversations->map(function($conversation) use ($user) {
                $otherUser = $conversation->users->first();
                
                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'email' => $otherUser->email,
                        'role' => $otherUser->role,
                        'full_name' => $this->getUserFullName($otherUser),
                        'avatar_url' => $this->getUserAvatar($otherUser),
                    ],
                    'latest_message' => $conversation->latestMessage ? [
                        'id' => $conversation->latestMessage->id,
                        'content' => $conversation->latestMessage->content,
                        'created_at' => $conversation->latestMessage->created_at->toISOString(),
                        'is_mine' => $conversation->latestMessage->user_id === $user->id,
                    ] : null,
                    'unread_count' => $conversation->unread_count,
                    'updated_at' => $conversation->updated_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'conversations' => $formatted
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách tin nhắn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo hoặc lấy conversation giữa 2 users
     */
    public function getOrCreateConversation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'other_user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $currentUser = $request->user();
            $otherUserId = $request->other_user_id;

            // Kiểm tra quyền chat
            $otherUser = User::find($otherUserId);
            
            if (!$this->canChat($currentUser, $otherUser)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền chat với người này'
                ], 403);
            }

            // Tìm conversation có sẵn
            $conversation = Conversation::whereHas('users', function($query) use ($currentUser) {
                    $query->where('user_id', $currentUser->id);
                })
                ->whereHas('users', function($query) use ($otherUserId) {
                    $query->where('user_id', $otherUserId);
                })
                ->first();

            // Nếu chưa có, tạo mới
            if (!$conversation) {
                $conversation = Conversation::create([]);
                $conversation->users()->attach([$currentUser->id, $otherUserId]);
            }

            // Load thông tin other user
            $conversation->load(['users' => function($query) use ($currentUser) {
                $query->where('users.id', '!=', $currentUser->id)
                    ->with(['patient', 'doctor', 'adminProfile']);
            }]);

            $otherUserData = $conversation->users->first();

            return response()->json([
                'success' => true,
                'conversation' => [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUserData->id,
                        'email' => $otherUserData->email,
                        'role' => $otherUserData->role,
                        'full_name' => $this->getUserFullName($otherUserData),
                        'avatar_url' => $this->getUserAvatar($otherUserData),
                    ],
                    'created_at' => $conversation->created_at->toISOString(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo conversation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy messages của một conversation
     */
    public function getMessages(Request $request, $conversationId)
    {
        try {
            $user = $request->user();
            
            // Kiểm tra user có trong conversation không
            $conversation = Conversation::whereHas('users', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->find($conversationId);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy conversation'
                ], 404);
            }

            // Lấy messages
            $messages = Message::where('conversation_id', $conversationId)
                ->with(['user' => function($query) {
                    $query->with(['patient', 'doctor', 'adminProfile']);
                }])
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function($message) use ($user) {
                    return [
                        'id' => $message->id,
                        'conversation_id' => $message->conversation_id,
                        'content' => $message->content,
                        'is_mine' => $message->user_id === $user->id,
                        'read_at' => $message->read_at,
                        'created_at' => $message->created_at->toISOString(),
                        'user' => [
                            'id' => $message->user->id,
                            'email' => $message->user->email,
                            'role' => $message->user->role,
                            'full_name' => $this->getUserFullName($message->user),
                            'avatar_url' => $this->getUserAvatar($message->user),
                        ]
                    ];
                });

            // Đánh dấu đã đọc các tin nhắn của người khác
            Message::where('conversation_id', $conversationId)
                ->where('user_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json([
                'success' => true,
                'messages' => $messages
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy tin nhắn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gửi message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Nội dung tin nhắn không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            
            // Kiểm tra user có trong conversation không
            $conversation = Conversation::whereHas('users', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->find($conversationId);

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy conversation'
                ], 404);
            }

            // Tạo message
            $message = Message::create([
                'conversation_id' => $conversationId,
                'user_id' => $user->id,
                'content' => $request->input('content'),
            ]);

            // Load user info
            $message->load(['user' => function($query) {
                $query->with(['patient', 'doctor', 'adminProfile']);
            }]);

            // Cập nhật updated_at của conversation
            $conversation->touch();

            // Broadcast event
            broadcast(new MessageSent($message))->toOthers();

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'conversation_id' => $message->conversation_id,
                    'content' => $message->content,
                    'is_mine' => true,
                    'read_at' => $message->read_at,
                    'created_at' => $message->created_at->toISOString(),
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role,
                        'full_name' => $this->getUserFullName($user),
                        'avatar_url' => $this->getUserAvatar($user),
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gửi tin nhắn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    public function markAsRead(Request $request, $conversationId)
    {
        try {
            $user = $request->user();

            Message::where('conversation_id', $conversationId)
                ->where('user_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu đã đọc'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kiểm tra quyền chat giữa 2 users dựa trên mối quan hệ lịch hẹn:
     * - Patient: chỉ chat với bác sĩ đã từng có lịch hẹn & Admin
     * - Doctor: chỉ chat với bệnh nhân đã từng có lịch hẹn & Admin
     * - Admin: chat với tất cả
     */
   private function canChat($user1, $user2)
{
    // Admin chat được với tất cả
    if ($user1->role === 'admin' || $user2->role === 'admin') {
        return true;
    }

    // Patient chỉ chat được với bác sĩ đã từng có lịch hẹn
    if ($user1->role === 'patient' && $user2->role === 'doctor') {
        $patient = $user1->patient;
        $doctor  = $user2->doctor;

        if (!$patient || !$doctor) {
            return false;
        }

        return \App\Models\Appointment::where('patient_id', $patient->id)
            ->where('doctor_id', $doctor->id)
            ->exists();
    }

    // Doctor chỉ chat được với bệnh nhân đã từng có lịch hẹn
    if ($user1->role === 'doctor' && $user2->role === 'patient') {
        $doctor  = $user1->doctor;
        $patient = $user2->patient;

        if (!$patient || !$doctor) {
            return false;
        }

        return \App\Models\Appointment::where('patient_id', $patient->id)
            ->where('doctor_id', $doctor->id)
            ->exists();
    }

    return false;
}

  
    
    public function searchUsers(Request $request)
    {
        try {
            $user = $request->user();
            $searchTerm = $request->input('search', '');
            $role = $request->input('role', 'all'); // all, patient, doctor

            // Admin có thể tìm tất cả users
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có quyền truy cập'
                ], 403);
            }

            $query = User::where('id', '!=', $user->id)
                ->where('is_active', true);

            // Filter by role
            if ($role !== 'all') {
                $query->where('role', $role);
            }

            // Search
            if ($searchTerm) {
                $query->where(function($q) use ($searchTerm) {
                    $q->where('email', 'like', "%{$searchTerm}%")
                      ->orWhereHas('patient', function($subq) use ($searchTerm) {
                          $subq->where('full_name', 'like', "%{$searchTerm}%")
                               ->orWhere('phone', 'like', "%{$searchTerm}%");
                      })
                      ->orWhereHas('doctor', function($subq) use ($searchTerm) {
                          $subq->where('full_name', 'like', "%{$searchTerm}%")
                               ->orWhere('phone', 'like', "%{$searchTerm}%");
                      })
                      ->orWhereHas('adminProfile', function($subq) use ($searchTerm) {
                          $subq->where('full_name', 'like', "%{$searchTerm}%");
                      });
                });
            }

            $users = $query->with(['patient', 'doctor', 'adminProfile'])
                ->limit(20)
                ->get()
                ->map(function($u) {
                    return [
                        'id' => $u->id,
                        'email' => $u->email,
                        'role' => $u->role,
                        'full_name' => $this->getUserFullName($u),
                        'avatar_url' => $this->getUserAvatar($u),
                    ];
                });

            return response()->json([
                'success' => true,
                'users' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tìm kiếm users để chat (cho Doctor)
     * Chỉ tìm patients có lịch hẹn và admin
     */
    public function searchUsersForDoctor(Request $request)
    {
        try {
            $user = $request->user();
            $searchTerm = $request->input('search', '');

            if ($user->role !== 'doctor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có quyền truy cập'
                ], 403);
            }

            $doctor = $user->doctor;
            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy thông tin bác sĩ'
                ], 404);
            }

            // Lấy danh sách patient IDs có lịch hẹn với doctor này
            $patientIds = \App\Models\Appointment::where('doctor_id', $doctor->id)
                ->distinct()
                ->pluck('patient_id')
                ->toArray();

            $query = User::where('id', '!=', $user->id)
                ->where('is_active', true)
                ->where(function($q) use ($patientIds) {
                    // Admin hoặc patients có lịch hẹn
                    $q->where('role', 'admin')
                      ->orWhere(function($subq) use ($patientIds) {
                          $subq->where('role', 'patient')
                               ->whereHas('patient', function($patientQuery) use ($patientIds) {
                                   $patientQuery->whereIn('id', $patientIds);
                               });
                      });
                });

            // Search
            if ($searchTerm) {
                $query->where(function($q) use ($searchTerm) {
                    $q->where('email', 'like', "%{$searchTerm}%")
                      ->orWhereHas('patient', function($subq) use ($searchTerm) {
                          $subq->where('full_name', 'like', "%{$searchTerm}%")
                               ->orWhere('phone', 'like', "%{$searchTerm}%");
                      })
                      ->orWhereHas('adminProfile', function($subq) use ($searchTerm) {
                          $subq->where('full_name', 'like', "%{$searchTerm}%");
                      });
                });
            }

            $users = $query->with(['patient', 'adminProfile'])
                ->limit(20)
                ->get()
                ->map(function($u) {
                    return [
                        'id' => $u->id,
                        'email' => $u->email,
                        'role' => $u->role,
                        'full_name' => $this->getUserFullName($u),
                        'avatar_url' => $this->getUserAvatar($u),
                    ];
                });

            return response()->json([
                'success' => true,
                'users' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm: ' . $e->getMessage()
            ], 500);
        }
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