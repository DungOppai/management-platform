# BÁO CÁO THUYẾT MINH ĐỒ ÁN TỐT NGHIỆP

**Đề tài:** XÂY DỰNG NỀN TẢNG QUẢN LÝ DỰ ÁN TÍCH HỢP TRỢ LÝ AI VÀ ĐÓNG GÓI DOCKER COMPOSE  
**Tiếng Anh:** Building an AI-Integrated Project Management Platform with Docker  
**Cơ sở đào tạo:** Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU) – Khoa Khoa học Máy tính  
**Sinh viên thực hiện:**
- Hoàng Công Trí Dũng (MSV: 22IT048 - Lớp 22GIT)
- Đặng Trường Khang (MSV: 22IT136 - Lớp 22GIT)  
**Giảng viên hướng dẫn:** ThS. Dương Thị Mai Nga  

---

## LỜI MỞ ĐẦU & CHIẾN LƯỢC TRIỂN KHAI

Trong giai đoạn đầu phát triển ứng dụng, để tránh phụ thuộc vào hạ tầng đám mây tốn phí và phức tạp của AWS (như AWS EC2, AWS Bedrock, IAM, VPC), nhóm sinh viên đã lựa chọn **giải pháp Containerization toàn diện bằng Docker và Docker Compose**. Giải pháp này cho phép hệ thống:
1. Độc lập hạ tầng, chạy mượt mà trên môi trường máy chủ nội bộ hoặc máy trạm cá nhân.
2. Thiết kế module AI theo kiến trúc **Provider-Agnostic** (hỗ trợ Google Gemini API, OpenAI API và có sẵn Local Smart Engine chạy độc lập không tốn chi phí), đồng thời cấu trúc sẵn sàng tích hợp Amazon Bedrock Claude khi bước vào giai đoạn nghiệm thu trên AWS.
3. Đồng bộ dữ liệu và quy trình nghiệp vụ với cơ sở dữ liệu PostgreSQL 16 trong container riêng biệt.

---

## CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI

### 1.1. Tính cấp thiết của đề tài (Customer Pain Points)
Qua khảo sát thực tế tại các nhóm làm việc đại học và các nhóm phần mềm nhỏ:
1. **Chi phí chuyển đổi ngữ cảnh (Context Switching Tax):** Nhóm làm việc phải mở đồng thời 3-5 công cụ: Zalo/Slack (chat), Trello/Jira (quản lý task), Excel (báo cáo tiến độ). Khi đang làm việc, việc phải chuyển qua lại giữa các tab làm giảm hiệu suất nghiêm trọng.
2. **Hội chứng "Trôi tin nhắn" (Lost in Chat):** Các quyết định quan trọng (sửa API, đổi UI, fix bug) thảo luận trong nhóm chat nhưng thành viên ngại mở lại Jira/Trello để tạo task. Sau 1-2 ngày tin nhắn trôi đi dẫn đến chậm deadline.
3. **Gánh nặng tổng hợp báo cáo thủ công (Manual Reporting Bottleneck):** Trưởng nhóm phải thủ công hỏi từng thành viên rồi nhập vào bảng báo cáo; việc nhận diện ai đang quá tải công việc phần lớn dựa trên cảm tính.
4. **Sự quá tải tính năng (Feature Bloat):** Các công cụ như Jira, ClickUp quá cồng kềnh với nhóm vừa và nhỏ.

### 1.2. Mục tiêu đề tài
- Xây dựng nền tảng Web hợp nhất quản lý công việc và giao tiếp thời gian thực.
- Tích hợp Trợ lý AI chủ động (Proactive AI Evaluator): tự động bóc tách task từ tin nhắn (1-Click Chat-to-Task), cảnh báo trễ deadline, phát hiện nút thắt cổ chai và tổng hợp báo cáo standup tự động.
- Đóng gói toàn bộ hệ thống bằng Docker Compose chuẩn DevOps.

