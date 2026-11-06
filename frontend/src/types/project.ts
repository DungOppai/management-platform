export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export interface Member {
  id: string;
  name: string;
  initials: string;
  role: string;
  tone: Tone;
}

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  dueDate: string;
  assigneeId: string;
  checklist: ChecklistItem[];
}

export interface NewTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  dueDate: string;
  memberIds: string[];
}

export interface SuggestedTask {
  title: string;
  assigneeId: string;
  dueDate: string;
  priority: Priority;
}

export interface MessageAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  text: string;
  time: string;
  suggestion?: SuggestedTask;
  attachment?: MessageAttachment;
}

export interface Activity {
  id: string;
  actorId: string;
  text: string;
  time: string;
}

export type AssistantActionId = 'standup' | 'bottlenecks' | 'catchup';

export interface AssistantAction {
  id: AssistantActionId;
  title: string;
  description: string;
}

export interface ReportItem {
  text: string;
  label?: string;
  tone?: 'danger' | 'warning' | 'success' | 'neutral';
}

export interface AssistantReport {
  title: string;
  summary: string;
  basis: string;
  sections: {heading: string;items: ReportItem[];}[];
}