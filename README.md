# 🚀 Nền Tảng Quản Lý Dự Án Tích Hợp Trợ Lý AI & Docker Compose

> **Đồ án Tốt nghiệp Đại học – Khoa Khoa học Máy tính**  
> **Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**  
> **Sinh viên:** Hoàng Công Trí Dũng (22IT048) & Đặng Trường Khang (22IT136) – Lớp 22GIT  
> **Giảng viên hướng dẫn:** ThS. Dương Thị Mai Nga  

---

## 📌 1. Giới thiệu & Định hướng Kiến trúc

Theo yêu cầu thực tế của đề tài và để tối ưu chi phí, trong giai đoạn phát triển ban đầu hệ thống **không phụ thuộc trực tiếp vào các dịch vụ có phí của AWS (AWS EC2, AWS Bedrock, IAM)** mà được đóng gói chuẩn hóa bằng **Docker & Docker Compose**. 

### 💡 Ưu điểm của giải pháp này:
- **Tự vận hành (Self-hosted) & 0 đồng chi phí đám mây:** Toàn bộ Frontend, Backend, Cơ sở dữ liệu PostgreSQL chạy khép kín trong container Docker trên máy cá nhân hoặc máy chủ nội bộ.
- **Kiến trúc AI Hybrid thông minh:** Module AI được thiết kế theo dạng Adapter (Provider-Agnostic). Hệ thống tích hợp sẵn **Smart Local AI Engine** (chạy độc lập, không tốn API key hay token) và hỗ trợ kết nối linh hoạt với **Google Gemini API / OpenAI API**. Khi đến thời điểm nghiệm thu đồ án trên AWS, chỉ cần cắm adapter Amazon Bedrock Claude mà không phải thay đổi kiến trúc cốt lõi.

---

## 🌟 2. Bốn Tính Năng Cải Tiến Cốt Lõi (Từ Báo cáo Phân tích Thị trường)

1. **⚡ Chuyển đổi trực tiếp từ "Trò chuyện" sang "Hành động" (1-Click Chat-to-Task):**
   - Tích hợp phòng chat thời gian thực qua **Socket.io**.
   - Di chuột vào bất kỳ tin nhắn trao đổi nào trong nhóm, bấm **"Tạo Task"** -> AI tự động phân tích ngữ cảnh tin nhắn, bóc tách tên công việc, người phụ trách, hạn chót và mức độ ưu tiên để tạo thẻ trên Kanban ngay lập tức.
2. **🤖 Trợ lý AI chủ động đánh giá tiến độ (Proactive AI Evaluator):**
   - **AI Standup & Báo cáo tuần:** 1 nút bấm để AI tổng hợp toàn bộ tình trạng task của dự án thành báo cáo 3 phần: Việc đã hoàn thành, Điểm nghẽn rủi ro, và Đề xuất hành động tiếp theo.
   - **Phát hiện Điểm nghẽn & Quá tải (Bottleneck Detector):** AI chủ động nhận diện thành viên đang bị gán quá nhiều việc gấp hoặc các task có nguy cơ trễ hạn để đưa ra khuyến nghị phân bổ lại nguồn lực.
   - **Tóm tắt Thảo luận Bị nhỡ (Chat Catch-up):** Thành viên vào sau chỉ cần bấm nút để AI tóm tắt 30-50 tin nhắn thành 3-5 gạch đầu dòng cốt lõi.
3. **📊 Đánh giá Tiến độ Đa chiều (Multi-dimensional Progress Tracking):**
   - Kết hợp giữa 4 cột Kanban (`To Do` -> `In Progress` -> `Review` -> `Done`), thanh trượt % hoàn thành (0% - 100%) và danh sách đầu việc con (Checklists/Subtasks).
   - Dashboard đo lường hiệu suất minh bạch: Tỷ lệ đúng hạn (On-time rate), phân bổ công việc theo mức độ ưu tiên và theo từng thành viên.
4. **📦 Gọn nhẹ & Sẵn sàng Triển khai (Dockerized Architecture):**
   - Giao diện lấy cảm hứng từ tốc độ của **Linear** và sự trực quan của **Trello**.
   - Đóng gói trọn vẹn 3 tầng (Database, Backend API, Web Client) qua Docker Compose.

---

## 🛠️ 3. Hướng dẫn Khởi chạy Hệ thống

