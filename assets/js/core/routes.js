/**
 * routes.js — Peta tunggal semua URL halaman
 * Namespace: App.routes
 * Semua link WAJIB memakai peta ini, tidak ada path manual.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Helper: menentukan base path relatif terhadap posisi halaman saat ini
  function getBasePath() {
    var path = window.location.pathname
    // Deteksi kedalaman folder
    var segments = path.split('/').filter(Boolean)
    var fileName = segments[segments.length - 1] || ''

    // Cari folder root project (reservasi-ruangan-unj)
    var rootIndex = -1
    for (var i = 0; i < segments.length; i++) {
      if (segments[i] === 'reservasi-ruangan-unj') {
        rootIndex = i
        break
      }
    }

    if (rootIndex === -1) {
      // Fallback: hitung dari posisi saat ini
      // Cek apakah di root atau subfolder
      if (path.indexOf('/public/') !== -1 ||
          path.indexOf('/auth/') !== -1 ||
          path.indexOf('/shared/') !== -1 ||
          path.indexOf('/mahasiswa/') !== -1 ||
          path.indexOf('/pj/') !== -1 ||
          path.indexOf('/dosen/') !== -1 ||
          path.indexOf('/admin/') !== -1 ||
          path.indexOf('/navigation/') !== -1) {
        return '../'
      }
      return './'
    }

    // Hitung berapa level di bawah root
    var depth = segments.length - rootIndex - 1
    if (fileName.indexOf('.html') !== -1) {
      depth = depth - 1
    }

    if (depth <= 0) return './'
    var prefix = ''
    for (var j = 0; j < depth; j++) {
      prefix += '../'
    }
    return prefix
  }

  var base = getBasePath()

  window.App.routes = {
    _base: base,

    // Root
    index: base + 'index.html',

    // Public
    public: {
      landing: base + 'public/landing.html',
      pilihGedung: base + 'public/pilih-gedung.html',
      pilihLantai: base + 'public/pilih-lantai.html',
      denah: base + 'public/denah.html',
      notFound: base + 'public/404.html',       // 🆕 TAMBAHAN
      forbidden: base + 'public/403.html',       // 🆕 TAMBAHAN
    },

    // Auth
    auth: {
      signup: base + 'auth/signup.html',
      login: base + 'auth/login.html',
      lupaPassword: base + 'auth/lupa-password.html',      // 🆕 TAMBAHAN
      resetPassword: base + 'auth/reset-password.html',    // 🆕 TAMBAHAN
      menungguVerifikasi: base + 'auth/menunggu-verifikasi.html', // 🆕 TAMBAHAN
    },

    // Shared
    shared: {
      profil: base + 'shared/profil.html',           // 🆕 TAMBAHAN
      notifikasi: base + 'shared/notifikasi.html',   // 🆕 TAMBAHAN
    },

    // Mahasiswa
    mahasiswa: {
      mataKuliahSaya: base + 'mahasiswa/mata-kuliah-saya.html', // 🆕 TAMBAHAN (opsional)
    },

    // PJ (Penanggung Jawab)
    pj: {
      dashboardBooking: base + 'pj/dashboard-booking.html',   // 🆕 TAMBAHAN
      formReservasi: base + 'pj/form-reservasi.html',
      riwayatBooking: base + 'pj/riwayat-booking.html',
      detailBooking: base + 'pj/detail-booking.html',         // 🆕 TAMBAHAN
    },

    // Dosen
    dosen: {
      dashboardPersetujuan: base + 'dosen/dashboard-persetujuan.html', // 🆕 TAMBAHAN
      daftarAccRuangan: base + 'dosen/daftar-acc-ruangan.html',
      detailPengajuan: base + 'dosen/detail-pengajuan.html',          // 🆕 TAMBAHAN
      riwayatKeputusan: base + 'dosen/riwayat-keputusan.html',        // 🆕 TAMBAHAN
    },

    // Admin
    admin: {
      dashboard: base + 'admin/dashboard-admin.html',
      manajemenAkun: base + 'admin/manajemen-akun.html',
      manajemenRelasi: base + 'admin/manajemen-relasi.html',         // 🆕 TAMBAHAN (opsional)
      masterDataRuangan: base + 'admin/master-data-ruangan.html',
      semuaBooking: base + 'admin/semua-booking.html',
      reservasiPaksa: base + 'admin/reservasi-paksa.html',
      notifikasiPemborosan: base + 'admin/notifikasi-pemborosan.html',
      logAktivitas: base + 'admin/log-aktivitas.html',               // 🆕 TAMBAHAN
      statistikLaporan: base + 'admin/statistik-laporan.html',       // 🆕 TAMBAHAN
    },
  }

  /**
   * Navigasi ke rute tertentu
   * @param {string} url - URL tujuan dari App.routes
   * @param {Object} [params] - Query parameters opsional
   */
  window.App.navigateTo = function (url, params) {
    if (params && typeof params === 'object') {
      var qs = Object.keys(params)
        .filter(function (k) { return params[k] !== undefined && params[k] !== null })
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]) })
        .join('&')
      if (qs) url += '?' + qs
    }
    window.location.href = url
  }
})()
