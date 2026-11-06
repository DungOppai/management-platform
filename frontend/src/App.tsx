import React, { useState } from 'react';
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

function ProtectedLayout() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell />;
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full bg-canvas font-sans text-ink antialiased transition-colors duration-200`}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <WorkspaceProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="board" element={<Board />} />
                <Route path="chat" element={<Chat />} />
                <Route path="assistant" element={<Assistant />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WorkspaceProvider>
        </BrowserRouter>
        <Toaster theme={theme} position="bottom-right" richColors />
      </MotionConfig>
    </div>
  );
}

export default App;
