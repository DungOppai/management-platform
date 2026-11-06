import type { Priority, TaskStatus, Tone } from '../types/project';

export const statuses: {id: TaskStatus;label: string;dotClass: string;}[] = [
{ id: 'todo', label: 'Cần làm', dotClass: 'bg-ink-faint' },
{ id: 'in_progress', label: 'Đang làm', dotClass: 'bg-accent' },
{ id: 'review', label: 'Đang review', dotClass: 'bg-warning' },
{ id: 'done', label: 'Hoàn thành', dotClass: 'bg-success' }];


export const priorities: {id: Priority;label: string;className: string;}[] = [
{ id: 'low', label: 'Thấp', className: 'bg-subtle text-ink-muted' },
{ id: 'medium', label: 'Trung bình', className: 'bg-accent-soft text-accent' },
{ id: 'high', label: 'Cao', className: 'bg-warning-soft text-warning' },
{ id: 'urgent', label: 'Khẩn cấp', className: 'bg-danger-soft text-danger' }];


export const toneClasses: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-subtle text-ink-muted'
};