const iconPaths = {
  bell: '<path d="M10 21a2 2 0 0 0 4 0"/><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="3"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M10 17h4"/>',
  layout: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 7.4A9 9 0 1 1 12 3Z"/>',
  package: '<path d="m7.5 4.3 9 5.2"/><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  queue: '<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/><path d="m17 15 3 3-3 3"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.7-2.7L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.7-6.3L21 8"/><path d="M21 3v5h-5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};

const state = {
  data: null,
  page: 1,
  pageSize: 6,
  sessionQuery: '',
  sessionFilter: 'all',
  hiddenLogs: false,
  chartPoints: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const svgIcon = (name) => `<svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ''}</svg>`;

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = svgIcon(el.dataset.icon);
  });
}

function statusMeta(data = {}) {
  const raw = String(data.pairingStatus || '').toLowerCase();
  if (data.connected) return { label: 'Online', className: 'status-online' };
  if (raw.includes('restart')) return { label: 'Restarting', className: 'status-restarting' };
  if (raw.includes('connect') || raw.includes('start') || raw.includes('pair')) return { label: 'Connecting', className: 'status-connecting' };
  return { label: 'Offline', className: 'status-offline' };
}

function badge(label, className = '') {
  return `<span class="ds-badge ${className}"><span class="status-dot"></span><span>${escapeHtml(label)}</span></span>`;
}

function setStatusBadge(selector, meta) {
  const el = $(selector);
  if (!el) return;
  el.className = `ds-badge ${meta.className}`;
  el.innerHTML = '<span class="status-dot"></span><span>' + meta.label + '</span>';
}

function metricCards(data) {
  const cards = [
    ['Bot Status', statusMeta(data).label, data.pairingStatus || 'Realtime connection state', statusMeta(data).className],
    ['Uptime', data.uptime || '-', 'Process runtime', 'accent-cyan'],
    ['Memory', data.memoryUsage || '-', 'Resident set size', 'accent-purple'],
    ['CPU Load', data.cpuUsage || '-', '1 minute average', ''],
    ['Sessions', `${data.totalSession || 0}/${data.maxSession || '-'}`, 'Active bot capacity', ''],
    ['Groups', data.totalGroup || 0, 'Joined group chats', 'status-online'],
    ['Users', data.totalUser || 0, 'Known users', ''],
    ['Chats', data.totalChat || 0, 'Tracked conversations', '']
  ];
  return cards.map(([label, value, meta, accent]) => `
    <article class="ds-card card-pad">
      <p class="card-kicker">${escapeHtml(label)}</p>
      <p class="metric-value ${accent}">${escapeHtml(value)}</p>
      <p class="metric-meta">${escapeHtml(meta)}</p>
    </article>
  `).join('');
}

function renderQr(data) {
  const frame = $('[data-qr-frame]');
  if (!frame) return;
  if (data.qrImage) {
    frame.innerHTML = `<img src="${data.qrImage}" alt="WhatsApp login QR">`;
  } else {
    frame.innerHTML = `<div class="empty-state">${svgIcon('qr')}<span>QR akan tampil saat dibutuhkan.</span></div>`;
  }
  $('[data-pairing-code]').textContent = `Code: ${data.pairingCode || '-'}`;
}

function normalizeSession(session, index) {
  const connected = Boolean(session.connected || session.isConnected);
  const pairingStatus = session.pairingStatus || session.status || (connected ? 'Online' : 'Offline');
  return {
    id: session.id || session.sessionId || session.phone || `session-${index + 1}`,
    phone: session.phone || session.phoneNumber || session.phone_number || '-',
    connected,
    pairingStatus,
    updatedAt: session.updatedAt || session.lastSeen || session.createdAt || '-'
  };
}

function sessionStatus(session) {
  if (session.connected) return { label: 'Online', className: 'status-online' };
  const raw = String(session.pairingStatus).toLowerCase();
  if (raw.includes('connect') || raw.includes('pair') || raw.includes('start')) return { label: 'Connecting', className: 'status-connecting' };
  if (raw.includes('restart')) return { label: 'Restarting', className: 'status-restarting' };
  return { label: 'Offline', className: 'status-offline' };
}

