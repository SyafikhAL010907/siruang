/**
 * notifikasi-pemborosan.js — Logika Vue Halaman Notifikasi Pemborosan (Halaman 28)
 * Memantau booking fallback (ruangan berkapasitas besar untuk rombel kecil) dan tombol tandai ditinjau.
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
        fallbackBookings: [],
        rooms: [],
        users: [],
        courses: [],
        filterReview: 'semua', // 'semua', 'belum', 'sudah'
        searchQuery: '',
        currentPage: 1,
        perPage: 10,
        actionLoading: false,
      }
    },
    computed: {
      filteredList: function () {
        var self = this
        var list = self.fallbackBookings

        if (self.filterReview === 'belum') {
          list = list.filter(function (b) { return !b.reviewed })
        } else if (self.filterReview === 'sudah') {
          list = list.filter(function (b) { return !!b.reviewed })
        }

        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase().trim()
          list = list.filter(function (b) {
            var room = self.getRoom(b.ruanganId)
            var roomCode = room ? room.kode.toLowerCase() : ''
            var courseName = self.getCourseName(b.courseId).toLowerCase()
            var userName = self.getUserName(b.userId).toLowerCase()
            var alasan = (b.alasan || '').toLowerCase()
            return roomCode.indexOf(q) !== -1 ||
                   courseName.indexOf(q) !== -1 ||
                   userName.indexOf(q) !== -1 ||
                   alasan.indexOf(q) !== -1
          })
        }

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredList.length / this.perPage) || 1
      },
      paginatedList: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredList.slice(start, start + this.perPage)
      },
      stats: function () {
        var self = this
        return {
          total: self.fallbackBookings.length,
          belumDitinjau: self.fallbackBookings.filter(function (b) { return !b.reviewed }).length,
          sudahDitinjau: self.fallbackBookings.filter(function (b) { return !!b.reviewed }).length,
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

        Promise.all([
          App.api.getBookings(),
          App.api.getRooms(),
          App.api.getUsers(),
          App.api.getCourses(),
        ]).then(function (results) {
          var allBookings = results[0] || []
          self.rooms = results[1] || []
          self.users = results[2] || []
          self.courses = results[3] || []

          // Ambil hanya yang isFallback
          self.fallbackBookings = allBookings.filter(function (b) { return !!b.isFallback })
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading fallback bookings:', err)
          self.loading = false
        })
      },

      getRoom: function (id) {
        return this.rooms.find(function (r) { return r.id === id }) || null
      },
      getRoomCode: function (id) {
        var r = this.getRoom(id)
        return r ? r.kode : '-'
      },
      getRoomCapacity: function (id) {
        var r = this.getRoom(id)
        return r ? r.kapasitas : 1
      },
      getCourseName: function (id) {
        var c = this.courses.find(function (item) { return item.id === id })
        return c ? c.nama : 'Perkuliahan'
      },
      getUserName: function (id) {
        var u = this.users.find(function (item) { return item.id === id })
        return u ? u.nama : 'Pemohon'
      },
      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },
      formatTime: function (jamMulai, jamSelesai) {
        return jamMulai + ' - ' + jamSelesai
      },

      toggleReviewed: function (booking) {
        var self = this
        var nextState = !booking.reviewed
        self.actionLoading = true

        App.api.updateBooking(booking.id, {
          reviewed: nextState,
          reviewedAt: nextState ? new Date().toISOString() : null,
          reviewedBy: nextState ? self.currentUser.id : null,
        }).then(function () {
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'REVIEW_WASTE',
            object: 'Booking #' + booking.id,
            detail: nextState ? 'Menandai notifikasi pemborosan telah ditinjau' : 'Membatalkan tanda tinjauan pemborosan',
          })
          self.actionLoading = false
          self.loadData()
        }).catch(function (err) {
          alert('Gagal memperbarui status tinjauan: ' + err.message)
          self.actionLoading = false
        })
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
