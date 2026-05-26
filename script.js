// ===== ADMIN CREDENTIALS =====
const ADMIN_NAME = 'gpx';
const ADMIN_PASS = 'Asep_1ndo37';

// ===== STORAGE KEYS =====
const LOCK_KEY    = 'gpx_lock';
const TICKETS_KEY = 'gpx_tickets';
const BLOCKED_KEY = 'gpx_blocked';

// ===== STATE =====
const state = {
  username: '', email: '',
  generatedCode: '', codeRevealed: false, countdownActive: false,
};

// ===== 24 EMOJI MENGAMBANG =====
const EMOJI_LIST = [
  '🌟','⭐','💫','✨','🎮','🎯','🏆','🎪',
  '🎭','🎨','🎲','🚀','🎸','🎵','🎉','🎊',
  '🌈','🦋','🌸','🍀','🎀','💎','👑','🔥'
];

function createFloatingEmojis() {
  const layer = document.getElementById('emoji-layer');
  EMOJI_LIST.forEach((emoji, i) => {
    const el = document.createElement('div');
    el.className = 'float-emoji';
    el.textContent = emoji;
    // posisi random
    el.style.left   = (Math.random() * 95) + 'vw';
    el.style.top    = (Math.random() * 90) + 'vh';
    // durasi & delay random agar semua bergerak beda
    const dur   = (6 + Math.random() * 8).toFixed(2) + 's';
    const delay = (Math.random() * 5).toFixed(2) + 's';
    el.style.animationDuration  = dur;
    el.style.animationDelay     = delay;
    // ukuran sedikit bervariasi
    const size = 22 + Math.floor(Math.random() * 12);
    el.style.fontSize = size + 'px';
    layer.appendChild(el);
  });
}

// ===== UTILS =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.scrollTop = 0; }
}

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function generateVerifiedId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function getTodayFormatted() {
  const now = new Date();
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Wednesday'];
  const months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  return `${now.getDate()} / ${months[now.getMonth()]} / ${days[now.getDay()]} / ${now.getFullYear()}`;
}

function getTimestamp() {
  const now  = new Date();
  let h = now.getHours();
  const m   = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function getNextSunday() {
  const now  = new Date();
  const diff = now.getDay() === 0 ? 7 : 7 - now.getDay();
  const sun  = new Date(now);
  sun.setDate(now.getDate() + diff);
  sun.setHours(0, 0, 0, 0);
  return sun;
}

function getNextSundayLabel() {
  const s = getNextSunday();
  const months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  return `tanggal: ${s.getDate()} / ${months[s.getMonth()]} / Sunday / ${s.getFullYear()}`;
}

// ===== LOCK =====
function checkLock() {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return false;
    const until = new Date(JSON.parse(raw).until);
    if (new Date() < until) return until;
    localStorage.removeItem(LOCK_KEY);
  } catch { localStorage.removeItem(LOCK_KEY); }
  return false;
}

function setLock() {
  localStorage.setItem(LOCK_KEY, JSON.stringify({ until: getNextSunday().toISOString() }));
}

// ===== TICKETS =====
function getTickets() {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]'); }
  catch { return []; }
}

function saveTicket(username, email, date, time, verifiedId) {
  const list = getTickets();
  list.unshift({ username, email, date, time, verifiedId, ts: Date.now() });
  localStorage.setItem(TICKETS_KEY, JSON.stringify(list));
}

// ===== BLOCKED =====
function getBlocked() {
  try { return JSON.parse(localStorage.getItem(BLOCKED_KEY) || '[]'); }
  catch { return []; }
}

function blockUser(username) {
  const list = getBlocked();
  if (!list.includes(username)) {
    list.push(username);
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(list));
  }
}

function unblockUser(username) {
  const list = getBlocked().filter(u => u !== username);
  localStorage.setItem(BLOCKED_KEY, JSON.stringify(list));
}

function isBlocked(username) {
  return getBlocked().includes(username);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  createFloatingEmojis();
  if (checkLock()) {
    showLockedPage();
  } else {
    showPage('page-home');
  }
  setupAdminFloatBtn();
  setupListeners();
});

function showLockedPage() {
  showPage('page-locked');
  document.getElementById('locked-date-display').textContent = getNextSundayLabel();
}

// ===== FLOATING ADMIN BUTTON =====
function setupAdminFloatBtn() {
  document.getElementById('btn-admin-float').addEventListener('click', () => {
    showPage('page-admin-login');
  });
}

// ===== SHAKE =====
function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!document.getElementById('sk')) {
    const s = document.createElement('style');
    s.id = 'sk';
    s.textContent = `@keyframes sk{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`;
    document.head.appendChild(s);
  }
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'sk 0.45s ease';
  el.style.borderColor = '#ef4444';
  setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 600);
}

