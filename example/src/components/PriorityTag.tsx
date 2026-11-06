import React from 'react';
import { priorities } from '../data/taskMeta';
import type { Priority } from '../types/project';

export function PriorityTag({ priority }: {priority: Priority;}) {
  const meta = priorities.find((p) => p.id === priority);
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ${meta.className}`}>
      {meta.label}
    </span>);

}