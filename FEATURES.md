# SIPEDA — Fitur & Evaluasi MoSCoW

> Prioritas berdasarkan **User Value > Business Value > Technical Complexity**

---

## Legend

| Tag | Arti |
|---|---|
| ✅ | Selesai |
| 🟡 | Perlu perbaikan/simplifikasi |
| ❌ | Belum ada |
| 🔄 | Dalam antrian |

---

## MUST (Wajib — Core Value Proposition)

| Fitur | Status | Catatan |
|---|---|---|
| **Registrasi donor online** (multi-step + kode unik) | ✅ | Selesai. Pre-screening + form + sukses page. |
| **Jadwal donor + filter bulan** | ✅ | Selesai. Ada client filter + detail page. |
| **Cek stok darah real-time** | ✅ | Selesai. Status otomatis (normal/kritis/kosong). |
| **Pencatatan hasil donor** (petugas) | ✅ | Selesai. Walk-in + kode lookup + vitals. |
| **Role-based auth** (public/admin/petugas) | ✅ | Selesai. 3 role + superadmin. |
| **Peta lokasi donor** (Leaflet) | ✅ | Selesai. Interactive markers. |
| **Riwayat donor** (via telepon + kode) | ✅ | Selesai. Dua faktor lookup. |
| **Auto-update stok & kuota** (via trigger) | ✅ | Selesai. Race-condition free. |

---

## SHOULD (Penting — Bedain dari Kompetitor)

| Fitur | Status | Prioritas | Catatan |
|---|---|---|---|
| **Notifikasi WhatsApp** (reminder + konfirmasi) | ❌ | **🟢 HIGH** | Via Fonnte. H-1 reminder, notif registrasi, konfirmasi hadir. |
| **PWA (Progressive Web App)** | ❌ | **🟢 HIGH** | Install ke home screen, push notification, offline support ringan. |
| **Sertifikat Donor Digital** | ❌ | **🟢 HIGH** | Download/print setelah donor berhasil. Share ke sosial media — free marketing. |
| **Export Excel multi-sheet** (admin) | ✅ | - | Selesai. 3 sheet (rekap, detail, summary). |
| **SEO: sitemap, robots.txt, metadata** | ✅ | - | Selesai. |
| **Pengumuman Darurat** (di halaman publik) | 🟡 | **🟡 MEDIUM** | Ada tabel & API, tapi belum tampil prominent di homepage. |
| **Riwayat Donor — tampilan lebih informatif** | 🟡 | 🟡 MEDIUM | Saat ini basic. Bisa tambah grafik riwayat. |
| **Admin — Dashboard grafik tren** | 🟡 | 🟡 MEDIUM | Stats ada, grafik stok bisa ditingkatin. |

---

## COULD (Nice to Have)

| Fitur | Status | Prioritas | Catatan |
|---|---|---|---|
| **Artikel / Pengumuman** | 🟡 | **🟡 MEDIUM** | **Saran: Simplifikasi.** Hapus kategori, featured, views. Atau ganti jadi "Pengumuman" aja. |
| **FAQ** | 🟡 | 🟢 LOW | **Saran: Hardcode jadi static page.** Gak perlu CRUD. |
| **Testimonial** | 🟡 | 🟢 LOW | **Saran: Hapus dari DB, jadi static section di homepage.** |
| **Dark mode** | ❌ | **🔴 SKIP** | Skip. Light mode diperbaiki (lebih soft). |
| **Analytics dashboard** (tren donor/bulan, demografi) | ❌ | 🟡 MEDIUM | Bagus untuk perencanaan PMI. Tapi belum urgent. |
| **Multi-tenant schema** (cabang_id) | 🟡 | 🟡 MEDIUM | Siapin column aja dulu. Jangan aktifin sampai ada demand nyata. |

---

## WON'T (Skip / Postpone)

| Fitur | Alasan |
|---|---|
| **Native mobile app** (iOS/Android) | PWA cukup. Biaya develop & maintain 2 platform gak sebanding. |
| **Donor account system** (login/password) | Kode-based + telepon = lebih low-friction. Loyalty via WA notification. |
| **Payment / donasi online** | Di luar domain PMI Kab. Urusan dana via transfer langsung. |
| **AI chatbot** | Overkill untuk skala Indramayu. WA + FAQ sudah cukup. |
| **Gamification / leaderboard** | Distraksi dari tujuan utama. |
| **Integrasi alat lab** | Butuh hardware, mahal, domain berbeda. |
| **Integrasi SIMDONDAR** | Masih bingung arahnya. Ditunda sampai ada kebutuhan jelas. |
| **Multi-language** | Semua user di Indramayu pake Bahasa Indonesia. |

---

## Ringkasan Tindakan

### Segera (High Priority)
- [ ] **WA Integration** via Fonnte (reminder + notif)
- [ ] **PWA** — @serwist/next + manifest + icons + push notif
- [ ] **Sertifikat Donor Digital** — generate PDF (html2canvas)

### Minggu Ini (Medium Priority)
- [ ] **Simplifikasi Artikel** → jadi "Pengumuman" atau versi ringan
- [ ] **FAQ & Testimonial** jadi static
- [ ] **Pengumuman Darurat** di homepage
- [ ] **Light theme refresh** — background lebih soft, bukan putih polos

### Nanti (Low Priority)
- [ ] Siapin `cabang_id` column untuk future multi-tenant
- [ ] Dashboard analytics (tren bulanan)
- [ ] Perbaiki riwayat donor (tambah grafik)
