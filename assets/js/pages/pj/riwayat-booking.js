/**
 * riwayat-booking.js — Logika Vue Halaman Riwayat Booking PJ (Halaman 15)
 * Menyajikan tabel seluruh pengajuan reservasi dengan filter status, filter tanggal,
 * pencarian dinamis, dan navigasi paginasi.
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
        bookings: [],
        filterStatus: 'semua',
        filterDate: '',
        searchKeyword: '',
        currentPage: 1,
        pageSize: 8,
      }
    },
    computed: {
      filteredList: function () {
        var list = this.bookings
        var self = this

        // 1. Filter Status
        if (this.filterStatus !== 'semua') {
          list = list.filter(function (b) { return b.status === self.filterStatus })
        }

        // 2. Filter Tanggal
        if (this.filterDate) {
          list = list.filter(function (b) { return b.tanggal === self.filterDate })
        }

        // 3. Pencarian Teks
        if (this.searchKeyword) {
          var q = this.searchKeyword.toLowerCase()
          list = list.filter(function (b) {
            var room = App.store.findById('rooms', b.ruanganId)
            var roomStr = room ? (room.kode + ' ' + room.nama).toLowerCase() : ''
            var course = App.store.findById('courses', b.mataKuliahId || b.courseId)
            var courseStr = course ? (course.kode + ' ' + course.nama).toLowerCase() : ''
            var alasanStr = (b.alasan || '').toLowerCase()
            return roomStr.indexOf(q) !== -1 || courseStr.indexOf(q) !== -1 || alasanStr.indexOf(q) !== -1
          })
        }

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredList.length / this.pageSize) || 1
      },
      paginatedList: function () {
        var start = (this.currentPage - 1) * this.pageSize
        return this.filteredList.slice(start, start + this.pageSize)
      },
    },
    watch: {
      filteredList: function () {
        if (this.currentPage > this.totalPages) {
          this.currentPage = 1
        }
      },
    },
    created: function () {
      this.loadBookings()
    },
    methods: {
      loadBookings: function () {
        var self = this
        var user = this.currentUser
        if (!user) return

        var filter = (user.role === 'admin') ? null : { userId: user.id }
        if (App.api && App.api.getBookings) {
          App.api.getBookings(filter).then(function (res) {
            self.bookings = res || []
          })
        }
      },

      resetFilters: function () {
        this.filterStatus = 'semua'
        this.filterDate = ''
        this.searchKeyword = ''
        this.currentPage = 1
      },

      getRoomCode: function (ruanganId) {
        var r = App.store.findById('rooms', ruanganId)
        return r ? r.kode : ruanganId || 'Ruangan'
      },

      getRoomBuilding: function (ruanganId) {
        var r = App.store.findById('rooms', ruanganId)
        return r ? 'Gedung ' + r.gedung + ' (Lt ' + r.lantai + ')' : ''
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
