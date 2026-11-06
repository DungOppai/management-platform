import type { AssistantAction, AssistantActionId, AssistantReport } from '../types/project';

export const assistantActions: AssistantAction[] = [
  {
    id: 'standup',
    title: 'Báo cáo standup',
    description: 'Hôm qua, hôm nay và vướng mắc của từng thành viên.',
  },
  {
    id: 'bottlenecks',
    title: 'Phát hiện điểm nghẽn',
    description: 'Công việc trễ hạn, bị dồn hoặc đứng yên quá lâu.',
  },
  {
    id: 'catchup',
    title: 'Tóm tắt thảo luận',
    description: 'Đọc nhanh những gì nhóm đã bàn hôm nay.',
  },
];


export const assistantReports: Record<AssistantActionId, AssistantReport> = {
  standup: {
    title: 'Báo cáo standup ngày 06/11',
    summary:
      'Phần realtime chat và JWT đang đúng tiến độ. Module AI Chat-to-Task và Kanban Board vẫn đang trong giai đoạn hoàn thiện, cần chú ý hạn chót 10–12/11.',
    basis: 'Dựa trên 13 công việc VKU-DATN và 7 tin nhắn chat',
    sections: [
      {
        heading: 'Hoàng Công Trí Dũng · Trưởng nhóm',
        items: [
          { label: 'Hôm qua', text: 'Hoàn thiện JWT middleware, kết nối Kanban Board với API backend.' },
          { label: 'Hôm nay', text: 'Tiếp tục VKU-01 (Kanban Board): Quick-add task + đồng bộ trạng thái.' },
          { label: 'Vướng mắc', text: 'VKU-01 còn 2 checklist chưa xong, hạn 10/11 đang gần.', tone: 'warning' as const },
        ],
      },
      {
        heading: 'Đặng Trường Khang · Lập trình viên',
        items: [
          { label: 'Hôm qua', text: 'Tích hợp Gemini API hoàn tất, test Chat-to-Task ra kết quả tốt.' },
          { label: 'Hôm nay', text: 'VKU-04: Hoàn thiện hiển thị avatar + thời gian trong Chat. VKU-02: Xác nhận tạo task từ gợi ý.' },
          { label: 'Vướng mắc', text: 'Docker Compose health check chưa xong, cần hoàn thiện trước demo thứ Sáu.', tone: 'danger' as const },
        ],
      },
    ],
  },
  bottlenecks: {
    title: 'Điểm nghẽn hiện tại',
    summary: 'Phát hiện 2 điểm nghẽn, trong đó Docker health check có thể ảnh hưởng đến buổi demo ngày 08/11.',
    basis: 'Dựa trên hạn chót, trạng thái và lịch sử cập nhật của 13 task',
    sections: [
      {
        heading: 'Nghiêm trọng',
        items: [
          {
            text: 'VKU-06 · Docker Compose health check đang ở trạng thái review và chưa hoàn thành, hạn 07/11, demo 08/11 sẽ bị ảnh hưởng.',
            tone: 'danger' as const,
          },
        ],
      },
      {
        heading: 'Cần theo dõi',
        items: [
          { text: 'VKU-01 · Kanban Board còn 2/5 checklist, hạn 10/11, Dũng đang gánh thêm VKU-03 (AI module).', tone: 'warning' as const },
          { text: 'VKU-02 · Chat-to-Task còn bước xác nhận tạo task, hạn 12/11.', tone: 'warning' as const },
        ],
      },
      {
        heading: 'Gợi ý',
        items: [
          { text: 'Ưu tiên hoàn thiện VKU-06 health check hôm nay để đảm bảo demo ổn định.', tone: 'success' as const },
          { text: 'Khang chuyển VKU-04 (Chat UI) sang done trước 08/11 để giải phóng slot cho VKU-02.', tone: 'success' as const },
        ],
      },
    ],
  },
  catchup: {
    title: 'Tóm tắt thảo luận sáng nay',
    summary: 'Nhóm tập trung vào tiến độ Socket.io realtime, Kanban Board, AI Chat-to-Task và chuẩn bị demo Docker.',
    basis: 'Dựa trên 7 tin nhắn từ 09:05 đến 10:10',
    sections: [
      {
        heading: 'Đã thống nhất',
        items: [
          { text: 'Socket.io realtime chat hoạt động ổn định trên 2 tab với 2 tài khoản khác nhau.' },
          { text: 'Gemini API + Smart Local Engine đã sẵn sàng, không cần key vẫn chạy được.' },
          { text: 'PostgreSQL seed data 2 tài khoản demo (Dũng + Khang) đã sẵn sàng.' },
        ],
      },
      {
        heading: 'Việc mới được nhắc đến',
        items: [
          { text: 'Thêm health check Docker Compose cho 3 service, hạn thứ Sáu 08/11.', tone: 'warning' as const },
          { text: 'Viết tài liệu Swagger API endpoint, hạn thứ Tư 12/11.', tone: 'warning' as const },
        ],
      },
      {
        heading: 'Thông tin đáng chú ý',
        items: [
          { text: 'Demo buổi bảo vệ sơ bộ dự kiến thứ Sáu 08/11, cần Docker Compose chạy ngon.', tone: 'success' as const },
        ],
      },
    ],
  },
};