import React, { FormEvent, useState } from 'react';
import { Button } from '../Button';

interface QuickAddTaskProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function QuickAddTask({ onSubmit, onCancel }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const value = title.trim();
    if (!value) return;
    onSubmit(value);
    setTitle('');
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-accent/40 bg-surface p-2.5 shadow-sm">
      <label htmlFor="quick-add" className="sr-only">
        Tên công việc
      </label>
      <textarea
        id="quick-add"
        autoFocus
        rows={2}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) submit(e);
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Nhập tên công việc…"
        className="w-full resize-none bg-transparent px-1 text-sm text-ink placeholder:text-ink-faint focus:outline-none" />
      
      <div className="mt-2 flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          Thêm
        </Button>
      </div>
    </form>);

}