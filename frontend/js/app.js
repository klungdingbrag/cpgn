// Endpoint publik GAS prototipe. Jangan simpan API key atau token rahasia di frontend.
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwGNdhNKtUSSwt0IcXJzpc2s0R8qE-HarCTtL61PwjMonGZe7li3E0wDwgQqDmMdwiuWA/exec';
const LOCAL_DRAFT_KEY = 'cpgnDraftV1';
const MAX_IMAGE_BYTES = 1024 * 1024;
const THEMES = {
  teal: { ink: '#102a2a', accent: '#0f766e', soft: '#e6f4f1', text: '#172a2a' },
  navy: { ink: '#14213d', accent: '#2563eb', soft: '#e9efff', text: '#1e293b' },
  earth: { ink: '#342c24', accent: '#a16207', soft: '#f4ead9', text: '#292524' }
};
const commonSteps = [
  { title: 'Identitas perusahaan', hint: 'Informasi dasar dan kontak.', fields: [
    ['companyName', 'Nama perusahaan', 'text', true], ['tagline', 'Tagline', 'text'],
    ['industry', 'Industri', 'text'], ['address', 'Alamat', 'textarea'],
    ['phone', 'Telepon', 'tel'], ['email', 'Email', 'email'], ['website', 'Website', 'url']
  ]},
  { title: 'Cerita & arah bisnis', hint: 'Masukkan poin yang faktual dan dapat diverifikasi.', fields: [
    ['history', 'Sejarah perusahaan', 'textarea'], ['vision', 'Visi', 'textarea'], ['mission', 'Misi', 'textarea']
  ]},
  { title: 'Produk dan layanan', hint: 'Setiap penawaran menjadi item terpisah pada profil.', type: 'items', key: 'products', itemKind: 'product' },
  { title: 'Visual profil', hint: 'JPG, PNG, atau WebP maksimal 1 MB per gambar.', type: 'visuals' }
];
const scaleSteps = {
  startup: [],
  mid: [
    { title: 'Organisasi', hint: 'Struktur tim dan informasi legalitas.', fields: [
      ['organization', 'Struktur organisasi', 'textarea'], ['legalitas', 'Legalitas perusahaan', 'textarea']
    ]},
    { title: 'Portofolio', hint: 'Tambahkan setiap proyek dan foto dokumentasinya.', type: 'items', key: 'portfolio', itemKind: 'portfolio' }
  ],
  corporate: [
    { title: 'Organisasi', hint: 'Struktur tim dan informasi legalitas.', fields: [
      ['organization', 'Struktur organisasi', 'textarea'], ['legalitas', 'Legalitas perusahaan', 'textarea']
    ]},
    { title: 'Portofolio', hint: 'Tambahkan setiap proyek dan foto dokumentasinya.', type: 'items', key: 'portfolio', itemKind: 'portfolio' },
    { title: 'Operasional & pencapaian', hint: 'Rangkuman data kompleks dan laporan pencapaian.', fields: [
      ['operationalData', 'Data operasional kompleks', 'textarea'], ['achievementReport', 'Laporan pencapaian', 'textarea']
    ]}
  ]
};
const reviewStep = { title: 'Tinjau profil', hint: 'Buka preview dokumen atau simpan profil ke cloud.', type: 'review' };
const form = document.querySelector('#profileForm');
const nav = document.querySelector('#stepNav');
const scaleSelect = document.querySelector('#businessScale');
const themeSelect = document.querySelector('#themeSelect');
const profileIdInput = document.querySelector('#profileId');
const statusEl = document.querySelector('#status');
const previewDialog = document.querySelector('#previewDialog');
const previewPages = document.querySelector('#previewPages');
let currentStep = 0;

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
  });
}
function parseJson(value, fallback) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try { return JSON.parse(value); } catch (_) { return fallback; }
}
function normalizeItems(value, kind) {
  const parsed = parseJson(value, null);
  if (Array.isArray(parsed)) return parsed.map(item => ({
    id: item.id || newId(), title: item.title || item.name || '',
    description: item.description || item.details || '', year: item.year || '', image: item.image || null
  }));
  if (typeof value === 'string' && value.trim()) {
    return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => ({
      id: newId(), title: kind === 'product' ? line : 'Dokumentasi ' + (index + 1),
      description: kind === 'product' ? '' : line, year: '', image: null
    }));
  }
  return [];
}
function normalizeProfile(data) {
  data = data && typeof data === 'object' ? data : {};
  data.businessScale = ['startup', 'mid', 'corporate'].includes(data.businessScale) ? data.businessScale : 'startup';
  data.theme = THEMES[data.theme] ? data.theme : 'teal';
  data.products = normalizeItems(data.products, 'product');
  data.portfolio = normalizeItems(data.portfolio, 'portfolio');
  data.assets = parseJson(data.assetsJson || data.assets, {});
  if (!data.assets || typeof data.assets !== 'object') data.assets = {};
  data.assets.cover = data.assets.cover || {};
  data.assets.backCover = data.assets.backCover || {};
  return data;
}
function readLocalDraft() {
  try { return normalizeProfile(JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY) || '{}')); }
  catch (_) { return normalizeProfile({}); }
}
let profile = readLocalDraft();
function stripDataUrls(value) {
  if (Array.isArray(value)) return value.map(stripDataUrls);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'dataUrl').map(([key, child]) => [key, stripDataUrls(child)]));
}
function persistLocal() {
  try { localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(stripDataUrls(profile))); }
  catch (_) { setStatus('Browser gagal menyimpan draft lokal. Simpan profil ke cloud.', true); }
}
function steps() { return [...commonSteps, ...scaleSteps[scaleSelect.value], reviewStep]; }
function captureFields() {
  for (const [key, value] of new FormData(form).entries()) if (key) profile[key] = value;
}
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = 'mt-4 min-h-5 text-sm ' + (isError ? 'text-rose-700' : 'text-slate-600');
}
function makeButton(label, classes, onClick) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = classes; button.textContent = label; button.addEventListener('click', onClick);
  return button;
}
function createField(key, label, type, required = false, value = '') {
  const wrapper = document.createElement('label'); wrapper.className = 'block';
  const caption = document.createElement('span'); caption.className = 'mb-2 block text-sm font-medium'; caption.textContent = label + (required ? ' *' : '');
  const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  input.name = key; input.className = 'field'; input.value = value || '';
  if (type === 'textarea') { input.classList.add('min-h-28'); input.placeholder = 'Tulis poin atau informasi di sini...'; }
  else { input.type = type; input.placeholder = label; }
  if (required) input.required = true;
  if (key) input.addEventListener('input', () => { profile[key] = input.value; persistLocal(); });
  wrapper.append(caption, input); return wrapper;
}
function itemField(item, property, label, type = 'text') {
  const wrapper = document.createElement('label'); wrapper.className = 'mb-3 block';
  const caption = document.createElement('span'); caption.className = 'mb-2 block text-sm font-medium'; caption.textContent = label;
  const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  input.className = 'field'; input.value = item[property] || ''; input.placeholder = label;
  if (type === 'textarea') input.classList.add('min-h-24'); else input.type = type;
  input.addEventListener('input', () => { item[property] = input.value; persistLocal(); });
  wrapper.append(caption, input); return wrapper;
}
function renderImageUploader(parent, label, owner) {
  const box = document.createElement('div'); box.className = 'mt-4 space-y-2';
  const caption = document.createElement('label'); caption.className = 'block text-sm font-medium'; caption.textContent = label;
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp'; input.className = 'field';
  const preview = document.createElement('img'); preview.className = 'image-preview' + (owner.dataUrl ? '' : ' hidden'); preview.alt = label;
  if (owner.dataUrl) preview.src = owner.dataUrl;
  const hint = document.createElement('p'); hint.className = 'text-xs text-slate-500'; hint.textContent = owner.name ? 'Tersimpan di Drive: ' + owner.name : 'JPG, PNG, atau WebP. Maksimal 1 MB.';
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0]; if (!file) return;
    input.disabled = true;
    try {
      const uploaded = await uploadImage(file);
      Object.assign(owner, uploaded); persistLocal(); preview.src = uploaded.dataUrl; preview.classList.remove('hidden');
      hint.textContent = 'Tersimpan di Drive: ' + uploaded.name; setStatus('Gambar berhasil diunggah ke Drive.');
    } catch (error) { setStatus(error.message || 'Upload gambar gagal.', true); }
    finally { input.disabled = false; input.value = ''; }
  });
  box.append(caption, input, preview, hint); parent.append(box);
}
function renderItemsEditor(step) {
  const key = step.key; profile[key] = Array.isArray(profile[key]) ? profile[key] : [];
  const heading = document.createElement('div');
  const title = document.createElement('p'); title.className = 'text-sm font-medium'; title.textContent = step.itemKind === 'product' ? 'Daftar produk/layanan' : 'Daftar proyek/galeri';
  const subtitle = document.createElement('p'); subtitle.className = 'mt-1 text-xs text-slate-500'; subtitle.textContent = 'Item disimpan terstruktur agar bisa ditata per halaman.';
  heading.append(title, subtitle); form.append(heading);
  profile[key].forEach((item, index) => {
    const card = document.createElement('div'); card.className = 'item-card';
    const header = document.createElement('div'); header.className = 'mb-3 flex items-center justify-between';
    const cardTitle = document.createElement('h3'); cardTitle.className = 'text-sm font-semibold'; cardTitle.textContent = (step.itemKind === 'product' ? 'Penawaran ' : 'Portofolio ') + (index + 1);
    header.append(cardTitle, makeButton('Hapus', 'text-sm font-medium text-rose-700 hover:text-rose-900', () => {
      profile[key].splice(index, 1); persistLocal(); render();
    }));
    card.append(header, itemField(item, 'title', step.itemKind === 'product' ? 'Nama produk/layanan' : 'Nama proyek'));
    card.append(itemField(item, 'description', 'Deskripsi', 'textarea'));
    if (step.itemKind === 'portfolio') {
      card.append(itemField(item, 'year', 'Tahun (opsional)'));
      item.image = item.image || {}; renderImageUploader(card, 'Foto portofolio (opsional)', item.image);
    }
    form.append(card);
  });
  form.append(makeButton(step.itemKind === 'product' ? '+ Tambah produk/layanan' : '+ Tambah item portofolio',
    'rounded-xl border border-dashed border-slate-400 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-800',
    () => { profile[key].push({ id: newId(), title: '', description: '', year: '', image: null }); persistLocal(); render(); }));
}
function renderVisuals() {
  const intro = document.createElement('p'); intro.className = 'text-sm text-slate-600'; intro.textContent = 'Gambar cover dan back cover disimpan secara privat di Drive.';
  form.append(intro); profile.assets = profile.assets || {};
  profile.assets.cover = profile.assets.cover || {}; profile.assets.backCover = profile.assets.backCover || {};
  renderImageUploader(form, 'Foto cover depan', profile.assets.cover);
  renderImageUploader(form, 'Foto pilihan back cover (opsional)', profile.assets.backCover);
}
function renderReview() {
  const target = document.querySelector('#reviewSummary'); target.replaceChildren();
  const values = [
    ['Perusahaan', profile.companyName], ['Skala', scaleSelect.options[scaleSelect.selectedIndex].text],
    ['Produk/layanan', String(profile.products.length)], ['Item portofolio', String(profile.portfolio.length)],
    ['Tema', themeSelect.options[themeSelect.selectedIndex].text]
  ];
  const list = document.createElement('dl'); list.className = 'grid gap-4 sm:grid-cols-2';
  values.forEach(([label, value]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt'); dt.className = 'text-xs font-semibold uppercase tracking-wide text-slate-500'; dt.textContent = label;
    const dd = document.createElement('dd'); dd.className = 'mt-1 text-sm text-slate-800'; dd.textContent = value || 'Belum diisi';
    row.append(dt, dd); list.append(row);
  });
  target.append(list);
}
function render() {
  const list = steps(); currentStep = Math.min(currentStep, list.length - 1);
  const step = list[currentStep];
  document.querySelector('#stepCount').textContent = 'Langkah ' + (currentStep + 1) + ' dari ' + list.length;
  document.querySelector('#stepTitle').textContent = step.title; document.querySelector('#stepHint').textContent = step.hint;
  nav.replaceChildren();
  list.forEach((item, index) => {
    const button = makeButton(String(index + 1).padStart(2, '0') + '  ' + item.title,
      'step w-full rounded-xl px-3 py-2 text-left text-sm ' + (index === currentStep ? '' : 'text-slate-600 hover:bg-slate-50'),
      () => { captureFields(); persistLocal(); currentStep = index; render(); });
    button.setAttribute('aria-current', index === currentStep ? 'step' : 'false'); nav.append(button);
  });
  form.replaceChildren();
  if (step.fields) step.fields.forEach(([key, label, type, required]) => form.append(createField(key, label, type, required, profile[key])));
  if (step.type === 'items') renderItemsEditor(step);
  if (step.type === 'visuals') renderVisuals();
  const isReview = step.type === 'review';
  form.classList.toggle('hidden', isReview); document.querySelector('#reviewSummary').classList.toggle('hidden', !isReview);
  if (isReview) renderReview();
  document.querySelector('#backButton').disabled = currentStep === 0;
  document.querySelector('#backButton').classList.toggle('opacity-40', currentStep === 0);
  document.querySelector('#nextButton').textContent = isReview ? 'Selesai' : 'Lanjut →';
}
function setProfileId(id) {
  profile.profileId = id || ''; profileIdInput.value = profile.profileId; persistLocal();
}
function jsonpGet(params) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cpgnJsonp_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script'); const url = new URL(GAS_ENDPOINT);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('callback', callbackName);
    const cleanup = () => { delete window[callbackName]; script.remove(); clearTimeout(timer); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Waktu tunggu API habis.')); }, 20000);
    window[callbackName] = payload => { cleanup(); resolve(payload); };
    script.onerror = () => { cleanup(); reject(new Error('Tidak dapat menghubungi API GAS.')); };
    script.src = url.toString(); document.head.append(script);
  });
}
function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Browser gagal membaca gambar.'));
    reader.readAsDataURL(file);
  });
}
async function waitForAsset(profileId, assetId) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const result = await jsonpGet({ action: 'getAsset', profileId, assetId });
      if (result.ok && result.dataUrl) return result;
      lastError = new Error(result.error || 'Aset belum tersedia.');
    } catch (error) { lastError = error; }
    await new Promise(resolve => setTimeout(resolve, 700));
  }
  throw new Error('Upload terkirim, tetapi gambar belum dapat diverifikasi. ' + (lastError ? lastError.message : ''));
}
async function uploadImage(file) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Ukuran gambar melebihi batas 1 MB.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Gunakan gambar JPG, PNG, atau WebP.');
  if (!profile.profileId) setProfileId(newId());
  const dataUrl = await readDataUrl(file); const base64 = dataUrl.split(',')[1] || ''; const assetId = newId();
  setStatus('Mengunggah gambar ke Google Drive…');
  await fetch(GAS_ENDPOINT, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ action: 'upload', profileId: profile.profileId, assetId, name: file.name, mimeType: file.type, base64 })
  });
  return waitForAsset(profile.profileId, assetId);
}
function hydrateAsset(owner) {
  if (!owner || !owner.assetId || owner.dataUrl || !profile.profileId) return Promise.resolve();
  return jsonpGet({ action: 'getAsset', profileId: profile.profileId, assetId: owner.assetId })
    .then(result => { if (result.ok && result.dataUrl) Object.assign(owner, result); });
}
async function hydrateAssets() {
  const owners = [profile.assets && profile.assets.cover, profile.assets && profile.assets.backCover, ...(profile.portfolio || []).map(item => item.image)];
  const outcomes = await Promise.allSettled(owners.map(hydrateAsset)); persistLocal(); return outcomes;
}
async function loadFromCloud(id) {
  if (!id) throw new Error('Masukkan ID profil yang ingin dimuat.');
  const response = await jsonpGet({ action: 'get', profileId: id });
  if (!response.ok || !response.profile) throw new Error(response.error || 'Profil tidak ditemukan.');
  profile = normalizeProfile({ ...response.profile, profileId: id });
  scaleSelect.value = profile.businessScale; themeSelect.value = profile.theme;
  setProfileId(id); currentStep = 0; await hydrateAssets(); persistLocal(); render();
}
function profileForApi() {
  const clean = stripDataUrls(profile);
  return {
    ...clean,
    products: JSON.stringify(clean.products || []),
    portfolio: JSON.stringify(clean.portfolio || []),
    assetsJson: JSON.stringify(clean.assets || {})
  };
}
async function saveToCloud() {
  captureFields();
  if (!profile.profileId) setProfileId(newId());
  profile.businessScale = scaleSelect.value; profile.theme = themeSelect.value;
  profile.package = scaleSelect.options[scaleSelect.selectedIndex].text; persistLocal();
  await fetch(GAS_ENDPOINT, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ action: 'save', profile: profileForApi() })
  });
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 900));
    try {
      const check = await jsonpGet({ action: 'get', profileId: profile.profileId });
      if (check.ok && check.profile && String(check.profile.profileId) === String(profile.profileId)) {
        setStatus('Profil tersimpan. ID untuk memuatnya kembali: ' + profile.profileId); return;
      }
      lastError = new Error(check.error || 'Profil belum dapat diverifikasi.');
    } catch (error) { lastError = error; }
  }
  throw new Error('Simpan belum dapat diverifikasi. ' + (lastError ? lastError.message : ''));
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function textChunks(value, limit = 900) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean); const chunks = []; let current = '';
  words.forEach(word => {
    if (current && (current + ' ' + word).length > limit) { chunks.push(current); current = word; }
    else current += (current ? ' ' : '') + word;
  });
  if (current) chunks.push(current); return chunks;
}
function textMarkup(value) { return textChunks(value).map(text => '<p>' + escapeHtml(text) + '</p>').join(''); }
function companyName() { return profile.companyName || 'Nama Perusahaan'; }
function innerPage(title, body, number, eyebrow = 'Company Profile') {
  return '<article class="preview-page content-page"><div class="page-topline"></div><p class="page-eyebrow">' + escapeHtml(eyebrow) +
    '</p><h2 class="mt-3 text-3xl font-semibold">' + escapeHtml(title) + '</h2><div class="content-body mt-8">' + body +
    '</div><div class="page-footer"><span>' + escapeHtml(companyName()) + '</span><span>' + number + '</span></div></article>';
}
function renderCover() {
  const cover = profile.assets.cover || {};
  const photo = cover.dataUrl ? '<img class="cover-photo" src="' + escapeHtml(cover.dataUrl) + '" alt="">' : '';
  return '<article class="preview-page cover-page">' + photo + '<div class="cover-overlay"></div><div class="cover-content"><div><div class="cover-mark">' +
    escapeHtml(companyName().slice(0, 1).toUpperCase()) + '</div><p class="cover-label mt-8">Company Profile</p></div><div><p class="text-sm uppercase tracking-widest text-white/70">' +
    escapeHtml(profile.industry || 'Profil Perusahaan') + '</p><h1 class="mt-4 text-5xl font-bold leading-tight">' + escapeHtml(companyName()) +
    '</h1><p class="cover-tagline mt-5">' + escapeHtml(profile.tagline || '') + '</p></div><p class="text-sm text-white/75">' + new Date().getFullYear() + '</p></div></article>';
}
function renderToc(entries, pageNumber, part, totalParts) {
  const rows = entries.map(item => '<div class="toc-row"><span>' + escapeHtml(item.title) + '</span><span>' + item.page + '</span></div>').join('');
  const title = totalParts > 1 ? 'Daftar Isi · ' + part : 'Daftar Isi';
  return '<article class="preview-page"><div class="page-topline"></div><p class="page-eyebrow">Overview</p><h2 class="mt-3 text-4xl font-semibold">' + title + '</h2><div class="toc-list">' +
    rows + '</div><div class="page-footer"><span>' + escapeHtml(companyName()) + '</span><span>' + pageNumber + '</span></div></article>';
}
function renderBackCover() {
  const image = profile.assets.backCover && profile.assets.backCover.dataUrl ? '<img class="cover-photo" src="' + escapeHtml(profile.assets.backCover.dataUrl) + '" alt="">' : '';
  const contacts = [['Alamat', profile.address], ['Telepon', profile.phone], ['Email', profile.email], ['Website', profile.website]]
    .filter(([, value]) => value).map(([label, value]) => '<div><span class="text-white/60">' + label + '</span><br>' + escapeHtml(value) + '</div>').join('');
  return '<article class="preview-page back-page">' + image + '<div class="cover-overlay"></div><div class="cover-content"><div><p class="cover-label">Terhubung dengan kami</p><h2 class="mt-4 text-4xl font-semibold">' +
    escapeHtml(companyName()) + '</h2></div><div class="back-contact">' + (contacts || '<p>Tambahkan informasi kontak pada formulir.</p>') +
    '</div><p class="text-sm text-white/70">' + escapeHtml(profile.tagline || '') + '</p></div></article>';
}
function renderTransition(number) {
  return '<article class="preview-page transition-page"><p class="page-eyebrow">Company Profile</p><h2 class="mt-5 text-4xl font-semibold">Membangun masa depan bersama</h2><p class="mt-5 max-w-xl text-lg">' +
    escapeHtml(profile.tagline || companyName()) + '</p><div class="page-footer"><span>' + escapeHtml(companyName()) + '</span><span>' + number + '</span></div></article>';
}
function buildPages() {
  const content = []; const entries = [];
  function add(title, body, eyebrow) {
    if (!body) return;
    const pageIndex = content.length;
    if (!entries.some(item => item.title === title)) entries.push({ title, index: pageIndex });
    content.push({ title, body, eyebrow: eyebrow || 'Company Profile' });
  }
  const historyParts = textChunks(profile.history || (companyName() + ' menyajikan profil perusahaan dan ruang lingkup bisnisnya pada dokumen ini.'), 1050);
  const about = [
    profile.industry ? '<p class="page-eyebrow">' + escapeHtml(profile.industry) + '</p>' : '',
    profile.tagline ? '<p class="text-xl font-medium">' + escapeHtml(profile.tagline) + '</p>' : '',
    textMarkup(historyParts[0] || '')
  ].join('');
  historyParts.forEach((part, index) => add(index ? 'Sejarah (lanjutan)' : 'Tentang Perusahaan', index ? textMarkup(part) : about));
  if (profile.vision || profile.mission) {
    const vm = [['Visi', profile.vision], ['Misi', profile.mission]].filter(([, value]) => value);
    vm.forEach(([label, value]) => textChunks(value, 850).forEach((part, index) =>
      add(index ? label + ' (lanjutan)' : (label === 'Visi' ? 'Visi & Misi' : 'Misi'), '<div class="data-card"><h3>' + label + '</h3>' + textMarkup(part) + '</div>')));
  }
  (profile.products || []).forEach((item, index) => {
    const title = item.title || 'Produk/Layanan ' + (index + 1);
    textChunks(item.description || 'Informasi produk/layanan dapat dilengkapi lebih lanjut.', 800).forEach((part, partIndex) =>
      add(partIndex ? title + ' (lanjutan)' : (index === 0 ? 'Produk & Layanan' : title),
        '<div class="data-card"><h3>' + escapeHtml(title) + '</h3>' + textMarkup(part) + '</div>', 'Our Offering'));
  });
  if (profile.organization) textChunks(profile.organization).forEach((part, index) => add(index ? 'Organisasi (lanjutan)' : 'Organisasi', textMarkup(part)));
  (profile.portfolio || []).forEach((item, index) => {
    const title = item.title || 'Proyek ' + (index + 1);
    const image = item.image && item.image.dataUrl ? '<img class="portfolio-image" src="' + escapeHtml(item.image.dataUrl) + '" alt="' + escapeHtml(title) + '">' : '';
    const year = item.year ? '<p class="page-eyebrow">' + escapeHtml(item.year) + '</p>' : '';
    textChunks(item.description || 'Dokumentasi proyek.', 650).forEach((part, partIndex) =>
      add(partIndex ? title + ' (lanjutan)' : (index === 0 ? 'Portofolio' : title), year + image +
        '<div class="data-card"><h3>' + escapeHtml(title) + '</h3>' + textMarkup(part) + '</div>', 'Selected Work'));
  });
  [['Legalitas', profile.legalitas], ['Operasional', profile.operationalData], ['Pencapaian', profile.achievementReport]].forEach(([label, value]) => {
    if (value) textChunks(value).forEach((part, index) => add(index ? label + ' (lanjutan)' : label, textMarkup(part)));
  });
  const contacts = [['Alamat', profile.address], ['Telepon', profile.phone], ['Email', profile.email], ['Website', profile.website]]
    .filter(([, value]) => value).map(([label, value]) => '<div class="data-card"><h3>' + label + '</h3><p>' + escapeHtml(value) + '</p></div>').join('');
  add('Kontak', '<p>' + escapeHtml(profile.tagline || 'Mari berdiskusi tentang peluang kolaborasi.') + '</p>' + (contacts || '<p>Tambahkan kontak perusahaan pada formulir.</p>'), 'Get in Touch');

  const tocSize = 10;
  const tocCount = Math.max(1, Math.ceil(entries.length / tocSize));
  const pages = [{ kind: 'cover' }];
  for (let i = 0; i < tocCount; i++) {
    pages.push({ kind: 'toc', entries: entries.slice(i * tocSize, (i + 1) * tocSize), number: i + 2, part: i + 1, totalParts: tocCount });
  }
  content.forEach((page, index) => pages.push({ kind: 'content', ...page, number: 2 + tocCount + index }));
  entries.forEach(entry => { entry.page = 2 + tocCount + entry.index; });
  // Replace TOC specs after final page numbers are known.
  for (const page of pages) if (page.kind === 'toc') page.entries = entries.slice((page.part - 1) * tocSize, page.part * tocSize);
  const padding = (4 - ((pages.length + 1) % 4)) % 4;
  for (let i = 0; i < padding; i++) pages.push({ kind: 'transition', number: pages.length + 1 });
  pages.push({ kind: 'back' });
  return pages;
}
function renderDocument() {
  const colors = THEMES[profile.theme] || THEMES.teal;
  Object.entries({ '--theme-ink': colors.ink, '--theme-accent': colors.accent, '--theme-soft': colors.soft, '--theme-text': colors.text })
    .forEach(([key, value]) => previewPages.style.setProperty(key, value));
  const pages = buildPages();
  previewPages.innerHTML = pages.map(page => page.kind === 'cover' ? renderCover() :
    page.kind === 'toc' ? renderToc(page.entries, page.number, page.part, page.totalParts) :
    page.kind === 'back' ? renderBackCover() :
    page.kind === 'transition' ? renderTransition(page.number) :
    innerPage(page.title, page.body, page.number, page.eyebrow)).join('');
  const range = { startup: '4–8', mid: '8–16', corporate: '20–40' }[profile.businessScale];
  document.querySelector('#pageCount').textContent = pages.length + ' halaman · target paket ' + range + ' · kelipatan 4';
}
async function openPreview() {
  captureFields(); profile.theme = themeSelect.value; persistLocal();
  previewDialog.showModal(); document.querySelector('#pageCount').textContent = 'Memuat halaman dan foto…';
  try { await hydrateAssets(); } catch (_) {}
  renderDocument();
}
async function exportPdf() {
  const button = document.querySelector('#exportPdfButton');
  if (!window.html2pdf) { setStatus('Library PDF belum termuat. Periksa koneksi, lalu coba lagi.', true); return; }
  button.disabled = true; button.textContent = 'Membuat PDF…'; previewPages.classList.add('is-exporting');
  const filename = (profile.companyName || 'company-profile').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.pdf';
  try {
    await html2pdf().set({
      margin: 0, filename, image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 2, useCORS: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }).from(previewPages).save();
    setStatus('PDF berhasil dibuat: ' + filename);
  } catch (error) { setStatus('PDF gagal dibuat. ' + (error.message || ''), true); }
  finally { previewPages.classList.remove('is-exporting'); button.disabled = false; button.textContent = 'Unduh PDF'; }
}
async function loadFromCloud(id) {
  if (!id) throw new Error('Masukkan ID profil yang ingin dimuat.');
  const response = await jsonpGet({ action: 'get', profileId: id });
  if (!response.ok || !response.profile) throw new Error(response.error || 'Profil tidak ditemukan.');
  profile = normalizeProfile({ ...response.profile, profileId: id });
  scaleSelect.value = profile.businessScale; themeSelect.value = profile.theme; profileIdInput.value = id;
  currentStep = 0; await hydrateAssets(); persistLocal(); render();
}
async function saveToCloud() {
  captureFields();
  if (!profile.profileId) profile.profileId = newId();
  profile.businessScale = scaleSelect.value; profile.theme = themeSelect.value;
  profile.package = scaleSelect.options[scaleSelect.selectedIndex].text; profileIdInput.value = profile.profileId; persistLocal();
  const clean = stripDataUrls(profile);
  const payload = { ...clean, products: JSON.stringify(clean.products || []), portfolio: JSON.stringify(clean.portfolio || []), assetsJson: JSON.stringify(clean.assets || {}) };
  await fetch(GAS_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ action: 'save', profile: payload }) });
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 900));
    try {
      const check = await jsonpGet({ action: 'get', profileId: profile.profileId });
      if (check.ok && check.profile && String(check.profile.profileId) === String(profile.profileId)) {
        setStatus('Profil tersimpan. ID untuk memuatnya kembali: ' + profile.profileId); return;
      }
      lastError = new Error(check.error || 'Profil belum dapat diverifikasi.');
    } catch (error) { lastError = error; }
  }
  throw new Error('Simpan belum dapat diverifikasi. ' + (lastError ? lastError.message : ''));
}
function jsonpGet(params) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cpgnJsonp_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script'); const url = new URL(GAS_ENDPOINT);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('callback', callbackName);
    const cleanup = () => { delete window[callbackName]; script.remove(); clearTimeout(timer); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Waktu tunggu API habis.')); }, 20000);
    window[callbackName] = payload => { cleanup(); resolve(payload); };
    script.onerror = () => { cleanup(); reject(new Error('Tidak dapat menghubungi API GAS.')); };
    script.src = url.toString(); document.head.append(script);
  });
}
function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Browser gagal membaca gambar.'));
    reader.readAsDataURL(file);
  });
}
async function waitForAsset(profileId, assetId) {
  let error;
  for (let i = 0; i < 5; i++) {
    try { const result = await jsonpGet({ action: 'getAsset', profileId, assetId }); if (result.ok && result.dataUrl) return result; error = new Error(result.error || 'Aset belum tersedia.'); }
    catch (e) { error = e; }
    await new Promise(resolve => setTimeout(resolve, 700));
  }
  throw new Error('Upload belum dapat diverifikasi. ' + (error ? error.message : ''));
}
async function uploadImage(file) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Ukuran gambar melebihi batas 1 MB.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Gunakan gambar JPG, PNG, atau WebP.');
  if (!profile.profileId) profile.profileId = newId();
  profileIdInput.value = profile.profileId; persistLocal();
  const dataUrl = await readDataUrl(file); const assetId = newId();
  setStatus('Mengunggah gambar ke Google Drive…');
  await fetch(GAS_ENDPOINT, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ action: 'upload', profileId: profile.profileId, assetId, name: file.name, mimeType: file.type, base64: dataUrl.split(',')[1] || '' })
  });
  return waitForAsset(profile.profileId, assetId);
}
async function hydrateAsset(owner) {
  if (!owner || !owner.assetId || owner.dataUrl || !profile.profileId) return;
  const result = await jsonpGet({ action: 'getAsset', profileId: profile.profileId, assetId: owner.assetId });
  if (result.ok && result.dataUrl) Object.assign(owner, result);
}
async function hydrateAssets() {
  profile.assets = profile.assets || {};
  const owners = [profile.assets.cover, profile.assets.backCover, ...(profile.portfolio || []).map(item => item.image)];
  return Promise.allSettled(owners.map(hydrateAsset));
}

