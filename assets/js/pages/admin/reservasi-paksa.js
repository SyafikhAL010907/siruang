/**
 * reservasi-paksa.js — Logika Vue Halaman Reservasi Paksa Admin (Halaman 27)
 * Booking darurat dekanat yang mem-bypass ACC & konflik, otomatis membatalkan booking berbenturan.
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

  // Time slots 30 menitan
  var slots = []
  for (var h = 7; h <= 21; h++) {
    slots.push(String(h).padStart(2, '0') + ':00')
    if (h < 21) slots.push(String(h).padStart(2, '0') + ':30')
  }

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        loading: true,
        timeSlots: slots,
        rooms: [],
        bookings: [],
        users: [],
        courses: [],
        form: {
          tanggal: App.utils.todayISO(),
          jamMulai: '08:00',
          jamSelesai: '11:00',
          ruanganId: '',
          namaKegiatan: 'Rapat Senat & Pimpinan Fakultas Teknik',
          alasan: 'Kegiatan mendesak Dekanat Fakultas Teknik UNJ yang memerlukan ruang sidang utama.',
        },
        errors: {},
        actionLoading: false,
      }
    },
    computed: {
      validEndSlots: function () {
        var startMin = App.utils.timeToMinutes(this.form.jamMulai)
        return this.timeSlots.filter(function (t) {
          return App.utils.timeToMinutes(t) > startMin
        })
      },
      roomsL: function () {
        return this.rooms.filter(function (r) { return r.gedung === 'L' })
      },
      roomsLS: function () {
        return this.rooms.filter(function (r) { return r.gedung === 'LS' })
      },
      selectedRoomObj: function () {
        if (!this.form.ruanganId) return null
        return this.rooms.find(function (r) { return r.id === this.form.ruanganId }.bind(this)) || null
      },
      // Deteksi booking berbenturan secara real-time
      impactedBookings: function () {
        if (!this.form.ruanganId || !this.form.tanggal || !this.form.jamMulai || !this.form.jamSelesai) {
          return []
        }

        var self = this
        var qStart = App.utils.timeToMinutes(self.form.jamMulai)
        var qEnd = App.utils.timeToMinutes(self.form.jamSelesai)

        return self.bookings.filter(function (b) {
          if (b.ruanganId !== self.form.ruanganId) return false
          if (b.tanggal !== self.form.tanggal) return false
          if (b.status !== 'disetujui' && b.status !== 'menunggu') return false

          var bStart = App.utils.timeToMinutes(b.jamMulai)
          var bEnd = App.utils.timeToMinutes(b.jamSelesai)
          return bStart < qEnd && bEnd > qStart
        })
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
          App.api.getRooms(),
          App.api.getBookings(),
          App.api.getUsers(),
          App.api.getCourses(),
        ]).then(function (results) {
          self.rooms = results[0] || []
          self.bookings = results[1] || []
          self.users = results[2] || []
          self.courses = results[3] || []

          if (self.rooms.length > 0 && !self.form.ruanganId) {
            self.form.ruanganId = self.rooms[0].id
          }

          self.loading = false
        }).catch(function (err) {
          console.error('Error loading data reservasi paksa:', err)
          self.loading = false
        })
      },

      getRoomCode: function (id) {
        var r = this.rooms.find(function (item) { return item.id === id })
        return r ? r.kode : '-'
      },
      getCourseName: function (id) {
        var c = this.courses.find(function (item) { return item.id === id })
        return c ? c.nama : 'Kegiatan Perkuliahan'
      },
      getUserName: function (id) {
        var u = this.users.find(function (item) { return item.id === id })
        return u ? u.nama : 'Pengguna'
      },
      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },

      submitReservasiPaksa: function () {
        var self = this
        self.errors = {}

        if (!self.form.tanggal) self.errors.tanggal = 'Tanggal wajib diisi.'
        if (!self.form.ruanganId) self.errors.ruanganId = 'Pilih ruangan.'
        if (!self.form.namaKegiatan) self.errors.namaKegiatan = 'Nama kegiatan darurat wajib diisi.'
        if (!self.form.alasan || self.form.alasan.trim().length < 10) {
          self.errors.alasan = 'Alasan darurat wajib diisi minimal 10 karakter.'
        }

        if (Object.keys(self.errors).length > 0) return

        var impactedCount = self.impactedBookings.length
        var confirmMsg = 'PERINGATAN TINGKAT TINGGI:\n\n' +
          'Anda akan mengeksekusi RESERVASI PAKSA untuk "' + self.form.namaKegiatan + '".\n' +
          (impactedCount > 0
            ? 'Terdapat ' + impactedCount + ' jadwal booking yang AKAN OTOMATIS DIBATALKAN oleh sistem!\n\n'
            : 'Tidak ada jadwal booking lain yang bentrok.\n\n') +
          'Lanjutkan eksekusi darurat ini?'

        if (!confirm(confirmMsg)) return

        self.actionLoading = true
        var now = new Date().toISOString()
        var roomCode = self.getRoomCode(self.form.ruanganId)

        // 1. Batalkan semua booking yang terdampak
        var cancelPromises = self.impactedBookings.map(function (b) {
          return App.api.updateBooking(b.id, {
            status: 'dibatalkan',
            alasanPembatalan: 'Dibatalkan sistem akibat Reservasi Darurat Dekanat: ' + self.form.namaKegiatan,
            cancelledBy: self.currentUser.id,
            cancelledAt: now,
          }).then(function () {
            // Notifikasi ke pemohon yang bentrok
            App.api.createNotification({
              userId: b.userId,
              title: 'Reservasi Dibatalkan (Darurat Dekanat)',
              message: 'Jadwal Anda di ruang ' + roomCode + ' pada ' + self.formatDate(b.tanggal) + ' dibatalkan sistem karena ruangan dibutuhkan untuk kegiatan darurat: ' + self.form.namaKegiatan,
              link: App.routes.pj.detailBooking + '?id=' + b.id,
              type: 'danger',
            })
          })
        })

        Promise.all(cancelPromises).then(function () {
          // 2. Buat booking paksa baru
          var newBookingData = {
            id: App.utils.uuid(),
            userId: self.currentUser.id,
            dosenId: null,
            courseId: null,
            ruanganId: self.form.ruanganId,
            tanggal: self.form.tanggal,
            jamMulai: self.form.jamMulai,
            jamSelesai: self.form.jamSelesai,
            jumlahKelas: 1,
            alasan: self.form.namaKegiatan + ' — ' + self.form.alasan.trim(),
            status: 'disetujui',
            isFallback: false,
            isPaksa: true,
            processedBy: self.currentUser.id,
            processedAt: now,
            createdAt: now,
          }

          App.store.addToList('bookings', newBookingData)

          // 3. Catat Log Audit Tingkat Tinggi
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'FORCE_BOOKING',
            object: 'Ruangan ' + roomCode,
            detail: 'Admin mengeksekusi reservasi paksa untuk ' + self.form.namaKegiatan + ' (' + self.form.tanggal + ' ' + self.form.jamMulai + '-' + self.form.jamSelesai + '). ' + impactedCount + ' booking terdampak dibatalkan.',
          })

          alert('Reservasi Paksa berhasil diterapkan! Ruangan telah dikunci untuk agenda ini.')
          self.actionLoading = false
          window.location.href = self.routes.admin.semuaBooking
        }).catch(function (err) {
          alert('Gagal mengeksekusi reservasi paksa: ' + err.message)
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
