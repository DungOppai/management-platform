import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const isDev = window.location.port === '5173';
    const serverUrl = isDev ? 'http://localhost:5000' : window.location.origin;

    socket = io(serverUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io] Connected successfully with ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.io] Disconnected:', reason);
    });
  }
  return socket;
}

export function joinProjectRoom(projectId) {
  const s = getSocket();
  if (s && projectId) {
    if (s.connected) {
      s.emit('join_project', projectId);
      console.log(`📡 [Socket.io] Joined room: project_${projectId}`);
    } else {
      s.once('connect', () => {
        s.emit('join_project', projectId);
        console.log(`📡 [Socket.io] Joined room (on connect): project_${projectId}`);
      });
    }
  }
}

export function leaveProjectRoom(projectId) {
  const s = getSocket();
  if (s && projectId && s.connected) {
    s.emit('leave_project', projectId);
    console.log(`👋 [Socket.io] Left room: project_${projectId}`);
  }
}
