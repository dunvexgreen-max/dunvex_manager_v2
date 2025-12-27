# 🔧 Sửa Lỗi: Trạng Thái Xóa & Nhập Xuất

## 🐛 Vấn Đề Phát Hiện
Bạn phát hiện ra rằng:
1. **Cột G (trang_thai_xoa)** được cập nhật sai khi nhập/xuất tồn kho (trạng thái nhập/xuất bị ghi vào cột xóa)
2. Code chưa sửa lỗi khi xác định cột G để lưu trạng thái xóa

## ✅ Các Sửa Chữa Đã Làm

### 1. **createInventory()** - Không ghi dữ liệu vào cột G
```javascript
// NEVER populate trang_thai_xoa (Col G) from payload - it's for deletion tracking only
const normalizedHeader = normalizeHeader(h);
if (normalizedHeader === 'trangthaixoa') return '';
```
**Tác dụng**: Khi thêm bản ghi tồn kho, cột G sẽ luôn trống (không bị ghi trạng thái nhập/xuất vào)

### 2. **updateInventory()** - Bỏ qua cột G khi chỉnh sửa
```javascript
// Find the trang_thai_xoa column (Col G) - NEVER UPDATE this column during edit
const delIdx = headers.findIndex(h => normalizeHeader(h) === 'trangthaixoa');

// Update each column EXCEPT trang_thai_xoa (Col G - deletion status)
headers.forEach((h, index) => {
  if (index === delIdx) return;  // <-- BỎ QUA CỘT G
  // ... update other columns
});
```
**Tác dụng**: Khi chỉnh sửa bản ghi, cột G không bị thay đổi (giữ nguyên DELETED nếu đã xóa)

### 3. **deleteInventory()** - Tìm cột G chính xác
```javascript
// Find trang_thai_xoa column (Col G) - when normalized becomes 'trangthaixoa'
const delIdx = headers.findIndex(h => normalizeHeader(h) === 'trangthaixoa');

if (delIdx === -1) throw new Error('Cột trang_thai_xoa (Col G) không tồn tại');

// Mark the record as deleted by setting trang_thai_xoa (Col G) = 'DELETED'
sheet.getRange(i + 1, delIdx + 1).setValue('DELETED');
```
**Tác dụng**: Xóa bản ghi sẽ đúng đánh dấu cột G (trạng_thai_xoa) = "DELETED"

## 📋 Cấu Trúc Sheet Đúng
| Col | Tên          | Chứa Dữ Liệu              |
|-----|--------------|-------------------------|
| A   | date         | 2025-12-27              |
| B   | ten_san_pham | Tấm duraflex 8mm x 1m22 |
| C   | id_san_pham  | S006                    |
| D   | so_luong     | 700                     |
| E   | trang_thai   | nhập / xuất             |
| F   | con_lai      | 700                     |
| **G**   | **trang_thai_xoa** | **(trống hoặc "DELETED")** |
| H   | ten_dang_nhap | bathong2410@gmail.com   |

## 🚀 Hành Động Tiếp Theo

### 1. **Copy code mới vào Apps Script**
- Mở: https://script.google.com
- Mở project `GAS_CustomerProducts_Script`
- Copy toàn bộ file `GAS_CustomerProducts_Script.txt`
- Dán vào editor (thay thế mã cũ)

### 2. **Deploy lại**
- Nhấn **"Deploy"** → **"New Deployment"**
- Chọn type: **"Web app"**
- Chọn "Execute as: [Tài khoản của bạn]"
- Chọn "Who has access: Anyone"
- Copy URL mới (nếu khác)

### 3. **Test chức năng**
Làm theo các bước này để xác minh lỗi đã sửa:

**Bước 1: Thêm bản ghi tồn kho**
- Vào tab "TỒN KHO"
- Nhấn "NHẬP TỒN KHO"
- Chọn sản phẩm, ngày, số lượng
- Nhấn "LƯU THÔNG TIN TỒN KHO"
- **Check Google Sheets**: Cột G phải trống (không có trạng thái nhập/xuất)

**Bước 2: Chỉnh sửa bản ghi**
- Nhấn nút 🖊️ (Edit) trên bản ghi vừa thêm
- Sửa số lượng (VD: 700 → 800)
- Nhấn "LƯU THÔNG TIN TỒN KHO"
- **Check Google Sheets**: Cột E thay đổi (số lượng), cột G vẫn trống

**Bước 3: Xóa bản ghi**
- Nhấn nút 🗑️ (Delete) trên bản ghi
- Xác nhận xóa
- **Check Google Sheets**: Cột G = "DELETED"

## 🎯 Kết Quả Mong Muốn
Sau sửa chữa:
- ✅ Khi **nhập/xuất tồn kho**: Cột E ghi trạng thái, cột G trống
- ✅ Khi **chỉnh sửa**: Chỉ cột D-F thay đổi, cột G không động
- ✅ Khi **xóa**: Cột G = "DELETED", các cột khác vẫn giữ nguyên

---
📧 **Nếu vẫn có vấn đề:**
- Check Google Sheets để xem dữ liệu thực tế
- Mở Console (F12) xem lỗi chi tiết
- Kiểm tra Logs của Apps Script để debug backend
