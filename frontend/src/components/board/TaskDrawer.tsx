import React, { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, XIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { priorities, statuses } from '../../data/taskMeta';
import { dueLabel, dueToneText, formatShortDate } from '../../utils/date';
import type { Priority, Task, TaskStatus } from '../../types/project';

interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

const selectClass =
'w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40';

export function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const { updateTask, getMember, members } = useWorkspace();

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task, onClose]);

  return (
    <AnimatePresence>
      {task &&
      <>
          <motion.div
          key="overlay"
          className="fixed inset-0 z-40 bg-ink/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose} />
        
          <motion.aside
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-title"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-xl">
          
            <div className="flex h-14 items-center justify-between border-b border-line px-5">
              <span className="text-sm font-medium text-ink-faint">{task.code}</span>
              <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-ink">
              
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <h2 id="task-title" className="text-lg font-semibold leading-snug text-ink">
                {task.title}
              </h2>
              {task.description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{task.description}</p>}

              <dl className="mt-6 grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3 text-sm">
                <Field label="Trạng thái">
                  <select
                  aria-label="Trạng thái"
                  value={task.status}
                  onChange={(e) => {
                    const status = e.target.value as TaskStatus;
                    let nextProgress = task.progress;
                    if (status === 'done') {
                      nextProgress = 100;
                    } else if (task.status === 'done' && task.progress === 100) {
                      nextProgress = status === 'todo' ? 0 : 70;
                    }
                    updateTask(task.id, { status, progress: nextProgress });
                  }}
                  className={selectClass}>
                  
                    {statuses.map((s) =>
                  <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                  )}
                  </select>
                </Field>
                <Field label="Độ ưu tiên">
                  <select
                  aria-label="Độ ưu tiên"
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                  className={selectClass}>
                  
                    {priorities.map((p) =>
                  <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                  )}
                  </select>
                </Field>
                <Field label="Người thực hiện">
                  <div className="flex items-center gap-2">
                    <Avatar member={getMember(task.assigneeId)} />
                    <select
                    aria-label="Người thực hiện"
                    value={task.assigneeId}
                    onChange={(e) => updateTask(task.id, { assigneeId: e.target.value })}
                    className={selectClass}>
                    
                      {members.map((m) =>
                    <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                    )}
                    </select>
                  </div>
                </Field>
                <Field label="Hạn chót">
                  <span className="text-ink">
                    {formatShortDate(task.dueDate)}
                    {task.status !== 'done' &&
                  <span className={`ml-2 text-xs ${dueToneText[dueLabel(task.dueDate).tone]}`}>
                        {dueLabel(task.dueDate).label}
                      </span>
                  }
                  </span>
                </Field>
                <Field label="Tiến độ">
                  <div className="flex items-center gap-3">
                    <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={task.progress}
                    aria-label="Tiến độ"
                    onChange={(e) => {
                      const progress = Number(e.target.value);
                      const patch: Partial<Task> = { progress };
                      if (progress === 100) {
                        patch.status = 'done';
                      } else if (task.status === 'done') {
                        // Kéo xuống dưới 100% thì tự động chuyển khỏi trạng thái Hoàn thành
                        patch.status = progress > 0 ? 'in_progress' : 'todo';
                      }
                      updateTask(task.id, patch);
                    }}
                    className="h-1.5 flex-1 cursor-pointer accent-[rgb(var(--accent))]" />
                  
                    <span className="w-10 text-right tabular-nums text-ink">{task.progress}%</span>
                  </div>
                </Field>
              </dl>

              <section className="mt-8">
                <h3 className="text-sm font-semibold text-ink">
                  Checklist
                  {task.checklist.length > 0 &&
                <span className="ml-2 font-normal tabular-nums text-ink-faint">
                      {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
                    </span>
                }
                </h3>
                {task.checklist.length === 0 ?
              <p className="mt-2 text-sm text-ink-faint">Công việc này chưa có checklist.</p> :

              <ul className="mt-3 space-y-1">
                    {task.checklist.map((item) =>
                <li key={item.id}>
                        <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.done}
                    onClick={() =>
                    updateTask(task.id, {
                      checklist: task.checklist.map((c) => c.id === item.id ? { ...c, done: !c.done } : c)
                    })
                    }
                    className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-150 hover:bg-subtle">
                    
                          <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      item.done ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface'}`
                      }>
                      
                            {item.done && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
                          </span>
                          <span className={item.done ? 'text-ink-faint line-through' : 'text-ink'}>{item.title}</span>
                        </button>
                      </li>
                )}
                  </ul>
              }
              </section>
            </div>
          </motion.aside>
        </>
      }
    </AnimatePresence>);

}

function Field({ label, children }: {label: string;children: ReactNode;}) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>);

}