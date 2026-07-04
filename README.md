# Modern WhatsApp Bot

WhatsApp bot modular berbasis Node.js ES Module, Baileys terbaru, Express dashboard, JSON database, hot reload command, permission middleware, cooldown, rate limiter, dan fitur media/AI/downloader.

## Fitur Utama

- Pairing Code Login dan QR status di dashboard.
- Auto reconnect dan auto save session.
- Anti crash untuk `uncaughtException` dan `unhandledRejection`.
- Hot reload command: tambah/edit file di `src/commands`, bot reload daftar command otomatis.
- Multi prefix dari `.env`, contoh `PREFIX=.,!,/`.
- Permission middleware dan cooldown command.
- Rate limiter, input validation, anti spam, auto block nomor spam.
- Dashboard Express di `http://localhost:3000`.
- Kontrol Stop dan Restart koneksi bot langsung dari dashboard.
- Database JSON dengan adapter layer yang bisa diganti MongoDB, SQLite, atau PostgreSQL.

## Instalasi

```bash
npm install
```

Edit `.env`:

```env
OWNER_NUMBER=628xxxxxxxxxx
BOT_NAME=Modern Bot
PREFIX=.
PORT=3000
AUTH_METHOD=pairing

OPENAI_API_KEY=
GEMINI_API_KEY=
CLAUDE_API_KEY=

COBALT_API_URL=https://api.cobalt.tools/
COBALT_API_KEY=
```

Jalankan bot:

```bash
npm start
```

Saat pertama login, pairing code akan tampil di console dan dashboard. Buka WhatsApp, pilih perangkat tertaut, lalu masukkan pairing code.

Kalau ingin login memakai QR di dashboard, ubah:

```env
AUTH_METHOD=qr
```

Setelah itu restart bot dan scan QR dari WhatsApp > Perangkat tertaut.

## Development

```bash
npm run dev
npm run lint
```

Dashboard:

```text
http://localhost:3000
```

## Deploy

1. Gunakan Node.js 20 atau lebih baru.
2. Upload project ke VPS.
3. Jalankan `npm install`.
4. Isi `.env`.
5. Jalankan dengan process manager:

```bash
npm install -g pm2
pm2 start src/index.js --name modern-wa-bot
pm2 save
```

Untuk restart:

```bash
pm2 restart modern-wa-bot
```

## Menambah Command

Buat file baru di dalam `src/commands/<kategori>/nama.js`.

```js
export default {
  name: 'ping',
  alias: ['p'],
  category: 'general',
  description: 'Cek respons bot.',
  async execute({ sock, msg, args }) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Args: ${args.join(' ')}` }, { quoted: msg });
  }
};
```

Properti tambahan yang bisa dipakai:

- `ownerOnly: true`
- `adminOnly: true`
- `groupOnly: true`
- `privateOnly: true`
- `cooldownMs: 5000`

## Struktur Project

```text
project/
├── src/
│   ├── commands/
│   │   ├── ai/
│   │   ├── downloader/
│   │   ├── general/
│   │   ├── media/
│   │   └── sticker/
│   ├── config/
│   ├── database/
│   ├── events/
│   ├── handlers/
│   ├── lib/
│   ├── middleware/
│   ├── session/
│   ├── utils/
│   └── index.js
├── public/
├── .env
├── package.json
└── README.md
```

## Command Tersedia

General: `menu`, `help`, `ping`, `runtime`, `uptime`, `owner`, `info`, `speed`.

Downloader: `tiktok`, `ytmp3`, `ytmp4`.

AI: `chatgpt`, `gemini`, `claude`.

Sticker/Media: `sticker`, `steks`/`brat`, `emoji`, `readviewonce`/`rvo`.

## Database Adapter

Default adapter ada di `src/database/JsonDatabase.js`. Untuk mengganti ke MongoDB, SQLite, atau PostgreSQL, buat class baru yang extend `DatabaseAdapter`, lalu ubah export di `src/database/index.js`.

Method wajib:

- `init()`
- `read()`
- `write(data)`

## Troubleshooting

Pairing code tidak muncul:

- Pastikan `OWNER_NUMBER` berformat angka internasional tanpa `+`, contoh `6281234567890`.
- Session logout akan dibersihkan otomatis agar QR baru dapat muncul.
- Pairing code cepat kedaluwarsa. Pakai code terbaru yang muncul setelah restart bot.

Bot tidak merespons command:

- Pastikan command diawali prefix dari `.env`.
- Cek dashboard log activity.

Downloader gagal:

- Pastikan URL valid dan publik.
- Beberapa platform membatasi region, private post, atau konten tertentu.
- Downloader YouTube memakai `yt-dlp` lokal. Saat pertama dipakai bot akan download binary ke folder `bin/`.
- Jika YouTube MP3 ingin hasil `.mp3` murni, install FFmpeg di server. Tanpa FFmpeg bot mengirim audio terbaik yang tersedia, biasanya `.m4a`.
- Cobalt masih tersedia di helper, tetapi public API bisa menolak request. Untuk memakai Cobalt, deploy instance sendiri lalu isi `COBALT_API_URL` dan `COBALT_API_KEY`.

AI gagal:

- Isi API key terkait di `.env`.
- Pastikan billing/quota provider API aktif.

Sharp gagal install di Windows:

- Gunakan Node.js LTS terbaru.
- Jalankan ulang `npm install`.