### Cách 1: Chạy toàn bộ bằng Docker (Khuyên dùng - 1 lệnh duy nhất)

Yêu cầu máy đã cài Docker Desktop. Chạy lệnh sau tại thư mục gốc của dự án:

```powershell
docker compose up --build -d
```

Sau khi các container khởi động:
- **Ứng dụng Web (Frontend):** Truy cập [http://localhost:3000](http://localhost:3000)
- **Backend API & Healthcheck:** [http://localhost:5000/health](http://localhost:5000/health)
- **PostgreSQL Database:** Port `5432` (User: `postgres`, Pass: `postgrespassword123`, DB: `pm_ai_db`)

Để dừng hệ thống:
```powershell
docker compose down
```

---

### Cách 2: Chạy trực tiếp trên máy (Local Development)

Nếu bạn muốn chạy trực tiếp bằng Node.js mà không cần bật Docker:

#### 1. Khởi động Backend:
```powershell
cd backend
npm install
npm run dev
```
*(Backend chạy tại `http://localhost:5000`)*

#### 2. Khởi động Frontend:
Mở thêm một terminal mới:
```powershell
cd frontend
npm install
npm run dev
```
*(Frontend chạy tại `http://localhost:5173`)*

---

## 🔑 4. Tài khoản Đăng nhập Mẫu (1-Click Demo Login)

Ứng dụng có sẵn tính năng **Đăng nhập nhanh 1-Click** ngay trên màn hình đăng nhập để hội đồng đánh giá và giảng viên kiểm thử dễ dàng:

| Họ và tên | Mã sinh viên | Email | Mật khẩu mặc định | Vai trò |
| :--- | :--- | :--- | :--- | :--- |
| **Hoàng Công Trí Dũng** | 22IT048 | `dung.hoang@vku.udn.vn` | `password123` | **Project Leader** |
| **Đặng Trường Khang** | 22IT136 | `khang.dang@vku.udn.vn` | `password123` | **Full-stack Developer** |

---

## ⚙️ 5. Cấu hình AI Tùy chọn (Optional API Key)

Hệ thống **mặc định sử dụng Built-in Smart Local AI Engine** nên ứng dụng **chạy 100% mượt mà, đầy đủ tính năng phân tích mà KHÔNG cần nhập API key hay tốn bất kỳ chi phí nào**.

Nếu bạn muốn kết nối với các mô hình ngôn ngữ đám mây, hãy mở file `backend/.env` (hoặc cấu hình trong `docker-compose.yml`) và thêm key:

```env
# Tùy chọn: Google Gemini API (miễn phí)
GEMINI_API_KEY=AIzaSy...

# Hoặc OpenAI API
OPENAI_API_KEY=sk-...
```

---

## 📁 6. Cấu trúc Dự án

```
d:\uni\datn\
├── backend/                  # REST API Node.js, Express, Socket.io, PostgreSQL
│   ├── src/
│   │   ├── config/           # Cấu hình kết nối DB & Seed dữ liệu ban đầu
│   │   ├── controllers/      # Bộ điều khiển Auth, Task, Project, Chat, AI, Dashboard
│   │   ├── middleware/       # Xác thực JWT & phân quyền
│   │   ├── routes/           # Định tuyến các API endpoints
│   │   ├── services/         # Module AI Service & Socket.io Service
│   │   └── server.js         # Entrypoint server HTTP & WebSocket
│   ├── Dockerfile            # Container build cho Backend
│   └── package.json
├── frontend/                 # Client ReactJS (Vite, Tailwind CSS, Lucide Icons)
│   ├── src/
│   │   ├── components/       # KanbanBoard, ProjectChat, AICommandCenter, DashboardView, TaskModal...
│   │   ├── context/          # Quản lý Auth State & Token
│   │   ├── services/         # Axios API Client & Socket.io Client
│   │   ├── App.jsx           # Component chính kết hợp các tab giao diện
│   │   └── main.jsx
│   ├── Dockerfile            # Multi-stage build Nginx Alpine cho Frontend
│   ├── nginx.conf            # Reverse Proxy cấu hình điều hướng /api và /socket.io
│   └── package.json
├── docker-compose.yml        # Orchestration quản lý 3 services (DB, Backend, Frontend)
├── BAO_CAO_DO_AN.md          # Thuyết minh đồ án 6 chương bám sát đề cương VKU
└── README.md                 # Tài liệu hướng dẫn sử dụng
```

