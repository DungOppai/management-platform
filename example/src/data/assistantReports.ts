import type { AssistantAction, AssistantActionId, AssistantReport } from '../types/project';

export const assistantActions: AssistantAction[] = [
{
  id: 'standup',
  title: 'Báo cáo standup',
  description: 'Hôm qua, hôm nay và vướng mắc của từng thành viên.'
},
{
  id: 'bottlenecks',
  title: 'Phát hiện điểm nghẽn',
  description: 'Công việc trễ hạn, bị dồn hoặc đứng yên quá lâu.'
},
{
  id: 'catchup',
  title: 'Tóm tắt thảo luận',
  description: 'Đọc nhanh những gì nhóm đã bàn hôm nay.'
}];


export const assistantReports: Record<AssistantActionId, AssistantReport> = {
  standup: {
    title: 'Báo cáo standup ngày 06/11',
    summary:
    'Phần giao diện đang đúng tiến độ. Luồng xác thực OTP trễ 2 ngày và đang kéo theo phần tích hợp thanh toán.',
    basis: 'Dựa trên 11 công việc và 7 tin nhắn',
    sections: [
    {
      heading: 'Lê Quang Huy · Backend',
      items: [
      { label: 'Hôm qua', text: 'Hoàn thiện endpoint gửi và xác minh OTP.' },
      { label: 'Hôm nay', text: 'Cập nhật key mới của nhà cung cấp SMS, kiểm thử luồng xác minh.' },
      { label: 'Vướng mắc', text: 'Nhà cung cấp SMS đổi cấu hình, DLK-14 đang trễ 2 ngày.', tone: 'danger' }]

    },
    {
      heading: 'Trần Thu Hà · UI/UX Designer',
      items: [
      { label: 'Hôm qua', text: 'Hoàn tất prototype màn hình đặt lịch khám (DLK-12).' },
      { label: 'Hôm nay', text: 'Chờ review, bắt đầu phác thảo trang quản lý bác sĩ.' }]

    },
    {
      heading: 'Võ Ngọc Lan · Kiểm thử',
      items: [
      { label: 'Hôm qua', text: 'Tái hiện lỗi lệch lịch trên Safari iOS 17.' },
      { label: 'Hôm nay', text: 'Kiểm tra bản sửa DLK-13, chuẩn bị test case cho lịch hẹn.' },
      { label: 'Vướng mắc', text: 'Cần thiết bị iOS thật để xác nhận lỗi.', tone: 'warning' }]

    }]

  },
  bottlenecks: {
    title: 'Điểm nghẽn hiện tại',
    summary: 'Phát hiện 3 điểm nghẽn, trong đó 1 điểm có thể ảnh hưởng đến mốc phát hành 15/12.',
    basis: 'Dựa trên hạn chót, trạng thái và lịch sử cập nhật',
    sections: [
    {
      heading: 'Nghiêm trọng',
      items: [
      {
        text: 'DLK-14 · API xác thực OTP trễ 2 ngày. DLK-15 (VNPay) phụ thuộc vào luồng đăng nhập này.',
        tone: 'danger'
      }]

    },
    {
      heading: 'Cần theo dõi',
      items: [
      { text: 'DLK-13 · Lỗi Safari đã ở trạng thái review và quá hạn 1 ngày.', tone: 'warning' },
      { text: 'Lê Quang Huy đang giữ 2 việc mở, cả hai đều có hạn trong 2 tuần tới.', tone: 'warning' }]

    },
    {
      heading: 'Gợi ý',
      items: [
      { text: 'Chuyển DLK-17 (email nhắc lịch) sang Phạm Đức Long để giảm tải cho Huy.', tone: 'success' },
      { text: 'Review DLK-12 trong hôm nay để mở khoá trang quản lý bác sĩ.', tone: 'success' }]

    }]

  },
  catchup: {
    title: 'Tóm tắt thảo luận sáng nay',
    summary: 'Nhóm tập trung vào tiến độ OTP, lỗi Safari và tài liệu tích hợp VNPay cho team mobile.',
    basis: 'Dựa trên 7 tin nhắn từ 09:02 đến 10:05',
    sections: [
    {
      heading: 'Đã thống nhất',
      items: [
      { text: 'Huy hoàn thành API OTP trong chiều nay sau khi có key SMS mới.' },
      { text: 'Thiết kế màn hình đặt lịch đã sẵn sàng để review trên Figma.' }]

    },
    {
      heading: 'Việc mới được nhắc đến',
      items: [
      { text: 'Viết tài liệu tích hợp VNPay cho team mobile, hạn thứ Hai.', tone: 'warning' },
      { text: 'Kiểm thử luồng huỷ lịch hẹn trên staging, hạn thứ Tư.', tone: 'warning' }]

    },
    {
      heading: 'Thông tin đáng chú ý',
      items: [{ text: 'Pipeline staging đã ổn định, mỗi lần build khoảng 4 phút.', tone: 'success' }]
    }]

  }
};