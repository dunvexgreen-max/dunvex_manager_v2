# HƯỚNG DẪN KHẮC PHỤC LỖI CORS - MASTER ADMIN

Bạn đang gặp lỗi "LỖI KẾT NỐI (CORS)" vì hệ thống Web chưa kết nối được với Google Apps Script mới. Vui lòng làm theo các bước sau:

## 🔴 BƯỚC 1: TRIỂN KHAI (DEPLOY) SCRIPT MASTER

1.  Truy cập: [https://script.google.com](https://script.google.com)
2.  Tạo hoặc Mở dự án Script dành cho Master (nếu chưa có thì tạo mới tên là `GAS_Master_Core`).
3.  **Xóa hết code cũ** và Copy toàn bộ nội dung từ file `GAS_Master_Script.txt` trong máy của bạn dán vào.
4.  Lưu lại (Ctrl + S).

**QUAN TRỌNG: CẤP QUYỀN LẦN ĐẦU**
*   Chọn hàm `initMasterSheetHeaders` ở menu thả xuống cạnh nút "Run/Debug".
*   Bấm **Run**.
*   Google sẽ hỏi quyền -> Chọn **Review Permissions** -> Chọn mail -> **Advanced** -> **Go to ... (unsafe)** -> **Allow**.

## 🔴 BƯỚC 2: DEPLOY WEB APP (QUAN TRỌNG NHẤT)

Đây là bước quyết định để sửa lỗi CORS:

1.  Bấm nút **Deploy** (màu xanh góc phải) -> **New deployment**.
2.  Bảng hiện ra, chọn biểu tượng bánh răng (Settings) -> **Web app**.
3.  Điền thông tin y hệt như sau:
    *   **Description:** `Master Fix V1`
    *   **Execute as:** `Me (gmail của bạn)`
    *   **Who has access:** `Anyone` (⚠️ BẮT BUỘC PHẢI CHỌN CÁI NÀY, nếu chọn Only Me sẽ bị lỗi CORS).
4.  Bấm **Deploy**.
5.  Copy đường link **Web App URL** (có dạng `https://script.google.com/macros/s/.../exec`).

## 🟢 BƯỚC 3: CẬP NHẬT URL VÀO WEB CODE

1.  Mở file `master-home.html`:
    *   Tìm dòng: `const MASTER_API = '...';`
    *   Thay link cũ trong dấu nháy `'...'` bằng link bạn vừa copy.
2.  Mở file `super-admin.html`:
    *   Tìm dòng: `const MASTER_API = '...';`
    *   Làm tương tự (thay bằng link mới).

## 🟢 BƯỚC 4: KIỂM TRA

1.  Lưu file và mở lại `super-admin.html` trên trình duyệt.
2.  Lỗi CORS sẽ biến mất và dữ liệu sẽ tải lên thành công!
