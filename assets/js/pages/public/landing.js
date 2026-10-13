/**
 * landing.js — Logika Vue Halaman Beranda / Landing (Halaman 2)
 * Menampilkan statistik okupansi real-time per gedung pada jam sekarang,
 * tombol CTA cerdas sesuai sesi autentikasi, serta tautan ke denah.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  var app = Vue.createApp({
    data: function () {
      var now = new Date()
      var curHour = now.getHours()
      var startH = String(curHour).padStart(2, '0') + ':00'
      var endH = String(Math.min(23, curHour + 2)).padStart(2, '0') + ':00'

      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        todayISO: App.utils.todayISO(),
        curHour: curHour,
        jamMulai: startH,
        jamSelesai: endH,
        gedungLStats: {
          total: 24,
          tersedia: 18,
          sebagian: 4,
          terpakai: 2,
        },
        gedungLSStats: {
          total: 24,
          tersedia: 18,
          sebagian: 4,
          terpakai: 2,
        },
      }
    },
    computed: {
      currentDateFormatted: function () {
        return App.utils.formatDate(new Date())
      },
      currentHourFormatted: function () {
        return this.jamMulai + ' - ' + this.jamSelesai + ' WIB'
      },
      roleLabel: function () {
        if (!this.currentUser) return ''
        return App.utils.roleLabel ? App.utils.roleLabel(this.currentUser.role) : this.currentUser.role
      },
      dashboardUrl: function () {
        if (!this.currentUser) return this.routes.auth.login
        return App.auth.getDefaultRedirect(this.currentUser.role)
      },
    },
    created: function () {
      this.loadLiveOccupancy()
    },
    methods: {
      /**
       * Menghitung status okupansi terkini per gedung
       */
      loadLiveOccupancy: function () {
        var self = this
        if (!App.api || !App.api.getRooms || !App.api.getRoomStatus) return

        // 1. Gedung L (Elektro)
        App.api.getRooms({ gedung: 'L' }).then(function (roomsL) {
          if (!roomsL || roomsL.length === 0) return
          var promises = roomsL.map(function (r) {
            return App.api.getRoomStatus(r.id, self.todayISO, self.jamMulai, self.jamSelesai)
          })
          Promise.all(promises).then(function (statuses) {
            var stats = { total: roomsL.length, tersedia: 0, sebagian: 0, terpakai: 0 }
            statuses.forEach(function (res) {
              if (res.status === 'tersedia') stats.tersedia++
              else if (res.status === 'sebagian') stats.sebagian++
              else if (res.status === 'terpakai') stats.terpakai++
              else stats.tersedia++ // fallback
            })
            self.gedungLStats = stats
          })
        })

        // 2. Gedung L (Sipil)
        App.api.getRooms({ gedung: 'LS' }).then(function (roomsLS) {
          if (!roomsLS || roomsLS.length === 0) return
          var promises = roomsLS.map(function (r) {
            return App.api.getRoomStatus(r.id, self.todayISO, self.jamMulai, self.jamSelesai)
          })
          Promise.all(promises).then(function (statuses) {
            var stats = { total: roomsLS.length, tersedia: 0, sebagian: 0, terpakai: 0 }
            statuses.forEach(function (res) {
              if (res.status === 'tersedia') stats.tersedia++
              else if (res.status === 'sebagian') stats.sebagian++
              else if (res.status === 'terpakai') stats.terpakai++
              else stats.tersedia++
            })
            self.gedungLSStats = stats
          })
        })
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