### 1.3. Đối tượng và phạm vi nghiên cứu
- **Đối tượng:** Sinh viên CNTT, nhóm làm đồ án, nhóm nghiên cứu, startup và các nhóm lập trình viên từ 3 đến 25 thành viên.
- **Phạm vi:** Ứng dụng Web hoàn chỉnh gồm Frontend ReactJS, Backend REST API Node.js/Express, Real-time WebSocket (Socket.io), Database PostgreSQL và Module Trí tuệ nhân tạo.

---

## CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

### 2.1. Phương pháp luận quản trị Agile & Kanban
- Mô hình bảng trực quan Kanban với 4 cột trạng thái: `To Do` -> `In Progress` -> `Review` -> `Done`.
- Cơ chế đánh giá đa chiều: Kết hợp trạng thái cột, thanh trượt phần trăm hoàn thành (0% - 100%) và danh sách đầu việc con (Checklists/Subtasks).

### 2.2. Công nghệ Real-time với WebSockets (Socket.io)
- Cho phép truyền tải tin nhắn trò chuyện và sự kiện cập nhật trạng thái thẻ công việc tức thì đến tất cả thành viên trong nhóm mà không cần reload trang.

### 2.3. Trí tuệ nhân tạo & Mô hình ngôn ngữ lớn (LLM)
- **Kỹ thuật Context-filtered Prompting:** Backend chỉ lọc các trường dữ liệu cốt lõi (JSON tinh gọn) của dự án để gửi tới mô hình AI, giúp tiết kiệm 70-80% lượng token tiêu thụ và bảo vệ quyền riêng tư dữ liệu.
- **Cơ chế Hybrid AI Engine:** Kết hợp giữa Cloud LLM (Gemini/Claude) khi có kết nối Internet và Local Rule-based NLP Engine đảm bảo tính sẵn sàng 100% ngay cả khi offline.

### 2.4. Công nghệ Đóng gói Container (Docker & Docker Compose)
- Đóng gói Backend, Frontend và Database PostgreSQL vào các container cô lập, loại bỏ lỗi "chạy được trên máy tôi nhưng không chạy được trên máy khác".

---

## CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Phân tích đối thủ cạnh tranh (Competitor Analysis)
- **Trello:** Trực quan nhưng thiếu khung chat tích hợp và thiếu AI đánh giá rủi ro.
- **Jira:** Rất mạnh nhưng cấu hình phức tạp, không có chat nội bộ và chi phí cao.
- **Slack / Zalo:** Giao tiếp nhanh nhưng không quản lý được trạng thái công việc và dễ trôi tin nhắn.
- **Giải pháp của đề tài:** Hợp nhất Khung chat + Thẻ Kanban + AI chủ động trên một màn hình duy nhất.

### 3.2. Bốn tính năng cải tiến cốt lõi (Core Innovations)
1. **Chat-to-Task 1-Click:** Di chuột vào bất kỳ tin nhắn nào trong phòng chat, bấm "Tạo Task" -> AI tự động bóc tách tên việc, người phụ trách, mức độ ưu tiên và hạn chót.
2. **AI Standup & Báo cáo Tiến độ:** 1 nút bấm để AI phân tích toàn bộ dự án thành 3 mục: Việc đã hoàn thành, Điểm nghẽn rủi ro, và Đề xuất hành động tiếp theo.
3. **Nhận diện Điểm nghẽn & Quá tải (Bottleneck Detector):** Tự động phát hiện thành viên đang ôm quá nhiều việc gấp hoặc các task có nguy cơ trễ hạn.
4. **Tóm tắt Thảo luận Bị nhỡ (Chat Catch-up):** Thành viên vào sau chỉ cần bấm nút để AI tóm tắt 30-50 tin nhắn thành 3-5 ý chính.

