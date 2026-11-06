import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  FolderPlusIcon,
  KanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessagesSquareIcon,
  PlusIcon,
  SparklesIcon,
  XIcon
} from "lucide-react";
import { Avatar } from "./Avatar";
import { BrandMark } from "./BrandMark";
import { useWorkspace } from "../contexts/WorkspaceContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboardIcon, end: true },
  { to: '/board', label: 'Bảng công việc', icon: KanbanIcon },
  { to: '/chat', label: 'Thảo luận', icon: MessagesSquareIcon },
  { to: '/assistant', label: 'Trợ lý AI', icon: SparklesIcon }
];

export function Sidebar() {
  const {
    projects,
    project,
    selectProject,
    createProject,
    tasks,
    currentUser,
    logout
  } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const openCount = tasks.filter((t) => t.status !== 'done').length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) {
      setCreateError('Vui lòng nhập tên và mã dự án');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await createProject({
        title: newTitle.trim(),
        code: newCode.trim().toUpperCase(),
        description: newDesc.trim()
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewCode('');
      setNewDesc('');
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Không thể tạo dự án. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col">
        <div className="flex h-16 items-center px-5">
          <BrandMark />
        </div>

        <div className="relative px-3">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors duration-150 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 cursor-pointer"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-[11px] font-semibold text-accent">
              {project?.code || 'PRJ'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-ink-faint">Dự án</span>
              <span className="block truncate text-sm font-medium text-ink">{project?.name || 'Chọn dự án'}</span>
            </span>
            <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Đóng danh sách dự án"
                  tabIndex={-1}
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  role="listbox"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute left-3 right-3 top-full z-20 mt-1.5 origin-top rounded-lg border border-line bg-surface p-1 shadow-xl"
                >
                  <ul className="max-h-56 overflow-y-auto space-y-0.5">
                    {projects.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={p.id === project?.id}
                          onClick={() => {
                            selectProject(p.id);
                            setMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 hover:bg-subtle cursor-pointer ${
                            p.id === project?.id ? 'bg-subtle text-accent font-semibold' : 'text-ink'
                          }`}
                        >
                          <span className="w-9 shrink-0 font-mono text-[11px] font-semibold text-ink-faint">
                            {p.code}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{p.name}</span>
                          {p.id === project?.id && (
                            <CheckIcon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Nút Tạo Dự Án Mới */}
                  <div className="border-t border-line mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowCreateModal(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-accent transition-colors duration-150 hover:bg-accent-soft cursor-pointer"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Tạo dự án mới...
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <nav aria-label="Điều hướng chính" className="mt-6 flex-1 px-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      isActive ? 'bg-subtle text-ink font-semibold' : 'text-ink-muted hover:bg-subtle hover:text-ink'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/board' && (
                    <span className="text-xs tabular-nums text-ink-faint">{openCount}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar member={currentUser} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{currentUser.name}</p>
              <p className="truncate text-xs text-ink-faint">{currentUser.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="rounded-md p-1.5 text-ink-faint transition-colors duration-150 hover:bg-subtle hover:text-danger cursor-pointer"
            >
              <LogOutIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup Tạo Dự Án Mới */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-ink/30 backdrop-blur-xs"
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2 text-ink font-semibold text-base">
                  <FolderPlusIcon className="h-5 w-5 text-accent" />
                  Tạo Dự Án Mới
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md p-1 text-ink-faint hover:text-ink hover:bg-subtle"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {createError && (
                <div className="mt-3 rounded-lg bg-danger-soft p-2.5 text-xs text-danger">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Tên dự án *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cổng Thông Tin Sinh Viên VKU"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (!newCode) {
                        const words = e.target.value.trim().split(/\s+/);
                        const suggested = words.map((w) => w[0] || '').join('').toUpperCase().slice(0, 6);
                        setNewCode(suggested);
                      }
                    }}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Mã dự án (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="VD: SV, POS, AI-APP"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full font-mono uppercase rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="mt-1 text-[11px] text-ink-faint">Dùng làm tiền tố mã số task (VD: {newCode || 'PRJ'}-1, {newCode || 'PRJ'}-2)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Mô tả dự án
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mục tiêu và phạm vi của dự án..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-ink-muted hover:bg-subtle"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newTitle.trim() || !newCode.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo dự án'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
