import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  SendIcon,
  SparklesIcon,
  BotIcon,
  RefreshCwIcon,
  PlusIcon,
  ImageIcon,
  FilmIcon,
  MicIcon,
  FileTextIcon,
  XIcon,
  SquareIcon,
  DownloadIcon,
  PaperclipIcon
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { TaskSuggestionCard } from '../components/chat/TaskSuggestionCard';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { messages as fallbackMessages } from '../data/messages';
import { isoFromToday } from '../utils/date';
import api from '../services/api';
import { getSocket, joinProjectRoom } from '../services/socket';
import type { ChatMessage, SuggestedTask, Priority, MessageAttachment } from '../types/project';

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
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

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
          time: format(new Date(m.created_at || Date.now()), 'HH:mm'),
          attachment: m.metadata?.attachment || undefined
        }));
        setMessages(mapped);
      }
    } catch {
      // Use fallback messages
    }
  };

  useEffect(() => {
    fetchMessages();

    if (project?.id) {
      joinProjectRoom(project.id);
    }

    // Socket.io Realtime Listener
    const socket = getSocket();
    const handleNewMessage = (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === String(msg.id))) return prev;

        const tempIdx = prev.findIndex(
          (m) =>
            m.id.startsWith('msg-') &&
            m.text === msg.content &&
            m.authorId === String(msg.sender_id)
        );

        const newMsgObj: ChatMessage = {
          id: String(msg.id),
          authorId: String(msg.sender_id),
          text: msg.content,
          time: format(new Date(msg.created_at || Date.now()), 'HH:mm'),
          attachment: msg.metadata?.attachment || undefined
        };

        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = newMsgObj;
          return next;
        }

        return [...prev, newMsgObj];
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [project?.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, attachment]);

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Kích thước tệp tin vượt quá 25MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        type,
        url: reader.result as string,
        name: file.name,
        size: file.size
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Voice Recording
  const startRecording = async () => {
    try {
      setShowAttachMenu(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachment({
            type: 'audio',
            url: reader.result as string,
            name: `Ghi-am-${format(new Date(), 'HHmm-ddMM')}.webm`,
            size: audioBlob.size
          });
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      toast.error('Không thể truy cập Microphone để ghi âm voice');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
      audioChunksRef.current = [];
    }
  };

  // 1-Click Chat-to-Task with REAL AI Engine
  const extract = async (m: ChatMessage) => {
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
    if (!value && !attachment) return;

    const messageContent = value || (attachment ? `Đã gửi ${attachment.name}` : '');

    // Optimistic message
    const tempMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      text: messageContent,
      time: format(new Date(), 'HH:mm'),
      attachment: attachment || undefined
    };
    setMessages((prev) => [...prev, tempMsg]);

    const sentAttachment = attachment;
    setText('');
    setAttachment(null);

    // Persist to backend
    try {
      await api.post(`/chat/project/${project.id}`, {
        content: messageContent,
        messageType: sentAttachment ? sentAttachment.type.toUpperCase() : 'TEXT',
        metadata: sentAttachment ? { attachment: sentAttachment } : null
      });
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
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'image')}
        />
        <input
          type="file"
          ref={videoInputRef}
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'video')}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="*/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'file')}
        />

        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-4 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Thảo luận · {project.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              Bấm dấu “+” để gửi ảnh, video, ghi âm voice hoặc tệp tin. Bấm “Tạo việc” để chuyển thành task.
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
                className="text-xs text-ink-muted hover:text-ink cursor-pointer"
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
                        className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium text-accent transition-[opacity,background-color] duration-150 hover:bg-accent-soft focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                      >
                        <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Tạo việc
                      </button>
                    )}
                  </div>

                  {/* Message Text */}
                  {m.text && <p className="mt-0.5 text-sm leading-relaxed text-ink">{m.text}</p>}

                  {/* Attachment Previews */}
                  {m.attachment && (
                    <div className="mt-2">
                      {m.attachment.type === 'image' && (
                        <img
                          src={m.attachment.url}
                          alt={m.attachment.name}
                          onClick={() => window.open(m.attachment?.url, '_blank')}
                          className="max-h-80 max-w-sm rounded-lg border border-line object-cover shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                        />
                      )}

                      {m.attachment.type === 'video' && (
                        <video
                          controls
                          src={m.attachment.url}
                          className="max-h-80 max-w-md rounded-lg border border-line bg-black shadow-sm"
                        />
                      )}

                      {m.attachment.type === 'audio' && (
                        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 shadow-sm max-w-xs">
                          <audio controls src={m.attachment.url} className="h-9 w-full" />
                        </div>
                      )}

                      {m.attachment.type === 'file' && (
                        <a
                          href={m.attachment.url}
                          download={m.attachment.name}
                          className="inline-flex items-center gap-3 rounded-lg border border-line bg-surface p-3 text-sm text-ink hover:bg-subtle transition-colors shadow-sm max-w-sm"
                        >
                          <FileTextIcon className="h-6 w-6 text-accent shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{m.attachment.name}</p>
                            {m.attachment.size && (
                              <p className="text-[11px] text-ink-faint">
                                {(m.attachment.size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                          <DownloadIcon className="h-4 w-4 text-ink-muted shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

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

        {/* Input Form & Attachments */}
        <div className="border-t border-line bg-surface p-4 lg:px-8">
          {/* Active Recording Banner */}
          {isRecording && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-danger/40 bg-danger-soft/40 px-3 py-2 text-xs text-danger">
              <div className="flex items-center gap-2 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
                </span>
                Đang ghi âm Voice ({recordingSeconds}s)...
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="rounded px-2 py-1 text-ink-muted hover:text-ink cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1 rounded bg-danger px-2.5 py-1 text-white font-medium hover:bg-danger/90 cursor-pointer"
                >
                  <SquareIcon className="h-3 w-3 fill-white" /> Xong & Đính kèm
                </button>
              </div>
            </div>
          )}

          {/* Attachment Preview Banner before Sending */}
          {attachment && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-line bg-subtle p-2 max-w-md">
              {attachment.type === 'image' && (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="h-12 w-12 rounded object-cover border border-line"
                />
              )}
              {attachment.type === 'video' && (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-ink/10 text-ink">
                  <FilmIcon className="h-5 w-5" />
                </div>
              )}
              {attachment.type === 'audio' && (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-accent-soft text-accent">
                  <MicIcon className="h-5 w-5" />
                </div>
              )}
              {attachment.type === 'file' && (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-ink/10 text-ink">
                  <FileTextIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{attachment.name}</p>
                <p className="text-[10px] text-ink-faint uppercase font-semibold">{attachment.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="rounded-md p-1 text-ink-faint hover:text-ink hover:bg-surface cursor-pointer"
                title="Bỏ đính kèm"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={send} className="flex items-center gap-2 relative">
            {/* Plus Button (+) for Media / File Attachments */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu((prev) => !prev)}
                title="Thêm tệp tin, ảnh, video hoặc voice"
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  showAttachMenu
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-surface text-ink-muted hover:bg-subtle hover:text-ink'
                }`}
              >
                <PlusIcon className="h-5 w-5" />
              </button>

              {/* Attachment Options Menu */}
              <AnimatePresence>
                {showAttachMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setShowAttachMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-12 left-0 z-30 w-52 rounded-xl border border-line bg-surface p-1.5 shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          imageInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-subtle transition-colors cursor-pointer"
                      >
                        <ImageIcon className="h-4 w-4 text-accent" />
                        <span>Hình ảnh (Photos)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          videoInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-subtle transition-colors cursor-pointer"
                      >
                        <FilmIcon className="h-4 w-4 text-warning" />
                        <span>Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={startRecording}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-subtle transition-colors cursor-pointer"
                      >
                        <MicIcon className="h-4 w-4 text-danger" />
                        <span>Ghi âm Voice</span>
                      </button>

                      <div className="my-1 border-t border-line" />

                      <button
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink hover:bg-subtle transition-colors cursor-pointer"
                      >
                        <PaperclipIcon className="h-4 w-4 text-ink-muted" />
                        <span>Tệp tin tài liệu</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <label htmlFor="chat-input" className="sr-only">
              Nội dung tin nhắn
            </label>
            <input
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={attachment ? 'Thêm ghi chú cho tệp tin...' : 'Nhắn tin với nhóm…'}
              className="h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
            />

            <Button type="submit" disabled={!text.trim() && !attachment}>
              <SendIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Gửi</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