### 3.3. Thiết kế Cơ sở Dữ liệu Quan hệ (PostgreSQL Schema)
- `users`: Quản lý tài khoản, mã hóa mật khẩu bcrypt, phân quyền (`LEADER`, `DEVELOPER`, `MEMBER`).
- `projects`: Mã dự án (Code), Tên, Mô tả, Người sở hữu.
- `project_members`: Bảng liên kết nhiều-nhiều giữa User và Project kèm vai trò.
- `tasks`: Thẻ công việc (tiêu đề, trạng thái, mức độ ưu tiên, deadline, progress %, assignee).
- `task_checklists`: Danh sách đầu việc con trong từng task.
- `chat_messages`: Lưu trữ lịch sử tin nhắn phòng chat và metadata.
- `ai_reports`: Lưu vết các báo cáo đánh giá tiến độ do AI sinh ra.

---

## CHƯƠNG 4: HIỆN THỰC VÀ ĐÓNG GÓI HỆ THỐNG

### 4.1. Cấu trúc Thư mục Dự án
```
d:\uni\datn\
├── backend/
│   ├── src/
│   │   ├── config/ (db.js kết nối PostgreSQL & auto-seed)
│   │   ├── controllers/ (auth, project, task, chat, ai, dashboard)
│   │   ├── middleware/ (auth.js bảo mật JWT)
│   │   ├── routes/ (REST API endpoints)
│   │   ├── services/ (ai.service.js, socket.service.js)
│   │   └── server.js (khởi tạo Express & Socket.io)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (KanbanBoard, ProjectChat, AICommandCenter, DashboardView, TaskModal, AuthModal)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── services/ (api.js, socket.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── README.md
└── BAO_CAO_DO_AN.md
```

### 4.2. Triển khai qua Docker Compose
Toàn bộ hệ thống được định nghĩa trong `docker-compose.yml` gồm 3 services:
- **`postgres`:** Database PostgreSQL 16 Alpine với volume persistence `pgdata`.
- **`backend`:** Node.js 20 Express REST API và Socket.io Server (Port 5000).
- **`frontend`:** Nginx Alpine phục vụ bản build ReactJS và cấu hình Reverse Proxy chuyển tiếp `/api` và `/socket.io` vào container backend (Port 3000).

---

## CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾT QUẢ

1. **Kiểm thử Chức năng:**
   - Đăng nhập 1-click cho tài khoản mẫu: Hoàng Công Trí Dũng (Leader) và Đặng Trường Khang (Dev).
   - Kéo chuyển trạng thái task trên Kanban Board, cập nhật thanh trượt tiến độ % và checklist.
   - Thảo luận thời gian thực trên phòng Chat, bấm "Tạo Task" từ tin nhắn thành công.
2. **Kiểm thử Module AI:**
   - Thử nghiệm chức năng bóc tách công việc từ tin nhắn tiếng Việt: Trích xuất đúng người nhận, hạn chót và mức độ ưu tiên.
   - Xuất báo cáo Standup tiến độ đạt độ chính xác cao về số liệu hoàn thành.
3. **Kiểm thử Containerization:**
   - Ứng dụng khởi động ổn định bằng lệnh `docker compose up -d`, các container liên lạc qua mạng nội bộ Docker an toàn.

---

## CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 6.1. Kết quả đạt được
- Đã xây dựng thành công nền tảng Web Quản lý Dự án hoàn chỉnh, hiện đại theo chuẩn Linear & Trello.
- Tích hợp thành công Trợ lý AI với khả năng phân tích dữ liệu vận hành thực tế.
- Đóng gói hoàn chỉnh bằng Docker Compose, giúp triển khai độc lập mà không phát sinh chi phí AWS trong giai đoạn xây dựng ban đầu.

### 6.2. Hướng phát triển tiếp theo
- Thiết lập quy trình CI/CD tự động bằng GitHub Actions (tự động test, build docker image và push lên Docker Hub).
- Khi bước vào giai đoạn đánh giá cuối kỳ trên AWS: Cấu hình đưa container lên **AWS EC2**, chuyển sang sử dụng **Amazon Bedrock Claude API** và thiết lập giám sát log qua **Amazon CloudWatch** theo đúng kế hoạch đề cương đồ án.

