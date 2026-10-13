/**
 * nav-loader.js — Memilih dan memuat navbar otomatis berdasarkan role sesi
 * Dipakai di halaman bersama (public/*, shared/*)
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  /**
   * Muat file navbar sesuai role.
   * Mengembalikan nama file navbar yang dimuat.
   * @returns {string}
   */
  window.App.loadNavbar = function () {
    var user = App.auth.currentUser()
    var role = user ? user.role : 'guest'
    var base = App.routes._base

    // Map role ke file navbar
    var navbarFiles = {
      admin: base + 'navigation/navbar-admin.js',
      dosen: base + 'navigation/navbar-dosen.js',
      pj: base + 'navigation/navbar-pj.js',
      mahasiswa: base + 'navigation/navbar-mahasiswa.js',
      guest: base + 'navigation/navbar-guest.js',
    }

    // Muat script navbar
    // Jika masih dalam proses parsing dokumen, gunakan document.write agar sinkron
    if (document.readyState === 'loading') {
      document.write('<script src="' + file + '"><\/script>')
    } else {
      var script = document.createElement('script')
      script.src = file
      script.async = false
      document.head.appendChild(script)
    }

    return role
  }

  // Auto-load saat nav-loader.js dieksekusi di HTML
  if (typeof window.App.loadNavbar === 'function') {
    window.App.loadNavbar()
  }
})()
