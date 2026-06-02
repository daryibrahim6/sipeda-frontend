# SIPEDA Roadmap

> Berdasarkan prioritas: User Value > Business Value > Technical Complexity

---

## Fase 1: Foundation (Selesai ✅)

> **Aplikasi sudah live, fitur inti berfungsi.**

- ✅ Registrasi donor online
- ✅ Jadwal & lokasi donor
- ✅ Stok darah real-time
- ✅ Pencatatan hasil donor (petugas)
- ✅ Admin dashboard + CRUD
- ✅ Auth & role management
- ✅ Peta interaktif
- ✅ Riwayat donor
- ✅ SEO dasar (sitemap, robots, metadata)
- ✅ Export Excel

---

## Fase 2: Engagement & Retention (Sekarang 🔴)

> **Meningkatkan partisipasi donor & mengurangi no-show.**

| Item | Estimasi | Impact |
|---|---|---|
| **WhatsApp Integration** (Fonnte) | 3-5 hari | 🔴 TINGGI — No-show turun drastis, donor ingat jadwal |
| **PWA** (installable + push notif) | 1-2 hari | 🔴 TINGGI — User HP bisa "install" web sebagai app |
| **Sertifikat Donor Digital** | 2-3 hari | 🔴 TINGGI — Donor share ke IG/WA = free marketing |

---

## Fase 3: Polish & Simplify (Sedang 🟡)

> **Mengurangi kompleksitas yang gak perlu, memperbaiki UX.**

| Item | Estimasi | Alasan |
|---|---|---|
| **Simplifikasi Artikel** → jadi Pengumuman | 1-2 hari | Artikel CRUD terlalu berat untuk fungsinya |
| **FAQ jadi static** | 0.5 hari | Gak perlu DB & API buat 10 pertanyaan |
| **Testimonial jadi static section** | 0.5 hari | Sama, gak perlu CRUD |
| **Light theme refresh** (soft white) | 1 hari | Bikin nyaman dilihat, gak silau |
| **Pengumuman Darurat** di homepage | 1 hari | Stok kritis atau bencana harus langsung kelihatan |

---

## Fase 4: Data & Scale (Nanti 🟢)

> **Fitur yang meningkatkan value buat admin & skalabilitas.**

| Item | Estimasi | Alasan |
|---|---|---|
| **Dashboard analytics** (tren donor/bulan, demografi) | 3-5 hari | Admin bisa liat pola & bikin keputusan |
| **Multi-tenant schema** (tambah `cabang_id`) | 2-3 hari | Siapin struktur, jangan aktifin dulu |
| **Export report PDF** (laporan bulanan) | 2-3 hari | Admin butuh laporan ke atasan/PMI pusat |

---

## Fase 5: Future (Nanti 🔵)

> **Baru dikerjakan kalau ada demand jelas.**

- Integrasi SIMDONDAR (sistem nasional PMI)
- Fitur "Cari Darah" (request darah emergency dari RS)
- Dashboard publik (transparansi ke masyarakat)

---

## Timeline Visual (Estimasi)

```
Minggu 1-2: 🟡 Fase 2 (WA + PWA + Sertifikat)
Minggu 3-4: 🟡 Fase 3 (Simplify + Polish)
Bulan 2:    🟢 Fase 4 (Data + Scale)
Bulan 3+:   🔵 Fase 5 (Future)
```

> *Semua estimasi relative — solo developer. Prioritas bisa berubah berdasarkan feedback user.*
