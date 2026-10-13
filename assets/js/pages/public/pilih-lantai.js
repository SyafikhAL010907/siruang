/**
 * pilih-lantai.js — Logika Vue Halaman Pilih Lantai (Halaman 4)
 * Menampilkan daftar lantai Gedung L Rumpun Elektro (1-4) dan Gedung L Rumpun Sipil (1-4) beserta mini-ringkasan status.
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
      var initialGedung = (App.utils.getQueryParam('gedung') || 'L').toUpperCase()
      if (initialGedung !== 'L' && initialGedung !== 'LS') {
        initialGedung = 'L'
      }

      return {
        routes: App.routes,
        selectedGedung: initialGedung,
        floorList: [],
      }
    },
    computed: {
      buildingInfo: function () {
        if (this.selectedGedung === 'LS') {
          return {
            name: 'Gedung L (Rumpun Sipil)',
            floors: 4,
            description: 'Gedung perkuliahan Rumpun Teknik Sipil Fakultas Teknik 4 lantai.',
          }
        }
        return {
          name: 'Gedung L (Rumpun Elektro)',
          floors: 4,
          description: 'Gedung perkuliahan Rumpun Teknik Elektro Fakultas Teknik 4 lantai.',
        }
      },
    },
    created: function () {
      this.buildFloorList()
    },
    methods: {
      switchBuilding: function (code) {
        this.selectedGedung = code
        // Update URL tanpa reload
        if (window.history && window.history.replaceState) {
          var url = window.location.pathname + '?gedung=' + code
          window.history.replaceState(null, '', url)
        }
        this.buildFloorList()
      },

      goToFloor: function (lantai) {
        window.location.href = this.routes.public.denah + '?gedung=' + this.selectedGedung + '&lantai=' + lantai
      },

      buildFloorList: function () {
        var numFloors = 4
        var floors = []
        var rooms = App.store.get('rooms', [])
        var today = App.utils.todayISO()
        var curHour = new Date().getHours()
        var jamMulai = String(curHour).padStart(2, '0') + ':00'
        var jamSelesai = String(Math.min(23, curHour + 2)).padStart(2, '0') + ':00'

        for (var i = 1; i <= numFloors; i++) {
          var floorRooms = rooms.filter(function (r) {
            return r.gedung === this.selectedGedung && r.lantai === i
          }.bind(this))

          // Default mini status
          var defaultTersedia = Math.max(1, floorRooms.length - 2)
          var defaultSebagian = floorRooms.length > 3 ? 1 : 0
          var defaultTerpakai = floorRooms.length - defaultTersedia - defaultSebagian

          floors.push({
            lantai: i,
            totalRooms: floorRooms.length || 6,
            stats: {
              tersedia: defaultTersedia,
              sebagian: defaultSebagian,
              terpakai: Math.max(0, defaultTerpakai),
            },
          })
        }

        this.floorList = floors

        // Cek live status dari API
        var self = this
        if (App.api && App.api.getRoomStatus) {
          floors.forEach(function (fl, idx) {
            var flRooms = rooms.filter(function (r) {
              return r.gedung === self.selectedGedung && r.lantai === fl.lantai
            })
            if (flRooms.length === 0) return

            var promises = flRooms.map(function (r) {
              return App.api.getRoomStatus(r.id, today, jamMulai, jamSelesai)
            })

            Promise.all(promises).then(function (resList) {
              var count = { tersedia: 0, sebagian: 0, terpakai: 0 }
              resList.forEach(function (res) {
                if (res.status === 'tersedia') count.tersedia++
                else if (res.status === 'sebagian') count.sebagian++
                else if (res.status === 'terpakai') count.terpakai++
                else count.tersedia++
              })
              self.floorList[idx].stats = count
            })
          })
        }
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
