// GAS deployment URL. This is a public endpoint; do not put private API keys here.
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwGNdhNKtUSSwt0IcXJzpc2s0R8qE-HarCTtL61PwjMonGZe7li3E0wDwgQqDmMdwiuWA/exec';
const LOCAL_DRAFT_KEY = 'cpgnDraftV1';

const commonSteps = [
  { title: 'Identitas perusahaan', hint: 'Mulai dari informasi dasar dan kontak.', fields: [
    ['companyName', 'Nama perusahaan', 'text', true], ['tagline', 'Tagline', 'text'],
    ['industry', 'Industri', 'text'], ['address', 'Alamat', 'textarea'],
    ['phone', 'Telepon', 'tel'], ['email', 'Email', 'email'], ['website', 'Website', 'url']
  ]},
  { title: 'Cerita & arah bisnis', hint: 'Masukkan poin faktual. AI Copywriter akan ditambahkan pada fase berikutnya.', fields: [
    ['history', 'Sejarah perusahaan', 'textarea'], ['vision', 'Visi', 'textarea'], ['mission', 'Misi', 'textarea']
  ]},
  { title: 'Produk dan layanan', hint: 'Jelaskan penawaran utama kepada calon klien.', fields: [
    ['products', 'Produk / layanan', 'textarea']
  ]}
];
const scaleSteps = {
  startup: [],
  mid: [{ title: 'Organisasi & portofolio', hint: 'Bagian tambahan untuk perusahaan menengah.', fields: [
    ['organization', 'Struktur organisasi', 'textarea'], ['portfolio', 'Portofolio / dokumentasi', 'textarea'], ['legalitas', 'Legalitas', 'textarea']
  ]}],
  corporate: [
    { title: 'Organisasi & portofolio', hint: 'Bagian tambahan untuk perusahaan korporat.', fields: [
      ['organization', 'Struktur organisasi', 'textarea'], ['portfolio', 'Portofolio / dokumentasi', 'textarea'], ['legalitas', 'Legalitas', 'textarea']
    ]},
    { title: 'Operasional & pencapaian', hint: 'Rangkuman data kompleks dan laporan pencapaian.', fields: [
      ['operationalData', 'Data operasional kompleks', 'textarea'], ['achievementReport', 'Laporan pencapaian', 'textarea']
    ]}
  ]
};
const reviewStep = { title: 'Tinjau profil', hint: 'Periksa ringkasan, lalu simpan ke cloud.', fields: [] };
const form = document.querySelector('#profileForm');
const nav = document.querySelector('#stepNav');
const scaleSelect = document.querySelector('#businessScale');
const profileIdInput = document.querySelector('#profileId');
const statusEl = document.querySelector('#status');
let currentStep = 0;
let profile = readLocalDraft();

