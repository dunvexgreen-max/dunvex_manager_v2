# Hướng Dẫn Kích Hoạt Tính Năng Phân Tích Giá

Hiện tại, tính năng "Phân tích giá" đang báo lỗi vì chưa được kết nối với backend (Google Apps Script). Bạn cần thực hiện deploy code server để lấy URL kết nối.

## 🔴 BƯỚC 1: DEPLOY SCRIPT MỚI

### 1. Mở Google Apps Script
- Truy cập: https://script.google.com
- Tạo một dự án mới (New Project)
- Đặt tên dự án là: `GAS_PriceAnalysis_Script`

### 2. Copy code backend
- Mở file `GAS_PriceAnalysis_Script.txt` trong thư mục code của bạn.
- Copy **toàn bộ nội dung**.
- Quay lại trang Google Apps Script, xóa hết code cũ trong file `Code.gs`.
- Paste code vừa copy vào.
- Nhấn **Save** (biểu tượng đĩa mềm).

### 3. Deploy Web App
- Click nút **Deploy** (góc trên bên phải) > **New deployment**.
- Bấm vào bánh răng (Select type) > chọn **Web app**.
- Điền thông tin:
  - **Description**: Price Analysis API
  - **Execute as**: `Me` (email của bạn)
  - **Who has access**: `Anyone` (Bắt buộc chọn Anyone để Web App hoạt động được)
- Click **Deploy**.
- **Copy URL Web App** vừa được tạo (Đường dẫn có dạng `https://script.google.com/macros/s/.../exec`).

---

## 🟢 BƯỚC 2: CẬP NHẬT FRONTEND

### 1. Mở file `phan-tich-gia.html`
- Tìm đến dòng 835 (hoặc tìm từ khóa `const ANALYZE_URL`).
- Bạn sẽ thấy dòng code:
  ```javascript
  const ANALYZE_URL = 'https://script.google.com/macros/s/AKfycbzL5n9-yW_7S5qXN09oU7H_G_F_S_P_L_Y_T_I_C_S/exec';
  ```

### 2. Thay thế URL
- Thay thế đường dẫn placeholder đó bằng URL bạn vừa copy ở Bước 1.
- Code sau khi sửa sẽ trông giống như:
  ```javascript
  const ANALYZE_URL = 'https://script.google.com/macros/s/AKfycbx...dài ngoằng.../exec';
  ```
- **Lưu file** `phan-tich-gia.html`.

---

## 🟡 BƯỚC 3: KIỂM TRA
1. Quay lại trang web **Phân Tích Giá**.
2. Refresh (F5) lại trang.
3. Thử upload file Excel hoặc nhập link Google Sheet.
4. Nếu không còn báo lỗi đỏ ở góc màn hình và dữ liệu hiện ra -> **Thành công!**

> **Lưu ý:** Lần đầu tiên chạy script (khi bạn test), Google có thể yêu cầu cấp quyền (Review permissions). Hãy chọn account của bạn > Advanced > Go to (Unsafe) > Allow.