function filteredSessions() {
  const sessions = (state.data?.sessions || []).map(normalizeSession);
  return sessions.filter((session) => {
    const text = `${session.id} ${session.phone} ${session.pairingStatus}`.toLowerCase();
    const meta = sessionStatus(session).label.toLowerCase();
    const matchesQuery = text.includes(state.sessionQuery.toLowerCase());
    const matchesFilter = state.sessionFilter === 'all' || meta === state.sessionFilter;
    return matchesQuery && matchesFilter;
  });
}

function renderSessions() {
  const body = $('[data-session-table]');
  const sessions = filteredSessions();
  const pages = Math.max(1, Math.ceil(sessions.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.pageSize;
  const visible = sessions.slice(start, start + state.pageSize);

  if (!visible.length) {
    body.innerHTML = '<tr><td colspan="5"><div class="empty-state">Tidak ada session yang cocok.</div></td></tr>';
  } else {
    body.innerHTML = visible.map((session) => {
      const meta = sessionStatus(session);
      return `
        <tr>
          <td><div class="cell-strong">${escapeHtml(session.id)}</div><div class="cell-muted">Bot instance</div></td>
          <td>${badge(meta.label, meta.className)}</td>
          <td>${escapeHtml(session.phone)}</td>
          <td class="cell-muted">${escapeHtml(session.pairingStatus || '-')}</td>
          <td class="cell-muted">${formatDate(session.updatedAt)}</td>
        </tr>
      `;
    }).join('');
  }

  $('[data-pagination-label]').textContent = `${sessions.length} sessions - page ${state.page}/${pages}`;
  $('[data-prev-page]').disabled = state.page <= 1;
  $('[data-next-page]').disabled = state.page >= pages;
}

function renderLogs(data) {
  const logs = state.hiddenLogs ? [] : (data.logs || []);
  const target = $('[data-logs]');
  if (!logs.length) {
    target.innerHTML = '<div class="empty-state">Log view kosong.</div>';
    return;
  }
  target.innerHTML = logs.slice(0, 80).map((log) => `
    <div class="log-row">
      <span class="muted">${log.time || '-'}</span>
      <span class="accent-cyan">${String(log.level || 'info').toUpperCase()}</span>
      <span class="log-message">${escapeHtml(log.message || '')}</span>
    </div>
  `).join('');
}

function renderChart(data) {
  const cpu = Number.parseFloat(data.cpuUsage) || 0;
  const mem = Number.parseInt(data.memoryUsage, 10) || 0;
  state.chartPoints.push(Math.min(100, Math.round((cpu * 14) + (mem / 32))));
  state.chartPoints = state.chartPoints.slice(-18);
  const points = state.chartPoints.length > 1 ? state.chartPoints : [8, 18, 15, 26, 24, 33, 29, 42];
  const width = 720;
  const height = 220;
  const pad = 20;
  const step = (width - pad * 2) / (points.length - 1);
  const coords = points.map((value, index) => [pad + index * step, height - pad - (value / 100) * (height - pad * 2)]);
  const line = coords.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width - pad} ${height - pad} L${pad} ${height - pad} Z`;
  $('[data-chart]').innerHTML = `
    <defs>
      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity=".24"/>
        <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="chart-grid" d="M20 60H700M20 110H700M20 160H700"/>
    <path class="chart-area" d="${area}"/>
    <path class="chart-line" d="${line}"/>
  `;
}

function render(data) {
  state.data = data;
  state.hiddenLogs = false;
  $('[data-bot-name]').textContent = data.botName || 'WhatsApp Bot';
  $('[data-runtime]').textContent = data.uptime || '-';
  $('[data-metrics]').innerHTML = metricCards(data);
  const meta = statusMeta(data);
  setStatusBadge('[data-global-status]', meta);
  setStatusBadge('[data-pairing-status]', meta);
  renderQr(data);
  renderChart(data);
  renderSessions();
  renderLogs(data);
}

async function load() {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
    render(await response.json());
  } catch (error) {
    showToast('error', 'Dashboard gagal mengambil status bot.');
    console.error(error);
  }
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Request failed');
  return data;
}

function showToast(type, message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="cell-strong">${type.toUpperCase()}</div><div class="cell-muted">${message}</div>`;
  $('[data-toasts]').appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function setButtonLoading(button, loading) {
  button.disabled = loading;
  button.classList.toggle('is-loading', loading);
  const spinner = button.querySelector('.spinner');
  if (loading && !spinner) button.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>');
  if (!loading && spinner) spinner.remove();
}

function openModal() {
  $('[data-pairing-modal]').classList.add('is-open');
  $('[data-modal-backdrop]').classList.add('is-open');
  $('#phoneNumber').focus();
}

function closeModal() {
  $('[data-pairing-modal]').classList.remove('is-open');
  $('[data-modal-backdrop]').classList.remove('is-open');
}

function bindEvents() {
  $('[data-theme-toggle]').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('dashboard-theme', next);
    $('[data-theme-toggle]').innerHTML = svgIcon(next === 'dark' ? 'moon' : 'layout');
  });
  $('[data-collapse-sidebar]').addEventListener('click', () => {
    $('[data-sidebar]').classList.toggle('is-collapsed');
    $('.app-shell').classList.toggle('is-sidebar-collapsed');
  });
  $('[data-mobile-menu]').addEventListener('click', () => {
    $('[data-sidebar]').classList.add('is-open');
    $('[data-drawer-backdrop]').classList.add('is-open');
  });
  $('[data-drawer-backdrop]').addEventListener('click', () => {
    $('[data-sidebar]').classList.remove('is-open');
    $('[data-drawer-backdrop]').classList.remove('is-open');
  });
  $$('[data-view]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-view]').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    $('[data-sidebar]').classList.remove('is-open');
    $('[data-drawer-backdrop]').classList.remove('is-open');
  }));
  $('[data-session-search]').addEventListener('input', (event) => {
    state.sessionQuery = event.target.value;
    state.page = 1;
    renderSessions();
  });
  $('[data-session-filter]').addEventListener('change', (event) => {
    state.sessionFilter = event.target.value;
    state.page = 1;
    renderSessions();
  });
  $('[data-prev-page]').addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    renderSessions();
  });
  $('[data-next-page]').addEventListener('click', () => {
    state.page += 1;
    renderSessions();
  });
  $('[data-clear-log-view]').addEventListener('click', () => {
    state.hiddenLogs = true;
    renderLogs({ logs: [] });
  });
  $('[data-open-pairing]').addEventListener('click', openModal);
  $$('[data-close-modal], [data-modal-backdrop]').forEach((el) => el.addEventListener('click', closeModal));
  $('[data-restart]').addEventListener('click', async (event) => {
    setButtonLoading(event.currentTarget, true);
    try {
      await postJson('/api/restart');
      showToast('success', 'Restart command dikirim.');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setButtonLoading(event.currentTarget, false);
    }
  });
  $('[data-submit-pairing]').addEventListener('click', async (event) => {
    const phoneNumber = $('#phoneNumber').value.trim();
    if (!phoneNumber) return showToast('warning', 'Nomor WhatsApp wajib diisi.');
    setButtonLoading(event.currentTarget, true);
    try {
      const result = await postJson('/api/pair', { phoneNumber });
      showToast('success', result.pairingCode ? `Pairing code: ${result.pairingCode}` : 'Pairing request dikirim.');
      closeModal();
      load();
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setButtonLoading(event.currentTarget, false);
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function formatDate(value) {
  if (!value || value === '-') return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function boot() {
  const savedTheme = localStorage.getItem('dashboard-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  hydrateIcons();
  $('[data-theme-toggle]').innerHTML = svgIcon(document.documentElement.dataset.theme === 'dark' ? 'moon' : 'layout');
  bindEvents();
  load();
  setInterval(load, 5000);
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const socket = new WebSocket(`${protocol}://${location.host}`);
  socket.onmessage = load;
}

boot();
