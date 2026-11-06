import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  PlusCircle, 
  Bot, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectChat({ project, onConvertToTask }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [extractingId, setExtractingId] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!project?.id) return;
    try {
      const res = await api.get(`/chat/project/${project.id}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    setAiSummary(null);
  }, [project?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !project?.id) return;

    try {
      const res = await api.post(`/chat/project/${project.id}`, {
        content: inputValue.trim(),
      });
      setMessages((prev) => [...prev, res.data.message]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handle1ClickTask = async (msg) => {
    setExtractingId(msg.id);
    try {
      const res = await api.post('/ai/extract-task', {
        projectId: project.id,
        messageText: msg.content,
      });

      if (res.data?.extractedTask) {
        onConvertToTask(res.data.extractedTask);
      }
    } catch (err) {
      console.error('AI extract task error:', err);
      // Fallback
      onConvertToTask({
        title: msg.content.slice(0, 80),
        description: `Tạo từ tin nhắn: "${msg.content}"`,
        priority: 'MEDIUM',
      });
    } finally {
      setExtractingId(null);
    }
  };

  const handleChatCatchup = async () => {
    if (!project?.id) return;
    setLoadingSummary(true);
    try {
      const res = await api.get(`/ai/chat-catchup/${project.id}`);
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error('Chat catchup error:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-200">
              Kênh thảo luận dự án: {project?.title}
            </h3>
            <p className="text-[11px] text-slate-400">
              Trao đổi thời gian thực & Chuyển đổi tin nhắn thành Task 1-Click
            </p>
          </div>
        </div>

        {/* AI Chat Catch-up Button */}
        <button
          onClick={handleChatCatchup}
          disabled={loadingSummary}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all shadow cursor-pointer disabled:opacity-50"
        >
          {loadingSummary ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>AI Tóm tắt thảo luận (Catch-up)</span>
        </button>
      </div>

      {/* AI Summary Banner if active */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-xl p-3.5 mb-3 text-left shadow-lg relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-violet-400" />
              Tóm tắt nhanh từ Trợ lý AI (Chat Catch-up)
            </span>
            <button
              onClick={() => setAiSummary(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Đóng
            </button>
          </div>
          <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
            {aiSummary}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4 text-left">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
            <p>Chưa có tin nhắn nào trong kênh này. Hãy gửi tin nhắn đầu tiên để bắt đầu!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            const isExtracting = extractingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  <span className="font-semibold text-slate-300">{msg.sender_name || 'Thành viên'}</span>
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-start space-x-2">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs max-w-md shadow-md ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* 1-Click Chat-to-Task Button on hover */}
                  <button
                    onClick={() => handle1ClickTask(msg)}
                    disabled={isExtracting}
                    title="Chuyển tin nhắn này thành thẻ Task trên Kanban bằng AI"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 hover:text-white px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center space-x-1 shadow cursor-pointer disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    )}
                    <span>Tạo Task</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="mt-3 flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nhập nội dung thảo luận... (Ví dụ: 'Khang ơi, hoàn thiện nốt modal trước tối mai nhé')"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-5 py-3 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-all shadow cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
}
