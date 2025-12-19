# CẬP NHẬT KỊCH BẢN GOOGLE APPS SCRIPT (QUAN TRỌNG)

Để hệ thống có thể vừa **Upload ảnh** vừa **Lưu dữ liệu** cùng lúc và ghi đúng đường link ảnh vào Sheet, bạn cần cập nhật lại toàn bộ mã trong Google Apps Script.

## Bước 1: Copy đoạn mã mới dưới đây
Hãy xóa hết mã cũ trong file `Mã.gs` (Code.gs) của bạn và dán đè đoạn mã mới này vào:

```javascript
// ================= CẤU HÌNH =================
const SHEET_ID = '1f5w7uPmiqwbrqARpdPvBJeAOh1LPhhOnAwO4JFIkCn4'; // ID file Sheet
const SHEET_NAME = 'nano_pima'; // Tên Sheet
const DRIVE_FOLDER_ID = '1Jm6v_wN1YbVM43RYFIMtQqXuaD-bCTnV'; // ID thư mục Drive
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Xử lý lưu sản phẩm kèm ảnh
    if (data.type === 'save_product_with_image') {
      return saveProductWithImage(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: 'Unknown type'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveProductWithImage(data) {
  // 1. Xử lý Upload ảnh lên Drive
  let fileUrl = '';
  if (data.image_base64) {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(data.image_base64), data.image_mime, data.image_name);
    const file = folder.createFile(blob);
    
    // Set quyền công khai để xem được trên web
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Tạo link xem trực tiếp (tốt hơn getUrl gốc của Google)
    fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
  } else {
    fileUrl = 'Không có ảnh';
  }

  // 2. Ghi dữ liệu vào Sheet
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Thứ tự cột: [A]Link Ảnh, [B]ID, [C]Tên, [D]Quy Cách, [E]Độ Dày, [F]Đóng Gói, [G]Trọng Lượng, [H]Giá Kho, [I]Phí Chành, [J]Giá Tới Chành
  sheet.appendRow([
    fileUrl,
    data.id_sp,
    data.ten_sp,
    data.quy_cach,
    data.do_day,
    data.dong_goi,
    data.trong_luong,
    data.gia_kho,
    data.phi_chanh,
    data.gia_toi_chanh
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({result: 'success', url: fileUrl}))
      .setMimeType(ContentService.MimeType.JSON);
}
```

## Bước 2: Lưu và Triển khai lại (Deploy New Version)
**Rất quan trọng:** Mỗi khi sửa code, bạn phải tạo bản triển khai mới thì code mới mới chạy.
1. Nhấn nút xanh **Triển khai (Deploy)** > **Quản lý các bản triển khai (Manage deployments)**.
2. Nhấn biểu tượng **Chỉnh sửa (Edit)** (hình cây bút chì) hoặc tạo **Bản triển khai mới** nếu cần.
3. Ở phần **Phiên bản (Version)**, chọn **Phiên bản mới (New version)**.
4. Nhấn **Triển khai (Deploy)**.
5. Kiểm tra xem URL Web App có thay đổi không (thường là không đổi, nhưng nếu đổi thì nhớ copy link mới cập nhật vào code Web).

Vậy là xong! Hệ thống sẽ tự động lấy link ảnh từ Drive sau khi upload và điền vào cột A của Sheet.
