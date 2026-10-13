/**
 * dashboard-admin.js — Logika Vue Halaman Dashboard Admin (Halaman 22)
 * Menampilkan ringkasan metrik kampus, log aktivitas terbaru, dan pintasan administrasi.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Guard: Hanya admin
  var allowed = App.guard({ roles: ['admin'] })
  if (!allowed) return

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        loading: true,
        stats: {
          bookingHariIni: 0,
          bookingMenunggu: 0,
          ruanganTerpakai: 0,
          akunMenungguVerifikasi: 0,
          notifikasiPemborosan: 0,
          totalRuangan: 48,
          totalAkun: 0,
        },
        recentLogs: [],
        recentBookings: [],
        allRooms: [],
        allCourses: [],
        allUsers: [],
      }
    },
    created: function () {
      this.loadDashboardData()
    },
    methods: {
      loadDashboardData: function () {
        var self = this
        self.loading = true

        var today = App.utils ? App.utils.todayISO() : ''
        var curHour = new Date().getHours()
        var jamMulai = String(curHour).padStart(2, '0') + ':00'
        var jamSelesai = String(Math.min(23, curHour + 2)).padStart(2, '0') + ':00'

        Promise.all([
          App.api.getBookings(),
          App.api.getRooms(),
          App.api.getUsers(),
          App.api.getCourses(),
          App.api.getLogs(),
        ]).then(function (results) {
          var bookings = results[0] || []
          self.allRooms = results[1] || []
          self.allUsers = results[2] || []
          self.allCourses = results[3] || []
          var logs = results[4] || []

          // Hitung statistik
          var bookingHariIni = bookings.filter(function (b) { return b.tanggal === today }).length
          var bookingMenunggu = bookings.filter(function (b) { return b.status === 'menunggu' }).length
          var akunMenungguVerifikasi = self.allUsers.filter(function (u) { return u.status === 'menunggu_verifikasi' }).length
          var notifikasiPemborosan = bookings.filter(function (b) { return b.isFallback }).length

          // Hitung ruangan terpakai saat ini
          var activeApprovedBookings = bookings.filter(function (b) {
            if (b.status !== 'disetujui' || b.tanggal !== today) return false
            var bStart = App.utils.timeToMinutes(b.jamMulai)
            var bEnd = App.utils.timeToMinutes(b.jamSelesai)
            var nowMin = curHour * 60 + new Date().getMinutes()
            return bStart <= nowMin && bEnd >= nowMin
          })
          var uniqueUsedRooms = {}
          activeApprovedBookings.forEach(function (b) { uniqueUsedRooms[b.ruanganId] = true })
          var ruanganTerpakaiCount = Object.keys(uniqueUsedRooms).length

          self.stats = {
            bookingHariIni: bookingHariIni,
            bookingMenunggu: bookingMenunggu,
            ruanganTerpakai: ruanganTerpakaiCount,
            akunMenungguVerifikasi: akunMenungguVerifikasi,
            notifikasiPemborosan: notifikasiPemborosan,
            totalRuangan: self.allRooms.length,
            totalAkun: self.allUsers.length,
          }

          // 6 Log Aktivitas Terbaru
          self.recentLogs = logs.slice(0, 6)

          // 5 Booking Terbaru
          self.recentBookings = bookings.slice(0, 5)

          self.loading = false
        }).catch(function (err) {
          console.error('Error loading admin dashboard:', err)
          self.loading = false
        })
      },

      getRoomCode: function (id) {
        var r = this.allRooms.find(function (item) { return item.id === id })
        return r ? r.kode : '-'
      },
      getCourseName: function (id) {
        var c = this.allCourses.find(function (item) { return item.id === id })
        return c ? c.nama : 'Kegiatan Kampus'
      },
      getUserName: function (id) {
        var u = this.allUsers.find(function (item) { return item.id === id })
        return u ? u.nama : 'Pengguna'
      },
      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },
      formatDateTime: function (iso) {
        if (!iso) return '-'
        var d = new Date(iso)
        return App.utils.formatDate(d) + ', ' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0')
      },
      formatTime: function (jamMulai, jamSelesai) {
        return jamMulai + ' - ' + jamSelesai
      },
      getActionBadgeClass: function (action) {
        if (action.indexOf('CREATE') !== -1 || action.indexOf('APPROVE') !== -1) return 'badge-success'
        if (action.indexOf('REJECT') !== -1 || action.indexOf('CANCEL') !== -1 || action.indexOf('DELETE') !== -1) return 'badge-danger'
        if (action.indexOf('FORCE') !== -1) return 'badge-warning'
        return 'badge-info'
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
