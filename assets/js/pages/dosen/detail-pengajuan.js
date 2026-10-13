/**
 * detail-pengajuan.js — Logika Vue Halaman Detail Pengajuan Ruangan Dosen (Halaman 20)
 * 🆕 Menampilkan rincian komprehensif pengajuan, timeline riwayat, serta aksi ACC dan Tolak dengan alasan wajib.
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
      var bookingId = App.utils.getQueryParam('id')

      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        bookingId: bookingId,
        booking: null,
        room: null,
        course: null,
        requester: null,
        processor: null,
        loading: true,
        notFound: false,
        // State Modal Tolak
        rejectModalOpen: false,
        alasanTolak: '',
        rejectError: '',
        actionLoading: false,
      }
    },
    created: function () {
      this.loadBookingDetail()
    },
    methods: {
      loadBookingDetail: function () {
        var self = this
        self.loading = true
        self.notFound = false

        if (!self.bookingId) {
          self.loading = false
          self.notFound = true
          return
        }

        App.api.getBookingById(self.bookingId).then(function (booking) {
          if (!booking) {
            self.loading = false
            self.notFound = true
            return
          }

          self.booking = booking

          // Muat data relasi terkait
          Promise.all([
            App.api.getRooms(),
            App.api.getCourses(),
            App.api.getUsers(),
          ]).then(function (res) {
            var rooms = res[0] || []
            var courses = res[1] || []
            var users = res[2] || []

            self.room = rooms.find(function (r) { return r.id === booking.ruanganId }) || null
            self.course = courses.find(function (c) { return c.id === booking.courseId }) || null
            self.requester = users.find(function (u) { return u.id === booking.userId }) || null
            self.processor = booking.processedBy
              ? users.find(function (u) { return u.id === booking.processedBy })
              : null

            self.loading = false
          })
        }).catch(function (err) {
          console.error('Error loading booking detail:', err)
          self.loading = false
          self.notFound = true
        })
      },

      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },
      formatDateTime: function (iso) {
        if (!iso) return '-'
        var d = new Date(iso)
        return App.utils.formatDate(d) + ', ' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0') + ' WIB'
      },
      formatDuration: function (start, end) {
        if (!start || !end) return '-'
        var sMin = App.utils.timeToMinutes(start)
        var eMin = App.utils.timeToMinutes(end)
        var diff = Math.max(0, eMin - sMin)
        var h = Math.floor(diff / 60)
        var m = diff % 60
        if (m === 0) return h + ' Jam'
        return h + ' Jam ' + m + ' Menit'
      },

      // Aksi ACC (Setujui)
      handleApprove: function () {
        var self = this
        var confirmMsg = 'Apakah Anda yakin ingin menyetujui (ACC) pengajuan pemakaian ruangan ini?'
        if (!confirm(confirmMsg)) return

        self.actionLoading = true
        App.api.approveBooking(self.booking.id, self.currentUser.id).then(function () {
          alert('Pengajuan ruangan berhasil disetujui! Notifikasi telah dikirimkan ke pemohon.')
          self.actionLoading = false
          self.loadBookingDetail()
        }).catch(function (err) {
          alert('Gagal menyetujui pengajuan: ' + err.message)
          self.actionLoading = false
        })
      },

      // Aksi Tolak
      openRejectModal: function () {
        this.alasanTolak = ''
        this.rejectError = ''
        this.rejectModalOpen = true
      },
      closeRejectModal: function () {
        this.rejectModalOpen = false
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
        App.api.rejectBooking(self.booking.id, self.currentUser.id, self.alasanTolak.trim()).then(function () {
          alert('Pengajuan berhasil ditolak. Alasan penolakan telah tercatat dan dikirim ke pemohon.')
          self.actionLoading = false
          self.closeRejectModal()
          self.loadBookingDetail()
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
