import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinProjectRoom(projectId) {
  const s = getSocket();
  if (s && projectId) {
    s.emit('join_project', projectId);
  }
}

export function leaveProjectRoom(projectId) {
  const s = getSocket();
  if (s && projectId) {
    s.emit('leave_project', projectId);
  }
}
