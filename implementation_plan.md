# Integration Testing & Stabilization — WhatsApp Bot Framework

Phase fokus pada memastikan seluruh komponen backend dan frontend yang sudah dibuat bekerja sebagai satu kesatuan. **Tidak menambah fitur baru.** Hanya memperbaiki bug yang ditemukan.

## Ringkasan Analisis Codebase

Setelah melakukan deep-dive ke seluruh source code (~50+ file, ~8000+ LOC), berikut temuan dan rencana aksi.

---

## 🐛 Bug yang Ditemukan (Pre-Test)

### Bug Kritis

> [!CAUTION]
> **BUG-1: JWT Secret Mismatch — REST API vs WebSocket**
> [SocketAuth.js](file:///d:/CODING/capa-bot-wa/src/websocket/SocketAuth.js#L38) menggunakan `configManager.get('security', 'jwtSecret')` untuk verifikasi JWT, sedangkan [auth.js middleware](file:///d:/CODING/capa-bot-wa/src/api/middleware/auth.js#L19) menggunakan `config.jwtSecret` (dari `.env`). Jika ConfigManager di-seed dengan secret berbeda dari `.env`, token dari REST API login **tidak akan bisa authenticate di WebSocket** dan sebaliknya. Ini menyebabkan WebSocket selalu gagal koneksi setelah login.

> [!CAUTION]
> **BUG-2: Logger `error()` menerima object sebagai argumen pertama**
> [errorHandler.js](file:///d:/CODING/capa-bot-wa/src/api/middleware/errorHandler.js#L44) memanggil `logger.error?.({ category: 'api', message: ... })` dengan **object** sebagai argumen pertama, tapi [logger.js](file:///d:/CODING/capa-bot-wa/src/utils/logger.js#L32) mengekspektasikan **string**. Akibatnya error log menampilkan `[object Object]` alih-alih pesan yang berguna, dan `meta` kosong.

> [!WARNING]
> **BUG-3: Listener leak pada EventBus wildcard `*`**
> [SocketEvents.js](file:///d:/CODING/capa-bot-wa/src/websocket/SocketEvents.js#L21) mendaftarkan listener `this.botManager.eventBus.on('*', ...)` di `start()` tapi `stop()` **tidak pernah melepasnya** (`off('*', ...)`). Setiap restart WebSocket = tambah listener baru = memory leak + duplicate events.

> [!WARNING]
> **BUG-4: `dashboard.js` logger reference error**
> [dashboard.js L9](file:///d:/CODING/capa-bot-wa/src/lib/dashboard.js#L9) mengimpor `activityLogs` dan `logger` dari `../utils/logger.js`. Kemudian [L51](file:///d:/CODING/capa-bot-wa/src/lib/dashboard.js#L51) mengakses `Object.keys(data.chats)` dan `Object.keys(data.users)` tanpa fallback — jika `data.chats` atau `data.users` undefined (misal DB fresh), **server crash dengan TypeError**.

### Bug Non-Kritis

> [!NOTE]
> **BUG-5: `requestPairingCode` race condition**
> [SessionService.js](file:///d:/CODING/capa-bot-wa/src/session/services/SessionService.js#L54) request pairing code saat `sock` belum fully initialized. Jika `sock.requestPairingCode` di-call sebelum socket ready, error silently swallowed tapi `pairingCode` tetap kosong.

> [!NOTE]
> **BUG-6: Auth route `/auth/logout` tidak disconnect WebSocket**
> [AuthController logout](file:///d:/CODING/capa-bot-wa/src/api/v1/controllers/AuthController.js#L77) hanya blacklist token dan remove refresh token, tapi tidak mengirim event ke WebSocket agar socket terputus. Socket tetap terhubung setelah logout.

> [!NOTE]
> **BUG-7: `LoggerService` unused vs `logger`**
> [LoggerService.js](file:///d:/CODING/capa-bot-wa/src/manager/LoggerService.js) digunakan di BotManager sebagai `this.logger`, tapi berbagai komponen langsung import `logger` dari utils. Beberapa tempat memanggil `this.logger.info?.(...)` atau `this.logger.success?.(...)` yang bisa silent-fail tergantung implementasi LoggerService.

> [!NOTE]
> **BUG-8: Dashboard `/api/status` missing guard for `data.chats` dan `data.users`**
> [dashboard.js L51](file:///d:/CODING/capa-bot-wa/src/lib/dashboard.js#L51): `Object.keys(data.chats)` dan `Object.keys(data.users)` tanpa null check — crash jika database belum punya key tersebut.

---

## Proposed Changes

Perubahan dikelompokkan berdasarkan prioritas bug fix. **Tidak ada fitur baru.**

---

### 1. WebSocket JWT Secret Fix (BUG-1)

#### [MODIFY] [SocketAuth.js](file:///d:/CODING/capa-bot-wa/src/websocket/SocketAuth.js)

- Ubah line 38 agar menggunakan `config.jwtSecret` dari `.env` (sama dengan REST API middleware) sebagai **primary source**, dengan fallback ke `configManager`
- Ini memastikan token yang di-generate oleh REST API (`auth.js`) bisa di-verify oleh WebSocket

---

### 2. Logger Error Call Fix (BUG-2)

#### [MODIFY] [errorHandler.js](file:///d:/CODING/capa-bot-wa/src/api/middleware/errorHandler.js)

- Fix `logger.error` call di line 44-49 agar pass string sebagai argumen pertama, object sebagai meta

---

### 3. EventBus Listener Leak Fix (BUG-3)

#### [MODIFY] [SocketEvents.js](file:///d:/CODING/capa-bot-wa/src/websocket/SocketEvents.js)

- Simpan reference ke wildcard listener handler
- Di `stop()`, panggil `eventBus.off('*', handler)` untuk melepas listener
- Tambahkan juga cleanup untuk `logger.onLog`

---

### 4. Dashboard Null Safety Fix (BUG-4, BUG-8)

#### [MODIFY] [dashboard.js](file:///d:/CODING/capa-bot-wa/src/lib/dashboard.js)

- Tambahkan null/undefined guards pada akses `data.chats`, `data.users`, `data.groups`
- Prevent crash saat database belum terisi

---

### 5. Logout WebSocket Disconnect (BUG-6)

#### [MODIFY] [AuthController.js](file:///d:/CODING/capa-bot-wa/src/api/v1/controllers/AuthController.js)

- Emit event `auth.logout` via EventBus (jika tersedia)
- WebSocket SocketEvents sudah forward semua events, sehingga frontend dapat menerima signal logout

---

### 6. Integration Test Script

#### [NEW] [tests/integration.test.js](file:///d:/CODING/capa-bot-wa/tests/integration.test.js)

Buat comprehensive integration test script yang menguji seluruh 14 test scenarios. Script ini akan:

1. **TEST-1 Authentication**: Login, logout, JWT, refresh token, session expired handling
2. **TEST-2 Bot Management**: Create bot, verify response
3. **TEST-3 Multi Session**: Verify multiple bot endpoints
4. **TEST-4 Auto Restore**: Verify session restore endpoint
5. **TEST-5 Commands**: Verify command endpoints
6. **TEST-6 Plugins**: Verify plugin list, enable/disable, reload
7. **TEST-7 REST API**: Systematic test of ALL endpoints with correct status codes
8. **TEST-8 WebSocket**: Socket.IO connect, auth, room subscribe, events
9. **TEST-9 Bot Detail**: Verify bot info, stats, groups
10. **TEST-10 Monitoring**: System overview, health, statistics
11. **TEST-11 Error Handling**: Invalid inputs, unauthorized, not found
12. **TEST-12 Performance**: Concurrent requests, no duplicate events
13. **TEST-13 Database**: Verify persistence (sessions, config, schedulers, plugins)
14. **TEST-14 Logging**: Verify audit log and activity logs

Test script menggunakan **native Node.js** (no external test framework), axios untuk HTTP, dan socket.io-client untuk WebSocket — keduanya sudah ada di dependencies.

---

## Verification Plan

### Automated Tests

```bash
# 1. Start server di satu terminal
npm start

# 2. Run integration tests di terminal lain
node tests/integration.test.js
```

### Manual Verification

- Pastikan server start tanpa error setelah semua fix
- Pastikan WebSocket connect setelah login (fix BUG-1)
- Pastikan error log menampilkan pesan yang benar (fix BUG-2)
- Monitor memory usage untuk leak detection (fix BUG-3)

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Test 2-5 (Bot Management, Multi Session, Auto Restore, Commands) membutuhkan **bot WhatsApp yang benar-benar terkoneksi** (nomor WA + pairing). Test script akan memvalidasi API endpoint response format dan error handling, tapi **tidak bisa simulate actual WhatsApp pairing** secara otomatis. Apakah sudah ada session bot aktif yang bisa digunakan? Jika tidak, test ini akan fokus pada validasi API response structure saja.

> [!IMPORTANT]
> **Q2:** Apakah boleh menambah file `tests/integration.test.js` sebagai file tes baru? File ini bukan fitur — murni testing tool. Alternatifnya, semua tes bisa ditulis sebagai artifact report saja tanpa script executable.
