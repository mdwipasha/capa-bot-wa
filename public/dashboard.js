const iconPaths = {
  bell: '<path d="M10 21a2 2 0 0 0 4 0"/><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  alert:
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="3"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M10 17h4"/>',
  broadcast:
    '<path d="M4.9 19.1a10 10 0 0 1 0-14.2"/><path d="M7.8 16.2a6 6 0 0 1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.5"/><path d="M19.1 4.9a10 10 0 0 1 0 14.2"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M9 2v2"/><path d="M9 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:
    '<path d="m2 2 20 20"/><path d="M6.7 6.7C3.8 8.6 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.6 4.9-1.4"/><path d="M10.6 5.1c.5-.1.9-.1 1.4-.1 6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.2 4.2"/><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9"/>',
  layout:
    '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  login:
    '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 7.4A9 9 0 1 1 12 3Z"/>',
  package:
    '<path d="m7.5 4.3 9 5.2"/><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  queue:
    '<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/><path d="m17 15 3 3-3 3"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  restart: '<path d="M3 2v6h6"/><path d="M3 8a9 9 0 1 1 2.6 6.4"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.3-2 3.8-2 3.8s2.5-.5 3.8-2c.7-.8.7-2 .1-2.6-.6-.6-1.8-.6-2.6.1Z"/><path d="m9 15-3-3a22 22 0 0 1 2.6-5.4C10.3 4 12.6 2.4 16 2c0 3.4-1.6 5.7-4.6 7.4A22 22 0 0 1 6 12"/><path d="m9 15 3 3a22 22 0 0 0 5.4-2.6C20 13.7 21.6 11.4 22 8c-3.4.4-5.7 2-7.4 4.6A22 22 0 0 0 12 18"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings:
    '<path d="M12.2 2h-.4a2 2 0 0 0-2 1.8l-.1.8a2 2 0 0 1-3 1.4l-.7-.4a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.7.5a2 2 0 0 1 0 3.3l-.7.5a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.7-.4a2 2 0 0 1 3 1.4l.1.8a2 2 0 0 0 2 1.8h.4a2 2 0 0 0 2-1.8l.1-.8a2 2 0 0 1 3-1.4l.7.4a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.7-.5a2 2 0 0 1 0-3.3l.7-.5a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.7.4a2 2 0 0 1-3-1.4l-.1-.8a2 2 0 0 0-2-1.8Z"/><circle cx="12" cy="12" r="3"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.5a1.3 1.3 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/>',
  signal:
    '<path d="M2 20h.01"/><path d="M7 20a5 5 0 0 0-5-5"/><path d="M12 20A10 10 0 0 0 2 10"/><path d="M17 20A15 15 0 0 0 2 5"/>',
  sparkles:
    '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  user: '<path d="M19 21a7 7 0 0 0-14 0"/><circle cx="12" cy="8" r="4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  disk: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2H4.2a2 2 0 0 1-2.2-2v-3"/><path d="M2 10h20"/><rect width="20" height="14" x="2" y="3" rx="2"/><circle cx="16" cy="16" r="1"/>',
  network:
    '<path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><path d="M12 4v2"/><path d="M12 18v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/>',
  hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle:
    '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  layers:
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
};

const API_BASE =
  localStorage.getItem("dashboard-api-base") ||
  `${location.protocol}//${location.hostname}:3001/api/v1`;
const API_ORIGIN = API_BASE.replace(/\/api\/v\d+\/?$/, "");
const ROLE_ACCESS = {
  dashboard: ["owner", "admin", "operator", "viewer", "developer"],
  profile: ["owner", "admin", "operator", "viewer", "developer"],
  settings: ["owner", "admin", "developer"],
  bots: ["owner", "admin", "operator", "developer"],
  sessions: ["owner", "admin", "operator", "developer"],
  queue: ["owner", "admin", "operator", "developer"],
  plugins: ["owner", "admin", "developer"],
  activity: ["owner", "admin", "operator", "developer"],
};

const state = {
  user: null,
  socket: null,
  refreshInFlight: null,
  statusTimer: null,
  confirmAction: null,
  activeRoute: "dashboard",
  dashboard: {
    loaded: false,
    loading: false,
    error: "",
    status: null,
    system: null,
    health: null,
    bots: [],
    queue: null,
    jobs: [],
    plugins: [],
    commands: [],
    logs: [],
    activities: [],
    alerts: [],
    logFilter: "all",
    logSearch: "",
    chart: {
      cpu: [],
      ram: [],
      disk: [],
      network: [],
    },
  },
  bots: {
    loaded: false,
    loading: false,
    items: [],
    selected: new Set(),
    query: "",
    queryDraft: "",
    statusFilter: "all",
    tagFilter: "all",
    sort: "name",
    order: "asc",
    page: 1,
    pageSize: 10,
    searchTimer: null,
    virtualStart: 0,
    pairing: null,
  },
  botDetail: {
    sessionId: "",
    loaded: false,
    loading: false,
    bot: null,
    stats: null,
    groups: [],
    queue: [],
    queueStats: null,
    jobs: [],
    logs: [],
    activities: [],
    tab: "overview",
    groupQuery: "",
    groupFilter: "all",
    groupPage: 1,
    groupPageSize: 10,
    logQuery: "",
    logFilter: "all",
    chart: {
      cpu: [],
      ram: [],
      latency: [],
      network: [],
    },
  },
  counters: new Map(),
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const svgIcon = (name) =>
  `<svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ""}</svg>`;

const tokenStore = {
  get activeStorage() {
    return localStorage.getItem("dashboard-remember") === "true"
      ? localStorage
      : sessionStorage;
  },
  read(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  },
  write(tokens, remember) {
    const storage = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem("dashboard-access-token");
    other.removeItem("dashboard-refresh-token");
    storage.setItem("dashboard-access-token", tokens.accessToken);
    storage.setItem("dashboard-refresh-token", tokens.refreshToken);
    localStorage.setItem("dashboard-remember", String(Boolean(remember)));
  },
  update(tokens) {
    this.activeStorage.setItem("dashboard-access-token", tokens.accessToken);
    this.activeStorage.setItem("dashboard-refresh-token", tokens.refreshToken);
  },
  clear() {
    ["dashboard-access-token", "dashboard-refresh-token"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    localStorage.removeItem("dashboard-remember");
  },
  accessToken() {
    return this.read("dashboard-access-token");
  },
  refreshToken() {
    return this.read("dashboard-refresh-token");
  },
};

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}, retry = true) {
    const suppressAuthRedirect = Boolean(options.suppressAuthRedirect);
    const requestOptions = { ...options };
    delete requestOptions.suppressAuthRedirect;
    const headers = new Headers(options.headers || {});
    const token = tokenStore.accessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...requestOptions,
      headers,
    });
    const payload = await response.json().catch(() => null);

    if (response.status === 401 && retry && tokenStore.refreshToken()) {
      const refreshed = await this.refresh();
      if (refreshed) return this.request(path, options, false);
      if (!suppressAuthRedirect) handleUnauthorized();
      throw new ApiError(401, "Session expired");
    }

    if (response.status === 403) {
      if (!suppressAuthRedirect) handleForbidden();
      throw new ApiError(403, payload?.message || "Forbidden");
    }
    if (response.status === 401) {
      if (retry && !suppressAuthRedirect) handleUnauthorized();
      throw new ApiError(401, payload?.message || "Unauthorized");
    }
    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        response.status,
        payload?.message || payload?.error?.message || "Request failed",
      );
    }

    return payload?.data ?? payload;
  }

  async refresh() {
    if (state.refreshInFlight) return state.refreshInFlight;
    const refreshToken = tokenStore.refreshToken();
    if (!refreshToken) return false;

    state.refreshInFlight = fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) return false;
        tokenStore.update(payload.data);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        state.refreshInFlight = null;
      });

    return state.refreshInFlight;
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const api = new ApiClient(API_BASE);

async function dashboardApi(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new ApiError(
      response.status,
      payload?.error || payload?.message || "Dashboard API failed",
    );
  }
  return payload?.data ?? payload;
}

async function apiWithFallback(v1Path, fallbackPath, options = {}) {
  try {
    return await api.request(v1Path, options);
  } catch (err) {
    if (!fallbackPath || [401, 403].includes(err.status)) throw err;
    return dashboardApi(fallbackPath, options);
  }
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = svgIcon(el.dataset.icon);
  });
}

function showAuth() {
  $("[data-auth-screen]").hidden = false;
  $("[data-app-shell]").hidden = true;
  setLoading(false);
  disconnectSocket();
  clearInterval(state.statusTimer);
  state.statusTimer = null;
}

function showShell() {
  $("[data-auth-screen]").hidden = true;
  $("[data-app-shell]").hidden = false;
}

function handleUnauthorized() {
  tokenStore.clear();
  state.user = null;
  showAuth();
  showToast("warning", "Session expired. Silakan login ulang.");
}

function handleForbidden() {
  if (state.user) navigate("forbidden");
}

function setLoading(
  active,
  title = "Authenticating",
  copy = "Checking secure session...",
) {
  const overlay = $("[data-loading-overlay]");
  overlay.hidden = !active;
  $("[data-loading-title]").textContent = title;
  $("[data-loading-copy]").textContent = copy;
}

function setButtonLoading(button, loading) {
  button.disabled = loading;
  button.classList.toggle("is-loading", loading);
  const spinner = button.querySelector(".spinner");
  if (loading && !spinner)
    button.insertAdjacentHTML("afterbegin", '<span class="spinner"></span>');
  if (!loading && spinner) spinner.remove();
}

