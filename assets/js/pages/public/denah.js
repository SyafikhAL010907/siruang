/**
 * denah.js — Logika Vue Halaman Denah 2D Interaktif (Halaman 5)
 * Mendukung visualisasi spasial denah per lantai, filter tanggal & jam operasional,
 * live search, interaksi hover highlight daftar-denah, dan modal detail ruangan (#6).
 */
;(function () {
  'use strict'

  var App = window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Buat daftar slot waktu 30 menitan antara 07:00 s.d 21:00
  var slots = []
  for (var h = 7; h <= 21; h++) {
    slots.push(String(h).padStart(2, '0') + ':00')
    if (h < 21) {
      slots.push(String(h).padStart(2, '0') + ':30')
    }
  }

  var app = Vue.createApp({
    data: function () {
      var initialGedung = (App.utils.getQueryParam('gedung') || 'L').toUpperCase()
      if (initialGedung !== 'L' && initialGedung !== 'LS') initialGedung = 'L'
      var initialLantai = parseInt(App.utils.getQueryParam('lantai') || '1')

      var curHour = new Date().getHours()
      var defaultStart = (curHour >= 7 && curHour < 21)
        ? String(curHour).padStart(2, '0') + ':00'
        : '08:00'
      var defaultEnd = (curHour >= 7 && curHour < 19)
        ? String(curHour + 2).padStart(2, '0') + ':00'
        : '10:00'

      return {
        routes: App.routes,
        gedung: initialGedung,
        lantai: initialLantai,
        timeSlots: slots,
        filterDate: App.utils.todayISO(),
        filterJamMulai: defaultStart,
        filterJamSelesai: defaultEnd,
        searchKeyword: '',
        highlightedRoomId: null,
        floorplanData: null,
        floorRooms: [],
        roomStatuses: {},
        // Modal state
        showModal: false,
        selectedRoom: null,
        selectedRoomStatus: null,
      }
    },
    computed: {
      gedungName: function () {
        return this.gedung === 'LS' ? 'Gedung L (Rumpun Sipil)' : 'Gedung L (Rumpun Elektro)'
      },
      availableFloors: function () {
        return [1, 2, 3, 4]
      },
      validEndSlots: function () {
        var startMin = App.utils.timeToMinutes(this.filterJamMulai)
        return this.timeSlots.filter(function (t) {
          return App.utils.timeToMinutes(t) > startMin
        })
      },
      filteredRooms: function () {
        if (!this.searchKeyword) return this.floorRooms
        var q = this.searchKeyword.toLowerCase()
        return this.floorRooms.filter(function (r) {
          return r.kode.toLowerCase().indexOf(q) !== -1 ||
                 r.nama.toLowerCase().indexOf(q) !== -1 ||
                 (r.fasilitas && r.fasilitas.some(function (f) { return f.toLowerCase().indexOf(q) !== -1 }))
        })
      },
      displayGridRooms: function () {
        if (!this.floorplanData || !this.floorplanData.rooms) return []
        var self = this

        return this.floorplanData.rooms.map(function (gridItem) {
          // Cocokkan data room
          var roomObj = null
          for (var i = 0; i < self.floorRooms.length; i++) {
            if (self.floorRooms[i].id === gridItem.roomId || self.floorRooms[i].kode === gridItem.label) {
              roomObj = self.floorRooms[i]
              break
            }
          }

          var stObj = self.roomStatuses[gridItem.roomId] ||
            (roomObj ? self.roomStatuses[roomObj.id] : null) ||
            { status: 'tersedia', sisaKapasitas: 1 }

          var statusLabel = 'Tersedia'
          if (stObj.status === 'sebagian') statusLabel = 'Sebagian'
          else if (stObj.status === 'terpakai') statusLabel = 'Terpakai'
          else if (stObj.status === 'nonaktif') statusLabel = 'Nonaktif'

          return {
            roomId: roomObj ? roomObj.id : gridItem.roomId,
            col: gridItem.col,
            row: gridItem.row,
            width: gridItem.width,
            height: gridItem.height,
            label: gridItem.label,
            room: roomObj,
            status: stObj.status,
            statusText: statusLabel,
            statusObj: stObj,
          }
        })
      },
      floorStats: function () {
        var s = { tersedia: 0, sebagian: 0, terpakai: 0, nonaktif: 0 }
        var self = this
        this.floorRooms.forEach(function (r) {
          var st = self.getRoomStatus(r.id)
          if (st === 'tersedia') s.tersedia++
          else if (st === 'sebagian') s.sebagian++
          else if (st === 'terpakai') s.terpakai++
          else if (st === 'nonaktif') s.nonaktif++
        })
        return s
      },
    },
    created: function () {
      this.loadFloorplanAndRooms()
    },
    methods: {
      updateUrl: function () {
        if (window.history && window.history.replaceState) {
          var url = window.location.pathname + '?gedung=' + this.gedung + '&lantai=' + this.lantai
          window.history.replaceState(null, '', url)
        }
      },

      changeBuilding: function (g) {
        if (this.gedung === g) return
        this.gedung = g
        this.lantai = 1
        this.updateUrl()
        this.loadFloorplanAndRooms()
      },

      changeFloor: function (fl) {
        this.lantai = parseInt(fl)
        this.updateUrl()
        this.loadFloorplanAndRooms()
      },

      onStartTimeChange: function () {
        // Pastikan jam selesai lebih besar dari jam mulai
        var startMin = App.utils.timeToMinutes(this.filterJamMulai)
        var endMin = App.utils.timeToMinutes(this.filterJamSelesai)
        if (endMin <= startMin) {
          var nextIndex = this.timeSlots.indexOf(this.filterJamMulai) + 2
          this.filterJamSelesai = this.timeSlots[Math.min(this.timeSlots.length - 1, nextIndex)] || '21:00'
        }
        this.refreshRoomStatuses()
      },

      loadFloorplanAndRooms: function () {
        var self = this
        var targetGedung = String(this.gedung || 'L').toUpperCase()
        var targetLantai = parseInt(this.lantai || 1)

        // 1. Ambil data floorplan sinkronus agar denah langsung muncul seketika tanpa delay
        var allFp = App.store.get('floorplans') || (App.data && App.data.floorplans) || []
        var directFp = allFp.find(function (p) {
          var matchGedung = (p.gedung === targetGedung) || (targetGedung === 'LS' && p.gedung === 'SFD')
          return matchGedung && parseInt(p.lantai) === targetLantai
        })
        if (!directFp && App.data && App.data.floorplans) {
          directFp = App.data.floorplans.find(function (p) {
            var matchGedung = (p.gedung === targetGedung) || (targetGedung === 'LS' && p.gedung === 'SFD')
            return matchGedung && parseInt(p.lantai) === targetLantai
          })
        }
        if (directFp) {
          self.floorplanData = directFp
        }

        // Sinkronisasi via API async
        if (App.api && App.api.getFloorplan) {
          App.api.getFloorplan(targetGedung, targetLantai).then(function (fp) {
            if (fp) self.floorplanData = fp
          })
        }

        // 2. Ambil data ruangan di lantai ini
        if (App.api && App.api.getRooms) {
          App.api.getRooms({ gedung: targetGedung, lantai: targetLantai }).then(function (rooms) {
            self.floorRooms = rooms || []
            self.refreshRoomStatuses()
          })
        }
      },

      refreshRoomStatuses: function () {
        var self = this
        if (!App.api || !App.api.getRoomStatus) return

        this.floorRooms.forEach(function (r) {
          App.api.getRoomStatus(r.id, self.filterDate, self.filterJamMulai, self.filterJamSelesai).then(function (res) {
            self.roomStatuses[r.id] = res
          })
        })
      },

      getRoomStatus: function (roomId) {
        var st = this.roomStatuses[roomId]
        return st ? st.status : 'tersedia'
      },

      getStatusText: function (status) {
        if (status === 'tersedia') return 'Tersedia'
        if (status === 'sebagian') return 'Sebagian'
        if (status === 'terpakai') return 'Terpakai'
        return 'Nonaktif'
      },

      getBadgeClass: function (status) {
        if (status === 'tersedia') return 'badge-success'
        if (status === 'sebagian') return 'badge-warning'
        if (status === 'terpakai') return 'badge-danger'
        return 'badge-neutral'
      },

      getRoomBoxClass: function (status) {
        if (status === 'tersedia') return 'room-box-tersedia'
        if (status === 'sebagian') return 'room-box-sebagian'
        if (status === 'terpakai') return 'room-box-terpakai'
        return 'room-box-nonaktif'
      },

      getStatusDotClass: function (status) {
        if (status === 'tersedia') return 'bg-emerald-600'
        if (status === 'sebagian') return 'bg-yellow-500'
        if (status === 'terpakai') return 'bg-red-600'
        return 'bg-gray-500'
      },

      getStatusPillClass: function (status) {
        if (status === 'tersedia') return 'bg-emerald-100 text-emerald-800'
        if (status === 'sebagian') return 'bg-yellow-100 text-yellow-800'
        if (status === 'terpakai') return 'bg-red-100 text-red-800'
        return 'bg-gray-200 text-gray-800'
      },

      getFacilitySnippet: function (room) {
        if (!room || !room.fasilitas || room.fasilitas.length === 0) return 'Standar'
        return room.fasilitas.slice(0, 2).join(', ')
      },

      isSearched: function (item) {
        if (!this.searchKeyword) return false
        var q = this.searchKeyword.toLowerCase()
        return item.label.toLowerCase().indexOf(q) !== -1 ||
               (item.room && item.room.nama.toLowerCase().indexOf(q) !== -1)
      },

      openRoomModal: function (room) {
        if (!room) return
        this.selectedRoom = room
        this.selectedRoomStatus = this.roomStatuses[room.id] || {
          status: 'tersedia',
          sisaKapasitas: room.kapasitas,
          maxKapasitas: room.kapasitas,
          bookings: [],
        }
        this.showModal = true
      },

      closeRoomModal: function () {
        this.showModal = false
        this.selectedRoom = null
      },
    },
  })

  // Registrasi komponen navbar & modal
  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }
  if (App.roomDetailModalComponent) {
    app.component('room-detail-modal', App.roomDetailModalComponent)
  }

  app.mount('#app')
})()
