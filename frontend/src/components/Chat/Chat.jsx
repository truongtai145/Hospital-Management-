import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/axios";
import { getEcho } from "../../utils/echo";
import { 
  MessageCircle, Send, Search, X, User, 
  Clock, CheckCheck, Loader 
} from "lucide-react";
import { toast } from "react-toastify";

export default function Chat() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const messagesEndRef = useRef(null);
  const echoRef = useRef(null);

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();

    // Nếu có conversationId từ navigation state, auto select
    if (location.state?.conversationId) {
      const convId = location.state.conversationId;
      // Đợi conversations load xong rồi mới select
      setTimeout(() => {
        const conv = conversations.find(c => c.id === convId);
        if (conv) {
          handleSelectConversation(conv);
        }
      }, 500);
    }
    
    // Initialize Echo
    echoRef.current = getEcho();

    return () => {
      // Cleanup: leave channels
      if (selectedConversation && echoRef.current) {
        echoRef.current.leave(`private-conversation.${selectedConversation.id}`);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to conversation channel khi chọn conversation
  useEffect(() => {
    if (selectedConversation && echoRef.current) {
      const channel = echoRef.current.private(`conversation.${selectedConversation.id}`);
      
      channel.listen('.message.sent', (event) => {
        console.log('New message received:', event);
        
        // Thêm message mới vào danh sách
        setMessages(prev => [...prev, {
          ...event,
          is_mine: false
        }]);

        // Cập nhật conversation list
        loadConversations();

        // Auto scroll to bottom
        scrollToBottom();
      });

      return () => {
        channel.stopListening('.message.sent');
      };
    }
  }, [selectedConversation]);

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data.conversations);
    } catch (err) {
      console.error("Error loading conversations:", err);
      toast.error("Không thể tải danh sách trò chuyện");
    }
  };

  const loadMessages = async (conversationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
    
    // Mark as read
    try {
      await api.post(`/chat/conversations/${conversation.id}/read`);
      loadConversations(); // Refresh để cập nhật unread count
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const res = await api.post(
        `/chat/conversations/${selectedConversation.id}/messages`,
        { content: newMessage }
      );

      // Thêm message vào UI
      setMessages(prev => [...prev, res.data.message]);
      setNewMessage("");
      
      // Cập nhật conversation list
      loadConversations();

    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Nếu trong ngày hôm nay
    if (diff < 86400000) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Nếu trong tuần
    if (diff < 604800000) {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Ngày cũ hơn
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Danh sách conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-800">Tin nhắn</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-16 h-16 mb-2" />
              <p>Chưa có tin nhắn nào</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {conv.other_user.avatar_url ? (
                      <img
                        src={conv.other_user.avatar_url}
                        alt={conv.other_user.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {conv.other_user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {conv.other_user.full_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conv.latest_message && formatTime(conv.latest_message.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <p className={`text-sm truncate ${
                        conv.unread_count > 0 ? "font-semibold text-gray-800" : "text-gray-500"
                      }`}>
                        {conv.latest_message ? (
                          <>
                            {conv.latest_message.is_mine && "Bạn: "}
                            {conv.latest_message.content}
                          </>
                        ) : (
                          "Chưa có tin nhắn"
                        )}
                      </p>
                    </div>

                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                      conv.other_user.role === 'doctor' 
                        ? 'bg-blue-100 text-blue-700'
                        : conv.other_user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {conv.other_user.role === 'doctor' ? 'Bác sĩ' : 
                       conv.other_user.role === 'admin' ? 'Quản trị' : 'Bệnh nhân'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.other_user.avatar_url ? (
                  <img
                    src={selectedConversation.other_user.avatar_url}
                    alt={selectedConversation.other_user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                    {selectedConversation.other_user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {selectedConversation.other_user.full_name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.other_user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-2" />
                  <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${msg.is_mine ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      {!msg.is_mine && (
                        msg.user.avatar_url ? (
                          <img
                            src={msg.user.avatar_url}
                            alt={msg.user.full_name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {msg.user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )
                      )}

                      {/* Message Bubble */}
                      <div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.is_mine
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                        
                        {/* Time & Status */}
                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                          msg.is_mine ? "justify-end" : "justify-start"
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(msg.created_at)}</span>
                          {msg.is_mine && msg.read_at && (
                            <CheckCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-primary text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Chào mừng đến với Chat</h2>
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}