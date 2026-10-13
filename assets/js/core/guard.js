/**
 * guard.js — Route guard / proteksi halaman
 * Namespace: App.guard
 * Dipanggil paling awal di setiap halaman.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  /**
   * Guard halaman berdasarkan role
   * @param {Object} options
   * @param {string[]} options.roles - Role yang diizinkan
   * @param {boolean} [options.guestAllowed] - Jika true, guest bisa akses
   * @returns {boolean} true jika pengguna boleh akses
   */
  window.App.guard = function (options) {
    options = options || {}
    var roles = options.roles || []
    var guestAllowed = options.guestAllowed || false

    var user = App.auth.currentUser()

    // Halaman publik yang boleh diakses guest
    if (guestAllowed) {
      return true
    }

    // Belum login → redirect ke login
    if (!user) {
      var currentUrl = window.location.href
      App.navigateTo(App.routes.auth.login, { redirect: currentUrl })
      return false
    }

    // Akun nonaktif → tolak
    if (user.status === App.config.ACCOUNT_STATUS.NONAKTIF) {
      App.auth.logout()
      return false
    }

    // Akun belum diverifikasi → redirect ke halaman tunggu
    // 🆕 TAMBAHAN
    if (user.status === App.config.ACCOUNT_STATUS.MENUNGGU_VERIFIKASI) {
      // Hanya bisa akses halaman menunggu verifikasi
      if (window.location.pathname.indexOf('menunggu-verifikasi') === -1) {
        App.navigateTo(App.routes.auth.menungguVerifikasi)
        return false
      }
      return true
    }

    // Admin selalu lolos
    if (user.role === 'admin') {
      return true
    }

    // Cek role
    if (roles.length > 0 && roles.indexOf(user.role) === -1) {
      App.navigateTo(App.routes.public.forbidden)
      return false
    }

    return true
  }
})()
