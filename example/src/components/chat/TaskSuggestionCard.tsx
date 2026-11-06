import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { Button } from '../Button';
import { Avatar } from '../Avatar';
import { PriorityTag } from '../PriorityTag';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { formatShortDate } from '../../utils/date';
import type { SuggestedTask } from '../../types/project';

interface TaskSuggestionCardProps {
  loading: boolean;
  task: SuggestedTask;
  onTitleChange: (title: string) => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function TaskSuggestionCard({ loading, task, onTitleChange, onConfirm, onDismiss }: TaskSuggestionCardProps) {
  const { getMember } = useWorkspace();
  const assignee = getMember(task.assigneeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="mt-2 max-w-lg rounded-lg border border-accent/30 bg-surface p-4 shadow-sm"
      aria-live="polite">
      
      <p className="flex items-center gap-2 text-xs font-medium text-accent">
        <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {loading ? 'AI đang đọc tin nhắn…' : 'AI đề xuất công việc'}
      </p>

      {loading ?
      <div className="mt-3 space-y-2" aria-hidden="true">
          <div className="h-4 w-3/4 animate-pulse rounded bg-subtle" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-subtle" />
        </div> :

      <>
          <label htmlFor="suggested-title" className="sr-only">
            Tên công việc
          </label>
          <input
          id="suggested-title"
          value={task.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="mt-2 w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-medium text-ink hover:border-line focus:border-line focus:outline-none focus:ring-2 focus:ring-accent/40" />
        
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Avatar member={assignee} />
              {assignee?.name}
            </span>
            <span>Hạn {formatShortDate(task.dueDate)}</span>
            <PriorityTag priority={task.priority} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Bỏ qua
            </Button>
            <Button size="sm" onClick={onConfirm} disabled={!task.title.trim()}>
              Thêm vào bảng
            </Button>
          </div>
        </>
      }
    </motion.div>);

}