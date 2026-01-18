# Hướng Dẫn Chỉnh Sửa & Xóa Tồn Kho

## ✅ Chức Năng Vừa Thêm Vào

### 1. **Nút "Thao Tác" (Action Buttons)**
- Mỗi hàng trong bảng tồn kho hiện có 2 nút:
  - 🖊️ **Chỉnh Sửa** (Edit): Cho phép sửa thông tin bản ghi
  - 🗑️ **Xóa** (Delete): Đánh dấu bản ghi là đã xóa

### 2. **Chức Năng Chỉnh Sửa**
- Nhấn nút "Chỉnh Sửa" sẽ:
  1. Mở lại modal nhập tồn kho
  2. Điền đầy đủ thông tin hiện tại
  3. Cho phép bạn thay đổi bất kỳ trường nào
  4. Lưu lại những thay đổi

### 3. **Chức Năng Xóa**
- Nhấn nút "Xóa" sẽ:
  1. Hiện modal xác nhận
  2. Sau khi xác nhận, đánh dấu bản ghi trong cột `trang_thai_xoa` = "DELETED"
  3. Bản ghi vẫn tồn tại trong sheet nhưng được đánh dấu là đã xóa
  4. Có thể khôi phục bằng cách chỉnh sửa lại `trang_thai_xoa`

## 🔄 Các File Đã Sửa

### Frontend: `san-pham-khach.html`
**Thay Đổi:**
1. **renderInventory()** (line ~1427)
   - Thêm cột "Thao Tác" với 2 nút Edit/Delete
   - Mỗi nút gọi function tương ứng với dữ liệu hàng
   - Cập nhật colspan từ 8 → 9

2. **editInventoryRecord()** (line ~1638)
   - Mở modal chỉnh sửa với dữ liệu hiện tại
   - Đặt focus vào các trường có thể sửa
   - Gọi `updateInventoryRecord()` khi submit

3. **updateInventoryRecord()** (line ~1680)
   - POST đến backend với action = 'updateInventory'
   - Gửi dữ liệu cũ và mới để backend tìm đúng bản ghi
   - Reload bảng sau khi thành công

4. **deleteInventoryRecord()** (line ~1745)
   - Hiện modal xác nhận
   - Gọi `executeDeleteInventory()` khi xác nhận

5. **executeDeleteInventory()** (line ~1775)
   - POST đến backend với action = 'deleteInventory'
   - Gửi ID sản phẩm để backend xóa
   - Reload bảng sau khi thành công

### Backend: `GAS_CustomerProducts_Script.txt`
**Thay Đổi:**
1. **doPost()** (line ~75-76)
   - Thêm 2 dòng để nhận xử lý action 'updateInventory' và 'deleteInventory'

2. **updateInventory()** (line ~460-510)
   - Tìm bản ghi theo (date, id_san_pham)
   - Cập nhật tất cả các cột dữ liệu
   - Trả về kết quả thành công/lỗi

3. **deleteInventory()** (line ~512-564)
   - Tìm bản ghi theo id_san_pham
   - Đặt cột `trang_thai_xoa` = "DELETED"
   - Có thể xóa nhiều bản ghi cùng ID

## 🚀 Hướng Dẫn Sử Dụng

### Chỉnh Sửa Tồn Kho
1. Vào tab "TỒN KHO"
2. Tìm hàng cần sửa
3. Nhấn nút 🖊️ **Chỉnh Sửa**
4. Sửa thông tin cần thiết
5. Nhấn "LƯU THÔNG TIN TỒN KHO"
6. Bảng sẽ tự động cập nhật

### Xóa Tồn Kho
1. Vào tab "TỒN KHO"
2. Tìm hàng cần xóa
3. Nhấn nút 🗑️ **Xóa**
4. Xác nhận trong hộp thoại
5. Bản ghi sẽ bị đánh dấu là đã xóa

## ⚙️ Cần Làm Tiếp

### **QUAN TRỌNG: Cập nhật Apps Script**
Bạn cần triển khai (redeploy) mã Apps Script mới vào Google Sheets:

1. Mở Google Apps Script editor tại script.google.com
2. Mở project: `GAS_CustomerProducts_Script`
3. Sao chép toàn bộ nội dung từ file `GAS_CustomerProducts_Script.txt`
4. Dán vào editors, thay thế mã cũ
5. Nhấn "Triển khai" (Deploy) → "Triển khai mới" (New deployment)
6. Chọn loại: "Web app"
7. Copy URL mới trong hộp thoại (nếu URL thay đổi)
8. Dán URL này vào biến `SCRIPT_URL` trong `san-pham-khach.html` nếu khác

### Kiểm Tra Kết Quả
Sau khi triển khai:
1. Vào trang "Quản Lý Tồn Kho" trong web
2. Kiểm tra xem nút Edit/Delete có hiển thị không
3. Thử chỉnh sửa 1 bản ghi
4. Thử xóa 1 bản ghi
5. Kiểm tra Google Sheets để xem dữ liệu đã cập nhật

## 📋 Sheet Structure (ton_kho)
- **Col A**: date - Ngày nhập/xuất
- **Col B**: ten_san_pham - Tên sản phẩm
- **Col C**: id_san_pham - ID sản phẩm
- **Col D**: so_luong_nhap - Số lượng nhập
- **Col E**: trang_thai - Trạng thái (nhập/xuất)
- **Col F**: con_lai - Còn lại
- **Col G**: trang_thai_xoa - Trạng thái xóa (DELETED = đã xóa)
- **Col H**: ten_dang_nhap - Tên đăng nhập

## 🔍 Lưu Ý Quan Trọng

1. **Dữ liệu bị xóa không bị mất**: Chỉ đánh dấu là DELETED, vẫn có thể khôi phục
2. **Chỉnh sửa sẽ cập nhật toàn bộ**: Bất kỳ trường nào bạn sửa sẽ được cập nhật
3. **Con lại tự động tính**: Nếu bạn sửa số lượng nhập/xuất, con lại sẽ được tính lại
4. **Xác nhận trước xóa**: Luôn có modal xác nhận trước khi xóa bản ghi

---

📧 Nếu có vấn đề, kiểm tra:
- Browser Console (F12) để xem lỗi chi tiết
- Google Sheets để xem dữ liệu thực tế
- Logs của Apps Script để debug phía backend
