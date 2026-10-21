const SHEET_NAME = 'Profiles';
const HEADERS = [
  'profileId', 'businessScale', 'package', 'companyName', 'tagline', 'industry',
  'address', 'phone', 'email', 'website', 'history', 'vision', 'mission',
  'products', 'organization', 'portfolio', 'legalitas', 'operationalData',
  'achievementReport', 'assetsJson', 'createdAt', 'updatedAt'
];
const MAX_IMAGE_BYTES = 1024 * 1024;
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    let result;
    if (!p.action || p.action === 'health') result = { ok: true, service: 'company-profile-api' };
    else if (p.action === 'get') result = getProfile_(p.profileId);
    else if (p.action === 'getAsset') result = getAsset_(p.profileId, p.assetId);
    else throw new Error('Action GET tidak dikenal.');
    return respond_(result, p.callback);
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) }, p.callback);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    let result;
    if (body.action === 'save') result = saveProfile_(body.profile || {});
    else if (body.action === 'upload') result = uploadAsset_(body);
    else throw new Error('Action POST tidak dikenal.');
    return respond_(result);
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}

function respond_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback) {
    if (!/^[A-Za-z_$][\w$\.]*$/.test(callback)) throw new Error('Callback JSONP tidak valid.');
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
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
  HEADERS.forEach(key => {
    const value = profile[key] == null ? '' : profile[key];
    clean[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
  });
  clean.profileId = String(clean.profileId || Utilities.getUuid());
  clean.businessScale = String(clean.businessScale || 'startup');
  clean.updatedAt = new Date().toISOString();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
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
  } finally {
    lock.releaseLock();
  }
  return { ok: true, profileId: clean.profileId, updatedAt: clean.updatedAt };
}

function uploadAsset_(body) {
  const profileId = String(body.profileId || '');
  const assetId = String(body.assetId || '');
  if (!isUuid_(profileId) || !isUuid_(assetId)) throw new Error('profileId dan assetId harus berupa UUID.');
  const mimeType = String(body.mimeType || '').toLowerCase();
  if (IMAGE_MIME_TYPES.indexOf(mimeType) < 0) throw new Error('Format gambar harus JPG, PNG, atau WebP.');
  const base64 = String(body.base64 || '');
  if (!base64 || base64.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 8) throw new Error('Ukuran gambar maksimum 1 MB.');
  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error('Ukuran gambar maksimum 1 MB.');

  const folder = getAssetFolder_();
  const assetName = 'CPGN_' + assetId;
  const existing = folder.getFilesByName(assetName);
  while (existing.hasNext()) {
    const file = existing.next();
    const metadata = parseAssetDescription_(file);
    if (metadata.profileId === profileId) {
      return { ok: true, assetId, profileId, name: metadata.name || body.name || 'image', mimeType: metadata.mimeType || mimeType };
    }
  }

  const name = String(body.name || 'image').replace(/[\\/:*?"<>|\r\n]/g, '_').slice(0, 100);
  const blob = Utilities.newBlob(bytes, mimeType, assetName);
  const file = folder.createFile(blob);
  file.setDescription(JSON.stringify({ assetId, profileId, name, mimeType }));
  return { ok: true, assetId, profileId, name, mimeType };
}

function getAsset_(profileId, assetId) {
  if (!isUuid_(profileId) || !isUuid_(assetId)) throw new Error('ID aset tidak valid.');
  const files = getAssetFolder_().getFilesByName('CPGN_' + assetId);
  while (files.hasNext()) {
    const file = files.next();
    const metadata = parseAssetDescription_(file);
    if (metadata.assetId !== assetId || metadata.profileId !== profileId) continue;
    const blob = file.getBlob();
    const bytes = blob.getBytes();
    if (bytes.length > MAX_IMAGE_BYTES) throw new Error('Aset melebihi batas ukuran.');
    return {
      ok: true, assetId, profileId,
      name: metadata.name || file.getName(),
      mimeType: metadata.mimeType || blob.getContentType(),
      dataUrl: 'data:' + (metadata.mimeType || blob.getContentType()) + ';base64,' + Utilities.base64Encode(bytes)
    };
  }
  return { ok: false, error: 'Aset tidak ditemukan.' };
}

function parseAssetDescription_(file) {
  try { return JSON.parse(file.getDescription() || '{}'); }
  catch (_) { return {}; }
}

function isUuid_(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getAssetFolder_() {
  const id = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (!id) throw new Error('DRIVE_FOLDER_ID belum diset. Jalankan setupProject().');
  return DriveApp.getFolderById(id);
}

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diset. Jalankan setupProject().');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Tab Profiles tidak ditemukan. Jalankan setupProject().');
  return sheet;
}
