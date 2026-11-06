import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ChevronsUpDownIcon, KanbanIcon, LayoutDashboardIcon, LogOutIcon, MessagesSquareIcon, SparklesIcon, BoxIcon } from "lucide-react";
import { Avatar } from "./Avatar";
import { BrandMark } from "./BrandMark";
import { useWorkspace } from "../contexts/WorkspaceContext";
const navItems: {
  to: string;
  label: string;
  icon: BoxIcon;
  end?: boolean;
}[] = [{
  to: '/',
  label: 'Tổng quan',
  icon: LayoutDashboardIcon,
  end: true
}, {
  to: '/board',
  label: 'Bảng công việc',
  icon: KanbanIcon
}, {
  to: '/chat',
  label: 'Thảo luận',
  icon: MessagesSquareIcon
}, {
  to: '/assistant',
  label: 'Trợ lý AI',
  icon: SparklesIcon
}];
export function Sidebar() {
  const {
    projects,
    project,
    selectProject,
    tasks,
    currentUser
  } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const openCount = tasks.filter((t) => t.status !== 'done').length;
  return <div className="flex h-full w-full flex-col">
      <div className="flex h-16 items-center px-5">
        <BrandMark />
      </div>

      <div className="relative px-3">
        <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-haspopup="listbox" className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors duration-150 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-[11px] font-semibold text-accent">
            {project.code}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-ink-faint">Dự án</span>
            <span className="block truncate text-sm font-medium text-ink">{project.name}</span>
          </span>
          <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {menuOpen && <>
              <button type="button" aria-label="Đóng danh sách dự án" tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
              <motion.ul role="listbox" initial={{
            opacity: 0,
            y: -4,
            scale: 0.98
          }} animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} exit={{
            opacity: 0,
            y: -4,
            scale: 0.98
          }} transition={{
            duration: 0.15,
            ease: [0.23, 1, 0.32, 1]
          }} className="absolute left-3 right-3 top-full z-20 mt-1.5 origin-top rounded-lg border border-line bg-surface p-1 shadow-lg">
                {projects.map((p) => <li key={p.id}>
                    <button type="button" role="option" aria-selected={p.id === project.id} onClick={() => {
                selectProject(p.id);
                setMenuOpen(false);
              }} className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-ink transition-colors duration-150 hover:bg-subtle">
                      <span className="w-8 shrink-0 text-[11px] font-semibold text-ink-faint">{p.code}</span>
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      {p.id === project.id && <CheckIcon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />}
                    </button>
                  </li>)}
              </motion.ul>
            </>}
        </AnimatePresence>
      </div>

      <nav aria-label="Điều hướng chính" className="mt-6 flex-1 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({
            isActive
          }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${isActive ? 'bg-subtle text-ink' : 'text-ink-muted hover:bg-subtle hover:text-ink'}`}>
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.to === '/board' && <span className="text-xs tabular-nums text-ink-faint">{openCount}</span>}
              </NavLink>
            </li>)}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar member={currentUser} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{currentUser.name}</p>
            <p className="truncate text-xs text-ink-faint">{currentUser.role}</p>
          </div>
          <Link to="/login" aria-label="Đăng xuất" title="Đăng xuất" className="rounded-md p-1.5 text-ink-faint transition-colors duration-150 hover:bg-subtle hover:text-danger">
            <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>;
}