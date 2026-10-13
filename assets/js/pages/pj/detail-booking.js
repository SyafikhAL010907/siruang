// 🆕 TAMBAHAN
/**
 * detail-booking.js — Logika Vue Halaman Detail Booking PJ (Halaman 16)
 * Menampilkan rincian booking, timeline status, dan fitur pembatalan reservasi.
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
      var id = App.utils.getQueryParam('id') || ''
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        bookingId: id,
        booking: null,
        showCancelModal: false,
        cancelReason: '',
        cancelling: false,
      }
    },
    computed: {
      roomObj: function () {
        if (!this.booking || !this.booking.ruanganId) return null
        return App.store.findById('rooms', this.booking.ruanganId)
      },
      courseObj: function () {
        if (!this.booking) return null
        var cid = this.booking.mataKuliahId || this.booking.courseId
        return App.store.findById('courses', cid)
      },
      dosenName: function () {
        if (!this.booking || !this.booking.dosenId) return '-'
        var u = App.store.findById('users', this.booking.dosenId)
        return u ? u.nama : '-'
      },
      pemohonName: function () {
        if (!this.booking || !this.booking.userId) return 'PJ Kelas'
        var u = App.store.findById('users', this.booking.userId)
        return u ? u.nama : 'PJ Kelas'
      },
      processorName: function () {
        if (!this.booking || !this.booking.processedBy) return 'Dosen Pengampu'
        var u = App.store.findById('users', this.booking.processedBy)
        return u ? u.nama : 'Dosen Pengampu'
      },
      canCancel: function () {
        if (!this.booking) return false
        var s = this.booking.status
        if (s !== 'menunggu' && s !== 'disetujui') return false

        // Cek apakah waktu booking sudah lewat
        var today = App.utils.todayISO()
        if (this.booking.tanggal < today) return false
        return true
      },
      timelineDotClass: function () {
        if (!this.booking) return 'bg-gray-400'
        var s = this.booking.status
        if (s === 'menunggu') return 'bg-yellow-500'
        if (s === 'disetujui') return 'bg-emerald-600'
        if (s === 'ditolak') return 'bg-red-600'
        if (s === 'dibatalkan') return 'bg-gray-500'
        return 'bg-blue-600'
      },
      timelineTextClass: function () {
        if (!this.booking) return 'text-ink'
        var s = this.booking.status
        if (s === 'menunggu') return 'text-yellow-700'
        if (s === 'disetujui') return 'text-emerald-700'
        if (s === 'ditolak') return 'text-red-700'
        return 'text-ink'
      },
      timelineTitle: function () {
        if (!this.booking) return ''
        var s = this.booking.status
        if (s === 'menunggu') return 'Menunggu Persetujuan Dosen'
        if (s === 'disetujui') return 'Pengajuan Disetujui (ACC)'
        if (s === 'ditolak') return 'Pengajuan Ditolak'
        if (s === 'dibatalkan') return 'Pengajuan Dibatalkan'
        return 'Perkuliahan Selesai'
      },
      timelineDesc: function () {
        if (!this.booking) return ''
        var s = this.booking.status
        if (s === 'menunggu') return 'Pengajuan masih menunggu respon ACC dari dosen pengampu mata kuliah.'
        if (s === 'disetujui') return 'Ruangan telah disetujui dan siap digunakan sesuai jadwal perkuliahan.'
        if (s === 'ditolak') return 'Pengajuan ditolak oleh dosen pengampu atau administrator.'
        if (s === 'dibatalkan') return 'Reservasi ruangan telah dibatalkan.'
        return 'Jadwal perkuliahan telah selesai dilaksanakan.'
      },
    },
    created: function () {
      this.loadBooking()
    },
    methods: {
      loadBooking: function () {
        if (!this.bookingId) return
        var found = App.store.findById('bookings', this.bookingId)
        this.booking = found ? App.utils.deepClone(found) : null
      },

      openCancelDialog: function () {
        this.cancelReason = ''
        this.showCancelModal = true
      },

      confirmCancelBooking: function () {
        if (!this.cancelReason || this.cancelReason.length < 5) return

        this.cancelling = true
        var self = this

        setTimeout(function () {
          var user = self.currentUser
          App.store.updateById('bookings', self.booking.id, {
            status: 'dibatalkan',
            alasanBatal: self.cancelReason,
            cancelledBy: user.id,
            cancelledAt: new Date().toISOString(),
          })

          // Notifikasi ke Dosen pengampu
          if (App.api && App.api.createNotification && self.booking.dosenId) {
            App.api.createNotification({
              userId: self.booking.dosenId,
              type: 'batal',
              title: 'Reservasi Dibatalkan',
              message: (user ? user.nama : 'PJ') + ' membatalkan booking ruangan ' + (self.roomObj ? self.roomObj.kode : '') + '.',
              link: App.routes.dosen.daftarAccRuangan,
            })
          }

          // Catat log
          if (App.api && App.api.createLog) {
            App.api.createLog({
              userId: user.id,
              role: user.role,
              action: 'batal_booking',
              object: 'booking',
              objectId: self.booking.id,
              detail: user.nama + ' membatalkan booking ruangan: "' + self.cancelReason + '".',
            })
          }

          self.cancelling = false
          self.showCancelModal = false

          if (App.toast) {
            App.toast.success('Reservasi ruangan berhasil dibatalkan.')
          }

          self.loadBooking()
        }, 400)
      },

      formatDate: function (d) {
        return App.utils.formatDate(d)
      },

      formatDateTime: function (dt) {
        return App.utils.formatDateTime(dt)
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
