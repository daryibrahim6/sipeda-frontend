# SIPEDA — Sistem Informasi Pendonoran Darah

> **PMI Kabupaten Indramayu** — Platform donor darah modern berbasis web.

---

## 1. Ringkasan Produk

SIPEDA adalah platform digital yang menghubungkan masyarakat, petugas lapangan, dan admin PMI dalam satu ekosistem donor darah. Masyarakat bisa cek jadwal, daftar donor online, lihat stok darah real-time, dan akses edukasi. Petugas lapangan mencatat hasil donor di lokasi. Admin mengelola jadwal, lokasi, stok, dan laporan.

---

## 2. Target User & Segmentasi

| Segment | Kebutuhan Utama | Frekuensi |
|---|---|---|
| **Masyarakat / Donor** | Cari jadwal, daftar online, cek stok, lihat riwayat donor | Bulanan atau saat butuh |
| **Petugas Lapangan** | Catat hasil donor, cek pendaftar, rekap harian | Harian (saat event) |
| **Admin PMI** | Kelola jadwal, lokasi, stok, artikel, pengguna, laporan | Harian |
| **Superadmin** | Kelola semua + manajemen admin | Mingguan |

---

## 3. Goals & Success Metrics

### Business Goals
1. **Meningkatkan jumlah donor** — Digitalisasi registrasi & pengingat otomatis
2. **Efisiensi operasional** — Petugas gak perlu catat manual, data masuk langsung ke sistem
3. **Transparansi stok** — RS/masyarakat bisa cek ketersediaan darah real-time

### User Goals
1. Donor: "Saya mau donor, dimana & kapan?" — terjawab dalam 3 klik
2. Petugas: "Catat donor cepat, tanpa ribet" — selesai dalam 30 detik per orang
3. Admin: "Kelola tanpa pusing data tercecer" — semua terpusat di dashboard

### Success Metrics
- 🔴 Jumlah registrasi online per bulan
- 🔴 Jumlah donor tercatat via sistem
- 🟡 Waktu rata-rata pencatatan per donor
- 🟡 Stok darah akurat (tidak pernah over-claim)
- 🟢 Bounce rate website publik
- 🟢 Organic traffic dari Google (SEO)

---

## 4. Non-Goals (Explicitly NOT doing)

| Non-Goal | Alasan |
|---|---|
| **Native mobile app** | PWA cukup, iOS/Android native terlalu mahal untuk tahap ini |
| **Payment / donasi online** | Bukan domain PMI Kabupaten, dana via transfer langsung |
| **Gamification / leaderboard** | Distraksi dari tujuan utama |
| **AI chatbot** | Overkill. WA + FAQ sudah cukup |
| **Integrasi alat lab (Hematology Analyzer, dll)** | Butuh hardware, domain beda |
| **Donor account system (password-based)** | Kode-based lebih low-friction. Loyalty bisa via notifikasi WA |
| **Multi-language** | Target: Indramayu & sekitarnya. Bahasa Indonesia cukup |

---

## 5. Target Pengguna Akhir

- **Lokasi**: Kabupaten Indramayu (+ sekitarnya)
- **Usia**: 17–60 tahun (usia donor)
- **Perangkat**: Mayoritas HP Android (mid-range ke bawah), koneksi 4G tidak selalu stabil
- **Melek teknologi**: Medium — paham WA, Google, medsos. Bukan power user.

---

## 6. Competitive Landscape

| Produk | Kelebihan | Kekurangan vs SIPEDA |
|---|---|---|
| **SIMDONDAR** (nasional) | Integrasi lab, data nasional, SatuSehat | Backend ERP, bukan web publik; UI ketinggalan |
| **DONORKU** (mobile) | Nasional, kartu digital, pengingat | Harus instal app; belum ada registrasi jadwal online |
| **AyoDonor** (PMI pusat) | Stok nasional | Read-only, gak bisa daftar, UI lawas |
| **SIPEDA** | Web (zero install), registrasi online, peta interaktif, role-based, realtime | Masih baru, perlu bukti traction |

---

## 7. Constraints

- **Anggaran**: Minimal (open-source stack, Vercel free/hobby, Supabase free/pro)
- **Tim**: Solo developer
- **Waktu**: Iteratif — prioritas ke fitur impact tinggi dulu
- **Infrastruktur**: Vercel + Supabase (serverless)
