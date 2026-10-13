/**
 * pilih-gedung.js — Logika Vue Halaman Pilih Gedung (Halaman 3)
 * Menampilkan kartu pilihan Gedung L (Rumpun Elektro) dan Gedung L (Rumpun Sipil) beserta ringkasan status ketersediaan.
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
      return {
        routes: App.routes,
        statsL: { total: 24, tersedia: 18, sebagian: 4, terpakai: 2 },
        statsLS: { total: 24, tersedia: 18, sebagian: 4, terpakai: 2 },
      }
    },
    created: function () {
      this.loadOccupancy()
    },
    methods: {
      selectBuilding: function (code) {
        window.location.href = this.routes.public.pilihLantai + '?gedung=' + code
      },
      loadOccupancy: function () {
        var self = this
        var today = App.utils ? App.utils.todayISO() : ''
        var curHour = new Date().getHours()
        var jamMulai = String(curHour).padStart(2, '0') + ':00'
        var jamSelesai = String(Math.min(23, curHour + 2)).padStart(2, '0') + ':00'

        if (!App.api || !App.api.getRooms || !App.api.getRoomStatus) return

        // Hitung Gedung L (Elektro)
        App.api.getRooms({ gedung: 'L' }).then(function (roomsL) {
          if (!roomsL || roomsL.length === 0) return
          var promises = roomsL.map(function (r) {
            return App.api.getRoomStatus(r.id, today, jamMulai, jamSelesai)
          })
          Promise.all(promises).then(function (statuses) {
            var stats = { total: roomsL.length, tersedia: 0, sebagian: 0, terpakai: 0 }
            statuses.forEach(function (res) {
              if (res.status === 'tersedia') stats.tersedia++
              else if (res.status === 'sebagian') stats.sebagian++
              else if (res.status === 'terpakai') stats.terpakai++
              else stats.tersedia++
            })
            self.statsL = stats
          })
        })

        // Hitung Gedung L (Sipil)
        App.api.getRooms({ gedung: 'LS' }).then(function (roomsLS) {
          if (!roomsLS || roomsLS.length === 0) return
          var promises = roomsLS.map(function (r) {
            return App.api.getRoomStatus(r.id, today, jamMulai, jamSelesai)
          })
          Promise.all(promises).then(function (statuses) {
            var stats = { total: roomsLS.length, tersedia: 0, sebagian: 0, terpakai: 0 }
            statuses.forEach(function (res) {
              if (res.status === 'tersedia') stats.tersedia++
              else if (res.status === 'sebagian') stats.sebagian++
              else if (res.status === 'terpakai') stats.terpakai++
              else stats.tersedia++
            })
            self.statsLS = stats
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
