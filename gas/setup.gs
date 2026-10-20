/**
 * Jalankan setupProject() sekali dari editor Apps Script.
 * Spreadsheet dan folder Drive dibuat otomatis lalu ID-nya disimpan di Script Properties.
 * Jika dijalankan ulang, resource yang sudah tersimpan akan digunakan kembali.
 */
function setupProject() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  let folderId = properties.getProperty('DRIVE_FOLDER_ID');
  let spreadsheet;
  let folder;

  if (spreadsheetId) {
    // Memastikan resource konfigurasi lama masih dapat diakses.
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create('Company Profile Generator - Database');
    spreadsheetId = spreadsheet.getId();
    properties.setProperty('SPREADSHEET_ID', spreadsheetId);
  }

  if (folderId) {
    folder = DriveApp.getFolderById(folderId);
  } else {
    folder = DriveApp.createFolder('Company Profile Generator - Client Assets');
    folderId = folder.getId();
    properties.setProperty('DRIVE_FOLDER_ID', folderId);
  }

  const headers = [
    'profileId', 'businessScale', 'package', 'companyName', 'tagline', 'industry',
    'address', 'phone', 'email', 'website', 'history', 'vision', 'mission',
    'products', 'organization', 'portfolio', 'legalitas', 'operationalData',
    'achievementReport', 'assetsJson', 'createdAt', 'updatedAt'
  ];

  let sheet = spreadsheet.getSheetByName('Profiles');
  if (!sheet) sheet = spreadsheet.insertSheet('Profiles');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  const message = [
    'Setup selesai. Resource tersimpan di Script Properties.',
    '',
    'Spreadsheet: ' + spreadsheet.getUrl(),
    'Folder aset: ' + folder.getUrl(),
    '',
    'Jalankan setupProject() lagi tidak akan membuat duplikat.'
  ].join('\\n');
  SpreadsheetApp.getUi().alert('Company Profile Generator siap', message, SpreadsheetApp.getUi().ButtonSet.OK);
  Logger.log(message);
}
