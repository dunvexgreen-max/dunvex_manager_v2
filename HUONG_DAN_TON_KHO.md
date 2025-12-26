# HƯỚNG DẪN TRIỂN KHAI TÍNH NĂNG TỒN KHO

## Tổng quan
Tính năng tồn kho đã được tích hợp vào trang `san-pham-khach.html` dưới dạng tab thứ hai. Tính năng này cho phép:
- Nhập thông tin tồn kho sản phẩm
- Tự động lấy số lượng xuất từ đơn hàng
- Tính toán số lượng còn lại
- Lưu trữ vào sheet "ton_kho" trong Google Sheets

## Các file đã được cập nhật

### 1. san-pham-khach.html
- ✅ Thêm tab navigation (Sản Phẩm / Tồn Kho)
- ✅ Thêm bảng hiển thị tồn kho
- ✅ Thêm form modal nhập tồn kho
- ✅ Tích hợp logic lấy số lượng xuất từ đơn hàng
- ✅ Tự động tính toán số lượng còn lại

### 2. GAS_CustomerProducts_Script.txt
- ✅ Thêm constant `INVENTORY_SHEET_NAME = 'ton_kho'`
- ✅ Thêm action `readInventory` trong doGet
- ✅ Thêm action `createInventory` trong doPost
- ✅ Thêm hàm `readInventory()` - đọc dữ liệu tồn kho
- ✅ Thêm hàm `createInventory()` - tạo bản ghi tồn kho mới

### 3. GAS_Order_Script.txt
- ✅ Thêm action `getProductQuantity` trong doGet
- ✅ Thêm hàm `getProductQuantity()` - tính tổng số lượng sản phẩm đã xuất

## Các bước triển khai

### Bước 1: Cập nhật Google Apps Script cho Sản Phẩm Khách Hàng

1. Mở Google Sheet "sản-pham-khach-hang": 
   https://docs.google.com/spreadsheets/d/1x_DgdgVJVjkzZt8_e7Zg0gqDnG7oHmV0H7DgebVzD3E

2. Vào **Tiện ích mở rộng** → **Apps Script**

3. Copy toàn bộ nội dung từ file `GAS_CustomerProducts_Script.txt` và paste vào Apps Script

4. Nhấn **Lưu** (Ctrl+S hoặc Cmd+S)

5. Nhấn **Triển khai** → **Quản lý triển khai** → **Chỉnh sửa** (biểu tượng bút chì)

6. Nhấn **Triển khai** để cập nhật

### Bước 2: Cập nhật Google Apps Script cho Đơn Hàng

1. Mở Google Sheet "quan-ly-don-khach":
   https://docs.google.com/spreadsheets/d/1RKbxHqK_f4upstxQ1a0H0H7VF6Ut_eqyoNpwdozdEKI

2. Vào **Tiện ích mở rộng** → **Apps Script**

3. Copy toàn bộ nội dung từ file `GAS_Order_Script.txt` và paste vào Apps Script

4. Nhấn **Lưu** (Ctrl+S hoặc Cmd+S)

5. Nhấn **Triển khai** → **Quản lý triển khai** → **Chỉnh sửa** (biểu tượng bút chì)

6. Nhấn **Triển khai** để cập nhật

### Bước 3: Kiểm tra Sheet "ton_kho"

Sheet "ton_kho" sẽ được tự động tạo khi bạn nhập tồn kho lần đầu tiên. Nếu muốn tạo trước, bạn có thể:

1. Vào Google Sheet "sản-pham-khach-hang"
2. Tạo sheet mới tên "ton_kho"
3. Thêm header row với các cột:
   - date
   - ten_san_pham
   - id_san_pham
   - so_luong_nhap
   - so_luong_xuat
   - con_lai
   - ghi_chu
   - ten_dang_nhap

### Bước 4: Test tính năng

1. Mở trang `san-pham-khach.html` trong trình duyệt
2. Đăng nhập với tài khoản khách hàng
3. Click vào tab **📊 TỒN KHO**
4. Click nút **NHẬP TỒN KHO**
5. Điền thông tin:
   - Chọn ngày
   - Chọn sản phẩm từ dropdown
   - Nhập số lượng nhập
   - Số lượng xuất sẽ tự động lấy từ đơn hàng
   - Số lượng còn lại sẽ tự động tính
6. Click **LƯU THÔNG TIN TỒN KHO**

## Cấu trúc dữ liệu

### Sheet "ton_kho"
| Cột | Mô tả | Kiểu dữ liệu |
|-----|-------|--------------|
| date | Ngày nhập/xuất | Date |
| ten_san_pham | Tên sản phẩm | String |
| id_san_pham | Mã sản phẩm (S001, S002...) | String |
| so_luong_nhap | Số lượng nhập kho | Number |
| so_luong_xuat | Số lượng xuất kho (tự động) | Number |
| con_lai | Số lượng còn lại (tự động) | Number |
| ghi_chu | Ghi chú | String |
| ten_dang_nhap | Email người dùng | String |

## Lưu ý quan trọng

1. **Số lượng xuất tự động**: Hệ thống sẽ tìm kiếm trong tất cả các đơn hàng (Duraflex, Weber, Pima) và tính tổng số lượng sản phẩm đã được lên đơn dựa trên ID sản phẩm.

2. **Quyền truy cập**: Mỗi khách hàng chỉ thấy tồn kho của sản phẩm của mình (filter theo `ten_dang_nhap`).

3. **Tính toán còn lại**: `con_lai = so_luong_nhap - so_luong_xuat`

4. **Sheet tự động tạo**: Nếu sheet "ton_kho" chưa tồn tại, hệ thống sẽ tự động tạo khi bạn lưu bản ghi đầu tiên.

## Troubleshooting

### Lỗi: "Không thể kết nối với hệ thống"
- Kiểm tra xem đã triển khai lại Apps Script chưa
- Kiểm tra quyền truy cập của Apps Script (phải là "Anyone")

### Số lượng xuất không chính xác
- Kiểm tra xem ID sản phẩm trong đơn hàng có khớp với ID trong danh sách sản phẩm không
- Hệ thống tìm kiếm theo cách "contains", nên ID phải xuất hiện trong tên sản phẩm

### Sheet "ton_kho" không được tạo
- Chạy thử nghiệm bằng cách nhập một bản ghi tồn kho
- Nếu vẫn lỗi, tạo sheet thủ công với các cột như hướng dẫn ở Bước 3

## Tính năng tương lai có thể mở rộng

1. Thêm chức năng xuất báo cáo tồn kho
2. Thêm biểu đồ thống kê nhập/xuất theo thời gian
3. Cảnh báo khi tồn kho thấp
4. Lịch sử thay đổi tồn kho
5. Xuất file Excel báo cáo tồn kho

---

**Tác giả**: Antigravity AI Assistant  
**Ngày tạo**: 2025-12-26  
**Phiên bản**: 1.0
