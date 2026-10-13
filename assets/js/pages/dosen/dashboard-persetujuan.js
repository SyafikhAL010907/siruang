/**
 * dashboard-persetujuan.js — Logika Vue Halaman Dashboard Persetujuan Dosen (Halaman 18)
 * 🆕 Menampilkan ringkasan pengajuan menunggu, pintasan cepat, dan aksi tanggap persetujuan.
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
        stats: {
          menunggu: 0,
          disetujui: 0,
          ditolak: 0,
          totalMatkul: 0,
        },
        pendingBookings: [],
        recentDecisions: [],
        allRooms: [],
        allCourses: [],
        allUsers: [],
        // State Modal Tolak Cepat
        rejectModalOpen: false,
        selectedBooking: null,
        alasanTolak: '',
        rejectError: '',
        actionLoading: false,
      }
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
          App.api.getRelations(user.role === 'admin' ? {} : { dosenId: user.id }),
        ]).then(function (results) {
          var bookings = results[0] || []
          self.allRooms = results[1] || []
          self.allCourses = results[2] || []
          self.allUsers = results[3] || []
          var relations = results[4] || []

          // Hitung statistik
          var menungguList = bookings.filter(function (b) { return b.status === 'menunggu' })
          var disetujuiList = bookings.filter(function (b) { return b.status === 'disetujui' })
          var ditolakList = bookings.filter(function (b) { return b.status === 'ditolak' })

          self.stats.menunggu = menungguList.length
          self.stats.disetujui = disetujuiList.length
          self.stats.ditolak = ditolakList.length
          self.stats.totalMatkul = relations.length

          // Pengajuan Menunggu (maks 5 untuk dashboard)
          self.pendingBookings = menungguList.slice(0, 5)

          // Riwayat Keputusan Terkini (disetujui / ditolak)
          var decidedList = bookings.filter(function (b) {
            return b.status === 'disetujui' || b.status === 'ditolak'
          })
          decidedList.sort(function (a, b) {
            var dateA = new Date(a.processedAt || a.updatedAt || a.createdAt)
            var dateB = new Date(b.processedAt || b.updatedAt || b.createdAt)
            return dateB - dateA
          })
          self.recentDecisions = decidedList.slice(0, 5)

          self.loading = false
        }).catch(function (err) {
          console.error('Error loading dosen dashboard:', err)
          self.loading = false
        })
      },

      // Helper Tampilan Data
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
      formatTime: function (jamMulai, jamSelesai) {
        return jamMulai + ' - ' + jamSelesai + ' WIB'
      },

      // Aksi Cepat ACC
      quickApprove: function (booking) {
        var self = this
        var room = self.getRoom(booking.ruanganId)
        var roomCode = room ? room.kode : 'Ruangan'
        var confirmMsg = 'Apakah Anda yakin ingin menyetujui (ACC) pengajuan ruangan ' + roomCode + ' untuk tanggal ' + self.formatDate(booking.tanggal) + '?'

        if (!confirm(confirmMsg)) return

        self.actionLoading = true
        App.api.approveBooking(booking.id, self.currentUser.id).then(function () {
          alert('Pengajuan berhasil disetujui.')
          self.actionLoading = false
          self.loadData()
        }).catch(function (err) {
          alert('Gagal menyetujui pengajuan: ' + err.message)
          self.actionLoading = false
        })
      },

      // Aksi Cepat Tolak
      openRejectModal: function (booking) {
        this.selectedBooking = booking
        this.alasanTolak = ''
        this.rejectError = ''
        this.rejectModalOpen = true
      },
      closeRejectModal: function () {
        this.rejectModalOpen = false
        this.selectedBooking = null
        this.alasanTolak = ''
        this.rejectError = ''
      },
      confirmReject: function () {
        var self = this
        if (!self.alasanTolak || self.alasanTolak.trim().length < 10) {
          self.rejectError = 'Alasan penolakan wajib diisi minimal 10 karakter.'
          return
        }

        self.actionLoading = true
        App.api.rejectBooking(self.selectedBooking.id, self.currentUser.id, self.alasanTolak.trim()).then(function () {
          alert('Pengajuan berhasil ditolak.')
          self.actionLoading = false
          self.closeRejectModal()
          self.loadData()
        }).catch(function (err) {
          self.rejectError = 'Gagal menolak pengajuan: ' + err.message
          self.actionLoading = false
        })
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
