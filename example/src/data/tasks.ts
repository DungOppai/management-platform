import type { Task } from '../types/project';

export const tasks: Task[] = [
{
  id: 't1',
  projectId: 'p1',
  code: 'DLK-14',
  title: 'API xác thực OTP qua SMS',
  description: 'Gửi và xác minh mã OTP khi bệnh nhân đăng ký hoặc đăng nhập. Giới hạn 3 lần gửi mỗi 10 phút.',
  status: 'in_progress',
  priority: 'urgent',
  progress: 60,
  dueDate: '2026-11-04',
  assigneeId: 'm3',
  checklist: [
  { id: 'c1', title: 'Endpoint gửi OTP', done: true },
  { id: 'c2', title: 'Endpoint xác minh OTP', done: true },
  { id: 'c3', title: 'Cập nhật key nhà cung cấp SMS', done: false },
  { id: 'c4', title: 'Giới hạn tần suất gửi', done: false }]

},
{
  id: 't2',
  projectId: 'p1',
  code: 'DLK-13',
  title: 'Sửa lỗi hiển thị lịch trên Safari',
  description: 'Lịch tuần bị lệch cột trên Safari iOS 17 khi xoay ngang màn hình.',
  status: 'review',
  priority: 'urgent',
  progress: 80,
  dueDate: '2026-11-05',
  assigneeId: 'm5',
  checklist: [
  { id: 'c1', title: 'Tái hiện lỗi', done: true },
  { id: 'c2', title: 'Kiểm tra trên thiết bị thật', done: false }]

},
{
  id: 't3',
  projectId: 'p1',
  code: 'DLK-19',
  title: 'Tối ưu tốc độ tải trang chủ',
  description: 'Giảm thời gian tải lần đầu xuống dưới 2 giây trên mạng 4G.',
  status: 'in_progress',
  priority: 'medium',
  progress: 30,
  dueDate: '2026-11-06',
  assigneeId: 'm1',
  checklist: [
  { id: 'c1', title: 'Nén ảnh banner', done: true },
  { id: 'c2', title: 'Tách bundle theo trang', done: false }]

},
{
  id: 't4',
  projectId: 'p1',
  code: 'DLK-12',
  title: 'Thiết kế màn hình đặt lịch khám',
  description: 'Luồng chọn chuyên khoa, bác sĩ, khung giờ và xác nhận lịch hẹn.',
  status: 'review',
  priority: 'high',
  progress: 90,
  dueDate: '2026-11-07',
  assigneeId: 'm2',
  checklist: [
  { id: 'c1', title: 'Wireframe', done: true },
  { id: 'c2', title: 'Giao diện chi tiết', done: true },
  { id: 'c3', title: 'Prototype tương tác', done: true }]

},
{
  id: 't5',
  projectId: 'p1',
  code: 'DLK-15',
  title: 'Tích hợp cổng thanh toán VNPay',
  description: 'Thanh toán phí đặt lịch trước, hỗ trợ hoàn tiền khi huỷ trước 24 giờ.',
  status: 'in_progress',
  priority: 'high',
  progress: 40,
  dueDate: '2026-11-12',
  assigneeId: 'm4',
  checklist: [
  { id: 'c1', title: 'Tạo URL thanh toán', done: true },
  { id: 'c2', title: 'Xử lý IPN callback', done: false },
  { id: 'c3', title: 'Luồng hoàn tiền', done: false }]

},
{
  id: 't6',
  projectId: 'p1',
  code: 'DLK-16',
  title: 'Viết test cho module lịch hẹn',
  description: 'Unit test và integration test cho tạo, đổi và huỷ lịch hẹn.',
  status: 'todo',
  priority: 'medium',
  progress: 0,
  dueDate: '2026-11-14',
  assigneeId: 'm5',
  checklist: []
},
{
  id: 't7',
  projectId: 'p1',
  code: 'DLK-17',
  title: 'Thông báo nhắc lịch qua email',
  description: 'Gửi email nhắc trước 24 giờ và 2 giờ so với giờ hẹn.',
  status: 'todo',
  priority: 'medium',
  progress: 0,
  dueDate: '2026-11-18',
  assigneeId: 'm3',
  checklist: []
},
{
  id: 't8',
  projectId: 'p1',
  code: 'DLK-18',
  title: 'Trang quản lý bác sĩ cho admin',
  description: 'Thêm, sửa, tạm ẩn hồ sơ bác sĩ và lịch làm việc.',
  status: 'todo',
  priority: 'low',
  progress: 0,
  dueDate: '2026-11-25',
  assigneeId: 'm2',
  checklist: []
},
{
  id: 't9',
  projectId: 'p1',
  code: 'DLK-11',
  title: 'Thiết lập CI/CD với GitHub Actions',
  description: 'Tự động build, test và deploy lên staging khi merge vào nhánh main.',
  status: 'done',
  priority: 'medium',
  progress: 100,
  dueDate: '2026-11-02',
  assigneeId: 'm6',
  checklist: []
},
{
  id: 't10',
  projectId: 'p1',
  code: 'DLK-10',
  title: 'Thiết kế cơ sở dữ liệu',
  description: 'Lược đồ cho bệnh nhân, bác sĩ, lịch hẹn và thanh toán.',
  status: 'done',
  priority: 'high',
  progress: 100,
  dueDate: '2026-10-28',
  assigneeId: 'm4',
  checklist: []
},
{
  id: 't11',
  projectId: 'p1',
  code: 'DLK-09',
  title: 'Tổng hợp yêu cầu người dùng',
  description: 'Phỏng vấn 8 phòng khám và tổng hợp yêu cầu chức năng.',
  status: 'done',
  priority: 'medium',
  progress: 100,
  dueDate: '2026-10-25',
  assigneeId: 'm1',
  checklist: []
},
{
  id: 't12',
  projectId: 'p2',
  code: 'SV-4',
  title: 'Trang tra cứu điểm học kỳ',
  description: 'Hiển thị điểm theo học kỳ, có lọc theo năm học.',
  status: 'in_progress',
  priority: 'high',
  progress: 50,
  dueDate: '2026-11-10',
  assigneeId: 'm4',
  checklist: []
},
{
  id: 't13',
  projectId: 'p2',
  code: 'SV-5',
  title: 'Thiết kế trang đăng ký học phần',
  description: 'Luồng chọn lớp học phần và kiểm tra trùng lịch.',
  status: 'todo',
  priority: 'medium',
  progress: 0,
  dueDate: '2026-11-20',
  assigneeId: 'm2',
  checklist: []
},
{
  id: 't14',
  projectId: 'p2',
  code: 'SV-3',
  title: 'Đăng nhập bằng tài khoản trường',
  description: 'Tích hợp SSO của trường.',
  status: 'done',
  priority: 'high',
  progress: 100,
  dueDate: '2026-11-01',
  assigneeId: 'm1',
  checklist: []
},
{
  id: 't15',
  projectId: 'p3',
  code: 'KHO-7',
  title: 'Quét mã vạch khi nhập kho',
  description: 'Hỗ trợ máy quét và camera điện thoại.',
  status: 'in_progress',
  priority: 'high',
  progress: 35,
  dueDate: '2026-11-09',
  assigneeId: 'm3',
  checklist: []
},
{
  id: 't16',
  projectId: 'p3',
  code: 'KHO-8',
  title: 'Báo cáo tồn kho theo tuần',
  description: 'Xuất báo cáo Excel tồn kho theo từng kho.',
  status: 'todo',
  priority: 'medium',
  progress: 0,
  dueDate: '2026-11-03',
  assigneeId: 'm6',
  checklist: []
}];