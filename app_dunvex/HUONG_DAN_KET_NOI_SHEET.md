// ================= CẤU HÌNH TỔNG HỢP CHUẨN (CHỈ DÙNG GIA_WEB_NANO) =================
const SHEET_ID = '1f5w7uPmiqwbrqARpdPvBJeAOh1LPhhOnAwO4JFIkCn4'; 
const SHEET_NAME = 'gia_web_nano'; // Tập trung tất cả vào đây
const DRIVE_FOLDER_ID = '1Jm6v_wN1YbVM43RYFIMtQqXuaD-bCTnV'; 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || data.type;

    if (action === 'add' || action === 'save_product_with_image') {
      return addProduct(data);
    } else if (action === 'update') {
      return updateProduct(data);
    } else if (action === 'delete') {
      return deleteProduct(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: 'Hành động không xác định'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 1. CHỨC NĂNG THÊM MỚI (Lưu vào gia_web_nano)
function addProduct(data) {
  let fileUrl = '';
  if (data.image_base64) {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(data.image_base64), data.image_mime, data.image_name);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Thứ tự cột theo gia_web_nano: [A]image, [B]id sản phẩm, [C]tên sản phẩm, [D]quy cách, [E]độ dày, [F]đóng gói, [G]trọng lượng, [H]giá hcm
  sheet.appendRow([
    fileUrl,
    data.id_sp || '',
    data.ten_sp,
    data.quy_cach,
    data.do_day,
    data.dong_goi,
    data.trong_luong,
    data.gia_toi_chanh
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({result: 'success', url: fileUrl}))
      .setMimeType(ContentService.MimeType.JSON);
}

// 2. CHỨC NĂNG CHỈNH SỬA
function updateProduct(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const targetName = data.ten_sp_old || data.ten_sp;
  let rowIndex = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][2] == targetName) { // Cột C (index 2) là tên sản phẩm
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: 'Không tìm thấy sản phẩm'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.image_base64) {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(data.image_base64), data.image_mime, data.image_name);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const newUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    sheet.getRange(rowIndex, 1).setValue(newUrl); // Cập nhật cột A
  }

  sheet.getRange(rowIndex, 2).setValue(data.id_sp || ""); // Cập nhật cột B (ID) nếu cần
  sheet.getRange(rowIndex, 3).setValue(data.ten_sp); // Cột C
  sheet.getRange(rowIndex, 4).setValue(data.quy_cach || "");
  sheet.getRange(rowIndex, 5).setValue(data.do_day || "");
  sheet.getRange(rowIndex, 6).setValue(data.dong_goi || "");
  sheet.getRange(rowIndex, 7).setValue(data.trong_luong || "");
  sheet.getRange(rowIndex, 8).setValue(data.gia_toi_chanh); // Cột H
  
  return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
}

// 3. CHỨC NĂNG XÓA
function deleteProduct(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][2] == data.ten_sp) { // Tìm theo tên ở cột C
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({result: 'error', message: 'Không tìm thấy'})).setMimeType(ContentService.MimeType.JSON);
}
