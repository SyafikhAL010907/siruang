/**
 * riwayat-keputusan.js — Logika Vue Halaman Riwayat Keputusan Dosen (Halaman 21)
 * 🆕 Menampilkan daftar pengajuan yang sudah diproses (ACC / Tolak) beserta filter, pencarian, dan paginasi.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Guard: Hanya dosen dan admin
  var allowed = App.guard({ roles: ['dosen', 'admin'] })
  if (!allowed) return

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        loading: true,
        bookings: [],
        allRooms: [],
        allCourses: [],
        allUsers: [],
        filterStatus: 'semua',
        filterDate: '',
        searchQuery: '',
        currentPage: 1,
        perPage: 10,
      }
    },
    computed: {
      filteredBookings: function () {
        var self = this
        // Hanya yang sudah diproses (disetujui, ditolak, selesai)
        var list = self.bookings.filter(function (b) {
          return b.status === 'disetujui' || b.status === 'ditolak' || b.status === 'selesai'
        })

        // Filter status spesifik
        if (self.filterStatus !== 'semua') {
          list = list.filter(function (b) {
            if (self.filterStatus === 'disetujui') {
              return b.status === 'disetujui' || b.status === 'selesai'
            }
            return b.status === self.filterStatus
          })
        }

        // Filter tanggal
        if (self.filterDate) {
          list = list.filter(function (b) {
            return b.tanggal === self.filterDate
          })
        }

        // Filter pencarian teks
        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase().trim()
          list = list.filter(function (b) {
            var room = self.getRoom(b.ruanganId)
            var roomCode = room ? room.kode.toLowerCase() : ''
            var courseName = self.getCourseName(b.courseId).toLowerCase()
            var requester = self.getRequesterName(b.userId).toLowerCase()
            var alasan = (b.alasan || '').toLowerCase()
            var alasanTolak = (b.alasanPenolakan || '').toLowerCase()

            return roomCode.indexOf(q) !== -1 ||
                   courseName.indexOf(q) !== -1 ||
                   requester.indexOf(q) !== -1 ||
                   alasan.indexOf(q) !== -1 ||
                   alasanTolak.indexOf(q) !== -1
          })
        }

        // Urutkan dari keputusan terbaru
        list.sort(function (a, b) {
          var dateA = new Date(a.processedAt || a.updatedAt || a.createdAt)
          var dateB = new Date(b.processedAt || b.updatedAt || b.createdAt)
          return dateB - dateA
        })

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredBookings.length / this.perPage) || 1
      },
      paginatedBookings: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredBookings.slice(start, start + this.perPage)
      },
      summaryStats: function () {
        var self = this
        var list = self.bookings.filter(function (b) {
          return b.status === 'disetujui' || b.status === 'ditolak' || b.status === 'selesai'
        })
        return {
          total: list.length,
          disetujui: list.filter(function (b) { return b.status === 'disetujui' || b.status === 'selesai' }).length,
          ditolak: list.filter(function (b) { return b.status === 'ditolak' }).length,
        }
      },
    },
    created: function () {
      this.loadData()
    },
    methods: {
      loadData: function () {
        var self = this
        self.loading = true

        var user = self.currentUser
        if (!user) return

        var filter = user.role === 'admin' ? {} : { dosenId: user.id }

        Promise.all([
          App.api.getBookings(filter),
          App.api.getRooms(),
          App.api.getCourses(),
          App.api.getUsers(),
        ]).then(function (results) {
          self.bookings = results[0] || []
          self.allRooms = results[1] || []
          self.allCourses = results[2] || []
          self.allUsers = results[3] || []
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading riwayat keputusan:', err)
          self.loading = false
        })
      },

      getRoom: function (id) {
        return this.allRooms.find(function (r) { return r.id === id }) || null
      },
      getRoomCode: function (id) {
        var r = this.getRoom(id)
        return r ? r.kode : '-'
      },
      getCourseName: function (id) {
        var c = this.allCourses.find(function (item) { return item.id === id })
        return c ? c.nama : 'Mata Kuliah'
      },
      getRequesterName: function (id) {
        var u = this.allUsers.find(function (item) { return item.id === id })
        return u ? u.nama : 'Penanggung Jawab'
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
        return jamMulai + ' - ' + jamSelesai + ' WIB'
      },

      goToDetail: function (id) {
        window.location.href = this.routes.dosen.detailPengajuan + '?id=' + id
      },

      prevPage: function () {
        if (this.currentPage > 1) this.currentPage--
      },
      nextPage: function () {
        if (this.currentPage < this.totalPages) this.currentPage++
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