function showToast(type, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<div class="cell-strong">${escapeHtml(type.toUpperCase())}</div><div class="cell-muted">${escapeHtml(message)}</div>`;
  $("[data-toasts]").appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function renderUser(user) {
  const name = user.displayName || user.name || user.username || "User";
  const role = user.role || "viewer";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  $("[data-user-name]").textContent = name;
  $("[data-user-role]").textContent = formatRole(role);
  $("[data-user-avatar]").textContent = initials || "US";
  $("[data-bot-name]").textContent = "Capa Bot";
}

function formatRole(role) {
  return String(role || "viewer").replace(/^\w/, (letter) =>
    letter.toUpperCase(),
  );
}

function canAccess(route) {
  return (ROLE_ACCESS[route] || ROLE_ACCESS.dashboard).includes(
    state.user?.role,
  );
}

function navigate(route = "dashboard") {
  if (route === "sessions") route = "bots";
  const botDetailId = route.startsWith("bot-detail:")
    ? route.slice("bot-detail:".length)
    : "";
  const accessRoute = botDetailId ? "bots" : route;
  if (!state.user) return showAuth();
  if (route === "unauthorized") return renderError(401);
  if (route === "forbidden") return renderError(403);
  if (route === "not-found") return renderError(404);
  if (route === "server-error") return renderError(500);
  if (!ROLE_ACCESS[accessRoute]) return renderError(404);
  if (!canAccess(accessRoute)) return renderError(403);

  state.activeRoute = route;
  $$("[data-route]").forEach((item) =>
    item.classList.toggle(
      "is-active",
      item.dataset.route === accessRoute ||
        (accessRoute === "bots" && item.dataset.route === "sessions"),
    ),
  );
  closeDrawer();
  closeUserMenu();
  updateBrowserRoute(route);

  if (route === "dashboard") return renderDashboard();
  if (route === "bots") return renderBotManagement();
  if (botDetailId) return renderBotDetail(botDetailId);
  if (route === "profile") return renderProfile();
  if (route === "settings") return renderSettings();
  return renderPlaceholder(route);
}

function updateBrowserRoute(route) {
  const path =
    route === "dashboard"
      ? "/"
      : route.startsWith("bot-detail:")
        ? `/bots/${encodeURIComponent(route.slice("bot-detail:".length))}`
        : `/${route}`;
  if (
    location.pathname !== path &&
    (["dashboard", "bots"].includes(route) || route.startsWith("bot-detail:"))
  ) {
    history.pushState({ route }, "", path);
  }
}

function routeFromLocation() {
  const pendingRoute = sessionStorage.getItem("dashboard-pending-route");
  if (pendingRoute) {
    sessionStorage.removeItem("dashboard-pending-route");
    return pendingRoute;
  }
  const parts = location.pathname
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean);
  const route = parts[0] || "dashboard";
  if (route === "bots" && parts[1])
    return `bot-detail:${decodeURIComponent(parts[1])}`;
  if (route === "bots" || route === "sessions") return "bots";
  return ROLE_ACCESS[route] ? route : "dashboard";
}

function renderDashboard() {
  $("[data-page-title]").textContent = "Dashboard Overview";
  $("[data-page-subtitle]").textContent = "Realtime system control center";

  if (!state.dashboard.loaded) {
    $("[data-view-root]").innerHTML = renderDashboardSkeleton();
    loadDashboardOverview();
    return;
  }

  $("[data-view-root]").innerHTML = dashboardTemplate();
  hydrateIcons($("[data-view-root]"));
  animateCounters($("[data-view-root]"));
  renderLiveLogRows();
}

async function loadDashboardOverview({ silent = false } = {}) {
  if (!state.user || state.dashboard.loading) return;
  state.dashboard.loading = true;
  if (!silent && state.activeRoute === "dashboard") {
    $("[data-view-root]").innerHTML = renderDashboardSkeleton();
  }

  try {
    const [system, bots, queueData, jobs, plugins, commands, logs, status] =
      await Promise.all([
        api.request("/system").catch((err) => ({ error: err.message })),
        apiWithFallback("/bots?limit=100", "/api/bots").catch((err) => ({
          error: err.message,
          items: [],
        })),
        apiWithFallback("/queue?limit=20", "/api/queues/stats", {
          suppressAuthRedirect: true,
        }).catch((err) => ({
          error: err.message,
          queueStats: null,
          items: [],
        })),
        apiWithFallback("/jobs?limit=20", "/api/schedulers", {
          suppressAuthRedirect: true,
        }).catch((err) => ({ error: err.message, items: [] })),
        apiWithFallback("/plugins?limit=200", "/api/plugins", {
          suppressAuthRedirect: true,
        }).catch((err) => ({ error: err.message, items: [] })),
        apiWithFallback("/commands?limit=200", "/api/plugins", {
          suppressAuthRedirect: true,
        }).catch((err) => ({ error: err.message, items: [] })),
        api
          .request("/system/logs?limit=20", { suppressAuthRedirect: true })
          .catch((err) => ({ error: err.message, items: [] })),
        dashboardApi("/api/status").catch((err) => ({ error: err.message })),
      ]);

    state.dashboard.system = system?.error ? state.dashboard.system : system;
    state.dashboard.status = status?.error ? state.dashboard.status : status;
    state.dashboard.bots = getItems(bots);
    state.dashboard.queue =
      queueData?.queueStats || queueData?.stats || queueData || null;
    state.dashboard.jobs = getItems(jobs);
    state.dashboard.plugins = getItems(plugins);
    state.dashboard.commands = getItems(commands);
    state.dashboard.logs = normalizeLogs(getItems(logs));
    state.dashboard.activities = buildInitialActivities();
    state.dashboard.alerts = buildAlerts();
    seedCharts();
    state.dashboard.loaded = true;
    state.dashboard.error = "";
  } catch (err) {
    state.dashboard.error = err.message || "Dashboard gagal dimuat.";
  } finally {
    state.dashboard.loading = false;
    if (state.activeRoute === "dashboard") renderDashboard();
  }
}

function getItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
}

function normalizeLogs(logs = []) {
  return logs.slice(0, 20).map((log, index) => ({
    id: log.id || log.timestamp || `log-${Date.now()}-${index}`,
    time:
      log.timestamp || log.createdAt || log.time || new Date().toISOString(),
    level: String(log.level || log.action || "info").toLowerCase(),
    category: log.category || log.action || "system",
    message:
      log.message ||
      log.details?.message ||
      log.action ||
      JSON.stringify(log.details || log),
  }));
}

function buildInitialActivities() {
  const activities = [];
  state.dashboard.bots.slice(0, 4).forEach((bot) => {
    activities.push({
      type: bot.connected ? "Bot Connected" : "Bot Offline",
      message: `${bot.displayName || bot.phoneNumber || bot.id || "Bot"} ${bot.connected ? "online" : "offline"}`,
      time: bot.lastActive || new Date().toISOString(),
      tone: bot.connected ? "online" : "offline",
    });
  });
  state.dashboard.logs.slice(0, 4).forEach((log) => {
    activities.push({
      type: activityTitle(log.category || log.level),
      message: log.message,
      time: log.time,
      tone:
        log.level === "error"
          ? "offline"
          : log.level === "warn"
            ? "connecting"
            : "cyan",
    });
  });
  return activities.slice(0, 8);
}

function seedCharts() {
  const system = state.dashboard.system || {};
  const health = state.dashboard.health || {};
  const cpu = toNumber(
    health.cpu?.percentage ??
      system.cpu?.loadAvg?.[0] ??
      system.stats?.cpuUsage,
    0,
  );
  const ram = toNumber(
    health.memory?.percentage ?? memoryPercentage(system),
    0,
  );
  const disk = toNumber(system.stats?.diskUsage?.percentage, 0);
  pushChartPoint("cpu", cpu);
  pushChartPoint("ram", ram);
  pushChartPoint("disk", disk);
  pushChartPoint("network", networkSignal());
}

function pushChartPoint(key, value) {
  const list = state.dashboard.chart[key] || [];
  list.push({ value: clamp(toNumber(value, 0), 0, 100), time: Date.now() });
  state.dashboard.chart[key] = list.slice(-28);
}

function dashboardTemplate() {
  const system = state.dashboard.system || {};
  const bots = state.dashboard.bots;
  const queue = normalizeQueueStats(state.dashboard.queue);
  const jobs = state.dashboard.jobs;
  const pluginCount = countOf(
    state.dashboard.plugins,
    system.stats?.totalPlugin,
  );
  const commandCount = countOf(
    state.dashboard.commands,
    system.stats?.totalCommand,
  );
  const ram = memoryPercentage(system);
  const cpu = latestChartValue("cpu", toNumber(system.stats?.cpuUsage, 0));
  const disk = latestChartValue(
    "disk",
    toNumber(system.stats?.diskUsage?.percentage, 0),
  );

  return `
    <div class="overview-shell">
      <section class="overview-hero ds-card">
        <div>
          <p class="card-kicker">System Overview</p>
          <h2 class="overview-title">Control Center</h2>
          <p class="overview-subtitle">Live health, bot availability, queue pressure, scheduler state, recent activity, alerts, and logs in one operational surface.</p>
        </div>
        <div class="overview-live">
          ${statusBadge(bots.some((bot) => bot.connected) ? "Online" : "Offline")}
          <span class="cell-muted">Updated ${formatTime(new Date())}</span>
        </div>
      </section>

      <section class="overview-metrics">
        ${metricCard("Total Bots", bots.length, "Registered bot sessions", "bot")}
        ${metricCard("Bots Online", bots.filter((bot) => bot.connected).length, "Active WhatsApp links", "signal", "online")}
        ${metricCard("Bots Offline", bots.filter((bot) => !bot.connected).length, "Needs attention", "alert", "offline")}
        ${metricCard("Total Sessions", system.bots?.total ?? bots.length, "Session registry", "phone")}
        ${metricCard("CPU Usage", `${Math.round(cpu)}%`, cpuMeta(system), "cpu", cpu > 80 ? "offline" : "cyan", cpu)}
        ${metricCard("RAM Usage", `${Math.round(ram)}%`, memoryLabel(system), "activity", ram > 82 ? "offline" : "cyan", ram)}
        ${metricCard("Disk Usage", `${Math.round(disk)}%`, disk ? "Workspace volume" : "Awaiting disk tick", "database", disk > 90 ? "offline" : "cyan", disk)}
        ${metricCard("Uptime", formatDuration(system.uptime || 0), "Process runtime", "monitor")}
        ${metricCard("Node Version", system.node || system.stats?.nodeVersion || "-", system.platform || system.stats?.platform || "runtime", "terminal")}
        ${metricCard("Queue Running", queue.Running, `${queue.Waiting} waiting`, "queue", queue.Failed ? "connecting" : "online")}
        ${metricCard("Scheduler Running", jobs.filter(isJobRunning).length, `${jobs.filter(isJobUpcoming).length} upcoming`, "rocket", jobs.some(isJobFailed) ? "connecting" : "online")}
        ${metricCard("Plugin Count", pluginCount, `${commandCount} commands`, "package")}
      </section>

      <section class="overview-grid main-grid">
        <article class="ds-card card-pad bot-status-panel">
          <div class="card-header">
            <div>
              <p class="card-kicker">Live Bot Status</p>
              <h2 class="card-title">All Bots</h2>
            </div>
            ${statusBadge(`${bots.filter((bot) => bot.connected).length}/${bots.length || 0} Online`)}
          </div>
          ${bots.length ? `<div class="bot-card-grid">${bots.map(botCard).join("")}</div>` : emptyState("bot", "Belum ada bot", "Tambahkan bot pertama untuk mulai memonitor koneksi WhatsApp.")}
        </article>

        <article class="ds-card card-pad">
          <div class="card-header">
            <div>
              <p class="card-kicker">System Health</p>
              <h2 class="card-title">Realtime Usage</h2>
            </div>
            <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Live</span></span>
          </div>
          <div class="health-stack">
            ${healthChart("CPU", "cpu", cpu)}
            ${healthChart("RAM", "ram", ram)}
            ${healthChart("Disk", "disk", disk)}
            ${healthChart("Network", "network", latestChartValue("network", 0))}
          </div>
        </article>

        ${qrLoginPanel()}
      </section>

      <section class="overview-grid ops-grid">
        ${queueOverview(queue)}
        ${schedulerOverview(jobs)}
        ${activityTimeline()}
      </section>

      <section class="overview-grid lower-grid">
        ${alertsPanel()}
        ${liveLogPanel()}
      </section>

      ${quickActionsPanel()}
    </div>
  `;
}

function qrLoginPanel() {
  const status = state.dashboard.status || {};
  const hasQr = Boolean(status.qrImage);
  const connected = Boolean(status.connected);

  return `
    <article class="ds-card card-pad" data-qr-panel>
      <div class="card-header">
        <div>
          <p class="card-kicker">WhatsApp Login</p>
          <h2 class="card-title">QR Scan</h2>
        </div>
        ${statusBadge(connected ? "Connected" : hasQr ? "Scan Ready" : "Waiting", connected ? "online" : hasQr ? "cyan" : "connecting")}
      </div>
      ${
        hasQr
          ? `
        <div class="qr-frame">
          <img src="${escapeAttr(status.qrImage)}" alt="WhatsApp login QR code">
        </div>
      `
          : emptyState(
              "phone",
              connected ? "Bot connected" : "QR belum tersedia",
              connected
                ? "Session WhatsApp sudah aktif."
                : status.pairingStatus ||
                    "Tunggu beberapa detik setelah bot mulai connecting.",
            )
      }
    </article>
  `;
}

function renderDashboardSkeleton() {
  return `
    <div class="overview-shell">
      <section class="overview-hero ds-card"><div class="skeleton skeleton-wide"></div><div class="skeleton skeleton-short"></div></section>
      <section class="overview-metrics">${Array.from({ length: 12 }, () => '<article class="ds-card card-pad metric-skeleton"><div class="skeleton"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-short"></div></article>').join("")}</section>
      <section class="overview-grid main-grid"><article class="ds-card card-pad skeleton-tall"></article><article class="ds-card card-pad skeleton-tall"></article></section>
    </div>
  `;
}

function renderBotManagement() {
  $("[data-page-title]").textContent = "Bot Management";
  $("[data-page-subtitle]").textContent =
    "Manage running WhatsApp bot sessions";

  if (!state.bots.loaded) {
    $("[data-view-root]").innerHTML = renderBotManagementSkeleton();
    loadBotManagement();
    return;
  }

  $("[data-view-root]").innerHTML = botManagementTemplate();
  hydrateIcons($("[data-view-root]"));
  renderBotTableRows();
}

async function loadBotManagement({ silent = false } = {}) {
  if (!state.user || state.bots.loading) return;
  state.bots.loading = true;
  if (!silent && state.activeRoute === "bots")
    $("[data-view-root]").innerHTML = renderBotManagementSkeleton();

  try {
    const bots = await apiWithFallback("/bots?limit=100", "/api/bots");
    state.bots.items = getItems(bots).map(normalizeBot);
    state.dashboard.bots = state.bots.items;
    pruneBotSelection();
    state.bots.loaded = true;
  } catch (err) {
    showToast("error", err.message || "Bot gagal dimuat.");
    state.bots.loaded = true;
  } finally {
    state.bots.loading = false;
    if (state.activeRoute === "bots") renderBotManagement();
  }
}

function botManagementTemplate() {
  const selected = state.bots.selected.size;
  const stats = botManagementStats(state.bots.items);

  return `
    <div class="bot-management">
      <section class="bot-page-header ds-card">
        <div>
          <p class="card-kicker">Bot Management</p>
          <h2 class="overview-title">Running Bot Sessions</h2>
          <p class="overview-subtitle">Monitor, search, filter, sort, and operate bot sessions without leaving the table.</p>
        </div>
        <div class="bot-header-actions">
          <label class="search-wrap bot-search">
            ${svgIcon("search")}
            <input class="ds-input" data-bot-search placeholder="Search name, phone, session ID" value="${escapeAttr(state.bots.queryDraft)}">
          </label>
          <button class="ds-button secondary" type="button" data-bot-refresh>${svgIcon("refresh")}<span>Refresh</span></button>
          <button class="ds-button primary" type="button" data-add-bot>${svgIcon("bot")}<span>Add Bot</span></button>
        </div>
      </section>

      <section class="bot-stat-grid">
        ${botMetricCard("total", "Total Bot", stats.total, "All sessions", "bot")}
        ${botMetricCard("online", "Bot Online", stats.online, "Connected", "signal", "online")}
        ${botMetricCard("offline", "Bot Offline", stats.offline, "Not online", "alert", "offline")}
        ${botMetricCard("connecting", "Connecting", stats.connecting, "Pairing or starting", "refresh", "connecting")}
        ${botMetricCard("disconnected", "Disconnected", stats.disconnected, "Disconnected sessions", "phone", "offline")}
        ${botMetricCard("restarting", "Restarting", stats.restarting, "Restart in progress", "restart", "cyan")}
      </section>

      <section class="ds-card card-pad bot-table-panel">
        <div class="bot-table-toolbar">
          <div class="bot-filter-grid">
            <select class="ds-select" data-bot-status-filter aria-label="Status filter">
              ${filterOption("all", "All Status", state.bots.statusFilter)}
              ${filterOption("online", "Online", state.bots.statusFilter)}
              ${filterOption("offline", "Offline", state.bots.statusFilter)}
              ${filterOption("connecting", "Connecting", state.bots.statusFilter)}
              ${filterOption("restarting", "Restarting", state.bots.statusFilter)}
              ${filterOption("owner", "Owner", state.bots.statusFilter)}
            </select>
            <select class="ds-select" data-bot-tag-filter aria-label="Tag filter">
              ${botTagOptions()}
            </select>
            <select class="ds-select" data-bot-sort aria-label="Sort bots">
              ${sortOption("name", "Name")}
              ${sortOption("cpu", "CPU")}
              ${sortOption("ram", "RAM")}
              ${sortOption("groups", "Groups")}
              ${sortOption("users", "Users")}
              ${sortOption("status", "Status")}
              ${sortOption("lastActive", "Last Active")}
            </select>
            <select class="ds-select" data-bot-page-size aria-label="Page size">
              ${[10, 20, 50, 100].map((size) => `<option value="${size}"${state.bots.pageSize === size ? " selected" : ""}>${size} / page</option>`).join("")}
            </select>
          </div>
          <div class="bot-bulk-bar${selected ? " is-active" : ""}">
            <span class="cell-muted">${selected} selected</span>
            <button class="ds-button secondary" type="button" data-bulk-action="reconnect">Reconnect</button>
            <button class="ds-button secondary" type="button" data-bulk-action="restart">Restart</button>
            <button class="ds-button secondary" type="button" data-bulk-action="disconnect">Disconnect</button>
            <button class="ds-button danger" type="button" data-bulk-action="delete">Delete</button>
            <button class="ds-button primary" type="button" data-bulk-action="broadcast">Broadcast</button>
          </div>
        </div>

        <div class="bot-table-wrap">
          <table class="ds-table bot-table">
            <thead>
              <tr>
                <th class="select-col"><input type="checkbox" data-bot-select-all ${isCurrentPageFullySelected() ? "checked" : ""} aria-label="Select all bots on page"></th>
                <th>Avatar</th>
                <th>Display Name</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Connection</th>
                <th>Memory</th>
                <th>CPU</th>
                <th>Groups</th>
                <th>Users</th>
                <th>Plugin</th>
                <th>Command</th>
                <th>Last Active</th>
                <th class="sticky-action">Action</th>
              </tr>
            </thead>
            <tbody data-bot-table-body></tbody>
          </table>
        </div>

        <div class="bot-pagination">
          <span class="cell-muted" data-bot-page-label>${botPageLabel()}</span>
          <div class="cluster">
            <button class="ds-button secondary" type="button" data-bot-prev>Prev</button>
            <button class="ds-button secondary" type="button" data-bot-next>Next</button>
          </div>
        </div>
      </section>
      ${botPairingModal()}
    </div>
  `;
}

function renderBotManagementSkeleton() {
  return `
    <div class="bot-management">
      <section class="bot-page-header ds-card"><div class="skeleton skeleton-wide"></div><div class="skeleton skeleton-short"></div></section>
      <section class="bot-stat-grid">${Array.from({ length: 6 }, () => '<article class="ds-card card-pad metric-skeleton"><div class="skeleton"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-short"></div></article>').join("")}</section>
      <article class="ds-card card-pad"><div class="table-wrap"><div class="skeleton skeleton-tall"></div></div></article>
    </div>
  `;
}

function botMetricCard(key, label, value, meta, icon, tone = "cyan") {
  return metricCard(label, value, meta, icon, tone).replace(
    'class="metric-value"',
    `class="metric-value" data-bot-stat="${key}"`,
  );
}

function normalizeBot(bot = {}) {
  const id = String(
    bot.id || bot.sessionId || bot.phoneNumber || bot.phone_number || "",
  ).trim();
  const rawStatus = String(
    bot.status || bot.connection || bot.pairingStatus || "",
  ).toLowerCase();
  const connected = Boolean(
    bot.connected || rawStatus === "connected" || rawStatus === "online",
  );
  const status = normalizeBotStatus({ ...bot, connected, rawStatus });
  const tags = Array.isArray(bot.tags)
    ? bot.tags
    : [bot.tag, bot.owner ? "Owner" : "", bot.isOwner ? "Owner" : ""].filter(
        Boolean,
      );
  return {
    ...bot,
    id,
    sessionId: bot.sessionId || id,
    phoneNumber: bot.phoneNumber || bot.phone_number || "",
    displayName: bot.displayName || bot.name || bot.pushName || "",
    connected,
    disconnected:
      bot.disconnected ??
      (!connected && ["offline", "disconnected"].includes(status)),
    status,
    connection:
      bot.connection ||
      bot.pairingStatus ||
      (connected ? "Connected" : activityTitle(status)),
    memoryUsage: bot.memoryUsage || bot.memory || bot.stats?.memory || "-",
    cpuUsage: bot.cpuUsage ?? bot.cpu ?? bot.stats?.cpu ?? null,
    groupCount: toNumber(bot.groupCount ?? bot.groups ?? bot.stats?.groups, 0),
    userCount: toNumber(bot.userCount ?? bot.users ?? bot.stats?.users, 0),
    pluginCount: toNumber(
      bot.pluginCount ?? bot.plugins ?? bot.stats?.plugins,
      0,
    ),
    commandCount: toNumber(
      bot.commandCount ?? bot.commands ?? bot.stats?.commands,
      0,
    ),
    lastActive: bot.lastActive || bot.updatedAt || bot.stats?.lastActive || "",
    tags,
    owner: Boolean(
      bot.owner ||
      bot.isOwner ||
      tags.some((tag) => String(tag).toLowerCase() === "owner"),
    ),
    pairingCode: bot.pairingCode || bot.pairing_code || "",
    pairingStatus: bot.pairingStatus || bot.pairing_status || "",
    qr: bot.qr || "",
    qrImage: bot.qrImage || bot.qr_image || "",
  };
}

function normalizeBotStatus(bot = {}) {
  const raw = String(
    bot.rawStatus || bot.status || bot.pairingStatus || "",
  ).toLowerCase();
  if (raw.includes("restart")) return "restarting";
  if (
    raw.includes("connect") ||
    raw.includes("start") ||
    raw.includes("pair") ||
    raw.includes("qr")
  )
    return bot.connected ? "online" : "connecting";
  if (
    raw.includes("disconnect") ||
    raw.includes("logged") ||
    raw.includes("stop")
  )
    return "disconnected";
  if (bot.connected) return "online";
  return "offline";
}

function botManagementStats(items = []) {
  return items.reduce(
    (stats, bot) => {
      stats.total += 1;
      stats[bot.status] = (stats[bot.status] || 0) + 1;
      if (bot.connected) stats.online += bot.status === "online" ? 0 : 1;
      if (
        !bot.connected &&
        !["connecting", "restarting", "disconnected"].includes(bot.status)
      )
        stats.offline += bot.status === "offline" ? 0 : 1;
      return stats;
    },
    {
      total: 0,
      online: 0,
      offline: 0,
      connecting: 0,
      disconnected: 0,
      restarting: 0,
    },
  );
}

function filterOption(value, label, active) {
  return `<option value="${escapeAttr(value)}"${active === value ? " selected" : ""}>${escapeHtml(label)}</option>`;
}

function sortOption(value, label) {
  return `<option value="${escapeAttr(value)}"${state.bots.sort === value ? " selected" : ""}>${escapeHtml(label)} ${state.bots.order === "desc" ? "desc" : "asc"}</option>`;
}

function botTagOptions() {
  const tags = [
    ...new Set(
      state.bots.items
        .flatMap((bot) => bot.tags || [])
        .map(String)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
  return [
    filterOption("all", "All Tags", state.bots.tagFilter),
    ...tags.map((tag) => filterOption(tag, tag, state.bots.tagFilter)),
  ].join("");
}

function filteredBots() {
  const term = state.bots.query.trim().toLowerCase();
  const status = state.bots.statusFilter;
  const tag = state.bots.tagFilter;
  return state.bots.items
    .filter((bot) => {
      if (status === "owner") return bot.owner;
      return status === "all" || bot.status === status;
    })
    .filter(
      (bot) =>
        tag === "all" || (bot.tags || []).some((item) => String(item) === tag),
    )
    .filter((bot) => {
      if (!term) return true;
      return [bot.displayName, bot.phoneNumber, bot.sessionId, bot.id].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(term),
      );
    })
    .sort(compareBots);
}

function compareBots(a, b) {
  const sort = state.bots.sort;
  const direction = state.bots.order === "desc" ? -1 : 1;
  const map = {
    name: [
      a.displayName || a.phoneNumber || a.id,
      b.displayName || b.phoneNumber || b.id,
    ],
    cpu: [parseNumber(a.cpuUsage) ?? -1, parseNumber(b.cpuUsage) ?? -1],
    ram: [parseNumber(a.memoryUsage) ?? -1, parseNumber(b.memoryUsage) ?? -1],
    groups: [a.groupCount, b.groupCount],
    users: [a.userCount, b.userCount],
    status: [a.status, b.status],
    lastActive: [
      new Date(a.lastActive || 0).getTime(),
      new Date(b.lastActive || 0).getTime(),
    ],
  };
  const [left, right] = map[sort] || map.name;
  if (typeof left === "number" && typeof right === "number")
    return (left - right) * direction;
  return String(left || "").localeCompare(String(right || "")) * direction;
}

function pagedBots() {
  const bots = filteredBots();
  const totalPages = Math.max(1, Math.ceil(bots.length / state.bots.pageSize));
  state.bots.page = clamp(state.bots.page, 1, totalPages);
  const start = (state.bots.page - 1) * state.bots.pageSize;
  return bots.slice(start, start + state.bots.pageSize);
}

function renderBotTableRows() {
  const target = $("[data-bot-table-body]");
  if (!target) return;
  const rows = pagedBots();
  target.innerHTML = rows.length ? rows.map(botRow).join("") : botEmptyRow();
  updateBotSelectionControls();
  hydrateIcons(target);
}

function botRow(bot) {
  const id = bot.id || bot.sessionId;
  const display = bot.displayName || "Unnamed Bot";
  const statusTone =
    bot.status === "online"
      ? "online"
      : bot.status === "offline" || bot.status === "disconnected"
        ? "offline"
        : bot.status === "connecting"
          ? "connecting"
          : "cyan";
  return `
    <tr data-bot-row="${escapeAttr(id)}">
      <td class="select-col"><input type="checkbox" data-bot-select="${escapeAttr(id)}" ${state.bots.selected.has(id) ? "checked" : ""} aria-label="Select ${escapeAttr(display)}"></td>
      <td><div class="bot-avatar table-avatar">${initials(display || bot.phoneNumber || id)}</div></td>
      <td><div class="cell-strong truncate-cell">${escapeHtml(display)}</div><div class="cell-muted truncate-cell">${escapeHtml(bot.sessionId || id)}</div></td>
      <td>${escapeHtml(bot.phoneNumber || "-")}</td>
      <td>${statusBadge(activityTitle(bot.status), statusTone)}</td>
      <td><span class="cell-muted">${escapeHtml(bot.connection || "-")}</span></td>
      <td>${escapeHtml(bot.memoryUsage || "-")}</td>
      <td>${escapeHtml(formatCpu(bot.cpuUsage))}</td>
      <td>${escapeHtml(bot.groupCount ?? 0)}</td>
      <td>${escapeHtml(bot.userCount ?? 0)}</td>
      <td>${escapeHtml(bot.pluginCount ?? 0)}</td>
      <td>${escapeHtml(bot.commandCount ?? 0)}</td>
      <td><span class="cell-muted">${escapeHtml(bot.lastActive ? formatDate(bot.lastActive) : "-")}</span></td>
      <td class="sticky-action"><div class="row-actions">
        <button class="ds-button icon secondary" type="button" data-bot-detail="${escapeAttr(id)}" title="View Detail" aria-label="View Detail">${svgIcon("eye")}</button>
        <button class="ds-button icon secondary" type="button" data-bot-reconnect="${escapeAttr(id)}" title="Reconnect" aria-label="Reconnect">${svgIcon("refresh")}</button>
        <button class="ds-button icon secondary" type="button" data-bot-restart="${escapeAttr(id)}" title="Restart" aria-label="Restart">${svgIcon("restart")}</button>
        <button class="ds-button icon secondary" type="button" data-bot-disconnect="${escapeAttr(id)}" title="Disconnect" aria-label="Disconnect">${svgIcon("phone")}</button>
        <button class="ds-button icon danger" type="button" data-bot-delete="${escapeAttr(id)}" title="Delete" aria-label="Delete">${svgIcon("trash")}</button>
        <button class="ds-button icon primary" type="button" data-bot-broadcast="${escapeAttr(id)}" title="Broadcast" aria-label="Broadcast">${svgIcon("broadcast")}</button>
      </div></td>
    </tr>
  `;
}

function botEmptyRow() {
  const hasAny = state.bots.items.length > 0;
  return `<tr><td colspan="14">${emptyState("bot", hasAny ? "Bot tidak ditemukan" : "Belum ada bot", hasAny ? "Ubah filter atau kata kunci untuk menampilkan bot lain." : "Tambahkan bot pertama untuk memulai pairing WhatsApp.")}</td></tr>`;
}

function updateBotSelectionControls() {
  const pageRows = pagedBots();
  const all = $("[data-bot-select-all]");
  if (all) {
    all.checked =
      pageRows.length > 0 &&
      pageRows.every((bot) => state.bots.selected.has(bot.id));
    all.indeterminate =
      pageRows.some((bot) => state.bots.selected.has(bot.id)) && !all.checked;
  }
  const label = $("[data-bot-page-label]");
  if (label) label.textContent = botPageLabel();
  const prev = $("[data-bot-prev]");
  const next = $("[data-bot-next]");
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBots().length / state.bots.pageSize),
  );
  if (prev) prev.disabled = state.bots.page <= 1;
  if (next) next.disabled = state.bots.page >= totalPages;
  const bulk = $(".bot-bulk-bar");
  if (bulk) {
    bulk.classList.toggle("is-active", state.bots.selected.size > 0);
    const count = bulk.querySelector(".cell-muted");
    if (count) count.textContent = `${state.bots.selected.size} selected`;
  }
}

function botPageLabel() {
  const bots = filteredBots();
  if (!bots.length) return "0 bot";
  const start = (state.bots.page - 1) * state.bots.pageSize + 1;
  const end = Math.min(start + state.bots.pageSize - 1, bots.length);
  return `${start}-${end} dari ${bots.length} bot`;
}

function isCurrentPageFullySelected() {
  const rows = pagedBots();
  return (
    rows.length > 0 && rows.every((bot) => state.bots.selected.has(bot.id))
  );
}

function pruneBotSelection() {
  const ids = new Set(state.bots.items.map((bot) => bot.id));
  state.bots.selected = new Set(
    [...state.bots.selected].filter((id) => ids.has(id)),
  );
}

function updateBotStatsDom() {
  const stats = botManagementStats(state.bots.items);
  Object.entries(stats).forEach(([key, value]) => {
    const el = $(`[data-bot-stat="${key}"]`);
    if (el) el.textContent = String(value);
  });
}

function botPairingModal() {
  const pairing = state.bots.pairing;
  const isQr = pairing?.method === "qr";
  return `
    <section class="modal bot-pairing-modal${pairing ? " is-open" : ""}" data-bot-pairing-modal aria-modal="true" role="dialog" aria-labelledby="pairingTitle">
      <div class="modal-panel">
        <form data-pairing-form>
          <div class="modal-head">
            <h2 class="card-title" id="pairingTitle">Add Bot</h2>
            <button class="ds-button icon ghost" type="button" data-close-pairing aria-label="Tutup modal">${svgIcon("x")}</button>
          </div>
          <div class="modal-body pairing-body">
            <div class="form-field">
              <span class="card-kicker">Metode Koneksi</span>
              <div class="pairing-method-toggle" role="radiogroup" aria-label="Metode koneksi">
                <label class="pairing-method-option${!isQr ? " is-active" : ""}">
                  <input type="radio" name="method" value="pairing" ${!isQr ? "checked" : ""} ${pairing?.requested ? "disabled" : ""}>
                  <span>Pairing Code</span>
                </label>
                <label class="pairing-method-option${isQr ? " is-active" : ""}">
                  <input type="radio" name="method" value="qr" ${isQr ? "checked" : ""} ${pairing?.requested ? "disabled" : ""}>
                  <span>Scan QR</span>
                </label>
              </div>
            </div>
            <label class="form-field">
              <span class="card-kicker">Nomor WhatsApp</span>
              <input class="ds-input" name="phone" inputmode="numeric" autocomplete="off" placeholder="6281234567890" value="${escapeAttr(pairing?.phone || "")}" ${pairing?.requested ? "disabled" : ""} required>
            </label>
           <div class="pairing-flow">
            ${pairingStep("Input Nomor", pairing ? "online" : "cyan")}
            ${pairingStep(isQr ? "Generate QR" : "Request Pairing", pairing?.requested ? "online" : "cyan", "method")}
            ${pairingStep(isQr ? "Scan QR" : "Pairing Code", (isQr ? pairing?.qrImage : pairing?.code) ? "online" : "cyan", "result")}
            ${pairingStep("Connected", pairing?.connected ? "online" : "cyan")}
          </div>
            <div class="pairing-code-box${isQr ? " pairing-qr-box" : ""}" data-pairing-code>${
              isQr
                ? pairing?.qrImage
                  ? `<img class="pairing-qr-image" src="${escapeAttr(pairing.qrImage)}" alt="QR pairing WhatsApp">`
                  : escapeHtml(
                      "QR akan muncul di sini setelah bot mulai connecting...",
                    )
                : escapeHtml(
                    pairing?.code ||
                      "Pairing code akan muncul setelah request berhasil.",
                  )
            }</div>
            <div class="cell-muted pairing-ts" data-pairing-timestamp>${pairing?.pairingGeneratedAt ? escapeHtml(formatDate(pairing.pairingGeneratedAt)) : ""}</div>
            <div class="cell-muted" data-pairing-live-status>${escapeHtml(pairing?.status || "Menunggu nomor bot.")}</div>
          </div>
          <div class="modal-foot">
            <button class="ds-button ghost" type="button" data-close-pairing>Cancel</button>
            <button class="ds-button primary" type="submit" data-request-pairing ${pairing?.requested ? "disabled" : ""}><span class="button-text">${isQr ? "Generate QR" : "Request Pairing"}</span></button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function pairingStep(label, tone, key) {
  return `<span class="ds-badge status-${tone === "online" ? "online" : "restarting"}"${key ? ` data-pairing-step="${key}"` : ""}><span class="status-dot"></span><span>${escapeHtml(label)}</span></span>`;
}

function renderBotDetail(sessionId) {
  const detail = state.botDetail;
  if (detail.sessionId !== sessionId) resetBotDetail(sessionId);
  const bot = detail.bot || findBot(sessionId);
  $("[data-page-title]").textContent = bot?.displayName || "Bot Detail";
  $("[data-page-subtitle]").textContent = bot?.phoneNumber
    ? `${bot.phoneNumber} · ${sessionId}`
    : sessionId;

  if (!detail.loaded) {
    $("[data-view-root]").innerHTML = renderBotDetailSkeleton();
    loadBotDetail(sessionId);
    return;
  }

  $("[data-view-root]").innerHTML = botDetailTemplate();
  hydrateIcons($("[data-view-root]"));
  renderBotDetailTab();
  startBotDetailChartTick();
}

function resetBotDetail(sessionId) {
  clearBotDetailChartTick();
  state.botDetail = {
    ...state.botDetail,
    sessionId,
    loaded: false,
    loading: false,
    bot: findBot(sessionId) || null,
    stats: null,
    groups: [],
    queue: [],
    queueStats: null,
    jobs: [],
    logs: [],
    activities: [],
    tab: "overview",
    groupQuery: "",
    groupFilter: "all",
    groupPage: 1,
    groupPageSize: 10,
    logQuery: "",
    logFilter: "all",
    chart: { cpu: [], ram: [], latency: [], network: [] },
    chartTimer: null,
  };
}

function startBotDetailChartTick() {
  clearBotDetailChartTick();
  state.botDetail.chartTimer = setInterval(() => {
    if (state.activeRoute !== `bot-detail:${state.botDetail.sessionId}`) return;
    const stats = botDetailStats();
    pushDetailChartPoint("cpu", stats.cpu);
    pushDetailChartPoint("ram", stats.ram);
    pushDetailChartPoint("latency", Math.min(100, stats.latency / 30));
    pushDetailChartPoint("network", stats.network);
    updateBotDetailChartsDom();
  }, 4000);
}

function clearBotDetailChartTick() {
  if (state.botDetail?.chartTimer) {
    clearInterval(state.botDetail.chartTimer);
    state.botDetail.chartTimer = null;
  }
}

function updateBotDetailChartsDom() {
  const target = $("[data-bot-detail-charts]");
  if (!target) return;
  const stats = botDetailStats();
  target.innerHTML = botDetailChartsHtml(stats);
  hydrateIcons(target);
}

async function loadBotDetail(sessionId, { silent = false } = {}) {
  if (!state.user || state.botDetail.loading) return;
  state.botDetail.loading = true;
  if (!silent && state.activeRoute.startsWith("bot-detail:"))
    $("[data-view-root]").innerHTML = renderBotDetailSkeleton();
  const encoded = encodeURIComponent(sessionId);

  try {
    const [bot, info, stats, groups, queue, jobs, logs] = await Promise.all([
      apiWithFallback(`/bots/${encoded}`, `/api/bots/${encoded}`).catch(
        () => null,
      ),
      apiWithFallback(`/bots/${encoded}/stats`, `/api/bots/${encoded}/stats`, {
        suppressAuthRedirect: true,
      }).catch(() => null),
      apiWithFallback(`/bots/${encoded}/stats`, `/api/bots/${encoded}/stats`, {
        suppressAuthRedirect: true,
      }).catch(() => null),
      apiWithFallback(
        `/bots/${encoded}/groups`,
        `/api/bots/${encoded}/groups`,
        { suppressAuthRedirect: true },
      ).catch(() => []),
      apiWithFallback("/queue?limit=100", "/api/queues", {
        suppressAuthRedirect: true,
      }).catch(() => ({ items: [], queueStats: null })),
      apiWithFallback("/jobs?limit=100", "/api/schedulers", {
        suppressAuthRedirect: true,
      }).catch(() => ({ items: [] })),
      api
        .request("/system/logs?limit=80", { suppressAuthRedirect: true })
        .catch(() => ({ items: [] })),
    ]);

    const normalizedBot = normalizeBot({
      ...(bot || {}),
      ...(info || {}),
      id: sessionId,
      sessionId,
    });
    state.botDetail.bot = normalizedBot;
    state.botDetail.stats = stats || info?.stats || null;
    state.botDetail.groups = normalizeGroups(getItems(groups));
    state.botDetail.queue = getItems(queue).filter((job) =>
      botJobBelongsTo(job, sessionId),
    );
    state.botDetail.queueStats =
      queue?.queueStats || queue?.stats || normalizeQueueStats({});
    state.botDetail.jobs = getItems(jobs).filter((job) =>
      botJobBelongsTo(job, sessionId),
    );
    state.botDetail.logs = normalizeLogs(getItems(logs)).filter((log) =>
      botLogBelongsTo(log, sessionId, normalizedBot.phoneNumber),
    );
    state.botDetail.activities = buildBotActivities();
    seedBotDetailCharts();
    state.botDetail.loaded = true;
    upsertBot(normalizedBot);
  } catch (err) {
    showToast("error", err.message || "Detail bot gagal dimuat.");
    state.botDetail.loaded = true;
  } finally {
    state.botDetail.loading = false;
    if (state.activeRoute === `bot-detail:${sessionId}`)
      renderBotDetail(sessionId);
  }
}

function renderBotDetailSkeleton() {
  return `
    <div class="bot-detail">
      <section class="bot-detail-hero ds-card">
        <div class="bdet-hero-left">
          <div class="skeleton" style="width:64px;height:64px;border-radius:var(--radius-md);flex:0 0 64px"></div>
          <div style="display:grid;gap:8px;min-width:0;flex:1">
            <div class="skeleton skeleton-wide" style="height:24px"></div>
            <div class="skeleton" style="width:200px;height:14px"></div>
            <div class="skeleton" style="width:260px;height:20px"></div>
          </div>
        </div>
        <div class="bdet-hero-kpis">
          ${Array.from({ length: 3 }, () => '<div class="bdet-kpi-chip"><div class="skeleton" style="width:56px;height:12px"></div><div class="skeleton" style="width:72px;height:20px;margin-top:6px"></div></div>').join("")}
        </div>
      </section>
      <section class="bdet-actions-bar ds-card">
        ${Array.from({ length: 7 }, () => '<div class="skeleton" style="width:110px;height:38px;border-radius:var(--radius-sm)"></div>').join("")}
      </section>
      <section class="bdet-cards-row">
        ${Array.from({ length: 5 }, () => '<article class="ds-card card-pad metric-skeleton"><div class="skeleton"></div><div class="skeleton skeleton-value"></div><div class="skeleton skeleton-short"></div></article>').join("")}
      </section>
      <section class="bdet-split-row">
        <article class="ds-card card-pad skeleton-tall"></article>
        <article class="ds-card card-pad skeleton-tall"></article>
      </section>
      <article class="ds-card card-pad skeleton-tall"></article>
    </div>
  `;
}

function botDetailTemplate() {
  const detail = state.botDetail;
  const bot = detail.bot || {};
  const stats = botDetailStats();
  const statusTone =
    bot.status === "online"
      ? "online"
      : bot.status === "connecting"
        ? "connecting"
        : bot.status === "restarting"
          ? "cyan"
          : "offline";
  const isOnline = bot.status === "online";
  return `
    <div class="bot-detail">

      <!-- HERO HEADER -->
      <section class="bdet-hero ds-card">
        <div class="bdet-hero-left">
          <div class="bdet-avatar ${isOnline ? "is-online" : ""}">${initials(bot.displayName || bot.phoneNumber || bot.id)}</div>
          <div class="bdet-identity">
            <p class="card-kicker">Bot Detail &mdash; Session Control</p>
            <h2 class="bdet-name" data-detail-name>${escapeHtml(bot.displayName || "Unnamed Bot")}</h2>
            <div class="bdet-meta">
              <span class="bdet-meta-chip">${svgIcon("phone")}<span data-detail-phone>${escapeHtml(bot.phoneNumber || "-")}</span></span>
              <span class="bdet-meta-chip">${svgIcon("hash")}<span data-detail-session>${escapeHtml(bot.sessionId || bot.id || "-")}</span></span>
              <span data-detail-status>${statusBadge(activityTitle(bot.status || "offline"), statusTone)}</span>
            </div>
          </div>
        </div>
        <div class="bdet-hero-kpis">
          <div class="bdet-kpi-chip">
            <span class="bdet-kpi-label">${svgIcon("activity")}Latency</span>
            <strong class="bdet-kpi-value" data-detail-latency>${escapeHtml(formatLatency(stats.latency))}</strong>
          </div>
          <div class="bdet-kpi-chip">
            <span class="bdet-kpi-label">${svgIcon("clock")}Uptime</span>
            <strong class="bdet-kpi-value" data-detail-uptime>${escapeHtml(formatDuration(stats.uptime))}</strong>
          </div>
          <div class="bdet-kpi-chip">
            <span class="bdet-kpi-label">${svgIcon("signal")}Connection</span>
            <strong class="bdet-kpi-value" data-detail-connection>${escapeHtml(bot.connection || bot.pairingStatus || "-")}</strong>
          </div>
          <div class="bdet-kpi-chip">
            <span class="bdet-kpi-label">${svgIcon("users")}Users</span>
            <strong class="bdet-kpi-value">${escapeHtml(String(stats.users))}</strong>
          </div>
          <div class="bdet-kpi-chip">
            <span class="bdet-kpi-label">${svgIcon("layers")}Groups</span>
            <strong class="bdet-kpi-value">${escapeHtml(String(stats.groups))}</strong>
          </div>
        </div>
      </section>

      <!-- ACTION BAR -->
      <section class="bdet-actions-bar ds-card">
        <button class="ds-button secondary" type="button" data-detail-action="reconnect">${svgIcon("refresh")}<span>Reconnect</span></button>
        <button class="ds-button secondary" type="button" data-detail-action="restart">${svgIcon("restart")}<span>Restart</span></button>
        <button class="ds-button secondary" type="button" data-detail-action="disconnect">${svgIcon("phone")}<span>Disconnect</span></button>
        <button class="ds-button secondary" type="button" data-detail-action="pair">${svgIcon("link")}<span>Pair</span></button>
        <button class="ds-button danger" type="button" data-detail-action="delete">${svgIcon("trash")}<span>Delete Session</span></button>
        <div class="bdet-action-separator"></div>
        <button class="ds-button primary" type="button" data-detail-action="broadcast">${svgIcon("broadcast")}<span>Broadcast</span></button>
        <button class="ds-button secondary" type="button" data-detail-action="console">${svgIcon("terminal")}<span>Open Console</span></button>
        <div class="bdet-action-separator"></div>
        <button class="ds-button ghost" type="button" data-detail-action="refresh">${svgIcon("refresh")}<span>Refresh</span></button>
      </section>

      <!-- SYSTEM CARDS ROW -->
      <section class="bdet-cards-row">
        ${bdetSystemCard("CPU", formatCpu(stats.cpu), "cpu", usageTone(stats.cpu), stats.cpu)}
        ${bdetSystemCard("RAM", stats.ramLabel, "database", usageTone(stats.ram), stats.ram)}
        ${bdetSystemCard("Disk", `${Math.round(stats.disk)}%`, "disk", usageTone(stats.disk), stats.disk)}
        ${bdetSystemCard("Latency", formatLatency(stats.latency), "activity", stats.latency > 2000 ? "connecting" : "online", null)}
        ${bdetSystemCard("Network", `${Math.round(stats.network)}%`, "signal", stats.network > 70 ? "online" : "connecting", stats.network)}
      </section>

      <!-- SESSION LOGIN -->
      <section class="overview-grid main-grid">
        ${botDetailQrCard()}
        ${botInformationCard()}
      </section>

      <!-- BOT INFO + STATISTICS -->
      <section class="bdet-split-row">
        ${botStatisticsCard()}
        ${botSessionStateCard()}
      </section>

      <!-- RESOURCE MONITOR (Realtime Charts) -->
      <section class="ds-card card-pad bdet-resource-monitor">
        <div class="card-header">
          <div>
            <p class="card-kicker">Resource Monitor</p>
            <h2 class="card-title">Realtime Usage Chart</h2>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${statusBadge("Live", "online")}
            <button class="ds-button secondary" style="min-height:30px;padding:0 10px;font-size:12px" type="button" data-detail-action="refresh">${svgIcon("refresh")}</button>
          </div>
        </div>
        <div class="bdet-chart-grid" data-bot-detail-charts>
          ${botDetailChartsHtml(stats)}
        </div>
      </section>

      <!-- QUICK ACTIONS -->
      <section class="ds-card card-pad bdet-quick-panel">
        <div class="card-header">
          <div><p class="card-kicker">Quick Action</p><h2 class="card-title">Bot Operations</h2></div>
          <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Instant</span></span>
        </div>
        <div class="bdet-quick-grid">
          ${botQuickAction("Reload Plugin", "package", "reload-plugin")}
          ${botQuickAction("Reload Command", "terminal", "reload-command")}
          ${botQuickAction("Restart Queue", "queue", "restart-queue")}
          ${botQuickAction("Backup Session", "save", "backup-session")}
          ${botQuickAction("Restart Bot", "restart", "restart")}
        </div>
      </section>

      <!-- TABS PANEL -->
      <section class="ds-card card-pad bdet-tabs-panel">
        <div class="bdet-tabs-nav">
          <div class="tabs bdet-tabs-scroll">
            ${["overview", "groups", "queue", "scheduler", "logs", "activity"]
              .map((tab) => {
                const icons = {
                  overview: "layout",
                  groups: "users",
                  queue: "queue",
                  scheduler: "rocket",
                  logs: "terminal",
                  activity: "activity",
                };
                return `<button class="tab${detail.tab === tab ? " is-active" : ""}" type="button" data-bot-detail-tab="${tab}">${svgIcon(icons[tab] || "layout")}<span>${escapeHtml(activityTitle(tab))}</span></button>`;
              })
              .join("")}
          </div>
          <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Realtime</span></span>
        </div>
        <div class="bdet-tab-body" data-bot-detail-tab-body></div>
      </section>

    </div>
  `;
}

function botDetailQrCard() {
  const bot = state.botDetail.bot || {};
  const hasQr = Boolean(bot.qrImage);
  const connected = Boolean(bot.connected || bot.status === "online");
  return `
    <article class="ds-card card-pad" data-detail-qr-card>
      <div class="card-header">
        <div>
          <p class="card-kicker">WhatsApp Login</p>
          <h2 class="card-title">Session QR</h2>
        </div>
        ${statusBadge(connected ? "Connected" : hasQr ? "Scan Ready" : "Waiting", connected ? "online" : hasQr ? "cyan" : "connecting")}
      </div>
      ${
        hasQr
          ? `
        <div class="qr-frame">
          <img src="${escapeAttr(bot.qrImage)}" alt="WhatsApp login QR code for ${escapeAttr(bot.phoneNumber || bot.id || "bot")}">
        </div>
      `
          : emptyState(
              "phone",
              connected ? "Bot connected" : "QR belum tersedia",
              connected
                ? "Session WhatsApp untuk bot ini sudah aktif."
                : bot.pairingStatus ||
                    "Klik Reconnect atau Restart, lalu tunggu QR dari session ini.",
            )
      }
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;align-items:center;justify-content:center">
        <div style="display:flex;gap:8px;align-items:center"><div class="pairing-code-box" style="min-height:44px;padding:8px 12px;font-size:18px" data-detail-pairing-code>${escapeHtml(bot.pairingCode || "-")}</div>
        <button class="ds-button secondary" type="button" data-copy-pairing data-copy-pairing-value="${escapeAttr(bot.pairingCode || "")}" title="Copy Pairing Code">${svgIcon("copy")}</button></div>
        <div class="cell-muted pairing-ts" data-detail-pairing-timestamp>${bot.pairingGeneratedAt ? escapeHtml(formatDate(bot.pairingGeneratedAt)) : ""}</div>
      </div>
    </article>
  `;
}

function botSessionStateCard() {
  const bot = state.botDetail.bot || {};
  return `
    <article class="ds-card card-pad">
      <div class="card-header">
        <div><p class="card-kicker">Session State</p><h2 class="card-title">Login Status</h2></div>
        ${statusBadge(activityTitle(bot.status || "offline"), bot.status === "online" ? "online" : bot.status === "connecting" ? "cyan" : "connecting")}
      </div>
      <div class="bdet-info-grid">
        ${bdetInfoItem("Session ID", bot.sessionId || bot.id || "-", "hash")}
        ${bdetInfoItem("Phone Number", bot.phoneNumber || "-", "phone")}
        ${bdetInfoItem("Pairing Status", bot.pairingStatus || bot.connection || "-", "signal")}
        ${bdetInfoItem("QR Payload", bot.qr ? "Available" : "-", "qr")}
      </div>
    </article>
  `;
}

function bdetSystemCard(label, value, icon, tone, progress) {
  return `
    <article class="ds-card card-pad bdet-sys-card fade-in" data-bdet-sys-card="${escapeAttr(label.toLowerCase())}">
      <div class="bdet-sys-head">
        <div class="metric-icon ${toneClass(tone)}" data-bdet-sys-icon>${svgIcon(icon)}</div>
        <p class="card-kicker">${escapeHtml(label)}</p>
      </div>
      <p class="metric-value" data-bdet-sys-val>${escapeHtml(String(value))}</p>
      <div data-bdet-sys-progress-container>
        ${progress !== null ? progressBar(clamp(toNumber(progress, 0), 0, 100), tone) : '<div class="bdet-sys-placeholder"></div>'}
      </div>
    </article>
  `;
}

function botDetailChartsHtml(stats) {
  return `
    ${detailHealthChart("CPU", "cpu", latestDetailChartValue("cpu", stats.cpu))}
    ${detailHealthChart("RAM", "ram", latestDetailChartValue("ram", stats.ram))}
    ${detailHealthChart("Latency", "latency", latestDetailChartValue("latency", Math.min(100, stats.latency / 30)))}
    ${detailHealthChart("Network", "network", latestDetailChartValue("network", stats.network))}
  `;
}

function botInformationCard() {
  const bot = state.botDetail.bot || {};
  const stats = state.botDetail.stats || {};
  return `
    <article class="ds-card card-pad">
      <div class="card-header">
        <div><p class="card-kicker">Bot Information</p><h2 class="card-title">Runtime Identity</h2></div>
        <span class="ds-badge">${svgIcon("info")}<span>Live Data</span></span>
      </div>
      <div class="bdet-info-grid">
        ${bdetInfoItem("WhatsApp Version", stats.whatsappVersion || bot.whatsappVersion || "-", "sparkles")}
        ${bdetInfoItem("Device", stats.device || bot.device || "-", "monitor")}
        ${bdetInfoItem("Platform", stats.platform || bot.platform || "-", "layers")}
        ${bdetInfoItem("OS", stats.os || navigator.platform || "-", "database")}
        ${bdetInfoItem("Node Version", stats.nodeVersion || "-", "terminal")}
        ${bdetInfoItem("Connected Since", formatDate(stats.connectedSince || bot.connectedSince), "clock")}
        ${bdetInfoItem("Reconnect Count", String(bot.reconnectCount ?? stats.reconnectCount ?? 0), "refresh")}
      </div>
    </article>
  `;
}

function bdetInfoItem(label, value, icon) {
  return `
    <div class="bdet-info-item">
      <span class="bdet-info-icon ${value === "-" ? "tone-connecting" : "tone-cyan"}">${svgIcon(icon)}</span>
      <div>
        <p class="card-kicker">${escapeHtml(label)}</p>
        <div class="cell-strong bdet-info-val">${escapeHtml(value || "-")}</div>
      </div>
    </div>
  `;
}

function botStatisticsCard() {
  const stats = botDetailStats();
  return `
    <article class="ds-card card-pad">
      <div class="card-header">
        <div><p class="card-kicker">Statistics</p><h2 class="card-title">Usage Summary</h2></div>
        <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Live</span></span>
      </div>
      <div class="bdet-stat-grid">
        ${bdetStatChip("Messages Sent", stats.sent, "broadcast", "online")}
        ${bdetStatChip("Messages Received", stats.received, "activity", "cyan")}
        ${bdetStatChip("Commands", stats.commands, "terminal", "cyan")}
        ${bdetStatChip("Plugins", stats.plugins, "package", "cyan")}
        ${bdetStatChip("Groups", stats.groups, "users", "cyan")}
        ${bdetStatChip("Users", stats.users, "user", "cyan")}
        ${bdetStatChip("Queue", stats.queue, "queue", stats.queue > 0 ? "online" : "connecting")}
        ${bdetStatChip("Scheduler", stats.scheduler, "rocket", stats.scheduler > 0 ? "online" : "connecting")}
      </div>
    </article>
  `;
}

function bdetStatChip(label, value, icon, tone) {
  return `
    <div class="bdet-stat-chip ${toneClass(tone)}">
      <div class="bdet-stat-icon">${svgIcon(icon)}</div>
      <div>
        <div class="bdet-stat-val">${escapeHtml(String(value ?? 0))}</div>
        <div class="bdet-stat-label">${escapeHtml(label)}</div>
      </div>
    </div>
  `;
}

function renderBotDetailTab() {
  const target = $("[data-bot-detail-tab-body]");
  if (!target) return;
  const tab = state.botDetail.tab;
  const templates = {
    overview: botDetailOverviewTab,
    groups: botDetailGroupsTab,
    queue: botDetailQueueTab,
    scheduler: botDetailSchedulerTab,
    logs: botDetailLogsTab,
    activity: botDetailActivityTab,
  };
  target.innerHTML = (templates[tab] || botDetailOverviewTab)();
  hydrateIcons(target);
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function botDetailOverviewTab() {
  const bot = state.botDetail.bot || {};
  const stats = botDetailStats();
  const queueStats = normalizeQueueStats(state.botDetail.queueStats || {});
  return `
    <div class="bdet-overview-grid">

      <!-- Summary Welcome -->
      <article class="bdet-overview-welcome">
        <div class="bdet-overview-welcome-inner">
          <div class="bdet-welcome-avatar">${initials(bot.displayName || bot.phoneNumber || "BT")}</div>
          <div>
            <h3 class="card-title" style="font-size:16px;margin-bottom:4px">${escapeHtml(bot.displayName || "Unnamed Bot")}</h3>
            <p class="cell-muted" style="margin:0">Gunakan tab di bawah untuk melihat detail Groups, Queue, Scheduler, Logs, dan Activity.</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
              ${statusBadge(activityTitle(bot.status || "offline"), bot.status === "online" ? "online" : "offline")}
              ${bot.phoneNumber ? `<span class="ds-badge">${svgIcon("phone")}<span>${escapeHtml(bot.phoneNumber)}</span></span>` : ""}
              ${bot.connection ? `<span class="ds-badge">${escapeHtml(bot.connection)}</span>` : ""}
            </div>
          </div>
        </div>
      </article>

      <!-- Queue Summary -->
      <article class="bdet-overview-card">
        <div class="card-header">
          <div><p class="card-kicker">Queue</p><h3 class="card-title">Workload</h3></div>
          ${statusBadge(queueStats.Failed ? "Attention" : "Stable", queueStats.Failed ? "connecting" : "online")}
        </div>
        <div class="bdet-queue-grid">
          ${bdetQueuePill("Running", queueStats.Running, "online")}
          ${bdetQueuePill("Waiting", queueStats.Waiting, "cyan")}
          ${bdetQueuePill("Failed", queueStats.Failed, "offline")}
          ${bdetQueuePill("Completed", queueStats.Completed, "online")}
          ${bdetQueuePill("Retry", queueStats.Retry, "connecting")}
        </div>
      </article>

      <!-- Scheduler Summary -->
      <article class="bdet-overview-card">
        <div class="card-header">
          <div><p class="card-kicker">Scheduler</p><h3 class="card-title">Jobs</h3></div>
          ${statusBadge(`${state.botDetail.jobs.filter(isJobRunning).length} Running`, "cyan")}
        </div>
        <div class="bdet-scheduler-summary">
          ${bdetJobSummaryRow("Running", state.botDetail.jobs.filter(isJobRunning).length, "online")}
          ${bdetJobSummaryRow("Upcoming", state.botDetail.jobs.filter(isJobUpcoming).length, "cyan")}
          ${bdetJobSummaryRow("Failed", state.botDetail.jobs.filter(isJobFailed).length, "offline")}
          ${bdetJobSummaryRow("Completed", state.botDetail.jobs.filter(isJobSuccess).length, "online")}
        </div>
      </article>

      <!-- Groups Summary -->
      <article class="bdet-overview-card">
        <div class="card-header">
          <div><p class="card-kicker">Groups</p><h3 class="card-title">Membership</h3></div>
          <span class="ds-badge">${escapeHtml(String(state.botDetail.groups.length))} Group</span>
        </div>
        <div class="bdet-scheduler-summary">
          ${bdetJobSummaryRow("Total Groups", state.botDetail.groups.length, "cyan")}
          ${bdetJobSummaryRow("As Admin", state.botDetail.groups.filter((g) => g.status === "admin").length, "online")}
          ${bdetJobSummaryRow("Muted", state.botDetail.groups.filter((g) => g.status === "muted").length, "connecting")}
          ${bdetJobSummaryRow("Active", state.botDetail.groups.filter((g) => g.status === "active").length, "online")}
        </div>
      </article>

      <!-- Activity Timeline -->
      <article class="bdet-overview-activity">
        <div class="card-header">
          <div><p class="card-kicker">Recent Activity</p><h3 class="card-title">Timeline</h3></div>
          <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Realtime</span></span>
        </div>
        <div class="activity-timeline">
          ${
            state.botDetail.activities.slice(0, 8).length
              ? state.botDetail.activities.slice(0, 8).map(activityRow).join("")
              : emptyInline("Belum ada activity realtime untuk bot ini.")
          }
        </div>
      </article>

    </div>
  `;
}

function bdetQueuePill(label, value, tone) {
  return `<div class="bdet-q-pill ${toneClass(tone)}"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`;
}

function bdetJobSummaryRow(label, count, tone) {
  return `<div class="bdet-job-row"><span class="timeline-dot ${toneClass(tone)}"></span><span class="cell-strong">${escapeHtml(label)}</span><strong class="${toneClass(tone)}">${escapeHtml(String(count))}</strong></div>`;
}

function botDetailGroupsTab() {
  const groups = filteredBotGroups();
  const totalPages = Math.max(
    1,
    Math.ceil(groups.length / state.botDetail.groupPageSize),
  );
  state.botDetail.groupPage = clamp(state.botDetail.groupPage, 1, totalPages);
  const start = (state.botDetail.groupPage - 1) * state.botDetail.groupPageSize;
  const page = groups.slice(start, start + state.botDetail.groupPageSize);
  const totalGroups = state.botDetail.groups.length;
  return `
    <div class="bdet-tab-header">
      <div class="bdet-tab-info">
        <p class="card-kicker">Daftar Group</p>
        <h3 class="card-title">${totalGroups} Group Terdaftar</h3>
      </div>
    </div>
    <div class="tab-tools">
      <label class="search-wrap">${svgIcon("search")}<input class="ds-input" data-detail-group-search placeholder="Search nama atau ID group" value="${escapeAttr(state.botDetail.groupQuery)}"></label>
      <select class="ds-select" data-detail-group-filter aria-label="Filter group">
        ${filterOption("all", "Semua Group", state.botDetail.groupFilter)}
        ${filterOption("admin", "Admin", state.botDetail.groupFilter)}
        ${filterOption("muted", "Muted", state.botDetail.groupFilter)}
        ${filterOption("active", "Active", state.botDetail.groupFilter)}
      </select>
    </div>
    ${
      groups.length
        ? `
    <div class="table-wrap detail-table-wrap">
      <table class="ds-table">
        <thead><tr>
          <th>Avatar</th><th>Nama Group</th><th>Group ID</th><th>Members</th><th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${page.map(groupRow).join("")}
        </tbody>
      </table>
    </div>
    <div class="bot-pagination">
      <span class="cell-muted">${start + 1}–${Math.min(start + state.botDetail.groupPageSize, groups.length)} dari ${groups.length} group</span>
      <div class="cluster">
        <button class="ds-button secondary" type="button" data-detail-group-page="-1" ${state.botDetail.groupPage <= 1 ? "disabled" : ""}>${svgIcon("arrowLeft")}<span>Prev</span></button>
        <span class="cell-muted">Hal ${state.botDetail.groupPage}/${totalPages}</span>
        <button class="ds-button secondary" type="button" data-detail-group-page="1" ${state.botDetail.groupPage >= totalPages ? "disabled" : ""}><span>Next</span>${svgIcon("arrowLeft").replace("arrowLeft", "arrowLeft").replace('d="m12 19-7-7 7-7"/><path d="M19 12H5', 'd="m12 5 7 7-7 7"/><path d="M5 12h14')}</button>
      </div>
    </div>`
        : `${emptyState("users", "Belum ada group", "Data group akan tampil saat bot telah bergabung ke grup WhatsApp dan endpoint aktif.")}`
    }
  `;
}

function botDetailQueueTab() {
  const stats = normalizeQueueStats(state.botDetail.queueStats || {});
  const items = state.botDetail.queue;
  const total =
    stats.Running +
    stats.Waiting +
    stats.Failed +
    stats.Completed +
    stats.Retry;
  const progress = total ? Math.round((stats.Completed / total) * 100) : 0;
  return `
    <div class="bdet-tab-header">
      <div class="bdet-tab-info">
        <p class="card-kicker">Message Queue</p>
        <h3 class="card-title">${total} Total Jobs</h3>
      </div>
    </div>
    <div class="bdet-queue-stats-row">
      ${bdetQueueStatCard("Running", stats.Running, "online", "queue")}
      ${bdetQueueStatCard("Waiting", stats.Waiting, "cyan", "clock")}
      ${bdetQueueStatCard("Failed", stats.Failed, "offline", "xCircle")}
      ${bdetQueueStatCard("Completed", stats.Completed, "online", "checkCircle")}
      ${bdetQueueStatCard("Retry", stats.Retry, "connecting", "refresh")}
    </div>
    ${
      total > 0
        ? `
    <div class="bdet-queue-progress">
      <div class="health-meta"><span class="cell-strong">Completion</span><span class="cell-muted">${progress}%</span></div>
      ${progressBar(progress, "online")}
    </div>`
        : ""
    }
    ${
      items.length
        ? `
    <div class="bdet-tab-section-title">Job List</div>
    <div class="bdet-job-list">
      ${items.slice(0, 20).map(queueJobRow).join("")}
    </div>`
        : emptyState(
            "queue",
            "Queue kosong",
            "Tidak ada job queue untuk bot ini saat ini.",
          )
    }
  `;
}

function bdetQueueStatCard(label, value, tone, icon) {
  return `
    <div class="bdet-q-stat ${toneClass(tone)}">
      <div class="bdet-q-stat-icon">${svgIcon(icon)}</div>
      <strong class="bdet-q-stat-val">${escapeHtml(String(value))}</strong>
      <span class="bdet-q-stat-label">${escapeHtml(label)}</span>
    </div>
  `;
}

function botDetailSchedulerTab() {
  const jobs = state.botDetail.jobs;
  const running = jobs.filter(isJobRunning);
  const upcoming = jobs.filter(isJobUpcoming);
  const history = jobs.filter((j) => isJobFailed(j) || isJobSuccess(j));
  return `
    <div class="bdet-tab-header">
      <div class="bdet-tab-info">
        <p class="card-kicker">Job Scheduler</p>
        <h3 class="card-title">${jobs.length} Total Jobs</h3>
      </div>
    </div>
    <div class="bdet-scheduler-grid">
      <article class="bdet-scheduler-col">
        <div class="bdet-scheduler-col-head">
          <span class="timeline-dot tone-online"></span>
          <span class="cell-strong">Running Job</span>
          <span class="ds-badge status-online">${escapeHtml(String(running.length))}</span>
        </div>
        ${running.length ? running.slice(0, 8).map(schedulerJobRow).join("") : emptyInline("Tidak ada running job.")}
      </article>
      <article class="bdet-scheduler-col">
        <div class="bdet-scheduler-col-head">
          <span class="timeline-dot tone-cyan"></span>
          <span class="cell-strong">Upcoming Job</span>
          <span class="ds-badge">${escapeHtml(String(upcoming.length))}</span>
        </div>
        ${upcoming.length ? upcoming.slice(0, 8).map(schedulerJobRow).join("") : emptyInline("Tidak ada upcoming job.")}
      </article>
      <article class="bdet-scheduler-col bdet-scheduler-history">
        <div class="bdet-scheduler-col-head">
          <span class="timeline-dot tone-connecting"></span>
          <span class="cell-strong">History</span>
          <span class="ds-badge">${escapeHtml(String(history.length))}</span>
        </div>
        ${history.length ? history.slice(0, 12).map(schedulerJobRow).join("") : emptyInline("History scheduler kosong.")}
      </article>
    </div>
  `;
}

function botDetailLogsTab() {
  const logs = filteredBotLogs();
  const total = state.botDetail.logs.length;
  return `
    <div class="bdet-tab-header">
      <div class="bdet-tab-info">
        <p class="card-kicker">System Logs</p>
        <h3 class="card-title">${total} Log Entries</h3>
      </div>
    </div>
    <div class="tab-tools">
      <label class="search-wrap" style="flex:1">${svgIcon("search")}<input class="ds-input" data-detail-log-search placeholder="Search level, category, message..." value="${escapeAttr(state.botDetail.logQuery)}"></label>
      <select class="ds-select" data-detail-log-filter style="width:150px" aria-label="Filter log level">
        ${["all", "info", "warn", "warning", "error", "success"].map((level) => filterOption(level, level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1), state.botDetail.logFilter)).join("")}
      </select>
      <button class="ds-button secondary" type="button" data-detail-log-export>${svgIcon("download")}<span>Export</span></button>
    </div>
    <div class="logs bdet-logs" data-bot-detail-logs>
      ${
        logs.length
          ? logs
              .map(
                (log) => `
          <div class="log-row">
            <span class="log-time">${escapeHtml(formatTime(log.time))}</span>
            <span class="log-level ${logTone(log.level)}">${escapeHtml(log.level.toUpperCase())}</span>
            <span class="log-message">${escapeHtml(log.message)}</span>
          </div>`,
              )
              .join("")
          : '<div class="empty-state small" style="min-height:120px">Log bot ini belum tersedia atau tidak ada yang cocok dengan filter.</div>'
      }
    </div>
    ${logs.length ? `<div style="margin-top:8px;color:var(--text-muted);font-size:12px">Menampilkan ${logs.length} dari ${total} entri log</div>` : ""}
  `;
}

function botDetailActivityTab() {
  const activities = state.botDetail.activities;
  return `
    <div class="bdet-tab-header">
      <div class="bdet-tab-info">
        <p class="card-kicker">Bot Activity</p>
        <h3 class="card-title">Timeline Events</h3>
      </div>
      <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Realtime</span></span>
    </div>
    <div class="bdet-activity-timeline">
      ${
        activities.length
          ? activities.map((item, i) => botActivityRow(item, i === 0)).join("")
          : emptyState(
              "activity",
              "Belum ada activity",
              "Aktivitas bot akan muncul di sini secara realtime melalui WebSocket.",
            )
      }
    </div>
  `;
}

function botActivityRow(item, isNew = false) {
  const iconMap = {
    "Bot Connected": "signal",
    "Bot Online": "signal",
    "Bot Offline": "phone",
    "Session Connected": "signal",
    "Session Disconnected": "phone",
    "Session Reconnected": "refresh",
    "Plugin Loaded": "package",
    "Plugin Reloaded": "package",
    "Plugin Error": "alert",
    "Command Executed": "terminal",
    "Command Failed": "xCircle",
    "Broadcast Started": "broadcast",
    "Broadcast Finished": "broadcast",
    "Queue Started": "queue",
    "Queue Finished": "checkCircle",
    "Queue Failed": "xCircle",
    "Scheduler Started": "rocket",
    "Scheduler Finished": "checkCircle",
  };
  const icon = iconMap[item.type] || "activity";
  return `
    <div class="bdet-activity-row ${isNew ? "is-new" : ""}">
      <div class="bdet-activity-dot-wrap">
        <div class="bdet-activity-icon ${toneClass(item.tone)}">${svgIcon(icon)}</div>
        <div class="bdet-activity-line"></div>
      </div>
      <div class="bdet-activity-body">
        <div class="bdet-activity-head">
          <span class="cell-strong">${escapeHtml(item.type)}</span>
          <time class="cell-muted" style="font-size:11px">${escapeHtml(formatDate(item.time))}</time>
        </div>
        <div class="cell-muted bdet-activity-msg">${escapeHtml(item.message || "-")}</div>
      </div>
    </div>
  `;
}

function botDetailStats() {
  const bot = state.botDetail.bot || {};
  const stats = state.botDetail.stats || {};
  const cpu = parseNumber(bot.cpuUsage ?? stats.cpuUsage ?? stats.cpu) ?? 0;
  const ram =
    parseNumber(bot.memoryUsage ?? stats.memoryUsage ?? stats.ram) ?? 0;
  const latency = toNumber(bot.latency ?? stats.latency, 0);
  return {
    cpu: cpu <= 1 ? cpu * 100 : cpu,
    ram,
    ramLabel: bot.memoryUsage || stats.memoryUsage || stats.ramLabel || "-",
    disk: toNumber(stats.diskUsage?.percentage ?? stats.disk, 0),
    latency,
    network: bot.connected ? 100 : bot.status === "connecting" ? 55 : 12,
    uptime: toNumber(bot.uptime ?? stats.uptime, 0),
    sent: toNumber(stats.messagesSent ?? stats.sent, 0),
    received: toNumber(stats.messagesReceived ?? stats.received, 0),
    commands: toNumber(bot.commandCount ?? stats.commands, 0),
    plugins: toNumber(bot.pluginCount ?? stats.plugins, 0),
    groups: toNumber(bot.groupCount ?? state.botDetail.groups.length, 0),
    users: toNumber(bot.userCount ?? stats.users, 0),
    queue: state.botDetail.queue.length,
    scheduler: state.botDetail.jobs.length,
  };
}

function usageTone(value) {
  const number = parseNumber(value) ?? 0;
  if (number >= 85) return "offline";
  if (number >= 70) return "connecting";
  return "cyan";
}

function detailHealthChart(label, key, value) {
  const points = state.botDetail.chart[key] || [];
  return `
    <div class="health-item">
      <div class="health-meta"><span class="cell-strong">${escapeHtml(label)}</span><span class="cell-muted">${Math.round(value)}%</span></div>
      ${lineChart(points, `detail-${key}`)}
      ${progressBar(value, value > 85 ? "offline" : value > 70 ? "connecting" : "cyan")}
    </div>
  `;
}

function latestDetailChartValue(key, fallback = 0) {
  return state.botDetail.chart[key]?.at(-1)?.value ?? fallback;
}

function pushDetailChartPoint(key, value) {
  const list = state.botDetail.chart[key] || [];
  list.push({ value: clamp(toNumber(value, 0), 0, 100), time: Date.now() });
  state.botDetail.chart[key] = list.slice(-28);
}

function seedBotDetailCharts() {
  const stats = botDetailStats();
  if (state.botDetail.chart.cpu.length === 0) {
    for (let i = 0; i < 10; i++) {
      pushDetailChartPoint("cpu", stats.cpu);
      pushDetailChartPoint("ram", stats.ram);
      pushDetailChartPoint("latency", Math.min(100, stats.latency / 30));
      pushDetailChartPoint("network", stats.network);
    }
  }
}

function botQuickAction(label, icon, action) {
  return `<button class="bdet-quick-btn" type="button" data-detail-quick-action="${escapeAttr(action)}">${svgIcon(icon)}<span>${escapeHtml(label)}</span></button>`;
}

function infoItem(label, value) {
  return `<div class="profile-item"><p class="card-kicker">${escapeHtml(label)}</p><div class="cell-strong">${escapeHtml(value || "-")}</div></div>`;
}

function statChip(label, value) {
  return `<div class="queue-pill"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value ?? 0)}</strong></div>`;
}

function normalizeGroups(groups = []) {
  return groups.map((group, index) => ({
    id: group.id || group.jid || group.subject || `group-${index}`,
    name: group.name || group.subject || group.id || "Unnamed Group",
    members: toNumber(
      group.participants?.length ?? group.members ?? group.memberCount,
      0,
    ),
    status: group.muted
      ? "muted"
      : group.isAdmin || group.admin
        ? "admin"
        : "active",
  }));
}

function filteredBotGroups() {
  const term = state.botDetail.groupQuery.trim().toLowerCase();
  const filter = state.botDetail.groupFilter;
  return state.botDetail.groups
    .filter((group) => filter === "all" || group.status === filter)
    .filter(
      (group) =>
        !term || `${group.name} ${group.id}`.toLowerCase().includes(term),
    );
}

function groupRow(group) {
  const statusTone =
    group.status === "admin"
      ? "online"
      : group.status === "muted"
        ? "connecting"
        : "cyan";
  return `
    <tr>
      <td><div class="bot-avatar table-avatar" style="border-radius:var(--radius-sm)">${initials(group.name)}</div></td>
      <td>
        <div class="cell-strong">${escapeHtml(group.name)}</div>
        <div class="cell-muted" style="font-size:11px;margin-top:2px">${escapeHtml(group.id.slice(0, 30))}${group.id.length > 30 ? "…" : ""}</div>
      </td>
      <td><span class="cell-muted" style="font-size:11px">${escapeHtml(group.id)}</span></td>
      <td><span class="cell-muted">${escapeHtml(String(group.members))}</span></td>
      <td>${statusBadge(activityTitle(group.status), statusTone)}</td>
      <td>
        <button class="ds-button secondary" style="min-height:32px;padding:0 10px;font-size:12px" type="button" data-open-group="${escapeAttr(group.id)}">${svgIcon("link")}<span>Open</span></button>
      </td>
    </tr>
  `;
}

function botJobBelongsTo(job = {}, sessionId) {
  const raw = JSON.stringify(job).toLowerCase();
  const id = String(sessionId || "").toLowerCase();
  return !id || raw.includes(id);
}

function botLogBelongsTo(log = {}, sessionId, phoneNumber = "") {
  const raw = `${log.category || ""} ${log.message || ""}`.toLowerCase();
  return (
    raw.includes(String(sessionId).toLowerCase()) ||
    (phoneNumber && raw.includes(String(phoneNumber).toLowerCase()))
  );
}

function buildBotActivities() {
  const bot = state.botDetail.bot || {};
  const activities = [];
  if (bot.status)
    activities.push({
      type: `Bot ${activityTitle(bot.status)}`,
      message: bot.connection || bot.pairingStatus || bot.id,
      time: bot.lastActive || new Date().toISOString(),
      tone: bot.connected ? "online" : "connecting",
    });
  state.botDetail.logs.slice(0, 8).forEach((log) =>
    activities.push({
      type: activityTitle(log.category || log.level),
      message: log.message,
      time: log.time,
      tone:
        log.level === "error"
          ? "offline"
          : log.level === "warn"
            ? "connecting"
            : "cyan",
    }),
  );
  state.botDetail.queue.slice(0, 4).forEach((job) =>
    activities.push({
      type: `Queue ${activityTitle(job.status)}`,
      message: job.queueName || job.id,
      time: job.updatedAt || job.createdAt || new Date().toISOString(),
      tone: job.status === "Failed" ? "offline" : "cyan",
    }),
  );
  state.botDetail.jobs.slice(0, 4).forEach((job) =>
    activities.push({
      type: `Scheduler ${activityTitle(job.status)}`,
      message: job.name || job.id,
      time: job.updatedAt || job.nextRun || new Date().toISOString(),
      tone: isJobFailed(job) ? "offline" : "cyan",
    }),
  );
  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 20);
}

function detailList(items, renderer, emptyCopy) {
  return `<div class="detail-list">${items.length ? items.map(renderer).join("") : emptyInline(emptyCopy)}</div>`;
}

function queueJobRow(job = {}) {
  const tone = String(job.status || "")
    .toLowerCase()
    .includes("fail")
    ? "offline"
    : String(job.status || "")
          .toLowerCase()
          .includes("run")
      ? "online"
      : "cyan";
  return `<div class="activity-row"><span class="timeline-dot ${toneClass(tone)}"></span><div><div class="cell-strong">${escapeHtml(job.queueName || job.name || job.id || "Queue Job")}</div><div class="cell-muted">${escapeHtml(job.status || "-")}</div></div><time>${escapeHtml(formatTime(job.updatedAt || job.createdAt))}</time></div>`;
}

function schedulerJobRow(job = {}) {
  const tone = isJobFailed(job)
    ? "offline"
    : isJobRunning(job)
      ? "online"
      : "cyan";
  return `<div class="activity-row"><span class="timeline-dot ${toneClass(tone)}"></span><div><div class="cell-strong">${escapeHtml(job.name || job.id || "Scheduler Job")}</div><div class="cell-muted">${escapeHtml(job.schedule || job.status || "-")}</div></div><time>${escapeHtml(formatTime(job.nextRun || job.updatedAt || job.lastRun))}</time></div>`;
}

function filteredBotLogs() {
  const term = state.botDetail.logQuery.trim().toLowerCase();
  const level = state.botDetail.logFilter;
  return state.botDetail.logs
    .filter((log) => level === "all" || log.level === level)
    .filter(
      (log) =>
        !term ||
        `${log.level} ${log.category} ${log.message}`
          .toLowerCase()
          .includes(term),
    );
}

function botDetailActivityList(items, emptyCopy) {
  return `<div class="activity-timeline">${items.length ? items.map(activityRow).join("") : emptyInline(emptyCopy)}</div>`;
}

function metricCard(label, value, meta, icon, tone = "cyan", progress = null) {
  const numeric = typeof value === "number" ? value : parseNumber(value);
  return `
    <article class="ds-card card-pad metric-card fade-in">
      <div class="metric-head">
        <div class="metric-icon ${toneClass(tone)}">${svgIcon(icon)}</div>
        <p class="card-kicker">${escapeHtml(label)}</p>
      </div>
      <p class="metric-value" data-counter="${escapeHtml(String(numeric ?? ""))}" data-display="${escapeHtml(String(value))}">${escapeHtml(String(value))}</p>
      <p class="metric-meta">${escapeHtml(meta || "-")}</p>
      ${progress === null ? "" : progressBar(progress, tone)}
    </article>
  `;
}

function botCard(bot) {
  const online = Boolean(bot.connected);
  const id = bot.id || bot.sessionId || bot.phoneNumber;
  const display = bot.displayName || "Unnamed Bot";
  return `
    <article class="bot-card">
      <div class="bot-card-top">
        <div class="bot-avatar">${initials(display || bot.phoneNumber || "BT")}</div>
        <div class="bot-identity">
          <div class="cell-strong">${escapeHtml(display)}</div>
          <div class="cell-muted">${escapeHtml(bot.phoneNumber || bot.id || "-")}</div>
        </div>
        ${statusBadge(online ? "Online" : "Offline", online ? "online" : "offline")}
      </div>
      <div class="bot-stats">
        ${miniStat("Latency", formatLatency(bot.latency))}
        ${miniStat("Memory", bot.memoryUsage || "-")}
        ${miniStat("CPU", formatCpu(bot.cpuUsage))}
        ${miniStat("Groups", bot.groupCount ?? 0)}
        ${miniStat("Users", bot.userCount ?? 0)}
        ${miniStat("Plugin", bot.pluginCount ?? bot.commandCount ?? 0)}
      </div>
      <div class="bot-actions">
        <button class="ds-button secondary" type="button" data-bot-detail="${escapeAttr(id)}">${svgIcon("eye")}<span>Detail</span></button>
        <button class="ds-button secondary" type="button" data-bot-restart="${escapeAttr(id)}">${svgIcon("restart")}<span>Restart</span></button>
        <button class="ds-button primary" type="button" data-bot-reconnect="${escapeAttr(id)}">${svgIcon("refresh")}<span>Reconnect</span></button>
      </div>
    </article>
  `;
}

function healthChart(label, key, value) {
  const points = state.dashboard.chart[key] || [];
  return `
    <div class="health-item">
      <div class="health-meta">
        <span class="cell-strong">${escapeHtml(label)}</span>
        <span class="cell-muted">${Math.round(value)}%</span>
      </div>
      ${lineChart(points, key)}
      ${progressBar(value, value > 85 ? "offline" : value > 70 ? "connecting" : "cyan")}
    </div>
  `;
}

function lineChart(points, key) {
  const values = points.length
    ? points.map((point) => point.value)
    : [0, 0, 0, 0];
  const width = 260;
  const height = 76;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const path = values
    .map((value, index) => {
      const x = Math.round(index * step);
      const y = Math.round(
        height - (clamp(value, 0, 100) / 100) * (height - 8) - 4,
      );
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return `
    <svg class="mini-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(key)} usage chart">
      <defs><linearGradient id="fill-${escapeAttr(key)}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".26"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
      <path class="mini-chart-grid" d="M0 18H${width}M0 38H${width}M0 58H${width}"></path>
      <path class="mini-chart-area" d="${area}" fill="url(#fill-${escapeAttr(key)})"></path>
      <path class="mini-chart-line" d="${path}"></path>
    </svg>
  `;
}

function queueOverview(queue) {
  const total =
    queue.Running +
    queue.Waiting +
    queue.Failed +
    queue.Completed +
    queue.Retry;
  const progress = total ? (queue.Completed / total) * 100 : 0;
  return `
    <article class="ds-card card-pad">
      <div class="card-header"><div><p class="card-kicker">Queue Overview</p><h2 class="card-title">Workload</h2></div>${statusBadge(queue.Failed ? "Attention" : "Stable", queue.Failed ? "connecting" : "online")}</div>
      <div class="queue-radar">
        ${queuePill("Running", queue.Running, "online")}
        ${queuePill("Waiting", queue.Waiting, "cyan")}
        ${queuePill("Failed", queue.Failed, "offline")}
        ${queuePill("Completed", queue.Completed, "online")}
        ${queuePill("Retry", queue.Retry, "connecting")}
      </div>
      <div class="progress-block">
        <div class="health-meta"><span class="cell-strong">Progress</span><span class="cell-muted">${Math.round(progress)}%</span></div>
        ${progressBar(progress, "online")}
      </div>
    </article>
  `;
}

function schedulerOverview(jobs) {
  const upcoming = jobs.filter(isJobUpcoming).slice(0, 3);
  const running = jobs.filter(isJobRunning).slice(0, 3);
  const failed = jobs.filter(isJobFailed).slice(0, 3);
  const lastSuccess = jobs.filter(isJobSuccess).sort(sortByRecent).at(0);
  return `
    <article class="ds-card card-pad">
      <div class="card-header"><div><p class="card-kicker">Scheduler</p><h2 class="card-title">Job State</h2></div>${statusBadge(`${running.length} Running`, running.length ? "online" : "cyan")}</div>
      <div class="scheduler-list">
        ${schedulerRow("Upcoming Job", upcoming[0])}
        ${schedulerRow("Running Job", running[0])}
        ${schedulerRow("Failed Job", failed[0], "offline")}
        ${schedulerRow("Last Success", lastSuccess, "online")}
      </div>
    </article>
  `;
}

function activityTimeline() {
  const activities = state.dashboard.activities.slice(0, 9);
  return `
    <article class="ds-card card-pad">
      <div class="card-header"><div><p class="card-kicker">Recent Activity</p><h2 class="card-title">Timeline</h2></div><span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Realtime</span></span></div>
      <div class="activity-timeline">
        ${activities.length ? activities.map(activityRow).join("") : emptyInline("Belum ada activity realtime.")}
      </div>
    </article>
  `;
}

function alertsPanel() {
  const alerts = state.dashboard.alerts.slice(0, 8);
  return `
    <article class="ds-card card-pad">
      <div class="card-header"><div><p class="card-kicker">System Alert</p><h2 class="card-title">Warnings & Errors</h2></div>${statusBadge(alerts.length ? `${alerts.length} Active` : "Clear", alerts.length ? "connecting" : "online")}</div>
      <div class="alert-list">
        ${alerts.length ? alerts.map(alertRow).join("") : emptyInline("Tidak ada alert aktif.")}
      </div>
    </article>
  `;
}

function liveLogPanel() {
  return `
    <article class="ds-card card-pad live-log-panel">
      <div class="card-header">
        <div><p class="card-kicker">Live Log</p><h2 class="card-title">20 Log Terbaru</h2></div>
        <div class="log-tools">
          <label class="search-wrap log-search">
            ${svgIcon("search")}
            <input class="ds-input" data-log-search placeholder="Search log" value="${escapeAttr(state.dashboard.logSearch)}">
          </label>
          <select class="ds-select log-filter" data-log-filter>
            ${["all", "info", "warn", "error", "success"].map((level) => `<option value="${level}"${state.dashboard.logFilter === level ? " selected" : ""}>${level}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="logs compact-logs" data-live-logs></div>
    </article>
  `;
}

function quickActionsPanel() {
  const actions = [
    ["Tambah Bot", "bot", "sessions"],
    ["Broadcast", "broadcast", "activity"],
    ["Reload Plugin", "refresh", "plugins"],
    ["Restart Semua Bot", "restart", "restart-all"],
    ["Open Logs", "terminal", "logs"],
    ["Open Monitoring", "monitor", "monitoring"],
  ];
  return `
    <section class="quick-actions ds-card card-pad">
      <div class="card-header"><div><p class="card-kicker">Quick Action</p><h2 class="card-title">Operational Shortcuts</h2></div></div>
      <div class="quick-action-grid">
        ${actions.map(([label, icon, action]) => `<button class="quick-action" type="button" data-quick-action="${action}">${svgIcon(icon)}<span>${escapeHtml(label)}</span></button>`).join("")}
      </div>
    </section>
  `;
}

function renderLiveLogRows() {
  const target = $("[data-live-logs]");
  if (!target) return;
  const term = state.dashboard.logSearch.trim().toLowerCase();
  const level = state.dashboard.logFilter;
  const rows = state.dashboard.logs
    .filter((log) => level === "all" || log.level === level)
    .filter(
      (log) =>
        !term ||
        `${log.level} ${log.category} ${log.message}`
          .toLowerCase()
          .includes(term),
    )
    .slice(0, 20);

  target.innerHTML = rows.length
    ? rows
        .map(
          (log) => `
    <div class="log-row">
      <span>${escapeHtml(formatTime(log.time))}</span>
      <span class="log-level ${logTone(log.level)}">${escapeHtml(log.level)}</span>
      <span class="log-message">${escapeHtml(log.message)}</span>
    </div>
  `,
        )
        .join("")
    : `<div class="empty-state small">Log tidak ditemukan.</div>`;
}

function animateCounters(root = document) {
  root.querySelectorAll("[data-counter]").forEach((el) => {
    const display = el.dataset.display || el.textContent;
    const target = parseNumber(el.dataset.counter);
    if (target === null || !Number.isFinite(target)) {
      el.textContent = display;
      return;
    }

    const key = `${el.closest(".metric-card")?.querySelector(".card-kicker")?.textContent || ""}-${display}`;
    const from = state.counters.get(key) ?? 0;
    const start = performance.now();
    const duration = 680;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      el.textContent = display.includes("%")
        ? `${current}%`
        : display.match(/^\d+$/)
          ? String(current)
          : display;
      if (progress < 1) requestAnimationFrame(tick);
      else {
        el.textContent = display;
        state.counters.set(key, target);
      }
    };
    requestAnimationFrame(tick);
  });
}

function updateDashboardFromSocket(event, payload = {}) {
  if (event.startsWith("bot.") || event.startsWith("session.")) {
    updateBotFromSocket(event, payload);
    addActivity(
      eventLabel(event),
      payload.sessionId || payload.id || payload.bot?.id || "Bot state changed",
      event.includes("error") ? "offline" : "online",
    );
    if (state.activeRoute === "dashboard" && state.dashboard.loaded)
      renderDashboard();
    return;
  }
  if (!state.dashboard.loaded) return;
  if (event === "cpu.updated") {
    pushChartPoint("cpu", payload.percentage);
    updateBotDetailMetricsFromSocket(event, payload);
  } else if (event === "memory.updated") {
    pushChartPoint("ram", payload.percentage);
    updateBotDetailMetricsFromSocket(event, payload);
  } else if (event === "disk.updated") {
    pushChartPoint("disk", payload.percentage);
    updateBotDetailMetricsFromSocket(event, payload);
  } else if (event === "health.updated") {
    state.dashboard.health = payload;
    pushChartPoint("network", networkSignal());
    updateBotDetailMetricsFromSocket(event, payload);
  } else if (event.startsWith("queue.")) {
    applyQueueEvent(payload.job);
    applyBotDetailQueueEvent(payload.job || payload);
    addActivity(
      eventLabel(event),
      queueEventMessage(payload),
      event.includes("failed") ? "offline" : "cyan",
    );
    state.dashboard.alerts = buildAlerts();
  } else if (event.startsWith("job.")) {
    upsertById(state.dashboard.jobs, payload.job || payload);
    applyBotDetailJobEvent(payload.job || payload);
    addActivity(
      eventLabel(event),
      payload.name || payload.job?.name || "Scheduler job updated",
      event.includes("failed") ? "offline" : "cyan",
    );
    state.dashboard.alerts = buildAlerts();
  } else if (
    event.startsWith("plugin.") ||
    event.startsWith("command.") ||
    event.startsWith("broadcast.")
  ) {
    addActivity(
      eventLabel(event),
      payload.name || payload.total || payload.id || "Runtime event",
      event.includes("error") ? "offline" : "cyan",
    );
  }

  if (state.activeRoute === "dashboard") renderDashboard();
}

function updateBotDetailMetricsFromSocket(event, payload = {}) {
  if (state.activeRoute !== `bot-detail:${state.botDetail.sessionId}`) return;
  const stats = botDetailStats();

  if (event === "cpu.updated") {
    pushDetailChartPoint("cpu", payload.percentage);
    updateBdetSysCardDom(
      "cpu",
      formatCpu(payload.percentage),
      usageTone(payload.percentage),
      payload.percentage,
    );
  } else if (event === "memory.updated") {
    pushDetailChartPoint("ram", payload.percentage);
    updateBdetSysCardDom(
      "ram",
      payload.label || stats.ramLabel,
      usageTone(payload.percentage),
      payload.percentage,
    );
  } else if (event === "disk.updated") {
    pushDetailChartPoint("disk", payload.percentage);
    updateBdetSysCardDom(
      "disk",
      `${Math.round(payload.percentage)}%`,
      usageTone(payload.percentage),
      payload.percentage,
    );
  } else if (event === "health.updated") {
    pushDetailChartPoint("network", stats.network);
    updateBdetSysCardDom(
      "network",
      `${Math.round(stats.network)}%`,
      stats.network > 70 ? "online" : "connecting",
      stats.network,
    );
  }

  updateBotDetailChartsDom();
}

function updateBdetSysCardDom(cardName, value, tone, progress) {
  const card = $(`[data-bdet-sys-card="${cardName}"]`);
  if (!card) return;

  const valEl = card.querySelector("[data-bdet-sys-val]");
  if (valEl && valEl.textContent !== value) valEl.textContent = value;

  const iconEl = card.querySelector("[data-bdet-sys-icon]");
  if (iconEl) {
    iconEl.className = `metric-icon ${toneClass(tone)}`;
  }

  const progressContainer = card.querySelector(
    "[data-bdet-sys-progress-container]",
  );
  if (progressContainer) {
    progressContainer.innerHTML =
      progress !== null
        ? progressBar(clamp(toNumber(progress, 0), 0, 100), tone)
        : '<div class="bdet-sys-placeholder"></div>';
  }
}

function updateBotFromSocket(event, payload = {}) {
  const incoming = payload.bot || payload.session || payload.data || payload;
  const id = String(
    incoming.id || incoming.sessionId || payload.sessionId || payload.id || "",
  ).trim();
  if (!id) {
    if (state.activeRoute === "bots" && state.bots.loaded)
      loadBotManagement({ silent: true });
    return;
  }

  if (event === "bot.deleted") {
    state.bots.items = state.bots.items.filter((bot) => bot.id !== id);
    state.dashboard.bots = state.bots.items;
    state.bots.selected.delete(id);
    const row = $(`[data-bot-row="${cssEscape(id)}"]`);
    if (row) row.remove();
    updateBotStatsDom();
    updateBotSelectionControls();
    updatePairingFromBot({ id, status: "deleted" });
    return;
  }

  const index = state.bots.items.findIndex(
    (bot) => bot.id === id || bot.sessionId === id,
  );
  const previous = index >= 0 ? state.bots.items[index] : {};
  const normalized = normalizeBot({
    ...previous,
    ...incoming,
    id,
    sessionId: incoming.sessionId || id,
  });
  if (index >= 0) state.bots.items[index] = normalized;
  else state.bots.items.unshift(normalized);
  state.dashboard.bots = state.bots.items;
  updatePairingFromBot(normalized);
  updateOpenBotDetail(normalized);

  if (state.activeRoute !== "bots") return;
  const row = $(`[data-bot-row="${cssEscape(normalized.id)}"]`);
  const visible = pagedBots().some((bot) => bot.id === normalized.id);
  if (row && visible) {
    row.outerHTML = botRow(normalized);
    const nextRow = $(`[data-bot-row="${cssEscape(normalized.id)}"]`);
    if (nextRow) hydrateIcons(nextRow);
  } else {
    renderBotTableRows();
  }
  updateBotStatsDom();
}

function updateOpenBotDetail(bot) {
  if (
    state.botDetail.sessionId !== bot.id &&
    state.botDetail.sessionId !== bot.sessionId
  )
    return;
  state.botDetail.bot = normalizeBot({
    ...(state.botDetail.bot || {}),
    ...bot,
  });
  seedBotDetailCharts();
  if (state.activeRoute !== `bot-detail:${state.botDetail.sessionId}`) return;
  const stats = botDetailStats();
  const statusTone =
    bot.status === "online"
      ? "online"
      : bot.status === "connecting"
        ? "connecting"
        : bot.status === "restarting"
          ? "cyan"
          : "offline";
  const set = (selector, value) => {
    const el = $(selector);
    if (el && el.textContent !== value) el.textContent = value;
  };
  set("[data-detail-name]", state.botDetail.bot.displayName || "Unnamed Bot");
  set("[data-detail-phone]", state.botDetail.bot.phoneNumber || "-");
  set(
    "[data-detail-session]",
    state.botDetail.bot.sessionId || state.botDetail.bot.id || "-",
  );
  set("[data-detail-latency]", formatLatency(stats.latency));
  set("[data-detail-uptime]", formatDuration(stats.uptime));
  set(
    "[data-detail-connection]",
    state.botDetail.bot.connection || state.botDetail.bot.pairingStatus || "-",
  );
  const pairingEl = $("[data-detail-pairing-code]");
  if (pairingEl) pairingEl.textContent = state.botDetail.bot.pairingCode || "-";
  const pairingTs = $("[data-detail-pairing-timestamp]");
  if (pairingTs) pairingTs.textContent = state.botDetail.bot.pairingGeneratedAt ? formatDate(state.botDetail.bot.pairingGeneratedAt) : "";
  const status = $("[data-detail-status]");
  if (status) {
    const newHtml = statusBadge(
      activityTitle(state.botDetail.bot.status || "offline"),
      statusTone,
    );
    if (status.innerHTML !== newHtml) {
      status.innerHTML = newHtml;
      hydrateIcons(status);
    }
  }
  // Update avatar online ring
  const avatar = $(".bdet-avatar");
  if (avatar)
    avatar.classList.toggle(
      "is-online",
      state.botDetail.bot.status === "online",
    );
  // Update page title
  $("[data-page-title]").textContent =
    state.botDetail.bot.displayName || "Bot Detail";
}

function addLog(log) {
  const normalized = normalizeLogs([log])[0];
  state.dashboard.logs = [normalized, ...state.dashboard.logs].slice(0, 20);
  addBotDetailLog(normalized);
  addActivity(
    activityTitle(normalized.category || normalized.level),
    normalized.message,
    normalized.level === "error"
      ? "offline"
      : normalized.level === "warn"
        ? "connecting"
        : "cyan",
  );
  state.dashboard.alerts = buildAlerts();
  if (state.activeRoute === "dashboard") renderDashboard();
}

function applyBotDetailQueueEvent(job) {
  if (
    !job ||
    !state.botDetail.sessionId ||
    !botJobBelongsTo(job, state.botDetail.sessionId)
  )
    return;
  upsertById(state.botDetail.queue, job);
  state.botDetail.activities = [
    {
      type: eventLabel(`queue.${job.status || "updated"}`),
      message: job.queueName || job.id || "Queue updated",
      time: new Date().toISOString(),
      tone: isJobFailed(job) ? "offline" : "cyan",
    },
    ...state.botDetail.activities,
  ].slice(0, 20);
  if (
    state.activeRoute === `bot-detail:${state.botDetail.sessionId}` &&
    ["queue", "activity", "overview"].includes(state.botDetail.tab)
  )
    renderBotDetailTab();
}

function applyBotDetailJobEvent(job) {
  if (
    !job ||
    !state.botDetail.sessionId ||
    !botJobBelongsTo(job, state.botDetail.sessionId)
  )
    return;
  upsertById(state.botDetail.jobs, job);
  state.botDetail.activities = [
    {
      type: eventLabel(`scheduler.${job.status || "updated"}`),
      message: job.name || job.id || "Scheduler updated",
      time: new Date().toISOString(),
      tone: isJobFailed(job) ? "offline" : "cyan",
    },
    ...state.botDetail.activities,
  ].slice(0, 20);
  if (
    state.activeRoute === `bot-detail:${state.botDetail.sessionId}` &&
    ["scheduler", "activity", "overview"].includes(state.botDetail.tab)
  )
    renderBotDetailTab();
}

function addBotDetailLog(log) {
  const bot = state.botDetail.bot || {};
  if (
    !state.botDetail.sessionId ||
    !botLogBelongsTo(log, state.botDetail.sessionId, bot.phoneNumber)
  )
    return;
  state.botDetail.logs = [log, ...state.botDetail.logs].slice(0, 80);
  state.botDetail.activities = [
    {
      type: activityTitle(log.category || log.level),
      message: log.message,
      time: log.time,
      tone: log.level === "error" ? "offline" : "cyan",
    },
    ...state.botDetail.activities,
  ].slice(0, 20);
  if (
    state.activeRoute === `bot-detail:${state.botDetail.sessionId}` &&
    ["logs", "activity", "overview"].includes(state.botDetail.tab)
  )
    renderBotDetailTab();
}

function applyQueueEvent(job) {
  if (!job) return;
  const stats = normalizeQueueStats(state.dashboard.queue);
  state.dashboard.queue = stats;
  if (job.status === "Running") stats.Running += 1;
  if (job.status === "Waiting") stats.Waiting += 1;
  if (job.status === "Completed") stats.Completed += 1;
  if (job.status === "Failed") stats.Failed += 1;
  if (job.status === "Retrying") stats.Retry += 1;
}

function addActivity(type, message, tone = "cyan") {
  state.dashboard.activities = [
    {
      type,
      message: String(message || "-"),
      time: new Date().toISOString(),
      tone,
    },
    ...state.dashboard.activities,
  ].slice(0, 12);
}

function buildAlerts() {
  const system = state.dashboard.system || {};
  const queue = normalizeQueueStats(state.dashboard.queue);
  const bots = state.dashboard.bots || [];
  const ram = latestChartValue("ram", memoryPercentage(system));
  const cpu = latestChartValue("cpu", toNumber(system.stats?.cpuUsage, 0));
  const disk = latestChartValue(
    "disk",
    toNumber(system.stats?.diskUsage?.percentage, 0),
  );
  const alerts = [];

  if (bots.length && bots.some((bot) => !bot.connected))
    alerts.push({
      type: "Reconnect",
      message: `${bots.filter((bot) => !bot.connected).length} bot offline`,
      tone: "connecting",
    });
  if (cpu >= 85)
    alerts.push({
      type: "Warning",
      message: `CPU high at ${Math.round(cpu)}%`,
      tone: "connecting",
    });
  if (ram >= 85)
    alerts.push({
      type: "Memory High",
      message: `RAM usage ${Math.round(ram)}%`,
      tone: "offline",
    });
  if (disk >= 92)
    alerts.push({
      type: "Disk Full",
      message: `Disk usage ${Math.round(disk)}%`,
      tone: "offline",
    });
  if (queue.Failed > 0)
    alerts.push({
      type: "Queue Error",
      message: `${queue.Failed} failed jobs`,
      tone: "offline",
    });
  state.dashboard.logs
    .filter((log) => log.level === "error")
    .slice(0, 2)
    .forEach((log) =>
      alerts.push({ type: "Error", message: log.message, tone: "offline" }),
    );

  return alerts;
}

function statusBadge(label, tone = null) {
  const resolved =
    tone ||
    (String(label).toLowerCase().includes("offline") ? "offline" : "online");
  return `<span class="ds-badge status-${resolved === "cyan" ? "restarting" : resolved}"><span class="status-dot"></span><span>${escapeHtml(label)}</span></span>`;
}

function progressBar(value, tone = "cyan") {
  return `<div class="progress-track"><span class="progress-fill ${toneClass(tone)}" style="width:${clamp(toNumber(value, 0), 0, 100)}%"></span></div>`;
}

function miniStat(label, value) {
  return `<div><span class="cell-muted">${escapeHtml(label)}</span><strong>${escapeHtml(value ?? "-")}</strong></div>`;
}

function queuePill(label, value, tone) {
  return `<div class="queue-pill ${toneClass(tone)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function schedulerRow(label, job, tone = "cyan") {
  return `<div class="scheduler-row"><span class="status-dot ${toneClass(tone)}"></span><div><div class="cell-strong">${escapeHtml(label)}</div><div class="cell-muted">${escapeHtml(job?.name || job?.id || "-")} ${job?.nextRun ? `- ${formatDate(job.nextRun)}` : ""}</div></div></div>`;
}

function activityRow(item) {
  return `<div class="activity-row"><span class="timeline-dot ${toneClass(item.tone)}"></span><div><div class="cell-strong">${escapeHtml(item.type)}</div><div class="cell-muted">${escapeHtml(item.message)}</div></div><time>${escapeHtml(formatTime(item.time))}</time></div>`;
}

function alertRow(item) {
  return `<div class="alert-row ${toneClass(item.tone)}"><div>${svgIcon("alert")}</div><div><div class="cell-strong">${escapeHtml(item.type)}</div><div class="cell-muted">${escapeHtml(item.message)}</div></div></div>`;
}

function emptyState(icon, title, copy) {
  return `<div class="empty-state overview-empty"><div class="empty-icon">${svgIcon(icon)}</div><div><div class="cell-strong">${escapeHtml(title)}</div><div class="cell-muted">${escapeHtml(copy)}</div></div></div>`;
}

function emptyInline(copy) {
  return `<div class="empty-inline">${escapeHtml(copy)}</div>`;
}

function normalizeQueueStats(stats = {}) {
  return {
    Running: toNumber(stats.Running ?? stats.running, 0),
    Waiting: toNumber(stats.Waiting ?? stats.waiting, 0),
    Failed: toNumber(stats.Failed ?? stats.failed, 0),
    Completed: toNumber(stats.Completed ?? stats.completed, 0),
    Retry: toNumber(stats.Retry ?? stats.retry ?? stats.retrying, 0),
    AverageTime: toNumber(stats.AverageTime ?? stats.averageTime, 0),
  };
}

function memoryPercentage(system = {}) {
  if (system.os?.totalMemory && system.os?.freeMemory !== undefined) {
    return (
      ((system.os.totalMemory - system.os.freeMemory) / system.os.totalMemory) *
      100
    );
  }
  if (system.memory?.heapTotal)
    return (system.memory.heapUsed / system.memory.heapTotal) * 100;
  if (system.stats?.ramUsage?.heapTotal)
    return (
      (system.stats.ramUsage.heapUsed / system.stats.ramUsage.heapTotal) * 100
    );
  return 0;
}

function memoryLabel(system = {}) {
  if (system.memory?.rss)
    return `${system.memory.rss} ${system.memory.unit || "MB"} RSS`;
  if (system.stats?.ramUsage?.label) return system.stats.ramUsage.label;
  return "Runtime memory";
}

function cpuMeta(system = {}) {
  const cores = system.cpu?.cores;
  return cores ? `${cores} cores` : "Load average";
}

function latestChartValue(key, fallback = 0) {
  return state.dashboard.chart[key]?.at(-1)?.value ?? fallback;
}

function countOf(items, fallback = 0) {
  return items.length || toNumber(fallback, 0);
}

function toNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseNumber(value) {
  const match = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(seconds) {
  const total =
    Number(seconds) > 1000000
      ? Math.floor(Number(seconds) / 1000)
      : Math.floor(Number(seconds) || 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLatency(value) {
  const latency = toNumber(value, null);
  return latency === null ? "-" : `${Math.round(latency)} ms`;
}

function formatCpu(value) {
  const cpu = toNumber(value, null);
  return cpu === null
    ? "-"
    : cpu <= 1
      ? `${Math.round(cpu * 100)}%`
      : `${cpu}%`;
}

function initials(value) {
  return (
    String(value || "BT")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "BT"
  );
}

function toneClass(tone = "cyan") {
  return (
    {
      online: "tone-online",
      offline: "tone-offline",
      connecting: "tone-connecting",
      cyan: "tone-cyan",
    }[tone] || "tone-cyan"
  );
}

function logTone(level) {
  if (level === "error") return "tone-offline";
  if (level === "warn" || level === "warning") return "tone-connecting";
  if (level === "success") return "tone-online";
  return "tone-cyan";
}

function networkSignal() {
  const onlineBots = state.dashboard.bots.filter((bot) => bot.connected).length;
  const totalBots = state.dashboard.bots.length || 1;
  return Math.round((onlineBots / totalBots) * 100);
}

function isJobRunning(job) {
  return ["running", "processing"].includes(
    String(job?.status || "").toLowerCase(),
  );
}

function isJobUpcoming(job) {
  return (
    ["active", "scheduled", "waiting"].includes(
      String(job?.status || "").toLowerCase(),
    ) || Boolean(job?.nextRun)
  );
}

function isJobFailed(job) {
  return ["failed", "error"].includes(String(job?.status || "").toLowerCase());
}

function isJobSuccess(job) {
  return (
    ["completed", "success", "finished"].includes(
      String(job?.status || "").toLowerCase(),
    ) || Boolean(job?.lastRun)
  );
}

function sortByRecent(a, b) {
  return (
    new Date(b.finishedAt || b.lastRun || b.updatedAt || 0) -
    new Date(a.finishedAt || a.lastRun || a.updatedAt || 0)
  );
}

function upsertById(list, item) {
  if (!item?.id) return;
  const index = list.findIndex((entry) => entry.id === item.id);
  if (index >= 0) list[index] = { ...list[index], ...item };
  else list.unshift(item);
}

function eventLabel(event) {
  return String(event || "")
    .split(".")
    .map(activityTitle)
    .join(" ");
}

function activityTitle(value) {
  return String(value || "Activity")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function queueEventMessage(payload = {}) {
  return payload.job?.id || payload.queueName || "Queue updated";
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function renderPlaceholder(route) {
  const titles = {
    dashboard: "Dashboard Placeholder",
    sessions: "Sessions Placeholder",
    queue: "Queue Placeholder",
    plugins: "Plugins Placeholder",
    activity: "Activity Placeholder",
  };
  $("[data-page-title]").textContent = titles[route] || "Dashboard";
  $("[data-page-subtitle]").textContent =
    "Authentication shell is ready for next dashboard pages";
  $("[data-view-root]").innerHTML = `
    <article class="ds-card card-pad shell-placeholder">
      <p class="card-kicker">Authenticated Route</p>
      <h2 class="placeholder-title">${escapeHtml(titles[route] || "Placeholder")}</h2>
      <p class="placeholder-copy">Halaman ini sengaja belum diimplementasikan. Foundation authentication, route guard, app shell, dan lifecycle realtime sudah siap dipakai untuk pengembangan dashboard berikutnya.</p>
      <div class="placeholder-grid">
        <div><span class="ds-badge status-online"><span class="status-dot"></span><span>Role Guard</span></span><p class="cell-muted">Current role: ${escapeHtml(formatRole(state.user.role))}</p></div>
        <div><span class="ds-badge status-restarting"><span class="status-dot"></span><span>Auto Refresh</span></span><p class="cell-muted">JWT retry aktif saat token expired.</p></div>
        <div><span class="ds-badge accent-cyan"><span class="status-dot"></span><span>Socket</span></span><p class="cell-muted">Connected after login.</p></div>
      </div>
    </article>
  `;
}

function renderProfile() {
  $("[data-page-title]").textContent = "Profile";
  $("[data-page-subtitle]").textContent = "Current authenticated API user";
  $("[data-view-root]").innerHTML = `
    <article class="ds-card card-pad">
      <div class="card-header">
        <div>
          <p class="card-kicker">Account</p>
          <h2 class="card-title">Profile</h2>
        </div>
        <span class="ds-badge accent-cyan"><span class="status-dot"></span><span>${escapeHtml(formatRole(state.user.role))}</span></span>
      </div>
      <div class="profile-grid">
        ${profileItem("Username", state.user.username)}
        ${profileItem("Email", state.user.email || "-")}
        ${profileItem("Role", formatRole(state.user.role))}
        ${profileItem("Last Login", formatDate(state.user.lastLogin))}
      </div>
    </article>
  `;
}

function renderSettings() {
  $("[data-page-title]").textContent = "Settings";
  $("[data-page-subtitle]").textContent = "Authentication settings placeholder";
  $("[data-view-root]").innerHTML = `
    <article class="ds-card card-pad shell-placeholder">
      <p class="card-kicker">Settings</p>
      <h2 class="placeholder-title">Settings Placeholder</h2>
      <p class="placeholder-copy">Route ini sudah dilindungi untuk Owner, Admin, dan Developer. Implementasi pengaturan detail dapat masuk pada tahap berikutnya.</p>
    </article>
  `;
}

function profileItem(label, value) {
  return `<div class="profile-item"><p class="card-kicker">${escapeHtml(label)}</p><div class="cell-strong">${escapeHtml(value || "-")}</div></div>`;
}

function renderError(code) {
  const map = {
    401: [
      "Unauthorized",
      "Session tidak valid atau sudah berakhir. Silakan login ulang untuk melanjutkan.",
    ],
    403: [
      "Forbidden",
      "Role akun ini belum memiliki akses ke halaman tersebut.",
    ],
    404: ["Not Found", "Route dashboard yang diminta tidak tersedia."],
    500: [
      "Internal Server Error",
      "Terjadi masalah tak terduga pada aplikasi dashboard.",
    ],
  };
  const [title, copy] = map[code] || map[500];
  $("[data-page-title]").textContent = title;
  $("[data-page-subtitle]").textContent = `Error ${code}`;
  $("[data-view-root]").innerHTML = `
    <article class="ds-card card-pad error-page">
      <div>
        <p class="error-code">${code}</p>
        <h2 class="error-title">${title}</h2>
        <p class="error-copy">${copy}</p>
        <button class="ds-button secondary" type="button" data-route="dashboard">Back to Dashboard</button>
      </div>
    </article>
  `;
  hydrateIcons($("[data-view-root]"));
}

async function login(form) {
  const formData = new FormData(form);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const remember = formData.get("remember") === "on";
  const error = $("[data-login-error]");
  const button = $("[data-login-button]");

  error.hidden = true;
  setButtonLoading(button, true);

  try {
    const data = await api.request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
      false,
    );
    tokenStore.write(data, remember);
    state.user = data.user;
    await enterApp();
    showToast("success", "Login berhasil.");
  } catch (err) {
    error.textContent = err.message || "Login gagal.";
    error.hidden = false;
  } finally {
    setButtonLoading(button, false);
  }
}

async function restoreSession() {
  setLoading(true);
  if (!tokenStore.accessToken() && !tokenStore.refreshToken()) {
    showAuth();
    return;
  }

  try {
    if (!tokenStore.accessToken()) {
      const refreshed = await api.refresh();
      if (!refreshed) throw new ApiError(401, "Session expired");
    }
    state.user = await api.request("/auth/me");
    await enterApp();
  } catch (err) {
    tokenStore.clear();
    showAuth();
    if (err.status === 403) showToast("error", err.message);
  } finally {
    setLoading(false);
  }
}

async function enterApp() {
  showShell();
  renderUser(state.user);
  connectSocket();
  startStatusPolling();
  navigate(routeFromLocation());
}

async function logout({ all = false } = {}) {
  setLoading(
    true,
    all ? "Logging out all sessions" : "Logging out",
    "Revoking session token...",
  );
  try {
    if (all) {
      await api.request("/auth/sessions", { method: "DELETE" });
    } else {
      await api.request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokenStore.refreshToken() }),
      });
    }
  } catch (err) {
    if (![401, 403].includes(err.status)) showToast("warning", err.message);
  } finally {
    tokenStore.clear();
    state.user = null;
    showAuth();
    setLoading(false);
    showToast("info", all ? "Semua session dicabut." : "Logout berhasil.");
  }
}

async function connectSocket() {
  disconnectSocket();
  if (!window.io) {
    $("[data-session-state]").textContent = "Loading realtime client";
    const loaded = await loadSocketClient();
    if (!loaded || !state.user) {
      $("[data-session-state]").textContent = "Realtime client unavailable";
      return;
    }
  }

  state.socket = window.io(API_ORIGIN, {
    auth: { token: tokenStore.accessToken() },
    transports: ["websocket", "polling"],
  });

  state.socket.on("connect", () => {
    $("[data-session-state]").textContent = "Realtime connected";
    [
      "system",
      "global",
      "bot",
      "session",
      "queue",
      "scheduler",
      "broadcast",
      "logs",
    ].forEach((room) => state.socket.emit("subscribe", room));
  });
  state.socket.on("ready", () => {
    loadDashboardOverview({ silent: true });
  });
  state.socket.on("disconnect", () => {
    $("[data-session-state]").textContent = state.user
      ? "Realtime disconnected"
      : "Session protected";
  });
  state.socket.on("connect_error", (err) => {
    $("[data-session-state]").textContent = "Realtime auth failed";
    if (err?.message?.toLowerCase().includes("unauthorized"))
      api.refresh().then((ok) => {
        if (ok && state.user) connectSocket();
      });
  });

  ["cpu.updated", "memory.updated", "disk.updated", "health.updated"].forEach(
    (event) => {
      state.socket.on(event, (payload) =>
        updateDashboardFromSocket(event, payload),
      );
    },
  );
  [
    "bot.created",
    "bot.updated",
    "bot.deleted",
    "bot.restart",
    "bot.error",
    "session.connecting",
    "session.connected",
    "session.disconnected",
    "session.reconnected",
    "session.updated",
    "plugin.loaded",
    "plugin.reloaded",
    "plugin.error",
    "command.executed",
    "command.failed",
    "broadcast.started",
    "broadcast.finished",
    "queue.created",
    "queue.started",
    "queue.finished",
    "queue.failed",
    "queue.cancelled",
    "job.created",
    "job.started",
    "job.finished",
    "job.failed",
    "job.paused",
    "job.resumed",
  ].forEach((event) => {
    state.socket.on(event, (payload) =>
      updateDashboardFromSocket(event, payload),
    );
  });
  ["log.created", "log.error", "log.warning"].forEach((event) => {
    state.socket.on(event, (payload) =>
      addLog({ ...payload, level: payload?.level || event.split(".")[1] }),
    );
  });
}

function loadSocketClient() {
  return new Promise((resolve) => {
    if (window.io) return resolve(true);
    const existing = document.querySelector("script[data-socket-client]");
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.io)), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `${API_ORIGIN}/socket.io/socket.io.js`;
    script.async = true;
    script.dataset.socketClient = "true";
    script.onload = () => resolve(Boolean(window.io));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function disconnectSocket() {
  if (state.socket) {
    if (state.socket.removeAllListeners) state.socket.removeAllListeners();
    state.socket.disconnect();
    state.socket = null;
  }
}

function startStatusPolling() {
  clearInterval(state.statusTimer);
  loadStatus();
  state.statusTimer = setInterval(loadStatus, 5000);
}

async function loadStatus() {
  if (!state.user) return;
  try {
    const response = await fetch("/api/status");
    if (!response.ok) return;
    const data = await response.json();
    state.dashboard.status = data;
    $("[data-bot-name]").textContent = data.botName || "WhatsApp Bot";
    $("[data-runtime]").textContent = data.uptime || "App Shell";
    const meta = botStatusMeta(data);
    setStatusBadge("[data-global-status]", meta);
    setStatusBadge(
      "[data-pairing-status]",
      meta.label === "Online"
        ? { label: "Secure", className: "status-online" }
        : meta,
    );
    if (state.activeRoute === "dashboard") {
      const panel = $("[data-qr-panel]");
      if (panel) {
        panel.outerHTML = qrLoginPanel();
        hydrateIcons($("[data-qr-panel]"));
      }
    }
  } catch {
    setStatusBadge("[data-global-status]", {
      label: "Offline",
      className: "status-offline",
    });
  }
}

function botStatusMeta(data = {}) {
  const raw = String(data.pairingStatus || "").toLowerCase();
  if (data.connected) return { label: "Online", className: "status-online" };
  if (raw.includes("restart"))
    return { label: "Restarting", className: "status-restarting" };
  if (raw.includes("connect") || raw.includes("start") || raw.includes("pair"))
    return { label: "Connecting", className: "status-connecting" };
  return { label: "Offline", className: "status-offline" };
}

function setStatusBadge(selector, meta) {
  const el = $(selector);
  if (!el) return;
  el.className = `ds-badge ${meta.className}`;
  el.innerHTML = `<span class="status-dot"></span><span>${escapeHtml(meta.label)}</span>`;
}

function openConfirm({ title, body, actionText, action }) {
  state.confirmAction = action;
  $("[data-confirm-title]").textContent = title;
  $("[data-confirm-body]").textContent = body;
  $("[data-confirm-action] .button-text").textContent = actionText;
  $("[data-confirm-modal]").classList.add("is-open");
  $("[data-modal-backdrop]").classList.add("is-open");
}

function closeConfirm() {
  state.confirmAction = null;
  $("[data-confirm-modal]").classList.remove("is-open");
  $("[data-modal-backdrop]").classList.remove("is-open");
}

function closeDrawer() {
  $("[data-sidebar]").classList.remove("is-open");
  $("[data-drawer-backdrop]").classList.remove("is-open");
}

function closeUserMenu() {
  $("[data-user-menu]").hidden = true;
}

function bindEvents() {
  $("[data-login-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    login(event.currentTarget);
  });
  $("[data-toggle-password]").addEventListener("click", (event) => {
    const input = event.currentTarget
      .closest(".password-field")
      .querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
    event.currentTarget.innerHTML = svgIcon(
      input.type === "password" ? "eye" : "eyeOff",
    );
  });
  $("[data-theme-toggle]").addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("dashboard-theme", next);
    $("[data-theme-toggle]").innerHTML = svgIcon(
      next === "dark" ? "moon" : "layout",
    );
  });
  $("[data-collapse-sidebar]").addEventListener("click", () => {
    $("[data-sidebar]").classList.toggle("is-collapsed");
    $(".app-shell").classList.toggle("is-sidebar-collapsed");
  });
  $("[data-mobile-menu]").addEventListener("click", () => {
    $("[data-sidebar]").classList.add("is-open");
    $("[data-drawer-backdrop]").classList.add("is-open");
  });
  $("[data-drawer-backdrop]").addEventListener("click", closeDrawer);
  document.addEventListener("click", async (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) navigate(routeButton.dataset.route);
    const detailButton = event.target.closest("[data-bot-detail]");
    if (detailButton) showBotDetail(detailButton.dataset.botDetail);
    const restartButton = event.target.closest("[data-bot-restart]");
    if (restartButton)
      restartBot(restartButton.dataset.botRestart, restartButton);
    const reconnectButton = event.target.closest("[data-bot-reconnect]");
    if (reconnectButton)
      reconnectBot(reconnectButton.dataset.botReconnect, reconnectButton);
    const disconnectButton = event.target.closest("[data-bot-disconnect]");
    if (disconnectButton)
      disconnectBot(disconnectButton.dataset.botDisconnect, disconnectButton);
    const deleteButton = event.target.closest("[data-bot-delete]");
    if (deleteButton) confirmDeleteBot(deleteButton.dataset.botDelete);
    const broadcastButton = event.target.closest("[data-bot-broadcast]");
    if (broadcastButton)
      openBroadcastPlaceholder([broadcastButton.dataset.botBroadcast]);
    const addBotButton = event.target.closest("[data-add-bot]");
    if (addBotButton) openPairingModal();
    const refreshButton = event.target.closest("[data-bot-refresh]");
    if (refreshButton) loadBotManagement({ silent: false });
    const bulkButton = event.target.closest("[data-bulk-action]");
    if (bulkButton) handleBulkAction(bulkButton.dataset.bulkAction);
    const prevButton = event.target.closest("[data-bot-prev]");
    if (prevButton) changeBotPage(-1);
    const nextButton = event.target.closest("[data-bot-next]");
    if (nextButton) changeBotPage(1);
    const closePairing = event.target.closest("[data-close-pairing]");
    if (closePairing) closePairingModal();
    const copyPairing = event.target.closest("[data-copy-pairing]");
    if (copyPairing) {
      const code = copyPairing.dataset.copyPairingValue || copyPairing.closest('[data-detail-qr-card]')?.querySelector('[data-detail-pairing-code]')?.textContent || '';
      if (code) {
        navigator.clipboard?.writeText(code).then(() => showToast('success', 'Pairing code disalin')).catch(() => showToast('warning', 'Tidak dapat menyalin pairing code'));
      } else showToast('info', 'Tidak ada pairing code untuk disalin');
    }
    
    const detailTab = event.target.closest("[data-bot-detail-tab]");
    if (detailTab) {
      state.botDetail.tab = detailTab.dataset.botDetailTab;
      renderBotDetail(state.botDetail.sessionId);
    }
    const detailAction = event.target.closest("[data-detail-action]");
    if (detailAction)
      handleDetailAction(detailAction.dataset.detailAction, detailAction);
    const detailQuickAction = event.target.closest(
      "[data-detail-quick-action]",
    );
    if (detailQuickAction)
      handleDetailQuickAction(detailQuickAction.dataset.detailQuickAction);
    const groupPage = event.target.closest("[data-detail-group-page]");
    if (groupPage) {
      state.botDetail.groupPage += Number(groupPage.dataset.detailGroupPage);
      renderBotDetailTab();
    }
    const openGroup = event.target.closest("[data-open-group]");
    if (openGroup)
      showToast(
        "info",
        `Group ${openGroup.dataset.openGroup} siap dibuka saat halaman Group tersedia.`,
      );
    const exportLogs = event.target.closest("[data-detail-log-export]");
    if (exportLogs) exportBotLogs();
    const quickAction = event.target.closest("[data-quick-action]");
    if (quickAction) handleQuickAction(quickAction.dataset.quickAction);
    if (!event.target.closest(".user-menu-wrap")) closeUserMenu();
  });
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-log-search]")) {
      state.dashboard.logSearch = event.target.value;
      renderLiveLogRows();
    }
    if (event.target.matches("[data-bot-search]")) {
      state.bots.queryDraft = event.target.value;
      clearTimeout(state.bots.searchTimer);
      state.bots.searchTimer = setTimeout(() => {
        state.bots.query = state.bots.queryDraft;
        state.bots.page = 1;
        renderBotTableRows();
      }, 220);
    }
    if (event.target.matches("[data-detail-group-search]")) {
      state.botDetail.groupQuery = event.target.value;
      state.botDetail.groupPage = 1;
      renderBotDetailTab();
    }
    if (event.target.matches("[data-detail-log-search]")) {
      state.botDetail.logQuery = event.target.value;
      renderBotDetailTab();
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches('[data-bot-pairing-modal] input[name="method"]')) {
      if (!state.bots.pairing || state.bots.pairing.requested) return;
      state.bots.pairing.method =
        event.target.value === "qr" ? "qr" : "pairing";
      updatePairingModal();
    }
    if (event.target.matches("[data-log-filter]")) {
      state.dashboard.logFilter = event.target.value;
      renderLiveLogRows();
    }
    if (event.target.matches("[data-bot-status-filter]")) {
      state.bots.statusFilter = event.target.value;
      state.bots.page = 1;
      renderBotTableRows();
    }
    if (event.target.matches("[data-bot-tag-filter]")) {
      state.bots.tagFilter = event.target.value;
      state.bots.page = 1;
      renderBotTableRows();
    }
    if (event.target.matches("[data-bot-sort]")) {
      if (state.bots.sort === event.target.value)
        state.bots.order = state.bots.order === "asc" ? "desc" : "asc";
      else {
        state.bots.sort = event.target.value;
        state.bots.order = [
          "cpu",
          "ram",
          "groups",
          "users",
          "lastActive",
        ].includes(state.bots.sort)
          ? "desc"
          : "asc";
      }
      state.bots.page = 1;
      renderBotManagement();
    }
    if (event.target.matches("[data-bot-page-size]")) {
      state.bots.pageSize = Number(event.target.value);
      state.bots.page = 1;
      renderBotTableRows();
    }
    if (event.target.matches("[data-bot-select]")) {
      const id = event.target.dataset.botSelect;
      if (event.target.checked) state.bots.selected.add(id);
      else state.bots.selected.delete(id);
      updateBotSelectionControls();
    }
    if (event.target.matches("[data-bot-select-all]")) {
      pagedBots().forEach((bot) => {
        if (event.target.checked) state.bots.selected.add(bot.id);
        else state.bots.selected.delete(bot.id);
      });
      renderBotTableRows();
    }
    if (event.target.matches("[data-detail-group-filter]")) {
      state.botDetail.groupFilter = event.target.value;
      state.botDetail.groupPage = 1;
      renderBotDetailTab();
    }
    if (event.target.matches("[data-detail-log-filter]")) {
      state.botDetail.logFilter = event.target.value;
      renderBotDetailTab();
    }
  });
  document.addEventListener("submit", (event) => {
    if (event.target.matches("[data-pairing-form]")) {
      event.preventDefault();
      requestPairing(event.target);
    }
  });
  $("[data-user-menu-toggle]").addEventListener("click", (event) => {
    event.stopPropagation();
    $("[data-user-menu]").hidden = !$("[data-user-menu]").hidden;
  });
  $("[data-notification-toggle]").addEventListener("click", () => {
    $("[data-notification-area]").hidden = !$("[data-notification-area]")
      .hidden;
  });
  $("[data-close-notification]").addEventListener("click", () => {
    $("[data-notification-area]").hidden = true;
  });
  $("[data-logout]").addEventListener("click", () => logout());
  $("[data-logout-all]").addEventListener("click", () => {
    openConfirm({
      title: "Logout All Sessions",
      body: "Semua session aktif untuk akun ini akan dicabut dari backend.",
      actionText: "Logout All",
      action: () => logout({ all: true }),
    });
  });
  $$("[data-close-confirm], [data-modal-backdrop]").forEach((el) =>
    el.addEventListener("click", closeConfirm),
  );
  $("[data-confirm-action]").addEventListener("click", async () => {
    const action = state.confirmAction;
    closeConfirm();
    if (action) await action();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeConfirm();
      closePairingModal();
      closeUserMenu();
    }
  });
  window.addEventListener("popstate", () => {
    if (state.user) navigate(routeFromLocation());
  });
}

