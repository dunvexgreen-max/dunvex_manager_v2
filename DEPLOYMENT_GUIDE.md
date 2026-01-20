# Hướng Dẫn Deploy & Fix Tồn Kho

## 🔴 BƯỚC 1: REDEPLOY APPS SCRIPT (BẮT BUỘC)

Các thay đổi code vừa được cập nhật chỉ nằm ở file local, chưa được deploy lên web app. Làm theo bước này:

### 1. Mở Google Apps Script
- Truy cập: https://script.google.com
- Tìm project `GAS_CustomerProducts_Script` (tên dự án sẽ hiển thị ở sidebar trái)
- Mở project đó

### 2. Copy code mới vào editor
- Xóa toàn bộ nội dung hiện tại trong editor
- Mở file `GAS_CustomerProducts_Script.txt` ở workspace này
- Copy **toàn bộ nội dung** (Ctrl+A → Ctrl+C)
- Paste vào Google Apps Script editor (Ctrl+A → Ctrl+V)

### 3. Deploy mới
- Click **Deploy** (nút bên phải, có mũi tên xuống)
- Chọn **New deployment**
- Chọn **Web app** (dropdown Type)
- Chọn **Execute as: [your email]**
- Chọn **Who has access: Anyone**
- Click **Deploy**
- Copy URL mới (ví dụ: `https://script.google.com/macros/s/AKfycbzM8tz.../exec`)
- **Cập nhật** URL này vào:
  - `san-pham-khach.html`: tìm `PRODUCT_SCRIPT_URL = `...`` → paste URL mới
  - `quan-ly-don-khach.html`: tìm `PRODUCT_SCRIPT_URL = `...`` → paste URL mới
  - Lưu file

---

## 🔴 BƯỚC 2: KIỂM TRA & FIX CẤU TRÚC SHEET

**Vấn đề hiện tại:** Cột H đang hiển thị "nhập" (sai mapping)

### Cách fix:

**Option A: Thêm cột I (recommended)**
1. Mở sheet `ton_kho` trong Google Sheets
2. Click vào cột I (trống)
3. Ghi header: `trạng_thái` hoặc `trang_thai` (tùy bạn)
4. Xác nhận - xong

**Option B: Xóa cột H, thêm cột mới**
1. Mở sheet `ton_kho`
2. Click chuột phải vào **Column H** → **Delete column**
3. Thêm cột I với header `trang_thai`
4. Xác nhận - xong

---

## 🟢 BƯỚC 3: TEST INVENTORY LIST

Sau khi deploy & fix cột, test web UI:

1. Truy cập web app
2. Vào tab **Quản lý tồn kho**
3. Kiểm tra: có hiển thị dữ liệu không?
   - Nếu **có**: ✅ Xong!
   - Nếu **không**: Báo lại issue

---

## 🟢 BƯỚC 4: TEST AUTO-INVENTORY (OPTIONAL)

Test auto-log inventory khi order finalized:

1. Vào tab **Quản lý đơn hàng**
2. Tạo order mới, thêm sản phẩm, **chọn status "Đơn Chốt"**
3. Click **Lưu đơn hàng**
4. Đợi (sẽ thấy thông báo success)
5. Vào tab **Quản lý tồn kho**, kiểm tra có dòng mới với `trang_thai: 'xuất'` không?

---

## 📋 CHECKLIST HOÀN THÀNH

- [ ] Apps Script redeployed
- [ ] URL mới cập nhật vào `san-pham-khach.html`
- [ ] URL mới cập nhật vào `quan-ly-don-khach.html`
- [ ] Cấu trúc sheet `ton_kho` kiểm tra (Column I = trang_thai)
- [ ] Inventory list web UI hiển thị dữ liệu
- [ ] (Optional) Auto-inventory from "Đơn Chốt" tested

---

## 🆘 TROUBLESHOOTING

### "Inventory list vẫn không hiển thị dữ liệu"
1. Mở DevTools (F12 → Console)
2. Kiểm tra lỗi gì (thường là CORS hoặc API 404)
3. Nếu là API error, báo lại error message

### "Cột vẫn sai"
1. Chụp toàn bộ header row (Row 1) kèm column letters (A, B, C, ...)
2. Báo lại: cột nào là gì, đã thêm cột I chưa?

### "Không thấy URL mới sau deploy"
1. Vào Google Apps Script project
2. Click **Deployments** (icon lịch sử bên trái)
3. Tìm deployment mới nhất (sẽ có URL bên phải)
4. Copy URL → cập nhật vào frontend

---

**Khi xong hết, báo lại mình kết quả! 🚀**
