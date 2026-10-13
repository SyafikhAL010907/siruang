/**
 * semua-booking.js — Logika Vue Halaman Semua Booking Admin (Halaman 26)
 * Pantau seluruh reservasi kampus dan batalkan booking yang telah di-ACC dengan alasan wajib.
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
        filterStatus: 'semua',
        filterGedung: 'semua',
        filterDate: '',
        searchQuery: '',
        currentPage: 1,
        perPage: 10,
        // Modal Batalkan Booking
        cancelModalOpen: false,
        selectedBooking: null,
        alasanBatal: '',
        cancelError: '',
        actionLoading: false,
      }
    },
    computed: {
      filteredBookings: function () {
        var self = this
        var list = self.bookings

        // Filter status
        if (self.filterStatus !== 'semua') {
          list = list.filter(function (b) { return b.status === self.filterStatus })
        }

        // Filter gedung
        if (self.filterGedung !== 'semua') {
          list = list.filter(function (b) {
            var r = self.getRoom(b.ruanganId)
            return r && r.gedung === self.filterGedung
          })
        }

        // Filter tanggal
        if (self.filterDate) {
          list = list.filter(function (b) { return b.tanggal === self.filterDate })
        }

        // Search query
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
        return Math.ceil(this.filteredBookings.length / this.perPage) || 1
      },
      paginatedBookings: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredBookings.slice(start, start + this.perPage)
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
          App.api.getCourses(),
          App.api.getUsers(),
        ]).then(function (results) {
          self.bookings = results[0] || []
          self.rooms = results[1] || []
          self.courses = results[2] || []
          self.users = results[3] || []
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading semua booking:', err)
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
      getCourseName: function (id) {
        var c = this.courses.find(function (item) { return item.id === id })
        return c ? c.nama : 'Kegiatan Kampus'
      },
      getUser: function (id) {
        return this.users.find(function (u) { return u.id === id }) || null
      },
      getUserName: function (id) {
        var u = this.getUser(id)
        return u ? u.nama : 'Pengguna'
      },
      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },
      formatTime: function (jamMulai, jamSelesai) {
        return jamMulai + ' - ' + jamSelesai
      },

      // Buka Modal Pembatalan Booking (Khusus status disetujui / menunggu)
      openCancelModal: function (booking) {
        this.selectedBooking = booking
        this.alasanBatal = ''
        this.cancelError = ''
        this.cancelModalOpen = true
      },
      closeCancelModal: function () {
        this.cancelModalOpen = false
        this.selectedBooking = null
      },
      confirmCancelBooking: function () {
        var self = this
        if (!self.alasanBatal || self.alasanBatal.trim().length < 10) {
          self.cancelError = 'Alasan pembatalan wajib diisi minimal 10 karakter.'
          return
        }

        self.actionLoading = true
        var booking = self.selectedBooking
        var now = new Date().toISOString()
        var room = self.getRoom(booking.ruanganId)
        var roomCode = room ? room.kode : 'Ruangan'

        App.api.updateBooking(booking.id, {
          status: 'dibatalkan',
          alasanPembatalan: self.alasanBatal.trim(),
          cancelledBy: self.currentUser.id,
          cancelledAt: now,
        }).then(function () {
          // Kirim notifikasi ke pemohon
          App.api.createNotification({
            userId: booking.userId,
            title: 'Reservasi Dibatalkan oleh Admin',
            message: 'Reservasi ruangan ' + roomCode + ' pada ' + self.formatDate(booking.tanggal) + ' telah dibatalkan oleh Administrator. Alasan: ' + self.alasanBatal.trim(),
            link: App.routes.pj.detailBooking + '?id=' + booking.id,
            type: 'danger',
          })
          // Kirim notifikasi ke dosen terkait jika ada
          if (booking.dosenId) {
            App.api.createNotification({
              userId: booking.dosenId,
              title: 'Jadwal Kelas Dibatalkan oleh Admin',
              message: 'Reservasi kelas ' + self.getCourseName(booking.courseId) + ' (' + roomCode + ') dibatalkan oleh Admin. Alasan: ' + self.alasanBatal.trim(),
              link: App.routes.dosen.detailPengajuan + '?id=' + booking.id,
              type: 'warning',
            })
          }
          // Catat audit log
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'ADMIN_CANCEL_BOOKING',
            object: 'Booking #' + booking.id,
            detail: 'Admin membatalkan reservasi ' + roomCode + ' (' + booking.tanggal + '). Alasan: ' + self.alasanBatal.trim(),
          })

          alert('Booking berhasil dibatalkan dan notifikasi telah dikirimkan.')
          self.actionLoading = false
          self.closeCancelModal()
          self.loadData()
        }).catch(function (err) {
          self.cancelError = 'Gagal membatalkan booking: ' + err.message
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
