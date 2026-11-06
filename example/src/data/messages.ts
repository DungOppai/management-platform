import type { ChatMessage } from '../types/project';

export const messages: ChatMessage[] = [
{
  id: 'msg1',
  authorId: 'm2',
  text: 'Mình đã up bản thiết kế màn hình đặt lịch lên Figma, mọi người review giúp nhé.',
  time: '09:02'
},
{
  id: 'msg2',
  authorId: 'm5',
  text: 'Lỗi hiển thị lịch trên Safari vẫn còn ở iOS 17, mình đang kiểm tra lại trên máy thật.',
  time: '09:15'
},
{
  id: 'msg3',
  authorId: 'm1',
  text: 'Huy ơi, API OTP đang trễ hạn 2 ngày rồi, có vướng gì không?',
  time: '09:20'
},
{
  id: 'msg4',
  authorId: 'm3',
  text: 'Nhà cung cấp SMS vừa đổi cấu hình nên mình cần key mới. Chắc chiều nay xong.',
  time: '09:24'
},
{
  id: 'msg5',
  authorId: 'm4',
  text: 'Cần ai đó viết tài liệu hướng dẫn tích hợp VNPay cho team mobile trước thứ Hai nhé.',
  time: '09:40',
  suggestion: {
    title: 'Viết tài liệu tích hợp VNPay cho team mobile',
    assigneeId: 'm4',
    dueDate: '2026-11-09',
    priority: 'medium'
  }
},
{
  id: 'msg6',
  authorId: 'm1',
  text: 'Lan kiểm tra lại luồng huỷ lịch hẹn trên staging giúp mình, hạn thứ Tư nhé.',
  time: '09:45',
  suggestion: {
    title: 'Kiểm thử luồng huỷ lịch hẹn trên staging',
    assigneeId: 'm5',
    dueDate: '2026-11-11',
    priority: 'high'
  }
},
{
  id: 'msg7',
  authorId: 'm6',
  text: 'Pipeline deploy staging đã ổn định, mỗi lần build mất khoảng 4 phút.',
  time: '10:05'
}];