async function showBotDetail(id) {
  navigate(`bot-detail:${id}`);
}

function handleDetailAction(action, button) {
  const id = state.botDetail.sessionId;
  if (!id) return;
  if (action === "reconnect") return reconnectBot(id, button);
  if (action === "pair") return openPairingModalWithPrefill(id || state.botDetail.bot?.phoneNumber);
  if (action === "restart") return restartBot(id, button);
  if (action === "disconnect") return disconnectBot(id, button);
  if (action === "delete") return confirmDeleteBot(id);
  if (action === "broadcast") return openBroadcastPlaceholder([id]);
  if (action === "console")
    return showToast(
      "info",
      "Console bot akan tersedia pada update berikutnya.",
    );
  if (action === "refresh") return loadBotDetail(id, { silent: true });
}

function handleDetailQuickAction(action) {
  const id = state.botDetail.sessionId;
  if (action === "restart") return restartBot(id, null);
  const labels = {
    "reload-plugin":
      "Reload Plugin dikirim sebagai placeholder. Plugin Manager belum dibuat.",
    "reload-command":
      "Reload Command dikirim sebagai placeholder. Command Manager belum dibuat.",
    "restart-queue":
      "Restart Queue siap dipasang saat endpoint queue manage tersedia.",
    "backup-session":
      "Backup Session siap dipasang saat endpoint backup session tersedia.",
  };
  showToast("info", labels[action] || "Action siap dipasang.");
}

