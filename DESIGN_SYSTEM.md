# WhatsApp Bot Dashboard Design System

Design system ini menjadi sumber keputusan visual untuk Dashboard WhatsApp Bot Framework. Karakternya dark-first, minimal, professional, premium, developer friendly, dan fokus pada data.

## Color Palette

Gunakan token CSS, bukan warna hardcoded.

- `--bg-base`: dasar aplikasi dark navy graphite.
- `--bg-elevated`: permukaan sidebar, navbar, modal.
- `--bg-glass`: card glass dengan blur halus.
- `--bg-muted`: input, table row, skeleton.
- `--border-subtle`: border tipis standar.
- `--border-strong`: border untuk active/focus.
- `--text-primary`: teks utama.
- `--text-secondary`: teks pendukung.
- `--text-muted`: metadata dan placeholder.
- `--accent-blue`: aksi utama.
- `--accent-purple`: highlight sekunder.
- `--accent-cyan`: realtime dan koneksi.
- `--status-online`: online/success.
- `--status-connecting`: warning/connecting.
- `--status-offline`: offline/error.
- `--status-restarting`: restarting/info.

Light mode memakai token yang sama via `html[data-theme="light"]`.

## Typography

- Font utama: `Inter`, fallback `Manrope`, `Segoe UI`, sans-serif.
- Font mono: `JetBrains Mono`, `SFMono-Regular`, `Consolas`, monospace.
- Jangan gunakan font default browser tanpa fallback modern.
- Heading dashboard ringkas, 600-700.
- Body 14px-15px, line-height 1.5.
- Metadata 12px-13px, letter spacing tetap `0`.

## Icon Guideline

- Gunakan ikon outline sederhana dengan ukuran 16px, 18px, atau 20px.
- Ikon tombol harus konsisten dengan label aksi.
- Ikon navigasi harus tetap terbaca saat sidebar collapse.
- Ikon dekoratif tidak digunakan untuk memenuhi ruang kosong.
- Status memakai dot warna + label, bukan emoji.

## Border Radius

- `--radius-xs`: 6px untuk badge dan chip.
- `--radius-sm`: 8px untuk input, button, table controls.
- `--radius-md`: 12px untuk card dan dropdown.
- `--radius-lg`: 16px untuk modal dan panel utama.
- `--radius-full`: pill dan avatar.

## Shadow

- Shadow halus dan rendah kontras.
- `--shadow-soft`: card hover dan dropdown.
- `--shadow-glow`: focus/active accent, dipakai hemat.

## Button Style

- Button base: tinggi 38px, radius 8px, font 600.
- Variant: `primary`, `secondary`, `ghost`, `danger`, `icon`.
- Semua button memiliki hover, focus ring, disabled, dan loading state.
- Loading state memakai spinner kecil dan tetap menjaga ukuran tombol.

## Input Style

- Background muted/glass, border tipis.
- Tinggi minimal 38px.
- Placeholder memakai `--text-muted`.
- Focus memakai border accent dan shadow glow tipis.
- Search input selalu memiliki ikon search.

## Card Style

- Card memakai glass effect halus, border tipis, radius 12px.
- Hover menaikkan border dan shadow sedikit.
- Card tidak boleh nested kecuali modal/tool yang memang framed.
- Header card berisi title pendek dan optional action.

## Table Style

- Header sticky.
- Search, filter, pagination, empty state, dan loading skeleton tersedia.
- Row hover halus.
- Teks panjang dipotong dengan ellipsis.
- Action column memakai icon button atau compact text button.

## Modal Style

- Backdrop blur dan dim.
- Panel radius 16px, border subtle, shadow soft.
- Header, body, footer terpisah.
- Escape/click backdrop menutup modal untuk aksi non-destruktif.

## Badge Style

- Badge compact dengan dot status.
- Status:
  - Online: `--status-online`
  - Connecting: `--status-connecting`
  - Offline: `--status-offline`
  - Restarting: `--status-restarting`
- Badge informatif memakai accent blue/cyan/purple.

## Toast Style

- Toast muncul di kanan bawah desktop dan bawah tengah mobile.
- Variant: info, success, warning, error.
- Durasi default 3 detik.
- Tidak menutup area kerja utama.

## Animation Guideline

- Durasi standar: 160ms-240ms.
- Easing: `cubic-bezier(.2,.8,.2,1)`.
- Gunakan fade, slide, scale, hover lift, skeleton shimmer.
- Hormati `prefers-reduced-motion`.
- Animasi tidak boleh mengganggu pembacaan data.

## Spacing System

- Basis 4px.
- Token umum: 4, 8, 12, 16, 20, 24, 32, 40.
- Jarak antar section 24px desktop, 16px mobile.
- Gunakan whitespace untuk hierarki, bukan dekorasi berlebihan.

## Component Naming Convention

- CSS component class memakai prefix `ds-`: `ds-button`, `ds-card`, `ds-badge`.
- Layout class memakai prefix `app-`: `app-shell`, `app-sidebar`.
- State class memakai prefix `is-`: `is-active`, `is-loading`, `is-collapsed`.
- JavaScript renderer memakai pola `renderX`, action handler `handleX`, utility `formatX`.
- DOM selector untuk state/data memakai `data-*` bila elemen reusable.
