import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { Chat } from './pages/Chat';
import { Assistant } from './pages/Assistant';
import { Login } from './pages/Login';

interface AppProps {
  theme?: 'light' | 'dark';
}

export function App({ theme = 'light' }: AppProps) {
  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full bg-canvas font-sans text-ink antialiased`}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <WorkspaceProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="board" element={<Board />} />
                <Route path="chat" element={<Chat />} />
                <Route path="assistant" element={<Assistant />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WorkspaceProvider>
        </BrowserRouter>
        <Toaster theme={theme} position="bottom-right" richColors={false} />
      </MotionConfig>
    </div>);

}