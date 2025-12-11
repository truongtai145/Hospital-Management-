import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Button để bắt đầu chat với Doctor hoặc Admin
 * Dùng cho Patient khi xem profile Doctor hoặc muốn liên hệ Admin
 */
// eslint-disable-next-line no-unused-vars
export default function StartChatButton({ userId, userRole, userName }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      // Tạo hoặc lấy conversation
      const res = await api.post("/chat/conversations", {
        other_user_id: userId,
      });

      // Chuyển đến trang chat với conversation đã chọn
      navigate("/chat", { 
        state: { conversationId: res.data.conversation.id } 
      });

    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error(err.response?.data?.message || "Không thể bắt đầu trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MessageCircle className="w-5 h-5" />
      <span>{loading ? "Đang xử lý..." : `Chat với ${userRole === 'doctor' ? 'Bác sĩ' : 'Hỗ trợ'}`}</span>
    </button>
  );
}