// ===== RESET =====
function resetAll() {
  state.username = ''; state.email = '';
  state.generatedCode = ''; state.codeRevealed = false; state.countdownActive = false;

  ['input-username','input-email','input-code'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });

  const ic = document.getElementById('input-code'); if (ic) ic.placeholder = '_ _ _ _';

  const ca = document.getElementById('code-area'); if (ca) ca.style.display = 'none';
  const rc = document.getElementById('revealed-code'); if (rc) rc.style.display = 'none';
  const cb = document.getElementById('countdown-box'); if (cb) cb.style.display = 'flex';
  const cn = document.getElementById('countdown-num'); if (cn) cn.textContent = '20';
  const btn = document.getElementById('btn-get-code');
  if (btn) { btn.disabled = false; btn.textContent = '📋 Ambil Kode'; }
}

// ===== ALL LISTENERS =====
function setupListeners() {

  // HOME
  document.getElementById('btn-ticket').addEventListener('click', () => showPage('page-username'));

  // USERNAME
  function doUsername() {
    const v = document.getElementById('input-username').value.trim();
    if (!v) { shakeInput('input-username'); return; }
    state.username = v;
    showPage('page-email');
  }
  document.getElementById('btn-username-submit').addEventListener('click', doUsername);
  document.getElementById('input-username').addEventListener('keydown', e => { if (e.key==='Enter') doUsername(); });

  // EMAIL
  function doEmail() {
    const v = document.getElementById('input-email').value.trim();
    if (!v) { shakeInput('input-email'); return; }
    state.email = v;
    showPage('page-code');
  }
  document.getElementById('btn-email-submit').addEventListener('click', doEmail);
  document.getElementById('input-email').addEventListener('keydown', e => { if (e.key==='Enter') doEmail(); });

  // GET CODE
  document.getElementById('btn-get-code').addEventListener('click', () => {
    if (state.countdownActive) return;
    state.countdownActive = true;
    state.generatedCode   = generateCode();

    const codeArea = document.getElementById('code-area');
    const cdBox    = document.getElementById('countdown-box');
    const cdNum    = document.getElementById('countdown-num');
    const revCode  = document.getElementById('revealed-code');
    const theCode  = document.getElementById('the-code');
    const btn      = document.getElementById('btn-get-code');

    codeArea.style.display = 'block';
    cdBox.style.display    = 'flex';
    revCode.style.display  = 'none';
    btn.disabled           = true;
    btn.textContent        = '⏳ Menghitung...';

    let secs = 20;
    cdNum.textContent = secs;

    const iv = setInterval(() => {
      secs--;
      cdNum.textContent = secs;
      if (secs <= 0) {
        clearInterval(iv);
        cdBox.style.display   = 'none';
        theCode.textContent   = state.generatedCode;
        revCode.style.display = 'block';
        state.codeRevealed    = true;
        btn.textContent       = '✅ Code apprear!';
      }
    }, 1000);
  });

  // SUBMIT CODE
  function doCode() {
    const v = document.getElementById('input-code').value.trim();
    if (!state.codeRevealed) { alert('⚠️ click this button "Make code"!'); return; }
    if (v !== state.generatedCode) {
      shakeInput('input-code');
      document.getElementById('input-code').value = '';
      const inp = document.getElementById('input-code');
      inp.placeholder = '❌ code wrong!';
      setTimeout(() => { inp.placeholder = '_ _ _ _'; }, 2000);
      return;
    }

    showPage('page-loading');
    setTimeout(() => {
      const dateStr     = getTodayFormatted();
      const timeStr     = getTimestamp();
      const verifiedId  = generateVerifiedId();

      saveTicket(state.username, state.email, dateStr, timeStr, verifiedId);

      document.getElementById('cert-username').textContent   = state.username;
      document.getElementById('cert-date').textContent       = dateStr;
      document.getElementById('cert-verified-id').textContent = verifiedId;

      const circle = document.getElementById('check-circle');
      circle.style.animation = 'none';
      void circle.offsetWidth;
      circle.style.animation = 'checkPop 0.8s cubic-bezier(0.34,1.56,0.64,1) both';

      showPage('page-cert');
      setLock();
    }, 5000);
  }
  document.getElementById('btn-code-submit').addEventListener('click', doCode);
  document.getElementById('input-code').addEventListener('keydown', e => { if (e.key==='Enter') doCode(); });

  // CERT BACK
  document.getElementById('btn-back').addEventListener('click', () => {
    if (checkLock()) showLockedPage();
    else { resetAll(); showPage('page-home'); }
  });

  // ADMIN LOGIN
  function doAdminLogin() {
    const name  = document.getElementById('admin-name').value.trim();
    const pass  = document.getElementById('admin-pass').value;
    const errEl = document.getElementById('admin-error');
    if (name === ADMIN_NAME && pass === ADMIN_PASS) {
      errEl.style.display = 'none';
      document.getElementById('admin-name').value = '';
      document.getElementById('admin-pass').value = '';
      loadAdminPanel();
      showPage('page-admin');
    } else {
      errEl.style.display = 'block';
      errEl.style.animation = 'none';
      void errEl.offsetWidth;
      errEl.style.animation = 'errShake 0.4s ease';
      document.getElementById('admin-pass').value = '';
    }
  }
  document.getElementById('btn-admin-login').addEventListener('click', doAdminLogin);
  document.getElementById('admin-pass').addEventListener('keydown', e => { if (e.key==='Enter') doAdminLogin(); });

  // ADMIN BACK
  document.getElementById('btn-admin-back').addEventListener('click', () => {
    document.getElementById('admin-name').value = '';
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-error').style.display = 'none';
    if (checkLock()) showLockedPage(); else showPage('page-home');
  });

  // ADMIN LOGOUT
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    if (checkLock()) showLockedPage(); else showPage('page-home');
  });

  // HAPUS SEMUA
  document.getElementById('btn-clear-data').addEventListener('click', () => {
    if (confirm('⚠️ Yakin mau hapus semua data ticket?')) {
      localStorage.removeItem(TICKETS_KEY);
      loadAdminPanel();
    }
  });
}

