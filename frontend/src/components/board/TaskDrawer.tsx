import React, { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { priorities, statuses } from '../../data/taskMeta';
import { dueLabel, dueToneText } from '../../utils/date';
import type { Priority, Task, TaskStatus } from '../../types/project';

interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

const selectClass =
  'w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40';

export function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const { updateTask, deleteTask, addChecklist, toggleChecklist, deleteChecklist, getMember, members } = useWorkspace();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
    }
  }, [task?.id, task?.title, task?.description]);

  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [task, onClose]);

  if (!task) return null;

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask(task.id, { title: trimmed });
    }
  };

  const handleDescBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    await addChecklist(task.id, newChecklistTitle.trim());
    setNewChecklistTitle('');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.aside
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl"
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-5">
          <span className="font-mono text-xs font-semibold text-accent">{task.code}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-ink"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Editable Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Tiêu đề công việc</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="Nhập tiêu đề công việc..."
              className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-base font-semibold text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Editable Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Mô tả chi tiết</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="Thêm mô tả chi tiết cho công việc (yêu cầu, tài liệu tham khảo, ghi chú)..."
              className="mt-1 w-full rounded-md border border-line bg-surface/50 p-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Properties Grid */}
          <dl className="grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3.5 text-sm pt-2 border-t border-line">
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
                className={selectClass}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Độ ưu tiên">
              <select
                aria-label="Độ ưu tiên"
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                className={selectClass}
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Người thực hiện">
              <div className="flex items-center gap-2">
                <Avatar member={getMember(task.assigneeId)} />
                <select
                  aria-label="Người thực hiện"
                  value={task.assigneeId}
                  onChange={(e) => updateTask(task.id, { assigneeId: e.target.value })}
                  className={selectClass}
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Hạn chót">
              <div className="flex flex-col gap-1.5">
                <input
                  type="date"
                  aria-label="Hạn chót"
                  value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                  className={selectClass}
                />
                {task.status !== 'done' && task.dueDate && (
                  <span className={`text-xs ${dueToneText[dueLabel(task.dueDate).tone]}`}>
                    {dueLabel(task.dueDate).label}
                  </span>
                )}
              </div>
            </Field>

            <Field label="Tiến độ">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress}
                  aria-label="Tiến độ"
                  onChange={(e) => {
                    const progress = Number(e.target.value);
                    const patch: Partial<Task> = { progress };
                    if (progress === 100) {
                      patch.status = 'done';
                    } else if (task.status === 'done') {
                      patch.status = progress > 0 ? 'in_progress' : 'todo';
                    }
                    updateTask(task.id, patch);
                  }}
                  className="h-1.5 flex-1 cursor-pointer accent-[rgb(var(--accent))]"
                />
                <span className="w-10 text-right tabular-nums text-sm font-semibold text-ink">{task.progress}%</span>
              </div>
            </Field>
          </dl>

          {/* Checklist Section */}
          <section className="pt-4 border-t border-line">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">
                Danh sách kiểm tra (Checklist)
                {task.checklist.length > 0 && (
                  <span className="ml-2 font-normal tabular-nums text-ink-faint">
                    {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
                  </span>
                )}
              </h3>
            </div>

            {task.checklist.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {task.checklist.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-subtle"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.done}
                      onClick={() => toggleChecklist(task.id, item.id)}
                      className="flex flex-1 items-center gap-2.5 text-left text-sm"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          item.done ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface'
                        }`}
                      >
                        {item.done && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
                      </span>
                      <span className={item.done ? 'text-ink-faint line-through' : 'text-ink'}>{item.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChecklist(task.id, item.id)}
                      title="Xóa mục này"
                      className="opacity-0 group-hover:opacity-100 p-1 text-ink-faint hover:text-danger rounded transition-all"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Checklist Form */}
            <form onSubmit={handleAddChecklist} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="+ Thêm mục kiểm tra nhỏ..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="flex-1 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!newChecklistTitle.trim()}
                className="flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-40 transition-all"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Thêm
              </button>
            </form>
          </section>

          {/* Delete Task Option */}
          <div className="pt-6 border-t border-line flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn xóa công việc "${task.title}" không?`)) {
                  deleteTask(task.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-danger/80 hover:text-danger hover:underline transition-colors py-1 px-2"
            >
              <Trash2Icon className="h-3.5 w-3.5" /> Xóa công việc này
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-ink-muted text-xs font-medium">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}
