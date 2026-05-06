
const CONFIG = {
  wa: '6281919573190',
  ig: 'https://www.instagram.com/bikinlaris.digital/',
  tiktok: 'https://www.tiktok.com/@bikinlaris.digital?_r=1&_t=zs-95ljznvvpkq',
  gmap: 'https://maps.app.goo.gl/UjdAfbe2yXpU6PvZA',


  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyDlN7atSPKZVzECiBwV8x45Pj2OmBYZUKzmq-MmWRUV3Zpz8cSNFts1hp15cm7u-3rvg/exec',
};


let orderState = {
  nama: '', wa: '', usaha: '', alamat: '',
  jasa: '', catatan: '',
};
let currentStep = 1;


function openSocial(platform) {
  const urls = {
    ig: CONFIG.ig,
    tiktok: CONFIG.tiktok,
    gmap: CONFIG.gmap,
    wa: `https://wa.me/${CONFIG.wa}?text=Haloo%20Admin%20Saya%20Mau%20Order%20Jasa%20Digitalisasi%20UMKM`,
  };
  if (urls[platform]) window.open(urls[platform], '_blank');
}

function openOrderForm(jasaName) {
  orderState = { nama: '', wa: '', usaha: '', alamat: '', jasa: jasaName, catatan: '' };
  resetModal();
  document.getElementById('orderModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  
  if (jasaName) {
    setTimeout(() => {
      const opts = document.querySelectorAll('.service-opt');
      opts.forEach(o => {
        o.classList.toggle('selected', o.dataset.val === jasaName);
      });
      updateSummary();
    }, 50);
  }
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('orderModal')) closeOrderModal();
}

function resetModal() {
  currentStep = 1;
  showStep(1);
  document.getElementById('inputNama').value = '';
  document.getElementById('inputWA').value = '';
  document.getElementById('inputUsaha').value = '';
  document.getElementById('inputAlamat').value = '';
  document.getElementById('inputCatatan').value = '';
  document.querySelectorAll('.service-opt').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
  hideError();
  resetBtn();
}


function showStep(n) {
  currentStep = n;
  document.querySelectorAll('.form-step').forEach((s, i) => {
    s.classList.toggle('hidden', i + 1 !== n);
  });


  const pct = n === 1 ? 33 : n === 2 ? 66 : 100;
  document.getElementById('progressBar').style.width = pct + '%';


  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('dot' + i);
    dot.classList.remove('active', 'done');
    if (i < n) dot.classList.add('done');
    else if (i === n) dot.classList.add('active');
  }
  for (let i = 1; i <= 2; i++) {
    const line = document.getElementById('line' + i);
    line.classList.toggle('done', i < n);
  }


  document.querySelector('.modal-sheet').scrollTop = 0;
}

function goStep1() { showStep(1); }

function goStep2() {
  const nama = document.getElementById('inputNama').value.trim();
  const wa = document.getElementById('inputWA').value.trim();
  const usaha = document.getElementById('inputUsaha').value.trim();
  const alamat = document.getElementById('inputAlamat').value.trim();

  let valid = true;
  [
    ['inputNama', nama],
    ['inputWA', wa],
    ['inputUsaha', usaha],
    ['inputAlamat', alamat],
  ].forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!val) { el.classList.add('error'); valid = false; }
    else el.classList.remove('error');
  });

  if (!valid) {
    shakeModal();
    return;
  }

  if (!/^0?8[0-9]{8,11}$/.test(wa.replace(/\s/g, ''))) {
    document.getElementById('inputWA').classList.add('error');
    shakeModal();
    return;
  }

  orderState.nama = nama;
  orderState.wa = wa.startsWith('0') ? wa.slice(1) : wa;
  orderState.usaha = usaha;
  orderState.alamat = alamat;

  updateSummary();
  showStep(2);
}

