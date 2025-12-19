import { useState, useEffect, useRef } from "react";
import { api } from "../../../api/axios";
import { getEcho } from "../../../utils/echo";
import { 
  MessageCircle, Send, Search, 
  Clock, CheckCheck, Loader, Stethoscope, X, UserPlus
} from "lucide-react";
import { toast } from "react-toastify";

export default function DoctorChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const echoRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadConversations();
    echoRef.current = getEcho();

    return () => {
      if (selectedConversation && echoRef.current) {
        echoRef.current.leave(`private-conversation.${selectedConversation.id}`);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers();
      }, 500);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    if (selectedConversation && echoRef.current) {
      const channel = echoRef.current.private(`conversation.${selectedConversation.id}`);
      
      channel.listen('message.sent', (event) => {
        setMessages(prev => [...prev, {
          id: event.id,
          conversation_id: event.conversation_id,
          content: event.content,
          created_at: event.created_at,
          read_at: event.read_at,
          is_mine: false,
          user: event.user
        }]);

        loadConversations();
        scrollToBottom();
      });

      return () => {
        channel.stopListening('message.sent');
        echoRef.current.leave(`private-conversation.${selectedConversation.id}`);
      };
    }
  }, [selectedConversation]);

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
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Không thể tải danh sách trò chuyện");
    }
  };

  const searchUsers = async () => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm
      });
      
      const res = await api.get(`/chat/search/users-for-doctor?${params}`);
      setSearchResults(res.data.users);
      setShowSearchResults(true);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Không thể tìm kiếm người dùng");
    } finally {
      setSearchLoading(false);
    }
  };

  const startConversationWithUser = async (userId) => {
    try {
      const res = await api.post("/chat/conversations", {
        other_user_id: userId
      });
      
      if (res.data.success) {
        await loadConversations();
        
        const newConv = {
          id: res.data.conversation.id,
          other_user: res.data.conversation.other_user,
          latest_message: null,
          unread_count: 0,
          updated_at: res.data.conversation.created_at
        };
        
        handleSelectConversation(newConv);
        setShowSearchResults(false);
        setSearchTerm("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tạo cuộc trò chuyện");
    }
  };

  const loadMessages = async (conversationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(res.data.messages);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
    
    try {
      await api.post(`/chat/conversations/${conversation.id}/read`);
      loadConversations();
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

      setMessages(prev => [...prev, res.data.message]);
      setNewMessage("");
      loadConversations();

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    if (diff < 604800000) {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'patient': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Quản trị';
      case 'patient': return 'Bệnh nhân';
      default: return role;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Tin nhắn</h1>
              <p className="text-xs text-blue-100">Bác sĩ - Bệnh nhân</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bệnh nhân, admin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchLoading && (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showSearchResults && searchTerm.trim().length > 0 && (
            <div className="border-b border-gray-200 bg-blue-50">
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-700">
                  Kết quả tìm kiếm ({searchResults.length})
                </span>
                <button 
                  onClick={() => { setShowSearchResults(false); setSearchTerm(""); }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startConversationWithUser(user.id)}
                  className="p-3 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                        user.role === 'admin' 
                          ? 'from-purple-400 to-purple-600' 
                          : 'from-green-400 to-green-600'
                      } flex items-center justify-center text-white font-bold`}>
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {user.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              ))}
              
              {searchResults.length === 0 && !searchLoading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          )}

          {!showSearchResults && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <MessageCircle className="w-16 h-16 mb-2" />
              <p className="text-center">Chưa có tin nhắn nào</p>
              <p className="text-xs text-center mt-1">Tìm kiếm để bắt đầu trò chuyện</p>
            </div>
          )}
          
          {!showSearchResults && conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                selectedConversation?.id === conv.id ? "bg-blue-100 border-l-4 border-blue-600" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  {conv.other_user.avatar_url ? (
                    <img
                      src={conv.other_user.avatar_url}
                      alt={conv.other_user.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      conv.other_user.role === 'admin'
                        ? 'from-purple-400 to-purple-600'
                        : 'from-green-400 to-green-600'
                    } flex items-center justify-center text-white font-bold text-lg`}>
                      {conv.other_user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {conv.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {conv.unread_count}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conv.other_user.full_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conv.latest_message && formatTime(conv.latest_message.created_at)}
                    </span>
                  </div>
                  
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

                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getRoleBadgeColor(conv.other_user.role)}`}>
                    {getRoleLabel(conv.other_user.role)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {selectedConversation.other_user.avatar_url ? (
                  <img
                    src={selectedConversation.other_user.avatar_url}
                    alt={selectedConversation.other_user.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    selectedConversation.other_user.role === 'admin'
                      ? 'from-purple-400 to-purple-600'
                      : 'from-green-400 to-green-600'
                  } flex items-center justify-center text-white font-bold`}>
                    {selectedConversation.other_user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">
                    {selectedConversation.other_user.full_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {selectedConversation.other_user.email}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(selectedConversation.other_user.role)}`}>
                      {getRoleLabel(selectedConversation.other_user.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 animate-spin text-blue-600" />
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
                      {!msg.is_mine && (
                        msg.user.avatar_url ? (
                          <img
                            src={msg.user.avatar_url}
                            alt={msg.user.full_name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full ${
                            msg.user.role === 'admin' 
                              ? 'bg-purple-400' 
                              : 'bg-green-400'
                          } flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {msg.user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )
                      )}

                      <div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.is_mine
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none shadow-md"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                        
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

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {sending ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Stethoscope className="w-24 h-24 mb-4 text-blue-300" />
            <h2 className="text-2xl font-semibold mb-2">Chào mừng Bác sĩ</h2>
            <p>Chọn một cuộc trò chuyện hoặc tìm kiếm để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}