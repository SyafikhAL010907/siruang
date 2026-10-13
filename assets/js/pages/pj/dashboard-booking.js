// 🆕 TAMBAHAN
/**
 * dashboard-booking.js — Logika Vue Halaman Dashboard Booking PJ (Halaman 13)
 * Menampilkan ringkasan statistik booking aktif/menunggu/ditolak, 5 booking terbaru,
 * notifikasi terbaru, dan pintasan menu.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Guard: Hanya role PJ dan Admin
  var allowed = App.guard({ roles: ['pj', 'admin'] })
  if (!allowed) return

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        stats: {
          disetujui: 0,
          menunggu: 0,
          ditolak: 0,
          total: 0,
        },
        recentBookings: [],
        recentNotifs: [],
      }
    },
    computed: {
      currentDateFormatted: function () {
        return App.utils.formatDate(new Date())
      },
    },
    created: function () {
      this.loadDashboardData()
    },
    methods: {
      loadDashboardData: function () {
        var self = this
        var user = this.currentUser
        if (!user) return

        // 1. Ambil Booking
        var filter = (user.role === 'admin') ? null : { userId: user.id }
        if (App.api && App.api.getBookings) {
          App.api.getBookings(filter).then(function (bookings) {
            var all = bookings || []
            self.stats.total = all.length
            self.stats.disetujui = all.filter(function (b) { return b.status === 'disetujui' }).length
            self.stats.menunggu = all.filter(function (b) { return b.status === 'menunggu' }).length
            self.stats.ditolak = all.filter(function (b) { return b.status === 'ditolak' }).length

            self.recentBookings = all.slice(0, 5)
          })
        }

        // 2. Ambil Notifikasi
        if (App.api && App.api.getNotifications) {
          App.api.getNotifications(user.id).then(function (notifs) {
            self.recentNotifs = (notifs || []).slice(0, 4)
          })
        }
      },

      getRoomCode: function (ruanganId) {
        var r = App.store.findById('rooms', ruanganId)
        return r ? r.kode + ' (' + r.nama + ')' : ruanganId || 'Ruangan'
      },

      getCourseName: function (courseId) {
        if (!courseId) return 'Mata Kuliah'
        var c = App.store.findById('courses', courseId)
        return c ? c.kode + ' - ' + c.nama : 'Mata Kuliah'
      },

      getDosenName: function (dosenId) {
        if (!dosenId) return '-'
        var u = App.store.findById('users', dosenId)
        return u ? u.nama : '-'
      },

      formatDate: function (d) {
        return App.utils.formatDate(d)
      },

      formatDateTime: function (dt) {
        return App.utils.formatDateTime(dt)
      },

      getStatusLabel: function (status) {
        return App.utils.bookingStatusLabel(status)
      },

      getBadgeClass: function (status) {
        return App.utils.bookingStatusBadge(status)
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
