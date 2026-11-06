import React from 'react';
import { PlusIcon } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { QuickAddTask } from './QuickAddTask';
import type { Task } from '../../types/project';

interface BoardColumnProps {
  label: string;
  dotClass: string;
  tasks: Task[];
  adding: boolean;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onAdd: (title: string) => void;
  onOpen: (id: string) => void;
}

export function BoardColumn({ label, dotClass, tasks, adding, onStartAdd, onCancelAdd, onAdd, onOpen }: BoardColumnProps) {
  return (
    <section aria-label={label} className="flex w-72 shrink-0 flex-col rounded-xl bg-subtle/70 p-2 xl:w-auto xl:min-w-0 xl:flex-1">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold text-ink">{label}</h2>
        <span className="text-xs tabular-nums text-ink-faint">{tasks.length}</span>
        <button
          type="button"
          onClick={onStartAdd}
          aria-label={`Thêm công việc vào ${label}`}
          className="ml-auto rounded-md p-1 text-ink-faint transition-colors duration-150 hover:bg-surface hover:text-ink">
          
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-1 flex flex-col gap-2">
        {adding && <QuickAddTask onSubmit={onAdd} onCancel={onCancelAdd} />}
        {tasks.map((task) =>
        <TaskCard key={task.id} task={task} onOpen={onOpen} />
        )}
        {tasks.length === 0 && !adding &&
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
            Chưa có công việc
          </p>
        }
      </div>
    </section>);

}