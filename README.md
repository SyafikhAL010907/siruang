# Reservasi Ruangan UNJ — Frontend Prototype

Aplikasi web untuk melihat ketersediaan dan memesan ruang kelas lewat denah 2D interaktif (indoor mapping). Fokus utama adalah visualisasi spasial, bukan tabel jadwal.

## Tech Stack

- **Vue 3.5.x** via CDN (global build, tanpa bundler)
- **HTML5 + Tailwind CSS v4** via CDN (`@tailwindcss/browser@4`)
- **JavaScript vanilla (ES6+)**, namespace global `window.App`
- **Chart.js 4.5.x** via CDN (untuk halaman Statistik)
- Data: file JS dummy + `localStorage`

## Cara Menjalankan

1. Buka file `index.html` langsung di browser (double-click) **atau** gunakan Live Server.
2. Halaman loading akan muncul, data dummy di-seed otomatis ke localStorage.
3. Setelah 1-1.5 detik, redirect otomatis ke halaman landing.

### Reset Data Demo

Buka console browser dan jalankan:
```js
App.store.reset()
```

## Kredensial Demo

| Role | NIM/NIP | Email | Password |
|---|---|---|---|
| **Admin** | 198501012010011001 | admin@unj.ac.id | admin123 |
| **Dosen 1** | 197903152005011002 | budi.santoso@unj.ac.id | dosen123 |
| **Dosen 2** | 198207202008012003 | siti.rahayu@unj.ac.id | dosen123 |
| **PJ 1** | 1234567890 | andi.pratama@mhs.unj.ac.id | pj123 |
| **PJ 2** | 1234567891 | dewi.lestari@mhs.unj.ac.id | pj123 |
| **Mahasiswa 1** | 2234567890 | rizki.aditya@mhs.unj.ac.id | mhs123 |
| **Mahasiswa 2** | 2234567891 | putri.amanda@mhs.unj.ac.id | mhs123 |
| **Mahasiswa 3** | 2234567892 | fajar.hidayat@mhs.unj.ac.id | mhs123 |
| **Belum Verifikasi** | 2234567893 | nina.sari@mhs.unj.ac.id | mhs123 |
| **Nonaktif** | 2234567894 | galih.prakosa@mhs.unj.ac.id | mhs123 |

## Peta Halaman

| No | File | Deskripsi | Fase |
|---|---|---|---|
| 1 | `index.html` | Loading Screen | 1 |
| 2 | `public/landing.html` | Beranda / Landing Page | 3 |
| 3 | `public/pilih-gedung.html` | Pilih Gedung | 3 |
| 4 | `public/pilih-lantai.html` | Pilih Lantai | 3 |
| 5 | `public/denah.html` | Denah 2D Interaktif | 3 |
| 6 | `assets/js/components/room-detail-modal.js` | Modal Detail Ruangan | 3 |
| 7 | `auth/signup.html` | Sign Up | 2 |
| 8 | `auth/login.html` | Login | 2 |
| 9 | `auth/lupa-password.html` | Lupa Password 🆕 | 2 |
| 10 | `auth/reset-password.html` | Reset Password 🆕 | 2 |
| 11 | `auth/menunggu-verifikasi.html` | Menunggu Verifikasi 🆕 | 2 |
| 12 | `shared/profil.html` | Profil 🆕 | 2 |
| 13 | `pj/dashboard-booking.html` | Dashboard Booking 🆕 | 4 |
| 14 | `pj/form-reservasi.html` | Form Reservasi | 4 |
| 15 | `pj/riwayat-booking.html` | Riwayat Booking | 4 |
| 16 | `pj/detail-booking.html` | Detail Booking 🆕 | 4 |
| 17 | `mahasiswa/mata-kuliah-saya.html` | Mata Kuliah Saya 🆕 | 4 |
| 18 | `dosen/dashboard-persetujuan.html` | Dashboard Persetujuan 🆕 | 5 |
| 19 | `dosen/daftar-acc-ruangan.html` | Daftar ACC Ruangan | 5 |
| 20 | `dosen/detail-pengajuan.html` | Detail Pengajuan 🆕 | 5 |
| 21 | `dosen/riwayat-keputusan.html` | Riwayat Keputusan 🆕 | 5 |
| 22 | `admin/dashboard-admin.html` | Dashboard Admin | 6 |
| 23 | `admin/manajemen-akun.html` | Manajemen Akun | 6 |
| 24 | `admin/manajemen-relasi.html` | Manajemen Relasi 🆕 | 6 |
| 25 | `admin/master-data-ruangan.html` | Master Data Ruangan | 6 |
| 26 | `admin/semua-booking.html` | Semua Booking | 6 |
| 27 | `admin/reservasi-paksa.html` | Reservasi Paksa | 6 |
| 28 | `admin/notifikasi-pemborosan.html` | Notifikasi Pemborosan | 6 |
| 29 | `admin/log-aktivitas.html` | Log Aktivitas 🆕 | 6 |
| 30 | `admin/statistik-laporan.html` | Statistik & Laporan 🆕 | 6 |
| 31 | `shared/notifikasi.html` | Notifikasi 🆕 | 4 |
| 32 | `public/404.html` | Halaman Tidak Ditemukan 🆕 | 1 |
| 33 | `public/403.html` | Akses Ditolak 🆕 | 1 |