function applyThemeControls() {
  scaleSelect.value = profile.businessScale; themeSelect.value = profile.theme; profileIdInput.value = profile.profileId || '';
}
document.querySelector('#backButton').addEventListener('click', () => {
  captureFields(); persistLocal(); if (currentStep > 0) { currentStep--; render(); }
});
document.querySelector('#nextButton').addEventListener('click', () => {
  captureFields(); if (!form.classList.contains('hidden') && !form.reportValidity()) return;
  persistLocal();
  if (currentStep < steps().length - 1) { currentStep++; render(); }
  else setStatus('Draft lokal tersimpan. Buka Preview & PDF atau simpan ke cloud.');
});
document.querySelector('#saveButton').addEventListener('click', async event => {
  const button = event.currentTarget; button.disabled = true; button.textContent = 'Menyimpan…'; setStatus('Menyimpan dan memverifikasi profil…');
  try { await saveToCloud(); } catch (error) { setStatus(error.message || 'Penyimpanan gagal.', true); }
  finally { button.disabled = false; button.textContent = 'Simpan ke cloud'; }
});
document.querySelector('#loadButton').addEventListener('click', async event => {
  const button = event.currentTarget; button.disabled = true; button.textContent = 'Memuat…'; setStatus('Memuat profil…');
  try { await loadFromCloud(profileIdInput.value.trim()); setStatus('Profil dan gambar berhasil dimuat.'); }
  catch (error) { setStatus(error.message || 'Profil gagal dimuat.', true); }
  finally { button.disabled = false; button.textContent = 'Muat profil dari cloud'; }
});
document.querySelector('#previewButton').addEventListener('click', openPreview);
document.querySelector('#closePreviewButton').addEventListener('click', () => previewDialog.close());
document.querySelector('#exportPdfButton').addEventListener('click', exportPdf);
scaleSelect.addEventListener('change', () => {
  captureFields(); profile.businessScale = scaleSelect.value; persistLocal(); currentStep = 0; render();
});
themeSelect.addEventListener('change', () => {
  profile.theme = themeSelect.value; persistLocal(); if (previewDialog.open) renderDocument();
});
profileIdInput.addEventListener('change', () => { profile.profileId = profileIdInput.value.trim(); persistLocal(); });
previewDialog.addEventListener('click', event => { if (event.target === previewDialog) previewDialog.close(); });
applyThemeControls(); render();
