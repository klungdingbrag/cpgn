const SHEET_NAME = 'Profiles';
const HEADERS = [
  'profileId', 'businessScale', 'package', 'companyName', 'tagline', 'industry',
  'address', 'phone', 'email', 'website', 'history', 'vision', 'mission',
  'products', 'organization', 'portfolio', 'legalitas', 'operationalData',
  'achievementReport', 'assetsJson', 'createdAt', 'updatedAt'
];

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    let result;
    if (!p.action || p.action === 'health') result = { ok: true, service: 'company-profile-api' };
    else if (p.action === 'get') result = getProfile_(p.profileId);
    else throw new Error('Action GET tidak dikenal; gunakan health atau get.');
    return respond_(result, p.callback);
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) }, p.callback);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'save') throw new Error('Action POST tidak dikenal.');
    return respond_(saveProfile_(body.profile || {}));
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}

function respond_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback) {
    if (!/^[A-Za-z_$][\w$\.]*$/.test(callback)) throw new Error('Callback JSONP tidak valid.');
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getProfile_(profileId) {
  if (!profileId) throw new Error('profileId wajib diisi.');
  const values = getSheet_().getDataRange().getValues();
  const idIndex = HEADERS.indexOf('profileId');
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idIndex]) === String(profileId)) {
      const profile = {};
      HEADERS.forEach((key, c) => profile[key] = values[r][c] == null ? '' : values[r][c]);
      return { ok: true, profile };
    }
  }
  return { ok: false, error: 'Profil tidak ditemukan.' };
}

function saveProfile_(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('Payload profil tidak valid.');
  const clean = {};
  HEADERS.forEach(key => clean[key] = profile[key] == null ? '' : profile[key]);
  clean.profileId = String(clean.profileId || Utilities.getUuid());
  clean.businessScale = String(clean.businessScale || 'startup');
  clean.updatedAt = new Date().toISOString();
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const idCol = HEADERS.indexOf('profileId');
  const found = rows.findIndex((values, i) => i > 0 && String(values[idCol]) === clean.profileId);
  if (found < 0) {
    clean.createdAt = clean.createdAt || clean.updatedAt;
    sheet.appendRow(HEADERS.map(key => clean[key]));
  } else {
    clean.createdAt = clean.createdAt || rows[found][HEADERS.indexOf('createdAt')];
    sheet.getRange(found + 1, 1, 1, HEADERS.length).setValues([HEADERS.map(key => clean[key])]);
  }
  return { ok: true, profileId: clean.profileId, updatedAt: clean.updatedAt };
}

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diset. Jalankan setupProject().');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Tab Profiles tidak ditemukan. Jalankan setupProject().');
  return sheet;
}

