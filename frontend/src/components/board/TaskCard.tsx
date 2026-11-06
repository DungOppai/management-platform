import React from 'react';
import { CalendarIcon, ListChecksIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { PriorityTag } from '../PriorityTag';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { dueLabel, dueToneText, formatShortDate } from '../../utils/date';
import type { Task } from '../../types/project';

interface TaskCardProps {
  task: Task;
  onOpen: (id: string) => void;
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { getMember } = useWorkspace();
  const due = task.status === 'done' ? { label: formatShortDate(task.dueDate), tone: 'neutral' as const } : dueLabel(task.dueDate);
  const doneItems = task.checklist.filter((c) => c.done).length;

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className="block w-full rounded-lg border border-line bg-surface p-3.5 text-left shadow-sm transition-[border-color,box-shadow] duration-150 ease-out hover:border-ink-faint/40 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
      
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-faint">{task.code}</span>
        <PriorityTag priority={task.priority} />
      </div>
      <p className={`mt-1.5 line-clamp-2 text-sm font-medium leading-snug ${task.status === 'done' ? 'text-ink-muted' : 'text-ink'}`}>
        {task.title}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs">
          <span className={`inline-flex items-center gap-1 ${dueToneText[due.tone]}`}>
            <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {due.label}
          </span>
          {task.checklist.length > 0 &&
          <span className="inline-flex items-center gap-1 tabular-nums text-ink-muted">
              <ListChecksIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {doneItems}/{task.checklist.length}
            </span>
          }
        </div>
        <Avatar member={getMember(task.assigneeId)} />
      </div>
    </button>);

}