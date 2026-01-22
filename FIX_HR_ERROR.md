# Hướng Dẫn Sửa Lỗi Hệ Thống HR (Bắt Buộc)

Bạn đang gặp lỗi "e is not iterable" và Lịch sử báo cáo không hiển thị. Nguyên nhân là do Script HR cũ bị thiếu các hàm xử lý dữ liệu nhân viên.

Để khắc phục, bạn cần cập nhật lại code cho backend theo các bước sau:

## 🔴 CẬP NHẬT GOOGLE APPS SCRIPT

1. **Mở dự án Script HR cũ**:
   - Truy cập: https://script.google.com
   - Mở dự án HR mà bạn đã tạo ở bước trước (thường tên là `GAS_HR_Script`).

2. **Cập nhật code**:
   - Xóa toàn bộ nội dung cũ trong file `Code.gs`.
   - Mở file `GAS_HR_Script.txt` trong mã nguồn của bạn (mình vừa cập nhật thêm các hàm còn thiếu).
   - Copy toàn bộ nội dung mới và dán vào `Code.gs`.
   - Nhấn **Save** (biểu tượng đĩa mềm).

3. **Deploy phiên bản mới**:
   - Click nút **Deploy** (góc trên phải) > **Manage deployments** (Quản lý các bản triển khai).
   - Bấm vào biểu tượng **bút chì (Edit)** ở deployment hiện tại.
   - Ở mục **Version**, chọn **New version** (Phiên bản mới).
   - Click **Deploy**.

> **Lưu ý quan trọng**: Bạn KHÔNG cần tạo deployment mới (New deployment), chỉ cần Edit deployment cũ và chọn New version. Như vậy URL sẽ không đổi và bạn không cần sửa lại file HTML.

Sau khi làm xong, hãy quay lại trang web và tải lại (F5). Bảng "Lịch sử báo cáo" sẽ hoạt động bình thường!
