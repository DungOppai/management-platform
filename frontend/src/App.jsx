import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import { getSocket, joinProjectRoom, leaveProjectRoom } from './services/socket';
import Navbar from './components/Navbar';
import KanbanBoard from './components/KanbanBoard';
import ProjectChat from './components/ProjectChat';
import AICommandCenter from './components/AICommandCenter';
import DashboardView from './components/DashboardView';
import TaskModal from './components/TaskModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState('kanban');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
      if (res.data.projects.length > 0 && !selectedProject) {
        setSelectedProject(res.data.projects[0]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Fetch Tasks and Members for Selected Project
  const fetchProjectData = async (projectId) => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [tasksRes, projRes] = await Promise.all([
        api.get(`/tasks/project/${projectId}`),
        api.get(`/projects/${projectId}`),
      ]);
      setTasks(tasksRes.data.tasks);
      setMembers(projRes.data.members || []);
    } catch (err) {
      console.error('Error fetching project tasks & members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject?.id) {
      fetchProjectData(selectedProject.id);

      // Socket.io Realtime Join
      const socket = getSocket();
      joinProjectRoom(selectedProject.id);

      socket.on('task_created', (newTask) => {
        setTasks((prev) => {
          if (prev.some((t) => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
      });

      socket.on('task_updated', (updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      });

      socket.on('task_deleted', ({ id }) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      });

      return () => {
        leaveProjectRoom(selectedProject.id);
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_deleted');
      };
    }
  }, [selectedProject?.id]);

  // Handle Task Updates (e.g. moving status, progress change)
  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data.task : t))
      );
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handle Save Task (Create or Edit)
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        const res = await api.put(`/tasks/${taskData.id}`, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskData.id ? res.data.task : t))
        );
      } else {
        const res = await api.post('/tasks', {
          ...taskData,
          projectId: selectedProject.id,
        });
        setTasks((prev) => [res.data.task, ...prev]);
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle 1-Click Chat-to-Task from Chat
  const handleConvertToTaskFromChat = (extractedTask) => {
    setEditingTask(extractedTask);
    setIsTaskModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Đang khởi động hệ thống...
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        onNewTaskClick={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Main Tab View */}
      <main className="flex-1 pb-10">
        {selectedProject ? (
          <>
            {currentTab === 'kanban' && (
              <KanbanBoard
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {currentTab === 'chat' && (
              <ProjectChat
                project={selectedProject}
                onConvertToTask={handleConvertToTaskFromChat}
              />
            )}

            {currentTab === 'ai' && (
              <AICommandCenter project={selectedProject} />
            )}

            {currentTab === 'dashboard' && (
              <DashboardView project={selectedProject} />
            )}
          </>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs">
            Chưa có dự án nào được chọn.
          </div>
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialData={editingTask}
        members={members}
      />
    </div>
  );
}
