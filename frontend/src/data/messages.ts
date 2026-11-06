import type { ChatMessage } from '../types/project';

export const messages: ChatMessage[] = [
  {
    id: 'msg1',
    authorId: 'm2',
    text: 'Khang ơi, mình đã xong phần Socket.io server rồi, bây giờ test 2 tab thấy tin nhắn realtime ngon lắm!',
    time: '09:05',
  },
  {
    id: 'msg2',
    authorId: 'm1',
    text: 'Ngon! Mình đang làm phần Kanban Board, kéo thả dnd-kit mượt rồi, đang kết nối với API backend.',
    time: '09:12',
  },
  {
    id: 'msg3',
    authorId: 'm2',
    text: 'Gemini API mình đã tích hợp xong, test Chat-to-Task ra kết quả khá chuẩn. Fallback Smart Local Engine cũng hoạt động không cần key.',
    time: '09:20',
  },
  {
    id: 'msg4',
    authorId: 'm1',
    text: 'Tốt, nhớ commit lên nhánh feature/ai-chat-to-task nhé. Mình sẽ review sau khi xong Board.',
    time: '09:25',
  },
  {
    id: 'msg5',
    authorId: 'm2',
    text: 'Khang cần hoàn thiện Docker Compose trước buổi demo thứ Sáu, bao gồm health check cho cả 3 service.',
    time: '09:40',
    suggestion: {
      title: 'Thêm health check Docker Compose cho 3 service',
      assigneeId: 'm2',
      dueDate: '2026-11-08',
      priority: 'high',
    },
  },
  {
    id: 'msg6',
    authorId: 'm1',
    text: 'Dũng viết tài liệu API (Swagger) cho các endpoint auth, project, task trước thứ Tư nhé.',
    time: '09:50',
    suggestion: {
      title: 'Viết tài liệu Swagger API endpoint',
      assigneeId: 'm1',
      dueDate: '2026-11-12',
      priority: 'medium',
    },
  },
  {
    id: 'msg7',
    authorId: 'm2',
    text: 'PostgreSQL seed data chạy ổn rồi, 2 tài khoản demo (Dũng + Khang) đã có sẵn với password123.',
    time: '10:10',
  },
];