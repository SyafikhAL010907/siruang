/**
 * statistik-laporan.js — Logika Vue Halaman Statistik & Laporan Admin (Halaman 30)
 * Visualisasi data via Chart.js, analisis okupansi per gedung/lantai, serta ekspor CSV & PDF.
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
        bookings: [],
        rooms: [],
        courses: [],
        users: [],
        stats: {
          totalBookings: 0,
          disetujui: 0,
          menunggu: 0,
          ditolak: 0,
          dibatalkan: 0,
          selesai: 0,
          fallback: 0,
        },
        topRooms: [],
        floorOccupancy: [],
        statusChartInstance: null,
        floorChartInstance: null,
      }
    },
    created: function () {
      this.loadData()
    },
    methods: {
      loadData: function () {
        var self = this
        self.loading = true

        Promise.all([
          App.api.getBookings(),
          App.api.getRooms(),
          App.api.getCourses(),
          App.api.getUsers(),
        ]).then(function (results) {
          self.bookings = results[0] || []
          self.rooms = results[1] || []
          self.courses = results[2] || []
          self.users = results[3] || []

          self.calculateStats()
          self.loading = false

          // Inisialisasi Chart.js setelah DOM terpasang
          self.$nextTick(function () {
            self.initCharts()
          })
        }).catch(function (err) {
          console.error('Error loading report stats:', err)
          self.loading = false
        })
      },

      calculateStats: function () {
        var self = this
        var bList = self.bookings

        self.stats = {
          totalBookings: bList.length,
          disetujui: bList.filter(function (b) { return b.status === 'disetujui' }).length,
          menunggu: bList.filter(function (b) { return b.status === 'menunggu' }).length,
          ditolak: bList.filter(function (b) { return b.status === 'ditolak' }).length,
          dibatalkan: bList.filter(function (b) { return b.status === 'dibatalkan' }).length,
          selesai: bList.filter(function (b) { return b.status === 'selesai' }).length,
          fallback: bList.filter(function (b) { return !!b.isFallback }).length,
        }

        // Hitung 5 Ruangan Terpopuler
        var roomCounts = {}
        bList.forEach(function (b) {
          roomCounts[b.ruanganId] = (roomCounts[b.ruanganId] || 0) + 1
        })

        var sortedRoomIds = Object.keys(roomCounts).sort(function (a, b) {
          return roomCounts[b] - roomCounts[a]
        }).slice(0, 5)

        self.topRooms = sortedRoomIds.map(function (id) {
          var r = self.rooms.find(function (item) { return item.id === id })
          return {
            id: id,
            kode: r ? r.kode : 'Ruangan',
            nama: r ? r.nama : '',
            gedung: r ? (r.gedung === 'LS' ? 'Gedung L (Sipil)' : 'Gedung L (Elektro)') : '',
            count: roomCounts[id],
          }
        })

        // Hitung Okupansi per Lantai (1-4)
        var floors = [1, 2, 3, 4]
        self.floorOccupancy = floors.map(function (fl) {
          var countL = bList.filter(function (b) {
            var r = self.rooms.find(function (item) { return item.id === b.ruanganId })
            return r && r.gedung === 'L' && r.lantai === fl
          }).length

          var countLS = bList.filter(function (b) {
            var r = self.rooms.find(function (item) { return item.id === b.ruanganId })
            return r && r.gedung === 'LS' && r.lantai === fl
          }).length

          return {
            lantai: fl,
            elektro: countL,
            sipil: countLS,
            total: countL + countLS,
          }
        })
      },

      initCharts: function () {
        var self = this
        if (typeof Chart === 'undefined') return

        // 1. Chart Status Reservasi
        var ctxStatus = document.getElementById('chartStatusReservasi')
        if (ctxStatus) {
          if (self.statusChartInstance) self.statusChartInstance.destroy()
          self.statusChartInstance = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
              labels: ['Disetujui', 'Menunggu', 'Selesai', 'Ditolak', 'Dibatalkan'],
              datasets: [{
                data: [
                  self.stats.disetujui,
                  self.stats.menunggu,
                  self.stats.selesai,
                  self.stats.ditolak,
                  self.stats.dibatalkan,
                ],
                backgroundColor: [
                  '#16A34A', // hijau
                  '#EAB308', // kuning
                  '#2563EB', // biru
                  '#DC2626', // merah
                  '#9CA3AF', // abu
                ],
                borderWidth: 2,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } },
                },
              },
            },
          })
        }

        // 2. Chart Okupansi per Lantai
        var ctxFloor = document.getElementById('chartOkupansiLantai')
        if (ctxFloor) {
          if (self.floorChartInstance) self.floorChartInstance.destroy()
          self.floorChartInstance = new Chart(ctxFloor, {
            type: 'bar',
            data: {
              labels: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'],
              datasets: [
                {
                  label: 'Gedung L (Elektro)',
                  data: self.floorOccupancy.map(function (f) { return f.elektro }),
                  backgroundColor: '#14532D',
                  borderRadius: 6,
                },
                {
                  label: 'Gedung L (Sipil)',
                  data: self.floorOccupancy.map(function (f) { return f.sipil }),
                  backgroundColor: '#3B82F6',
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1, font: { family: 'Inter' } },
                },
                x: {
                  ticks: { font: { family: 'Inter' } },
                },
              },
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } },
                },
              },
            },
          })
        }
      },

      // Ekspor CSV (Client-Side)
      exportCSV: function () {
        var self = this
        var headers = [
          'ID Booking',
          'Tanggal',
          'Jam Mulai',
          'Jam Selesai',
          'Kode Ruangan',
          'Gedung',
          'Lantai',
          'Mata Kuliah',
          'Pemohon',
          'Rombel',
          'Status',
          'Fallback',
          'Alasan',
        ]

        var rows = self.bookings.map(function (b) {
          var r = self.rooms.find(function (item) { return item.id === b.ruanganId }) || {}
          var c = self.courses.find(function (item) { return item.id === b.courseId }) || {}
          var u = self.users.find(function (item) { return item.id === b.userId }) || {}

          return [
            b.id,
            b.tanggal,
            b.jamMulai,
            b.jamSelesai,
            r.kode || '-',
            r.gedung === 'LS' ? 'Gedung L (Sipil)' : 'Gedung L (Elektro)',
            r.lantai || '-',
            '"' + (c.nama || '').replace(/"/g, '""') + '"',
            '"' + (u.nama || '').replace(/"/g, '""') + '"',
            b.jumlahKelas || 1,
            b.status,
            b.isFallback ? 'Ya' : 'Tidak',
            '"' + (b.alasan || '').replace(/"/g, '""') + '"',
          ]
        })

        var csvContent = 'data:text/csv;charset=utf-8,' +
          headers.join(',') + '\n' +
          rows.map(function (e) { return e.join(',') }).join('\n')

        var encodedUri = encodeURI(csvContent)
        var link = document.createElement('a')
        var filename = 'laporan-reservasi-unj-' + (App.utils.todayISO ? App.utils.todayISO() : 'data') + '.csv'
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },

      // Ekspor PDF via Browser Print Stylesheet
      exportPDF: function () {
        window.print()
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
