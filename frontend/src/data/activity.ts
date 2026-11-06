import type { Activity } from '../types/project';

export const activity: Activity[] = [
  { id: 'a1', actorId: 'm2', text: 'xác nhận seed data PostgreSQL và 2 tài khoản demo sẵn sàng', time: '10:10' },
  { id: 'a2', actorId: 'm1', text: 'gợi ý tạo task "Viết tài liệu Swagger API endpoint"', time: '09:50' },
  { id: 'a3', actorId: 'm2', text: 'gợi ý tạo task "Thêm health check Docker Compose cho 3 service"', time: '09:40' },
  { id: 'a4', actorId: 'm2', text: 'hoàn thành tích hợp Gemini API và Smart Local Engine cho Chat-to-Task', time: '09:20' },
  { id: 'a5', actorId: 'm1', text: 'kết nối Kanban Board với API backend qua WorkspaceContext', time: 'Hôm qua' },
  { id: 'a6', actorId: 'm2', text: 'triển khai Socket.io server hỗ trợ room chat realtime', time: 'Hôm qua' },
  { id: 'a7', actorId: 'm1', text: 'hoàn thành thiết kế cơ sở dữ liệu PostgreSQL (VKU-11)', time: '28/10' },
];