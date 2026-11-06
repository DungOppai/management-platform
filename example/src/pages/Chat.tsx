import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SendIcon, SparklesIcon } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { TaskSuggestionCard } from '../components/chat/TaskSuggestionCard';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { messages as initialMessages } from '../data/messages';
import { isoFromToday } from '../utils/date';
import type { ChatMessage, SuggestedTask } from '../types/project';

interface Extraction {
  messageId: string;
  loading: boolean;
  task: SuggestedTask;
}

export function Chat() {
  const { project, members, getMember, currentUser, addTask } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState('');
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const extract = (m: ChatMessage) => {
    const task: SuggestedTask = m.suggestion ?? {
      title: m.text.length > 70 ? `${m.text.slice(0, 67).trimEnd()}…` : m.text,
      assigneeId: m.authorId,
      dueDate: isoFromToday(3),
      priority: 'medium'
    };
    setExtraction({ messageId: m.id, loading: true, task });
    window.setTimeout(() => {
      setExtraction((cur) => cur && cur.messageId === m.id ? { ...cur, loading: false } : cur);
    }, 700);
  };

  const confirm = () => {
    if (!extraction) return;
    const created = addTask({ ...extraction.task, status: 'todo', description: 'Tạo từ tin nhắn trong kênh thảo luận.' });
    toast.success(`Đã thêm ${created.code} vào cột Cần làm`, { description: created.title });
    setExtraction(null);
  };

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, authorId: currentUser.id, text: value, time: format(new Date(), 'HH:mm') }]);
    setText('');
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-[100dvh]">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line bg-surface px-5 py-4 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-ink">Thảo luận</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
            <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            Chọn “Tạo việc” ở một tin nhắn để AI chuyển thành công việc.
          </p>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto py-4" role="log" aria-label={`Tin nhắn ${project.name}`}>
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
                    {!active &&
                    <button
                      type="button"
                      onClick={() => extract(m)}
                      className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium text-accent transition-[opacity,background-color] duration-150 hover:bg-accent-soft focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      
                        <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Tạo việc
                      </button>
                    }
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink">{m.text}</p>
                  <AnimatePresence>
                    {active && extraction &&
                    <TaskSuggestionCard
                      loading={extraction.loading}
                      task={extraction.task}
                      onTitleChange={(title) => setExtraction({ ...extraction, task: { ...extraction.task, title } })}
                      onConfirm={confirm}
                      onDismiss={() => setExtraction(null)} />

                    }
                  </AnimatePresence>
                </div>
              </article>);

          })}
        </div>

        <form onSubmit={send} className="border-t border-line bg-surface px-5 py-4 lg:px-8">
          <div className="flex items-end gap-2 rounded-xl border border-line bg-canvas p-2 focus-within:ring-2 focus-within:ring-accent/40">
            <label htmlFor="chat-input" className="sr-only">
              Nhập tin nhắn
            </label>
            <textarea
              id="chat-input"
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) send(e);
              }}
              placeholder={`Nhắn cho nhóm ${project.code}…`}
              className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none" />
            
            <Button type="submit" size="md" disabled={!text.trim()} aria-label="Gửi">
              <SendIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>

      <aside className="hidden w-72 shrink-0 border-l border-line bg-surface xl:block" aria-label="Thành viên">
        <h2 className="px-5 pb-3 pt-5 text-sm font-semibold text-ink">
          Thành viên <span className="font-normal text-ink-faint">{members.length}</span>
        </h2>
        <ul className="space-y-1 px-3">
          {members.map((m) =>
          <li key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar member={m} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                <p className="truncate text-xs text-ink-faint">{m.role}</p>
              </div>
            </li>
          )}
        </ul>
      </aside>
    </div>);

}