// ===== LOAD ADMIN PANEL =====
function loadAdminPanel() {
  const tickets = getTickets();
  const blocked = getBlocked();
  const tbody   = document.getElementById('admin-tbody');
  const emptyEl = document.getElementById('admin-empty');
  const tableEl = document.getElementById('admin-table');

  // Stats
  document.getElementById('stat-total').textContent   = tickets.length;
  document.getElementById('stat-blocked').textContent = blocked.length;

  const todayKey   = new Date().toLocaleDateString('id-ID');
  const todayCnt   = tickets.filter(t => new Date(t.ts).toLocaleDateString('id-ID') === todayKey).length;
  document.getElementById('stat-today').textContent = todayCnt;

  // Ticket table
  tbody.innerHTML = '';
  if (tickets.length === 0) {
    tableEl.style.display = 'none';
    emptyEl.style.display = 'block';
  } else {
    tableEl.style.display = 'table';
    emptyEl.style.display = 'none';

    tickets.forEach((t, i) => {
      const blocked_flag = isBlocked(t.username);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>
          <strong>${escapeHtml(t.username)}</strong>
          ${blocked_flag ? '<span class="badge-blocked">DIBLOKIR</span>' : ''}
        </td>
        <td>${escapeHtml(t.email)}</td>
        <td class="verified-id-cell">${escapeHtml(t.verifiedId || '-')}</td>
        <td>${escapeHtml(t.date || '-')}</td>
        <td>${escapeHtml(t.time || '-')}</td>
        <td>
          ${blocked_flag
            ? `<button class="btn-unblokir" data-user="${escapeHtml(t.username)}">✅ Unblokir</button>`
            : `<button class="btn-blokir" data-user="${escapeHtml(t.username)}">🚫 Blokir</button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Blokir event
    tbody.querySelectorAll('.btn-blokir').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = btn.dataset.user;
        if (confirm(`Blokir "${user}"?`)) { blockUser(user); loadAdminPanel(); }
      });
    });
    tbody.querySelectorAll('.btn-unblokir').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = btn.dataset.user;
        if (confirm(`Unblokir "${user}"?`)) { unblockUser(user); loadAdminPanel(); }
      });
    });
  }

  // Blocked table
  const blockedTbody = document.getElementById('blocked-tbody');
  const blockedTable = document.getElementById('blocked-table');
  const blockedEmpty = document.getElementById('blocked-empty');
  blockedTbody.innerHTML = '';

  if (blocked.length === 0) {
    blockedTable.style.display = 'none';
    blockedEmpty.style.display = 'block';
  } else {
    blockedTable.style.display = 'table';
    blockedEmpty.style.display = 'none';
    blocked.forEach((username, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(username)}</strong></td>
        <td><button class="btn-unblokir" data-user="${escapeHtml(username)}">✅ Unblokir</button></td>
      `;
      blockedTbody.appendChild(tr);
    });
    blockedTbody.querySelectorAll('.btn-unblokir').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = btn.dataset.user;
        if (confirm(`Unblokir "${user}"?`)) { unblockUser(user); loadAdminPanel(); }
      });
    });
  }
}
