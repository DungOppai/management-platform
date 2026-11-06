import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { projects as defaultProjects } from '../data/projects';
import { members as defaultMembers } from '../data/members';
import { tasks as initialTasks } from '../data/tasks';
import { isoFromToday } from '../utils/date';
import api from '../services/api';
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../services/socket';
import type { Member, NewTaskInput, Project, Task, TaskStatus, Priority } from '../types/project';

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
  deleteTask: (id: string) => void;
  addChecklist: (taskId: string, title: string) => Promise<void>;
  toggleChecklist: (taskId: string, checklistId: string) => Promise<void>;
  deleteChecklist: (taskId: string, checklistId: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [projectsList, setProjectsList] = useState<Project[]>(defaultProjects);
  const [projectId, setProjectId] = useState<string>(defaultProjects[0].id);
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [membersList, setMembersList] = useState<Member[]>(defaultMembers);
  const [currentUser, setCurrentUser] = useState<Member>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return {
          id: String(u.id),
          name: u.full_name,
          initials: getInitials(u.full_name),
          role: u.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên',
          tone: 'accent'
        };
      }
    } catch {}
    return defaultMembers[0];
  });

  // Load Current User Profile from backend
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        const u = res.data.user;
        setCurrentUser({
          id: String(u.id),
          name: u.full_name,
          initials: getInitials(u.full_name),
          role: u.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên',
          tone: 'accent'
        });
      }
    } catch {
      // Keep default user if not logged in yet
    }
  }, []);

  // Load Projects from Backend
  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      if (res.data?.projects && res.data.projects.length > 0) {
        const mappedProjects: Project[] = res.data.projects.map((p: any) => ({
          id: String(p.id),
          code: p.code,
          name: p.title,
          dueDate: '2026-12-15',
          memberIds: []
        }));
        setProjectsList(mappedProjects);
        if (!mappedProjects.some(p => p.id === projectId)) {
          setProjectId(mappedProjects[0].id);
        }
      }
    } catch (err) {
      console.warn('Using default projects offline:', err);
    }
  }, [projectId]);

  // Load Tasks and Members for Active Project
  const fetchProjectData = useCallback(async (pId: string) => {
    if (!pId) return;
    try {
      const [tasksRes, projRes] = await Promise.all([
        api.get(`/tasks/project/${pId}`),
        api.get(`/projects/${pId}`)
      ]);

      if (tasksRes.data?.tasks) {
        const currentProj = projectsList.find(p => p.id === pId) || projectsList[0];
        const mappedTasks: Task[] = tasksRes.data.tasks.map((t: any) => ({
          id: String(t.id),
          projectId: String(t.project_id),
          code: `${currentProj.code}-${t.id}`,
          title: t.title,
          description: t.description || '',
          status: (t.status ? t.status.toLowerCase() : 'todo') as TaskStatus,
          priority: (t.priority ? t.priority.toLowerCase() : 'medium') as Priority,
          progress: t.progress ?? 0,
          dueDate: t.due_date ? t.due_date.slice(0, 10) : isoFromToday(7),
          assigneeId: t.assignee_id ? String(t.assignee_id) : 'm1',
          checklist: (t.checklists || []).map((c: any) => ({
            id: String(c.id),
            title: c.title,
            done: !!c.is_completed
          }))
        }));
        setAllTasks(mappedTasks);
      }

      if (projRes.data?.members) {
        const mappedMembers: Member[] = projRes.data.members.map((m: any, index: number) => ({
          id: String(m.id),
          name: m.full_name,
          initials: getInitials(m.full_name),
          role: m.project_role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên',
          tone: index % 2 === 0 ? 'accent' : 'success'
        }));
        setMembersList(mappedMembers);
      }
    } catch (err) {
      console.warn('Backend tasks offline, using local cache:', err);
    }
  }, [projectsList]);

  // Initial loads
  useEffect(() => {
    fetchCurrentUser();
    fetchProjects();
  }, [fetchCurrentUser, fetchProjects]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);

      // Join Socket.io room for realtime updates
      joinProjectRoom(projectId);
      const socket = getSocket();

      const onTaskCreated = () => fetchProjectData(projectId);
      const onTaskUpdated = () => fetchProjectData(projectId);
      const onTaskDeleted = () => fetchProjectData(projectId);

      socket.on('task_created', onTaskCreated);
      socket.on('task_updated', onTaskUpdated);
      socket.on('task_deleted', onTaskDeleted);

      return () => {
        leaveProjectRoom(projectId);
        socket.off('task_created', onTaskCreated);
        socket.off('task_updated', onTaskUpdated);
        socket.off('task_deleted', onTaskDeleted);
      };
    }
  }, [projectId, fetchProjectData]);

  const project = projectsList.find((p) => p.id === projectId) ?? projectsList[0];

  const getMember = useCallback(
    (id: string) => membersList.find((m) => m.id === id) || defaultMembers.find((m) => m.id === id),
    [membersList]
  );

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    // 1. Optimistic local update
    setAllTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    // 2. Persist to Backend API
    const apiPayload: any = {};
    if (patch.title !== undefined) apiPayload.title = patch.title;
    if (patch.description !== undefined) apiPayload.description = patch.description;
    if (patch.status !== undefined) apiPayload.status = patch.status.toUpperCase();
    if (patch.priority !== undefined) apiPayload.priority = patch.priority.toUpperCase();
    if (patch.progress !== undefined) apiPayload.progress = patch.progress;
    if (patch.dueDate !== undefined) apiPayload.dueDate = patch.dueDate;
    if (patch.assigneeId !== undefined) {
      const parsed = parseInt(patch.assigneeId, 10);
      apiPayload.assigneeId = isNaN(parsed) ? null : parsed;
    }

    api.put(`/tasks/${id}`, apiPayload).catch((err) => {
      console.warn('Failed to update task on backend:', err);
    });
  }, []);

  const addTask = useCallback(
    (input: NewTaskInput): Task => {
      const numbers = allTasks
        .filter((t) => t.projectId === project.id)
        .map((t) => Number(t.code.split('-')[1]) || 0);
      const next = Math.max(0, ...numbers) + 1;

      const tempId = `t-${Date.now()}`;
      const newTask: Task = {
        id: tempId,
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

      // Optimistic local add
      setAllTasks((prev) => [newTask, ...prev]);

      // Persist to backend
      const parsedAssignee = parseInt(newTask.assigneeId, 10);
      const apiPayload = {
        projectId: parseInt(project.id, 10) || 1,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status.toUpperCase(),
        priority: newTask.priority.toUpperCase(),
        dueDate: newTask.dueDate,
        assigneeId: isNaN(parsedAssignee) ? null : parsedAssignee,
        checklists: []
      };

      api.post('/tasks', apiPayload).then((res) => {
        if (res.data?.task) {
          const created = res.data.task;
          setAllTasks((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: String(created.id) } : t))
          );
        }
      }).catch((err) => {
        console.warn('Failed to persist task on backend:', err);
      });

      return newTask;
    },
    [allTasks, project, currentUser.id]
  );

  const deleteTask = useCallback((id: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    api.delete(`/tasks/${id}`).catch((err) => {
      console.warn('Failed to delete task on backend:', err);
    });
  }, []);

  const addChecklist = useCallback(async (taskId: string, title: string) => {
    if (!title.trim()) return;
    const tempId = `c-${Date.now()}`;
    const newItem = { id: tempId, title: title.trim(), done: false };

    setAllTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, checklist: [...t.checklist, newItem] } : t))
    );

    try {
      const res = await api.post(`/tasks/${taskId}/checklists`, { title: title.trim() });
      if (res.data?.item) {
        const realId = String(res.data.item.id);
        setAllTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.map((c) => (c.id === tempId ? { ...c, id: realId } : c)),
                }
              : t
          )
        );
      }
    } catch (err) {
      console.warn('Failed to add checklist item to backend:', err);
    }
  }, []);

  const toggleChecklist = useCallback(async (taskId: string, checklistId: string) => {
    setAllTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextChecklist = t.checklist.map((c) =>
          c.id === checklistId ? { ...c, done: !c.done } : c
        );
        const total = nextChecklist.length;
        const doneCount = nextChecklist.filter((c) => c.done).length;
        const progress = total > 0 ? Math.round((doneCount / total) * 100) : t.progress;
        const status = progress === 100 ? 'done' : (t.status === 'done' ? 'in_progress' : t.status);
        return { ...t, checklist: nextChecklist, progress, status };
      })
    );

    try {
      await api.put(`/tasks/checklists/${checklistId}/toggle`);
    } catch (err) {
      console.warn('Failed to toggle checklist on backend:', err);
    }
  }, []);

  const deleteChecklist = useCallback(async (taskId: string, checklistId: string) => {
    setAllTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextChecklist = t.checklist.filter((c) => c.id !== checklistId);
        return { ...t, checklist: nextChecklist };
      })
    );

    try {
      await api.delete(`/tasks/checklists/${checklistId}`);
    } catch (err) {
      console.warn('Failed to delete checklist on backend:', err);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  const value = useMemo<WorkspaceValue>(
    () => ({
      projects: projectsList,
      project,
      selectProject: setProjectId,
      tasks: allTasks.filter((t) => t.projectId === project.id || projectsList.length === 1),
      members: membersList,
      currentUser,
      getMember,
      updateTask,
      addTask,
      deleteTask,
      addChecklist,
      toggleChecklist,
      deleteChecklist,
      logout,
      refreshData: () => fetchProjectData(project.id)
    }),
    [projectsList, project, allTasks, membersList, currentUser, getMember, updateTask, addTask, deleteTask, addChecklist, toggleChecklist, deleteChecklist, logout, fetchProjectData]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
