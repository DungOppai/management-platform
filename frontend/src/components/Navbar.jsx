import React from 'react';
import { 
  Sparkles, 
  Kanban, 
  MessageSquare, 
  BarChart3, 
  Bot, 
  LogOut, 
  FolderGit2, 
  Plus,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  projects, 
  selectedProject, 
  setSelectedProject, 
  onNewTaskClick,
  onOpenAIModal 
}) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Project Selector */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                AI ProjectHub
                <span className="text-[10px] uppercase font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                  VKU DATN
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Hệ thống Quản lý Dự án & Trợ lý AI</p>
            </div>
          </div>

          {/* Project dropdown */}
          {projects && projects.length > 0 && (
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const proj = projects.find((p) => p.id === parseInt(e.target.value, 10));
                  if (proj) setSelectedProject(proj);
                }}
                className="bg-transparent text-sm text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    [{p.code}] {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentTab('kanban')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Bảng Kanban</span>
          </button>

          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'chat'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Phòng Chat & 1-Click Task</span>
          </button>

          <button
            onClick={() => setCurrentTab('ai')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'ai'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-violet-300" />
            <span>Trợ lý AI Đánh giá</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard & Báo cáo</span>
          </button>
        </nav>

        {/* Right: Quick Action & User Menu */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewTaskClick}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Task Mới</span>
          </button>

          <div className="h-6 w-px bg-slate-800" />

          {/* User info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-200">{user?.full_name}</p>
              <span className="text-[10px] text-indigo-400 uppercase tracking-wider">{user?.role || 'MEMBER'}</span>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
