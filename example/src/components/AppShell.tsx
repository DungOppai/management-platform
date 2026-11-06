import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, XIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BrandMark } from './BrandMark';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen w-full bg-canvas text-ink">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface lg:flex">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {mobileOpen &&
        <>
            <motion.div
            className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)} />
          
            <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-72 border-r border-line bg-surface lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
            
              <Sidebar />
              <button
              type="button"
              aria-label="Đóng menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-ink-muted hover:bg-subtle">
              
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.aside>
          </>
        }
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-ink-muted hover:bg-subtle">
            
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <BrandMark />
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>);

}