function exportBotLogs() {
  const rows = filteredBotLogs();
  const body = rows
    .map(
      (log) =>
        `[${log.time}] ${log.level.toUpperCase()} ${log.category}: ${log.message}`,
    )
    .join("\n");
  const blob = new Blob([body || "No logs"], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.botDetail.sessionId || "bot"}-logs.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function restartBot(id, button) {
  const bot = findBot(id);
  openConfirm({
    title: "Restart Bot",
    body: `${bot?.displayName || bot?.phoneNumber || id} akan direstart. Bot bisa tidak responsif sesaat.`,
    actionText: "Restart",
    action: () =>
      runBotAction(
        button,
        `/bots/${encodeURIComponent(id)}/restart`,
        `/api/bots/${encodeURIComponent(id)}/restart`,
        "Bot restart dikirim.",
        { status: "restarting", connection: "Restarting" },
      ),
  });
}

async function reconnectBot(id, button) {
  await runBotAction(
    button,
    `/bots/${encodeURIComponent(id)}/start`,
    `/api/sessions/${encodeURIComponent(id)}/reconnect`,
    "Bot reconnect dikirim.",
    { status: "connecting", connection: "Reconnecting" },
  );
}

async function disconnectBot(id, button) {
  await runBotAction(
    button,
    `/bots/${encodeURIComponent(id)}/stop`,
    `/api/sessions/${encodeURIComponent(id)}/disconnect`,
    "Bot disconnect dikirim.",
    { status: "disconnected", connected: false, connection: "Disconnecting" },
  );
}

function confirmDeleteBot(id) {
  const bot = findBot(id);
  openConfirm({
    title: "Delete Bot",
    body: `${bot?.displayName || bot?.phoneNumber || id} akan dihapus dari daftar bot. Session lokal bot ini juga ikut dihapus.`,
    actionText: "Delete",
    action: () => deleteBot(id),
  });
}

async function deleteBot(id) {
  const previous = [...state.bots.items];
  state.bots.items = state.bots.items.filter((bot) => bot.id !== id);
  state.bots.selected.delete(id);
  if (state.activeRoute === "bots") renderBotTableRows();
  updateBotStatsDom();
  try {
    await apiWithFallback(
      `/bots/${encodeURIComponent(id)}`,
      `/api/bots/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    state.dashboard.bots = state.bots.items;
    showToast("success", "Bot berhasil dihapus.");
  } catch (err) {
    state.bots.items = previous;
    if (state.activeRoute === "bots") renderBotTableRows();
    updateBotStatsDom();
    showToast("error", err.message || "Delete bot gagal.");
  }
}

async function runBotAction(
  button,
  path,
  fallbackPath,
  successMessage,
  optimistic = null,
) {
  if (button) setButtonLoading(button, true);
  const id = decodeURIComponent(path.split("/")[2] || "");
  const previous = optimistic ? findBot(id) : null;
  if (optimistic && previous) updateBotOptimistic(id, optimistic);
  try {
    await apiWithFallback(path, fallbackPath, { method: "POST" });
    showToast("success", successMessage);
    await loadBotManagement({ silent: true });
  } catch (err) {
    if (previous) updateBotOptimistic(id, previous);
    showToast("error", err.message || "Action gagal.");
  } finally {
    if (button) setButtonLoading(button, false);
  }
}

function updateBotOptimistic(id, patch) {
  const index = state.bots.items.findIndex((bot) => bot.id === id);
  if (index < 0) return;
  state.bots.items[index] = normalizeBot({
    ...state.bots.items[index],
    ...patch,
  });
  state.dashboard.bots = state.bots.items;
  if (state.activeRoute === "bots") {
    const row = $(`[data-bot-row="${cssEscape(id)}"]`);
    if (row) {
      row.outerHTML = botRow(state.bots.items[index]);
      const nextRow = $(`[data-bot-row="${cssEscape(id)}"]`);
      if (nextRow) hydrateIcons(nextRow);
    }
    updateBotStatsDom();
  }
}

function findBot(id) {
  return state.bots.items.find((bot) => bot.id === id || bot.sessionId === id);
}

function changeBotPage(delta) {
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBots().length / state.bots.pageSize),
  );
  state.bots.page = clamp(state.bots.page + delta, 1, totalPages);
  renderBotTableRows();
}

function selectedBotIds() {
  return [...state.bots.selected].filter((id) => findBot(id));
}

function handleBulkAction(action) {
  const ids = selectedBotIds();
  if (!ids.length) return showToast("info", "Pilih bot terlebih dahulu.");
  if (action === "broadcast") return openBroadcastPlaceholder(ids);
  if (action === "delete") {
    openConfirm({
      title: "Delete Selected Bots",
      body: `${ids.length} bot akan dihapus dari daftar bot.`,
      actionText: "Delete",
      action: () => runBulkAction(ids, "delete"),
    });
    return;
  }
  if (action === "restart") {
    openConfirm({
      title: "Restart Selected Bots",
      body: `${ids.length} bot akan direstart.`,
      actionText: "Restart",
      action: () => runBulkAction(ids, "restart"),
    });
    return;
  }
  runBulkAction(ids, action);
}

async function runBulkAction(ids, action) {
  const config = {
    reconnect: ["POST", "/start", "/reconnect", "connecting"],
    restart: ["POST", "/restart", "/restart", "restarting"],
    disconnect: ["POST", "/stop", "/disconnect", "disconnected"],
    delete: ["DELETE", "", "", null],
  }[action];
  if (!config) return;
  const [method, v1Suffix, fallbackSuffix, optimisticStatus] = config;
  if (optimisticStatus)
    ids.forEach((id) =>
      updateBotOptimistic(id, {
        status: optimisticStatus,
        connected: optimisticStatus === "online",
      }),
    );
  if (action === "delete") {
    state.bots.items = state.bots.items.filter((bot) => !ids.includes(bot.id));
    ids.forEach((id) => state.bots.selected.delete(id));
    renderBotTableRows();
    updateBotStatsDom();
  }
  const results = await Promise.allSettled(
    ids.map((id) => {
      const encoded = encodeURIComponent(id);
      const fallbackBase = action === "delete" ? "/api/bots" : "/api/sessions";
      return apiWithFallback(
        `/bots/${encoded}${v1Suffix}`,
        `${fallbackBase}/${encoded}${fallbackSuffix}`,
        { method },
      );
    }),
  );
  const failed = results.filter(
    (result) => result.status === "rejected",
  ).length;
  showToast(
    failed ? "warning" : "success",
    failed
      ? `${failed} dari ${ids.length} action gagal.`
      : `${ids.length} bot diproses.`,
  );
  state.bots.selected.clear();
  await loadBotManagement({ silent: true });
}

function openBroadcastPlaceholder(ids) {
  showToast(
    "info",
    `Broadcast siap untuk ${ids.length} bot. Halaman Broadcast akan dibuat pada update berikutnya.`,
  );
}

function openPairingModal() {
  // Backwards-compatible: allow passing an id or phone to prefill/fetch
  return openPairingModalWithPrefill();
}

async function openPairingModalWithPrefill(idOrPhone) {
  state.bots.pairing = {
    method: "pairing",
    phone: idOrPhone || "",
    requested: false,
    code: "",
    qrImage: "",
    status: "Pilih metode koneksi dan masukkan nomor WhatsApp.",
    connected: false,
    botId: null,
  };
  renderBotManagement();
  $('[data-bot-pairing-modal] input[name="phone"]')?.focus();

  // If no prefill provided, nothing to fetch
  if (!idOrPhone) return;

  try {
    // Try fetching by id first (v1 endpoint), fallback to listing and match by phone
    let bot = null;
    try {
      bot = await api.request(`/bots/${encodeURIComponent(idOrPhone)}`);
    } catch (err) {
      bot = null;
    }

    if (!bot) {
      const list = await apiWithFallback('/bots?limit=100', '/api/bots');
      const items = getItems(list);
      bot = items.find((b) => (b.phoneNumber || b.phone_number || b.id || b.sessionId) && (b.phoneNumber === idOrPhone || b.phone_number === idOrPhone || b.id === idOrPhone || b.sessionId === idOrPhone));
    }

    if (bot) {
      const normalized = normalizeBot(bot);
      upsertBot(normalized);
      updatePairingFromBot(normalized);
      // ensure pairing modal reflects fetched state
      updatePairingModal();
    }
  } catch (err) {
    // silent fail — keep modal usable
    console.warn('Failed fetching bot for pairing modal:', err?.message || err);
  }
}

function closePairingModal() {
  if (!state.bots.pairing) return;
  state.bots.pairing = null;
  if (state.activeRoute === "bots") renderBotManagement();
}

async function requestPairing(form) {
  const button = form.querySelector("[data-request-pairing]");
  const formData = new FormData(form);
  const phone = String(formData.get("phone") || "").replace(/\D/g, "");
  const method = formData.get("method") === "qr" ? "qr" : "pairing";
  if (!/^\d{10,15}$/.test(phone)) {
    showToast("warning", "Nomor harus 10-15 digit.");
    return;
  }
  state.bots.pairing = {
    phone,
    method,
    requested: true,
    code: "",
    qrImage: "",
    status: method === "qr" ? "Menyiapkan QR..." : "Request pairing dikirim...",
    connected: false,
  };
  updatePairingModal();
  setButtonLoading(button, true);
  try {
    const bot = normalizeBot(
      await apiWithFallback("/bots", "/api/bots", {
        method: "POST",
        body: JSON.stringify({ phone, authMethod: method }),
      }),
    );
    upsertBot(bot);
    state.bots.pairing = {
      phone,
      method,
      requested: true,
      botId: bot.id,
      code: bot.pairingCode || "",
      qrImage: bot.qrImage || "",
      status:
        bot.pairingStatus ||
        (method === "qr"
          ? "Menunggu QR realtime..."
          : "Menunggu pairing code realtime..."),
      connected: bot.connected,
      pairingGeneratedAt: bot.pairingCode || bot.qrImage ? new Date().toISOString() : null,
    };
    updatePairingModal();
    renderBotTableRows();
    updateBotStatsDom();
    showToast(
      "success",
      method === "qr" ? "Bot dibuat, silakan scan QR." : "Pairing bot dibuat.",
    );
  } catch (err) {
    state.bots.pairing = {
      phone,
      method,
      requested: false,
      code: "",
      qrImage: "",
      status: err.message || "Request gagal.",
      connected: false,
    };
    updatePairingModal();
    showToast("error", err.message || "Request gagal.");
  } finally {
    setButtonLoading(button, false);
  }
}
function upsertBot(bot) {
  const index = state.bots.items.findIndex((item) => item.id === bot.id);
  if (index >= 0) state.bots.items[index] = bot;
  else state.bots.items.unshift(bot);
  state.dashboard.bots = state.bots.items;
}

function updatePairingFromBot(bot) {
  const pairing = state.bots.pairing;
  if (!pairing) return;
  if (pairing.botId && bot.id !== pairing.botId) return;
  if (!pairing.botId && pairing.phone && bot.phoneNumber !== pairing.phone)
    return;
  const newCode = bot.pairingCode || pairing.code || "";
  const newQr = bot.qrImage || pairing.qrImage || "";
  const now = new Date().toISOString();
  let generatedAt = pairing.pairingGeneratedAt || null;
  if (newCode && newCode !== pairing.code) generatedAt = now;
  else if (newQr && newQr !== pairing.qrImage) generatedAt = now;

  state.bots.pairing = {
    ...pairing,
    botId: bot.id || pairing.botId,
    code: newCode,
    qrImage: newQr,
    status:
      bot.pairingStatus ||
      bot.connection ||
      activityTitle(bot.status || pairing.status),
    connected: Boolean(bot.connected || bot.status === "online"),
    pairingGeneratedAt: generatedAt,
  };

  // propagate timestamp to listing item if present
  const idx = state.bots.items.findIndex((item) => item.id === bot.id || item.sessionId === bot.sessionId);
  if (idx >= 0) state.bots.items[idx].pairingGeneratedAt = generatedAt;
  // also update open bot detail if matching
  if (state.botDetail.sessionId === bot.id || state.botDetail.sessionId === bot.sessionId) {
    state.botDetail.bot = normalizeBot({ ...(state.botDetail.bot || {}), ...bot, pairingGeneratedAt: generatedAt });
  }
  updatePairingModal();
}

function updatePairingModal() {
  const modal = $("[data-bot-pairing-modal]");
  if (!modal || !state.bots.pairing) return;
  const pairing = state.bots.pairing;
  const isQr = pairing.method === "qr";

  // toggle class aktif + disabled, TANPA replace elemen input-nya
  modal.querySelectorAll(".pairing-method-option").forEach((label) => {
    const input = label.querySelector('input[name="method"]');
    if (!input) return;
    input.disabled = Boolean(pairing.requested);
    label.classList.toggle(
      "is-active",
      input.value === (pairing.method || "pairing"),
    );
  });

  const stepMethod = modal.querySelector('[data-pairing-step="method"]');
  if (stepMethod) {
    stepMethod.lastElementChild.textContent = isQr
      ? "Generate QR"
      : "Request Pairing";
    stepMethod.classList.toggle("status-online", Boolean(pairing.requested));
    stepMethod.classList.toggle("status-restarting", !pairing.requested);
  }
  const stepResult = modal.querySelector('[data-pairing-step="result"]');
  if (stepResult) {
    const done = Boolean(isQr ? pairing.qrImage : pairing.code);
    stepResult.lastElementChild.textContent = isQr ? "Scan QR" : "Pairing Code";
    stepResult.classList.toggle("status-online", done);
    stepResult.classList.toggle("status-restarting", !done);
  }
  const ts = modal.querySelector('[data-pairing-timestamp]');
  if (ts) ts.textContent = pairing.pairingGeneratedAt ? formatDate(pairing.pairingGeneratedAt) : "";

  const codeBox = modal.querySelector("[data-pairing-code]");
  if (codeBox) {
    codeBox.classList.toggle("pairing-qr-box", isQr);
    if (isQr) {
      codeBox.innerHTML = pairing.qrImage
        ? `<img class="pairing-qr-image" src="${escapeAttr(pairing.qrImage)}" alt="QR pairing WhatsApp">`
        : escapeHtml("QR akan muncul di sini setelah bot mulai connecting...");
    } else {
      codeBox.textContent =
        pairing.code || "Pairing code akan muncul setelah request berhasil.";
    }
  }

  const status = modal.querySelector("[data-pairing-live-status]");
  if (status)
    status.textContent = pairing.connected ? "Connected" : pairing.status;

  const input = modal.querySelector('input[name="phone"]');
  if (input) {
    input.value = pairing.phone || "";
    input.disabled = Boolean(pairing.requested);
  }

  const button = modal.querySelector("[data-request-pairing]");
  if (button) {
    button.disabled = Boolean(pairing.requested);
    const label = button.querySelector(".button-text");
    if (label) label.textContent = isQr ? "Generate QR" : "Request Pairing";
  }
  
}

// refreshPairingInModal removed — modal now shows timestamp when pairing appears

async function handleQuickAction(action) {
  if (action === "restart-all") {
    const bots = state.dashboard.bots;
    if (!bots.length)
      return showToast("info", "Belum ada bot untuk direstart.");
    openConfirm({
      title: "Restart Semua Bot",
      body: `${bots.length} bot akan direstart lewat REST API.`,
      actionText: "Restart",
      action: async () => {
        const results = await Promise.allSettled(
          bots.map((bot) => {
            const id = encodeURIComponent(bot.id || bot.sessionId);
            return apiWithFallback(
              `/bots/${id}/restart`,
              `/api/bots/${id}/restart`,
              { method: "POST" },
            );
          }),
        );
        const failed = results.filter(
          (result) => result.status === "rejected",
        ).length;
        showToast(
          failed ? "warning" : "success",
          failed ? `${failed} bot gagal direstart.` : "Semua bot direstart.",
        );
        await loadDashboardOverview({ silent: true });
      },
    });
    return;
  }
  if (action === "logs") {
    document
      .querySelector("[data-live-logs]")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (action === "monitoring") {
    document
      .querySelector(".health-stack")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  navigate(action);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

function boot() {
  const savedTheme = localStorage.getItem("dashboard-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  hydrateIcons();
  $("[data-theme-toggle]").innerHTML = svgIcon(
    document.documentElement.dataset.theme === "dark" ? "moon" : "layout",
  );
  bindEvents();
  restoreSession();
}

boot();
