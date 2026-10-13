/**
 * config.js — Konstanta dan konfigurasi aplikasi
 * Namespace: App.config
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  window.App.config = {
    // Nama aplikasi
    APP_NAME: 'Reservasi Ruangan UNJ',

    // Role pengguna
    ROLES: {
      ADMIN: 'admin',
      DOSEN: 'dosen',
      PJ: 'pj',
      MAHASISWA: 'mahasiswa',
      GUEST: 'guest',
    },

    // Status booking
    BOOKING_STATUS: {
      MENUNGGU: 'menunggu',
      DISETUJUI: 'disetujui',
      DITOLAK: 'ditolak',
      DIBATALKAN: 'dibatalkan',
      SELESAI: 'selesai', // 🆕 TAMBAHAN
    },

    // Status ruangan
    ROOM_STATUS: {
      TERSEDIA: 'tersedia',
      SEBAGIAN: 'sebagian',
      TERPAKAI: 'terpakai',
      NONAKTIF: 'nonaktif', // 🆕 TAMBAHAN
    },

    // Status akun
    ACCOUNT_STATUS: {
      AKTIF: 'aktif',
      MENUNGGU_VERIFIKASI: 'menunggu_verifikasi',
      NONAKTIF: 'nonaktif',
    },

    // ⚠️ ASUMSI: Aturan booking
    BOOKING_RULES: {
      JAM_BUKA: 7,       // 07:00
      JAM_TUTUP: 21,     // 21:00
      SLOT_MENIT: 30,    // slot 30 menit
      MAX_KAPASITAS: 3,  // maksimal 3 kelas per ruangan
    },

    // Hak akses per role (mudah diubah)
    PERMISSIONS: {
      BOOKING: ['pj', 'admin'],           // ⚠️ ASUMSI: dosen tidak bisa booking
      APPROVAL: ['dosen', 'admin'],
      ADMIN_PANEL: ['admin'],
      VIEW_DENAH: ['guest', 'mahasiswa', 'pj', 'dosen', 'admin'],
      MATA_KULIAH_SAYA: ['mahasiswa', 'pj', 'admin'],
    },

    // Gedung
    BUILDINGS: {
      L: { name: 'Gedung L (Rumpun Elektro)', code: 'L', floors: 4 },
      LS: { name: 'Gedung L (Rumpun Sipil)', code: 'LS', floors: 4 },
    },

    // Delay simulasi API (ms)
    API_DELAY_MIN: 200,
    API_DELAY_MAX: 400,

    // Paginasi default
    DEFAULT_PAGE_SIZE: 10,

    // Versi aplikasi
    VERSION: '1.0.0',
  }
})()
