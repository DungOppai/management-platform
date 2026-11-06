import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SendIcon, SparklesIcon, BotIcon, RefreshCwIcon } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { TaskSuggestionCard } from '../components/chat/TaskSuggestionCard';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { messages as fallbackMessages } from '../data/messages';
import { isoFromToday } from '../utils/date';
import api from '../services/api';
import { getSocket } from '../services/socket';
import type { ChatMessage, SuggestedTask, Priority } from '../types/project';

interface Extraction {
  messageId: string;
  loading: boolean;
  task: SuggestedTask;
}

export function Chat() {
  const { project, members, getMember, currentUser, addTask } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>(fallbackMessages);
  const [text, setText] = useState('');
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [chatSummary, setChatSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch messages from Backend
  const fetchMessages = async () => {
    if (!project?.id) return;
    try {
      const res = await api.get(`/chat/project/${project.id}`);
      if (res.data?.messages && res.data.messages.length > 0) {
        const mapped: ChatMessage[] = res.data.messages.map((m: any) => ({
          id: String(m.id),
          authorId: String(m.sender_id),
          text: m.content,
          time: format(new Date(m.created_at || Date.now()), 'HH:mm')
        }));
        setMessages(mapped);
      }
    } catch {
      // Use fallback messages
    }
  };

  useEffect(() => {
    fetchMessages();

    // Socket.io Realtime Listener
    const socket = getSocket();
    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(msg.id),
          authorId: String(msg.sender_id),
          text: msg.content,
          time: format(new Date(msg.created_at || Date.now()), 'HH:mm')
        }
      ]);
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [project?.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // 1-Click Chat-to-Task with REAL AI Engine
  const extract = async (m: ChatMessage) => {
    // Initial placeholder while AI generates
    const placeholderTask: SuggestedTask = {
      title: m.text.length > 70 ? `${m.text.slice(0, 67).trimEnd()}…` : m.text,
      assigneeId: m.authorId,
      dueDate: isoFromToday(3),
      priority: 'medium'
    };

    setExtraction({ messageId: m.id, loading: true, task: placeholderTask });

    try {
      const res = await api.post('/ai/extract-task', {
        projectId: project.id,
        messageText: m.text
      });

      if (res.data?.extractedTask) {
        const aiTask = res.data.extractedTask;
        setExtraction({
          messageId: m.id,
          loading: false,
          task: {
            title: aiTask.title || placeholderTask.title,
            assigneeId: aiTask.suggested_assignee_id ? String(aiTask.suggested_assignee_id) : m.authorId,
            dueDate: aiTask.suggested_due_date || isoFromToday(3),
            priority: (aiTask.priority ? aiTask.priority.toLowerCase() : 'medium') as Priority
          }
        });
        toast.info('AI đã bóc tách nhiệm vụ từ tin nhắn!');
        return;
      }
    } catch (err) {
      console.warn('AI extraction fallback:', err);
    }

    setExtraction((cur) => (cur && cur.messageId === m.id ? { ...cur, loading: false } : cur));
  };

  const confirm = () => {
    if (!extraction) return;
    const created = addTask({
      ...extraction.task,
      status: 'todo',
      description: `Tạo từ tin nhắn trong kênh thảo luận.`
    });
    toast.success(`Đã thêm ${created.code} vào cột Cần làm`, { description: created.title });
    setExtraction(null);
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;

    // Optimistic message
    const tempMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      text: value,
      time: format(new Date(), 'HH:mm')
    };
    setMessages((prev) => [...prev, tempMsg]);
    setText('');

    // Persist to backend
    try {
      await api.post(`/chat/project/${project.id}`, { content: value });
    } catch (err) {
      console.warn('Failed to send message to backend:', err);
    }
  };

  // AI Chat Catch-up
  const handleChatCatchup = async () => {
    setSummarizing(true);
    try {
      const res = await api.get(`/ai/chat-catchup/${project.id}`);
      setChatSummary(res.data.summary);
    } catch {
      setChatSummary('Chưa có đủ tin nhắn để tổng hợp thảo luận.');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-[100dvh]">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-4 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Thảo luận</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              Chọn “Tạo việc” ở một tin nhắn để AI chuyển thành công việc ngay lập tức.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={summarizing}
            onClick={handleChatCatchup}
            className="hidden sm:inline-flex"
          >
            {summarizing ? (
              <RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BotIcon className="h-3.5 w-3.5 text-accent" />
            )}
            <span>AI Tóm tắt tin nhắn</span>
          </Button>
        </header>

        {chatSummary && (
          <div className="mx-5 mt-4 rounded-xl border border-accent/40 bg-accent-soft p-4 text-xs text-ink lg:mx-8 relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-accent flex items-center gap-1.5">
                <BotIcon className="h-4 w-4" />
                Tóm tắt nhanh từ Trợ lý AI (Chat Catch-up)
              </span>
              <button
                type="button"
                onClick={() => setChatSummary(null)}
                className="text-xs text-ink-muted hover:text-ink"
              >
                Đóng
              </button>
            </div>
            <div className="whitespace-pre-line leading-relaxed">{chatSummary}</div>
          </div>
        )}

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto py-4"
          role="log"
          aria-label={`Tin nhắn ${project.name}`}
        >
          <div className="my-2 flex items-center gap-3 px-5 lg:px-8" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-faint">Hôm nay</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {messages.map((m) => {
            const author = getMember(m.authorId);
            const active = extraction?.messageId === m.id;
            return (
              <article key={m.id} className="group flex gap-3 px-5 py-2.5 lg:px-8">
                <Avatar member={author} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-ink">{author?.name}</span>
                    <time className="text-xs text-ink-faint">{m.time}</time>
                    {!active && (
                      <button
                        type="button"
                        onClick={() => extract(m)}
                        className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium text-accent transition-[opacity,background-color] duration-150 hover:bg-accent-soft focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Tạo việc
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink">{m.text}</p>
                  <AnimatePresence>
                    {active && extraction && (
                      <TaskSuggestionCard
                        loading={extraction.loading}
                        task={extraction.task}
                        onTitleChange={(t) =>
                          setExtraction((cur) =>
                            cur ? { ...cur, task: { ...cur.task, title: t } } : cur
                          )
                        }
                        onConfirm={confirm}
                        onDismiss={() => setExtraction(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </article>
            );
          })}
        </div>

        <form onSubmit={send} className="border-t border-line bg-surface p-4 lg:px-8">
          <div className="flex items-center gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Nội dung tin nhắn
            </label>
            <input
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhắn tin với nhóm… (VD: 'Khang ơi hoàn thiện nốt phần Docker nhé')"
              className="h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <Button type="submit" disabled={!text.trim()}>
              <SendIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Gửi</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
