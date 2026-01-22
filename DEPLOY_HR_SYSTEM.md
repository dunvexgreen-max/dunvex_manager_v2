# Hướng Dẫn Kích Hoạt Hệ Thống HR & Chấm Công

Hệ thống Nhân sự (HR) hiện đang gặp lỗi "Hành động không hợp lệ" do chưa được kết nối với đúng Server Backend (Hiện tại đang kết nối nhầm sang Server Xác thực).

Bạn cần thực hiện các bước sau để khởi chạy Server HR riêng biệt:

## 🔴 BƯỚC 1: DEPLOY SCRIPT HR

### 1. Mở Google Apps Script
- Truy cập: https://script.google.com
- Tạo một dự án mới (New Project)
- Đặt tên dự án là: `GAS_HR_Script`

### 2. Copy code backend
- Mở file `GAS_HR_Script.txt` trong thư mục code của bạn.
- Copy **toàn bộ nội dung** (Ctrl+A -> Ctrl+C).
- Quay lại trang Google Apps Script, xóa hết code cũ trong file `Code.gs`.
- Paste code vừa copy vào.
- Nhấn **Save** (biểu tượng đĩa mềm).

### 3. Deploy Web App
- Click nút **Deploy** (góc trên bên phải) > **New deployment**.
- Bấm vào biểu tượng bánh răng (Select type) > chọn **Web app**.
- Điền thông tin:
  - **Description**: HR System API
  - **Execute as**: `Me` (email của bạn)
  - **Who has access**: `Anyone` (Bắt buộc chọn Anyone)
- Click **Deploy**.
- **Copy URL Web App** vừa được tạo (Đường dẫn có dạng `https://script.google.com/macros/s/.../exec`).

---

## 🟢 BƯỚC 2: CẬP NHẬT FRONTEND

### 1. Mở file `quan-ly-nhan-su.html`
- Tìm đến dòng **1111** (hoặc tìm từ khóa `const HR_URL`).
- Bạn sẽ thấy dòng code đang bị sai:
  ```javascript
  const HR_URL = 'https://script.google.com/macros/s/AKfycbyaz_6xI3Nz0FHnNgr9qEcPuOUGf4OY53l8x1ofSoh_LIGozbKmpSJNAwpq8U6ygpPNHw/exec';
  ```
  *(Đây là link của Auth Server, không phải HR Server)*

### 2. Thay thế URL
- Dán URL bạn vừa copy ở Bước 1 vào thay thế URL cũ.
- Code sau khi sửa sẽ trông giống như:
  ```javascript
  const HR_URL = 'https://script.google.com/macros/s/AKfycbx...URL_MOI_CUA_BAN.../exec';
  ```
- **Lưu file** `quan-ly-nhan-su.html`.

---

## 🟡 BƯỚC 3: KIỂM TRA
1. Quay lại trang **Hệ Thống HR**.
2. Refresh (F5) lại trang.
3. Vào tab **Cấu hình**, thử chọn vị trí trên bản đồ và nhấn **Lưu Cấu Hình**.
4. Nếu thấy thông báo "Đã lưu cấu hình!" màu xanh -> **Thành công!**

> **Lưu ý:** Lần đầu tiên chạy script, Google có thể yêu cầu cấp quyền (Authorize Access). Hãy chọn tài khoản của bạn > Advanced > Go to (Unsafe) > Allow.
