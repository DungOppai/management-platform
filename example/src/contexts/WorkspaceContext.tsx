import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { projects } from '../data/projects';
import { members as allMembers } from '../data/members';
import { tasks as initialTasks } from '../data/tasks';
import { isoFromToday } from '../utils/date';
import type { Member, NewTaskInput, Project, Task } from '../types/project';

interface WorkspaceValue {
  projects: Project[];
  project: Project;
  selectProject: (id: string) => void;
  tasks: Task[];
  members: Member[];
  currentUser: Member;
  getMember: (id: string) => Member | undefined;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (input: NewTaskInput) => Task;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: {children: ReactNode;}) {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);

  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const currentUser = allMembers[0];

  const getMember = useCallback((id: string) => allMembers.find((m) => m.id === id), []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setAllTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const addTask = useCallback(
    (input: NewTaskInput): Task => {
      const numbers = allTasks.
      filter((t) => t.projectId === project.id).
      map((t) => Number(t.code.split('-')[1]) || 0);
      const next = Math.max(0, ...numbers) + 1;
      const task: Task = {
        id: `t-${Date.now()}`,
        projectId: project.id,
        code: `${project.code}-${next}`,
        title: input.title,
        description: input.description ?? '',
        status: input.status ?? 'todo',
        priority: input.priority ?? 'medium',
        progress: 0,
        dueDate: input.dueDate ?? isoFromToday(7),
        assigneeId: input.assigneeId ?? currentUser.id,
        checklist: []
      };
      setAllTasks((prev) => [task, ...prev]);
      return task;
    },
    [allTasks, project, currentUser.id]
  );

  const value = useMemo<WorkspaceValue>(
    () => ({
      projects,
      project,
      selectProject: setProjectId,
      tasks: allTasks.filter((t) => t.projectId === project.id),
      members: project.memberIds.map((id) => allMembers.find((m) => m.id === id)).filter((m): m is Member => !!m),
      currentUser,
      getMember,
      updateTask,
      addTask
    }),
    [project, allTasks, currentUser, getMember, updateTask, addTask]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}