function selectService(el) {
  document.querySelectorAll('.service-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  orderState.jasa = el.dataset.val;
  document.getElementById('sumJasa').textContent = el.dataset.val;
}

function updateSummary() {
  document.getElementById('sumNama').textContent = orderState.nama || '—';
  document.getElementById('sumWA').textContent = orderState.wa ? '+62' + orderState.wa : '—';
  document.getElementById('sumUsaha').textContent = orderState.usaha || '—';
  document.getElementById('sumJasa').textContent = orderState.jasa || 'Belum dipilih';
}

// ─────────────────────────────────────────────
//  SUBMIT ORDER → Google Sheets
// ─────────────────────────────────────────────
async function submitOrder() {
  const catatan = document.getElementById('inputCatatan').value.trim();
  orderState.catatan = catatan;

  if (!orderState.jasa) {
    showError('Silakan pilih jasa terlebih dahulu.');
    shakeModal();
    return;
  }

  hideError();
  setLoadingBtn(true);

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const payload = {
    timestamp,
    nama: orderState.nama,
    wa: '+62' + orderState.wa,
    usaha: orderState.usaha,
    alamat: orderState.alamat,
    jasa: orderState.jasa,
    catatan: orderState.catatan || '-',
    status: 'Menunggu Pembayaran',
  };

  try {
    if (CONFIG.APPS_SCRIPT_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
      // Demo mode: skip API call, langsung ke step 3
      console.warn('Apps Script URL belum dikonfigurasi. Berjalan dalam mode demo.');
      await fakeDelay(800);
    } else {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // no-cors returns opaque response, treat as success
    }

    setLoadingBtn(false);
    document.getElementById('successDesc').textContent =
      `Halo ${orderState.nama}, tim kami akan menghubungi ${'+62' + orderState.wa} segera setelah pembayaran dikonfirmasi.`;
    showStep(3);

  } catch (err) {
    setLoadingBtn(false);
    showError('Gagal mengirim data. Coba lagi atau hubungi kami via WhatsApp.');
    console.error(err);
  }
}

function fakeDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
//  CONFIRM VIA WHATSAPP
// ─────────────────────────────────────────────
function confirmViaWA() {
  const text = encodeURIComponent(
    `Halo Admin BikinLaris! 👋\n\n` +
    `Saya sudah melakukan pembayaran QRIS untuk order berikut:\n\n` +
    `📋 *Detail Order*\n` +
    `• Nama: ${orderState.nama}\n` +
    `• Usaha: ${orderState.usaha}\n` +
    `• Alamat: ${orderState.alamat}\n` +
    `• Jasa: ${orderState.jasa}\n` +
    (orderState.catatan && orderState.catatan !== '-' ? `• Catatan: ${orderState.catatan}\n` : '') +
    `\nMohon dikonfirmasi ya, terima kasih! 🙏`
  );
  window.open(`https://wa.me/${CONFIG.wa}?text=${text}`, '_blank');
}

// ─────────────────────────────────────────────
//  UI HELPERS
// ─────────────────────────────────────────────
function setLoadingBtn(loading) {
  const btn = document.getElementById('btnSubmit');
  const text = document.getElementById('btnSubmitText');
  const icon = document.getElementById('btnSubmitIcon');
  const spinner = document.getElementById('btnSpinner');
  btn.disabled = loading;
  text.textContent = loading ? 'Mengirim...' : 'Kirim & Lanjut Bayar';
  icon.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

function resetBtn() {
  const btn = document.getElementById('btnSubmit');
  const text = document.getElementById('btnSubmitText');
  const icon = document.getElementById('btnSubmitIcon');
  const spinner = document.getElementById('btnSpinner');
  btn.disabled = false;
  text.textContent = 'Kirim & Lanjut Bayar';
  icon.classList.remove('hidden');
  spinner.classList.add('hidden');
}

function showError(msg) {
  const el = document.getElementById('submitError');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideError() {
  document.getElementById('submitError').classList.add('hidden');
}

function shakeModal() {
  const sheet = document.querySelector('.modal-sheet');
  sheet.style.animation = 'none';
  sheet.offsetHeight; // reflow
  sheet.style.animation = 'shake 0.3s ease';
  setTimeout(() => { sheet.style.animation = ''; }, 300);
}

// Add shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);
