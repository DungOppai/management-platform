import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusIcon, SearchIcon, UserIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { BoardColumn } from '../components/board/BoardColumn';
import { TaskDrawer } from '../components/board/TaskDrawer';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { statuses } from '../data/taskMeta';
import type { TaskStatus } from '../types/project';

export function Board() {
  const { project, tasks, currentUser, addTask } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null);

  const selected = tasks.find((t) => t.id === params.get('task')) ?? null;
  const q = query.trim().toLowerCase();
  const visible = tasks.filter(
    (t) =>
    (!mineOnly || t.assigneeId === currentUser.id) && (
    !q || t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
  );

  const openTask = (id: string) => setParams({ task: id });
  const closeTask = useCallback(() => setParams({}), [setParams]);

  const handleAdd = (status: TaskStatus, title: string) => {
    const created = addTask({ title, status });
    toast.success(`Đã tạo ${created.code}`, { description: created.title });
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Bảng công việc"
        description={`${project.name} · ${tasks.length} công việc`}
        actions={
        <Button onClick={() => setAddingTo('todo')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Tạo công việc
          </Button>
        } />
      

      <div className="flex flex-wrap items-center gap-2 px-5 pt-5 lg:px-8">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <label htmlFor="board-search" className="sr-only">
            Tìm công việc
          </label>
          <input
            id="board-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã…"
            className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40" />
          
        </div>
        <button
          type="button"
          aria-pressed={mineOnly}
          onClick={() => setMineOnly((v) => !v)}
          className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors duration-150 ${
          mineOnly ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-surface text-ink-muted hover:bg-subtle hover:text-ink'}`
          }>
          
          <UserIcon className="h-4 w-4" aria-hidden="true" />
          Việc của tôi
        </button>
      </div>

      <div className="flex flex-1 items-start gap-4 overflow-x-auto px-5 py-5 lg:px-8">
        {statuses.map((s) =>
        <BoardColumn
          key={s.id}
          label={s.label}
          dotClass={s.dotClass}
          tasks={visible.filter((t) => t.status === s.id)}
          adding={addingTo === s.id}
          onStartAdd={() => setAddingTo(s.id)}
          onCancelAdd={() => setAddingTo(null)}
          onAdd={(title) => handleAdd(s.id, title)}
          onOpen={openTask} />

        )}
      </div>

      <TaskDrawer task={selected} onClose={closeTask} />
    </div>);

}