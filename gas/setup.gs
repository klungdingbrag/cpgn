/** Jalankan sekali dari editor Apps Script. Nilai disimpan sebagai Script Properties. */
function setupProject() {
  const ui = SpreadsheetApp.getUi();
  const sheetReply = ui.prompt('Setup Company Profile Generator', 'Masukkan ID Google Spreadsheet:', ui.ButtonSet.OK_CANCEL);
  if (sheetReply.getSelectedButton() !== ui.Button.OK) return;
  const folderReply = ui.prompt('Setup Company Profile Generator', 'Masukkan ID folder Google Drive untuk aset:', ui.ButtonSet.OK_CANCEL);
  if (folderReply.getSelectedButton() !== ui.Button.OK) return;

  const spreadsheetId = sheetReply.getResponseText().trim();
  const folderId = folderReply.getResponseText().trim();
  if (!spreadsheetId || !folderId) throw new Error('Spreadsheet ID dan Drive folder ID wajib diisi.');
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  DriveApp.getFolderById(folderId).getName(); // Validasi akses.
  const headers = [
    'profileId', 'businessScale', 'package', 'companyName', 'tagline', 'industry',
    'address', 'phone', 'email', 'website', 'history', 'vision', 'mission',
    'products', 'organization', 'portfolio', 'legalitas', 'operationalData',
    'achievementReport', 'assetsJson', 'createdAt', 'updatedAt'
  ];
  let sheet = spreadsheet.getSheetByName('Profiles');
  if (!sheet) sheet = spreadsheet.insertSheet('Profiles');
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  PropertiesService.getScriptProperties().setProperties({ SPREADSHEET_ID: spreadsheetId, DRIVE_FOLDER_ID: folderId }, true);
  ui.alert('Setup selesai', 'Konfigurasi tersimpan di Script Properties dan tab Profiles siap digunakan.', ui.ButtonSet.OK);
}