## Keputusan & Asumsi

- ⚠️ Jam operasional 07:00-21:00, slot 30 menit — belum dikonfirmasi.
- ⚠️ Dosen tidak bisa melakukan booking langsung (hanya PJ dan Admin) — belum dikonfirmasi.
- ⚠️ Kapasitas ruangan 1/2/3 kelas — belum dikonfirmasi.
- ⚠️ Export PDF via print stylesheet — belum dikonfirmasi.
- Role `pj` dan `admin` tidak bisa dipilih saat Sign Up; hanya admin yang bisa mengubahnya.
- Tailwind CSS v4 digunakan (CSS-first config via `@theme`), bukan v3 dengan `tailwind.config.js`.
- Vue 3.5.x (latest stable) digunakan, bukan versi yang dipin di prompt awal.
- **Pembaruan Gedung (Permintaan Pengguna)**:
  - Gedung pertama: **Gedung L (Rumpun Elektro)** (4 lantai, 24 ruangan: kode L.101–L.406).
  - Gedung kedua: **Gedung L (Rumpun Sipil)** (4 lantai, 24 ruangan: kode LS.101–LS.406).

## Fase Pengerjaan

- [x] **Fase 1 — Fondasi**: struktur folder, core/*, data dummy, global.css, navbar, index.html, 404, 403
- [x] **Fase 2 — Akun**: halaman 7-12 (signup, login, lupa password, reset, verifikasi, profil)
- [x] **Fase 3 — Denah**: halaman 2-5 dan modal 6 (denah 2D interaktif, pilih gedung & lantai)
- [x] **Fase 4 — Reservasi**: halaman 13-17 dan 31 (dashboard booking, form reservasi, riwayat, detail, matkul, notifikasi)
- [x] **Fase 5 — Approval**: halaman 18-21 (dashboard persetujuan, daftar ACC, detail pengajuan, riwayat keputusan)
- [x] **Fase 6 — Administrasi**: halaman 22-30 (dashboard admin, manajemen akun, manajemen relasi, master data ruangan, semua booking, reservasi paksa, notifikasi pemborosan, log aktivitas, statistik laporan)
- [x] **Fase 7 — Penutup**: README final, checklist penerimaan terverifikasi, dan skenario uji lintas role

## Checklist Penerimaan (Acceptance Criteria)

- [x] **32 File HTML + 1 Komponen Modal**: Tiap halaman memiliki berkas CSS dan JS mirror pada struktur folder yang ditentukan.
- [x] **Arsitektur Single Source of Truth Routes**: Seluruh navigasi antarmuka dan redirect memakai objek `App.routes.*`.
- [x] **Navbar Dinamis per Role**:
  - `guest`: Beranda, Denah Gedung, Login, Sign Up.
  - `mahasiswa`: Beranda, Denah Gedung, Mata Kuliah Saya, Notifikasi, Profil, Logout.
  - `pj`: Beranda, Denah Gedung, Dashboard Booking, Buat Reservasi, Riwayat Booking, Mata Kuliah Saya, Notifikasi, Profil, Logout.
  - `dosen`: Beranda, Denah Gedung, Dashboard Persetujuan (badge pending), Daftar ACC, Riwayat Keputusan, Notifikasi, Profil, Logout.
  - `admin`: Dashboard, Denah Gedung, Persetujuan (ACC & Riwayat), Reservasi (Semua, Reservasi Paksa, Buat), Master Data Ruangan, Manajemen Akun, Manajemen Relasi, Notifikasi Pemborosan, Log Aktivitas, Statistik & Laporan, Notifikasi, Profil, Logout.
- [x] **Route Guarding**: Pengguna belum login dialihkan ke `login.html?redirect=...`; role tidak berhak dialihkan ke `403.html`; akun berstatus `menunggu_verifikasi` dialihkan ke `menunggu-verifikasi.html`; admin memiliki akses global ke seluruh halaman.
- [x] **Alur End-to-End Lolos**:
  1. Pengguna mendaftar di `signup.html` &rarr; status `menunggu_verifikasi`.
  2. Administrator memverifikasi akun di `manajemen-akun.html` &rarr; status `aktif`.
  3. Mahasiswa login dan mendapatkan peran PJ &rarr; mengakses denah dan membuat pengajuan reservasi di `form-reservasi.html`.
  4. Dosen pengampu menerima pengajuan di `dashboard-persetujuan.html` &rarr; meninjau di `detail-pengajuan.html` &rarr; menyetujui (ACC) atau menolak dengan alasan wajib min. 10 karakter.
  5. Status booking terbarukan, notifikasi otomatis terkirim, dan aktivitas tercatat di `log-aktivitas.html`.
- [x] **Aturan Fallback & Reservasi Paksa**:
  - Booking berkapasitas besar untuk rombel kecil otomatis terdeteksi sebagai `isFallback=true` dan masuk ke `notifikasi-pemborosan.html`.
  - Reservasi Paksa oleh Admin mendeteksi bentrok jadwal secara real-time, membatalkan otomatis jadwal yang terdampak, dan mengirim notifikasi darurat.
- [x] **Konsistensi Desain**:
  - Tema hijau tua UNJ (`#14532D`) + hijau soft (`#E8F3EC`) + putih bersih.
  - Tipografi Inter dengan hierarki heading yang rapi.
  - Kontras teks memenuhi rasio minimal WCAG 4.5:1.
  - Mobile-first responsif (dukungan kartu di smartphone dan tabel di desktop).
- [x] **Penanda Kode**: Semua fitur tambahan bertanda `<!-- 🆕 TAMBAHAN -->` / `// 🆕 TAMBAHAN` dan asumsi bertanda `// ⚠️ ASUMSI:`.

## Skenario Uji Coba Lintas Role

### Skenario 1: Guest (Tamu / Publik)
1. Buka `index.html` &rarr; loading animasi &rarr; redirect otomatis ke `public/landing.html`.
2. Klik **Lihat Denah** &rarr; `public/pilih-gedung.html` &rarr; pilih **Gedung L (Rumpun Elektro)** atau **Gedung L (Rumpun Sipil)** (keduanya 4 lantai).
3. Klik salah satu lantai &rarr; `public/denah.html`.
4. Klik salah satu kotak ruangan denah &rarr; modal detail ruangan muncul.
5. Karena belum login, tombol booking menampilkan **Login untuk Booking** &rarr; klik akan mengarahkan ke `auth/login.html`.

### Skenario 2: Pendaftaran & Verifikasi Admin
1. Buka `auth/signup.html`, isi formulir pendaftaran mahasiswa baru.
2. Setelah submit, halaman beralih ke `auth/menunggu-verifikasi.html`.
3. Logout, lalu login sebagai **Admin** (`admin@unj.ac.id` / `admin123`).
4. Masuk ke menu **Manajemen Akun** (`admin/manajemen-akun.html`).
5. Temukan akun baru pada daftar, klik tombol **Verifikasi** untuk mengaktifkan akun, atau klik **Ubah Role** untuk mengangkat menjadi PJ.

### Skenario 3: Reservasi oleh PJ Kelas
1. Login sebagai **PJ 1** (`andi.pratama@mhs.unj.ac.id` / `pj123`).
2. Masuk ke **Dashboard Booking** (`pj/dashboard-booking.html`) atau langsung ke **Denah** (`public/denah.html`).
3. Pilih ruangan hijau (tersedia), klik **Reservasi Ruangan Ini**.
4. Di `pj/form-reservasi.html`, pilih mata kuliah. Nama dosen pengampu akan terisi secara otomatis jika relasi akademik terdaftar.
5. Coba pilih kapasitas 1 rombel pada ruangan 3 rombel &rarr; peringatan *Fallback Kapasitas* akan muncul.
6. Kirim permohonan reservasi &rarr; status menjadi **Menunggu**.

### Skenario 4: Keputusan oleh Dosen Pengampu
1. Login sebagai **Dosen 1** (`budi.santoso@unj.ac.id` / `dosen123`).
2. Masuk ke **Dashboard Persetujuan** (`dosen/dashboard-persetujuan.html`).
3. Temukan permohonan yang baru diajukan oleh PJ.
4. Klik **Detail** &rarr; periksa detail pengajuan di `dosen/detail-pengajuan.html`.
5. Uji tombol **ACC** (status berubah jadi *Disetujui*) atau tombol **Tolak** (wajib mengisi alasan penolakan minimal 10 karakter).
6. Notifikasi otomatis langsung terkirim ke akun PJ pemohon.

### Skenario 5: Operasional Lanjut oleh Administrator
1. Login sebagai **Admin** (`admin@unj.ac.id` / `admin123`).
2. Buka `admin/semua-booking.html` &rarr; uji pembatalan reservasi yang sudah di-ACC dengan alasan resmi.
3. Buka `admin/reservasi-paksa.html` &rarr; pilih slot waktu yang beririsan dengan jadwal kuliah yang ada &rarr; sistem mendeteksi bentrok &rarr; eksekusi darurat membatalkan jadwal yang bertabrakan.
4. Buka `admin/notifikasi-pemborosan.html` &rarr; tandai kasus fallback yang sudah ditinjau.
5. Buka `admin/log-aktivitas.html` &rarr; seluruh riwayat aksi sebelumnya tercatat rapi secara kronologis.
6. Buka `admin/statistik-laporan.html` &rarr; amati visualisasi Chart.js, klik **Ekspor CSV** untuk mengunduh data, atau klik **Cetak / Simpan PDF** untuk laporan cetak bersih.