function readLocalDraft() {
  try { return JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY) || '{}'); }
  catch (_) { return {}; }
}
function persistLocal() {
  try { localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(profile)); }
  catch (_) { setStatus('Browser tidak dapat menyimpan draft lokal. Ekspor/simpan data sebelum menutup halaman.', true); }
}
function steps() { return [...commonSteps, ...scaleSteps[scaleSelect.value], reviewStep]; }
function captureFields() {
  for (const [key, value] of new FormData(form).entries()) profile[key] = value;
}
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = 'mt-4 min-h-5 text-sm ' + (isError ? 'text-rose-700' : 'text-slate-600');
}
function renderReview() {
  const target = document.querySelector('#reviewSummary');
  target.replaceChildren();
  const items = [
    ['Perusahaan', profile.companyName], ['Skala', scaleSelect.options[scaleSelect.selectedIndex].text],
    ['Industri', profile.industry], ['Produk/layanan', profile.products], ['ID profil', profile.profileId]
  ].filter(([, value]) => value);
  if (!items.length) {
    const empty = document.createElement('p'); empty.className = 'text-sm text-slate-500'; empty.textContent = 'Belum ada informasi. Kembali ke langkah sebelumnya untuk mengisi profil.'; target.append(empty); return;
  }
  const list = document.createElement('dl'); list.className = 'grid gap-4 sm:grid-cols-2';
  for (const [label, value] of items) {
    const row = document.createElement('div');
    const dt = document.createElement('dt'); dt.className = 'text-xs font-semibold uppercase tracking-wide text-slate-500'; dt.textContent = label;
    const dd = document.createElement('dd'); dd.className = 'mt-1 whitespace-pre-wrap text-sm text-slate-800'; dd.textContent = value;
    row.append(dt, dd); list.append(row);
  }
  target.append(list);
}
function render() {
  const list = steps();
  currentStep = Math.min(currentStep, list.length - 1);
  const step = list[currentStep];
  document.querySelector('#stepCount').textContent = 'Langkah ' + (currentStep + 1) + ' dari ' + list.length;
  document.querySelector('#stepTitle').textContent = step.title;
  document.querySelector('#stepHint').textContent = step.hint;

  nav.replaceChildren();
  list.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.step = String(index);
    button.setAttribute('aria-current', index === currentStep ? 'step' : 'false');
    button.className = 'step w-full rounded-xl px-3 py-2 text-left text-sm ' + (index === currentStep ? '' : 'text-slate-600 hover:bg-slate-50');
    button.textContent = String(index + 1).padStart(2, '0') + '  ' + item.title;
    button.addEventListener('click', () => { captureFields(); persistLocal(); currentStep = index; render(); });
    nav.append(button);
  });

  form.replaceChildren();
  for (const [key, label, type, required] of step.fields) {
    const wrapper = document.createElement('label'); wrapper.className = 'block';
    const caption = document.createElement('span'); caption.className = 'mb-2 block text-sm font-medium'; caption.textContent = label + (required ? ' *' : '');
    const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    input.name = key; input.className = 'field'; input.value = profile[key] || '';
    if (type === 'textarea') { input.classList.add('min-h-28'); input.placeholder = 'Tulis poin atau informasi di sini...'; }
    else { input.type = type; input.placeholder = label; }
    if (required) input.required = true;
    input.addEventListener('input', () => { profile[key] = input.value; persistLocal(); });
    wrapper.append(caption, input); form.append(wrapper);
  }
  const isReview = currentStep === list.length - 1;
  form.classList.toggle('hidden', isReview);
  const summary = document.querySelector('#reviewSummary');
  summary.classList.toggle('hidden', !isReview);
  if (isReview) renderReview();
  document.querySelector('#backButton').disabled = currentStep === 0;
  document.querySelector('#backButton').classList.toggle('opacity-40', currentStep === 0);
  document.querySelector('#nextButton').textContent = isReview ? 'Selesai' : 'Lanjut →';
}
function setProfileId(value) {
  profile.profileId = value || '';
  profileIdInput.value = profile.profileId;
  persistLocal();
}
function jsonpGet(params) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cpgnJsonp_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    const url = new URL(GAS_ENDPOINT);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('callback', callbackName);
    const cleanup = () => { delete window[callbackName]; script.remove(); clearTimeout(timer); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Waktu tunggu API habis.')); }, 15000);
    window[callbackName] = payload => { cleanup(); resolve(payload); };
    script.onerror = () => { cleanup(); reject(new Error('Tidak dapat menghubungi API GAS.')); };
    script.src = url.toString();
    document.head.append(script);
  });
}
async function loadFromCloud(id) {
  if (!id) throw new Error('Masukkan ID profil yang ingin dimuat.');
  const response = await jsonpGet({ action: 'get', profileId: id });
  if (!response.ok || !response.profile) throw new Error(response.error || 'Profil tidak ditemukan.');
  profile = { ...response.profile, profileId: id };
  if (!scaleSteps[profile.businessScale]) profile.businessScale = 'startup';
  scaleSelect.value = profile.businessScale;
  setProfileId(id);
  currentStep = 0;
  persistLocal();
  render();
}
async function saveToCloud() {
  captureFields();
  if (!profile.profileId) setProfileId(crypto.randomUUID());
  profile.businessScale = scaleSelect.value;
  profile.package = scaleSelect.options[scaleSelect.selectedIndex].text;
  persistLocal();
  // text/plain keeps this a simple cross-origin POST. GAS ContentService may return an opaque redirect.
  await fetch(GAS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ action: 'save', profile })
  });
  // Verify the write by reading the same profile through the JSONP endpoint.
  let lastError;
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 500 : 900));
    try {
      const check = await jsonpGet({ action: 'get', profileId: profile.profileId });
      if (check.ok && check.profile && String(check.profile.profileId) === String(profile.profileId)) {
        setStatus('Profil berhasil disimpan ke cloud. Simpan ID ini untuk memuatnya kembali: ' + profile.profileId);
        return;
      }
      lastError = new Error(check.error || 'Profil belum dapat diverifikasi.');
    } catch (error) { lastError = error; }
  }
  throw new Error('Request terkirim, tetapi penyimpanan belum dapat diverifikasi. Periksa deployment GAS dan coba muat lagi. ' + (lastError ? lastError.message : ''));
}

scaleSelect.value = scaleSteps[profile.businessScale] ? profile.businessScale : 'startup';
profileIdInput.value = profile.profileId || '';
document.querySelector('#backButton').addEventListener('click', () => {
  captureFields(); persistLocal();
  if (currentStep > 0) { currentStep--; render(); }
});
document.querySelector('#nextButton').addEventListener('click', () => {
  captureFields();
  if (!form.classList.contains('hidden') && !form.reportValidity()) return;
  persistLocal();
  if (currentStep < steps().length - 1) { currentStep++; render(); }
  else setStatus('Draft lokal tersimpan. Gunakan Simpan ke cloud untuk membuat salinan di Google Sheets.');
});
document.querySelector('#saveButton').addEventListener('click', async event => {
  const button = event.currentTarget; button.disabled = true; button.textContent = 'Menyimpan…';
  setStatus('Menyimpan profil dan memverifikasi hasilnya…');
  try { await saveToCloud(); }
  catch (error) { setStatus(error.message || 'Penyimpanan gagal.', true); }
  finally { button.disabled = false; button.textContent = 'Simpan ke cloud'; }
});
document.querySelector('#loadButton').addEventListener('click', async event => {
  const button = event.currentTarget; button.disabled = true; button.textContent = 'Memuat…';
  const id = profileIdInput.value.trim();
  setStatus('Memuat profil dari cloud…');
  try { await loadFromCloud(id); setStatus('Profil berhasil dimuat dari cloud.'); }
  catch (error) { setStatus(error.message || 'Profil gagal dimuat.', true); }
  finally { button.disabled = false; button.textContent = 'Muat profil dari cloud'; }
});
profileIdInput.addEventListener('change', () => setProfileId(profileIdInput.value.trim()));
scaleSelect.addEventListener('change', () => {
  captureFields(); profile.businessScale = scaleSelect.value; persistLocal(); currentStep = 0; render();
});
render();
