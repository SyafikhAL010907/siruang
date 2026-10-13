/**
 * form-reservasi.js — Logika Vue Halaman Form Reservasi (Halaman 14)
 * Menangani pemilihan jadwal, rombel multi-kelas, auto-fill dosen berbasis relasi,
 * pengecekan konflik & sisa kapasitas real-time, serta deteksi flag fallback pemborosan.
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

  // Generate slot waktu 30 menitan (07:00 s.d 21:00)
  var slots = []
  for (var h = 7; h <= 21; h++) {
    slots.push(String(h).padStart(2, '0') + ':00')
    if (h < 21) {
      slots.push(String(h).padStart(2, '0') + ':30')
    }
  }

  var app = Vue.createApp({
    data: function () {
      var paramRuangan = App.utils.getQueryParam('ruangan') || ''
      var paramTanggal = App.utils.getQueryParam('tanggal') || App.utils.todayISO()
      var paramStart = App.utils.getQueryParam('jamMulai') || '08:00'
      var paramEnd = App.utils.getQueryParam('jamSelesai') || '10:00'

      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        minDate: App.utils.todayISO(),
        timeSlots: slots,
        form: {
          tanggal: paramTanggal,
          jamMulai: paramStart,
          jamSelesai: paramEnd,
          jumlahKelas: 1,
          courseId: '',
          dosenId: '',
          ruanganId: paramRuangan,
          alasan: '',
        },
        errors: {
          tanggal: '',
          jamMulai: '',
          jamSelesai: '',
          courseId: '',
          dosenId: '',
          ruanganId: '',
          alasan: '',
        },
        courses: [],
        relations: [],
        dosenList: [],
        allRooms: [],
        roomCheckData: { status: 'tersedia', sisaKapasitas: 1 },
        loading: false,
        generalError: '',
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
        return this.allRooms.filter(function (r) { return r.gedung === 'L' })
      },
      roomsLS: function () {
        return this.allRooms.filter(function (r) { return r.gedung === 'LS' })
      },
      selectedRoomObj: function () {
        if (!this.form.ruanganId) return null
        return App.store.findById('rooms', this.form.ruanganId)
      },
      courseOptions: function () {
        if (!this.currentUser) return this.courses
        var self = this
        // Jika PJ, utamakan matkul yang direlasikan dengan PJ ini
        if (this.currentUser.role === 'pj') {
          var pjRelations = this.relations.filter(function (rel) {
            return rel.pjId === self.currentUser.id && rel.status === 'aktif'
          })
          if (pjRelations.length > 0) {
            var relCourseIds = pjRelations.map(function (r) { return r.courseId })
            var matched = this.courses.filter(function (c) {
              return relCourseIds.indexOf(c.id) !== -1
            })
            if (matched.length > 0) return matched
          }
        }
        return this.courses
      },
      activeRelation: function () {
        if (!this.form.courseId) return null
        var self = this
        var rel = this.relations.find(function (r) {
          if (r.courseId !== self.form.courseId || r.status !== 'aktif') return false
          if (self.currentUser && self.currentUser.role === 'pj') {
            return r.pjId === self.currentUser.id
          }
          return true
        })
        return rel || null
      },
      hasActiveRelation: function () {
        return this.activeRelation !== null
      },
      autoDosenName: function () {
        if (!this.activeRelation) return ''
        var dosen = App.store.findById('users', this.activeRelation.dosenId)
        return dosen ? dosen.nama : ''
      },
      isFallbackDetected: function () {
        if (!this.selectedRoomObj) return false
        // Fallback terjadi jika kapasitas ruangan lebih besar daripada rombel yang diajukan
        return this.selectedRoomObj.kapasitas > this.form.jumlahKelas
      },
      hasConflict: function () {
        if (!this.selectedRoomObj) return false
        if (this.roomCheckData.status === 'terpakai' || this.roomCheckData.status === 'nonaktif') return true
        return this.roomCheckData.sisaKapasitas < this.form.jumlahKelas
      },
      roomCheckBadgeClass: function () {
        if (this.hasConflict) return 'badge-danger'
        if (this.roomCheckData.status === 'sebagian') return 'badge-warning'
        return 'badge-success'
      },
      roomCheckStatusText: function () {
        if (this.roomCheckData.status === 'nonaktif') return 'Ruangan Nonaktif'
        if (this.hasConflict) return 'Bentrok / Penuh'
        if (this.roomCheckData.status === 'sebagian') return 'Terisi Sebagian'
        return 'Tersedia'
      },
    },
    created: function () {
      this.loadData()
    },
    methods: {
      loadData: function () {
        var self = this
        this.courses = App.store.get('courses', [])
        this.relations = App.store.get('relations', [])
        this.allRooms = App.store.get('rooms', [])
        this.dosenList = App.store.get('users', []).filter(function (u) { return u.role === 'dosen' })

        // Auto pilih mata kuliah pertama jika ada
        if (this.courseOptions.length > 0 && !this.form.courseId) {
          this.form.courseId = this.courseOptions[0].id
          this.onCourseChange()
        }

        if (this.form.ruanganId) {
          this.checkRoomAvailability()
        }
      },

      onCourseChange: function () {
        this.errors.courseId = ''
        if (this.hasActiveRelation) {
          this.form.dosenId = this.activeRelation.dosenId
          this.errors.dosenId = ''
        } else {
          // Jika tidak ada relasi resmi, kosongkan atau set ke dosen pertama
          this.form.dosenId = this.dosenList.length > 0 ? this.dosenList[0].id : ''
        }
      },

      onStartTimeChange: function () {
        var startMin = App.utils.timeToMinutes(this.form.jamMulai)
        var endMin = App.utils.timeToMinutes(this.form.jamSelesai)
        if (endMin <= startMin) {
          var nextIndex = this.timeSlots.indexOf(this.form.jamMulai) + 2
          this.form.jamSelesai = this.timeSlots[Math.min(this.timeSlots.length - 1, nextIndex)] || '21:00'
        }
        this.onTimeOrRoomChange()
      },

      onTimeOrRoomChange: function () {
        this.checkRoomAvailability()
      },

      checkRoomAvailability: function () {
        if (!this.form.ruanganId || !this.form.tanggal) return
        var self = this

        if (App.api && App.api.getRoomStatus) {
          App.api.getRoomStatus(
            this.form.ruanganId,
            this.form.tanggal,
            this.form.jamMulai,
            this.form.jamSelesai
          ).then(function (res) {
            self.roomCheckData = res || { status: 'tersedia', sisaKapasitas: 1 }
          })
        }
      },

      validateForm: function () {
        var isValid = true
        this.generalError = ''
        var errs = {
          tanggal: '',
          jamMulai: '',
          jamSelesai: '',
          courseId: '',
          dosenId: '',
          ruanganId: '',
          alasan: '',
        }

        if (App.utils.isEmpty(this.form.tanggal)) {
          errs.tanggal = 'Tanggal reservasi wajib dipilih.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.jamMulai)) {
          errs.jamMulai = 'Jam mulai wajib dipilih.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.jamSelesai)) {
          errs.jamSelesai = 'Jam selesai wajib dipilih.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.courseId)) {
          errs.courseId = 'Mata kuliah wajib dipilih.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.dosenId)) {
          errs.dosenId = 'Dosen pengampu wajib dipilih.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.ruanganId)) {
          errs.ruanganId = 'Ruang kelas wajib dipilih.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.alasan)) {
          errs.alasan = 'Alasan / keperluan reservasi wajib diisi.'
          isValid = false
        } else if (this.form.alasan.length < 10) {
          errs.alasan = 'Keterangan alasan minimal 10 karakter.'
          isValid = false
        }

        if (this.hasConflict) {
          this.generalError = 'Ruangan tidak dapat dipesan karena jadwal bentrok atau kapasitas penuh.'
          isValid = false
        }

        this.errors = errs
        return isValid
      },

      handleSubmitBooking: function () {
        if (!this.validateForm()) return

        this.loading = true
        var self = this

        setTimeout(function () {
          var user = self.currentUser
          var payload = {
            userId: user.id,
            dosenId: self.form.dosenId,
            courseId: self.form.courseId,
            mataKuliahId: self.form.courseId,
            ruanganId: self.form.ruanganId,
            tanggal: self.form.tanggal,
            jamMulai: self.form.jamMulai,
            jamSelesai: self.form.jamSelesai,
            jumlahKelas: self.form.jumlahKelas,
            alasan: self.form.alasan,
            status: 'menunggu',
            isFallback: self.isFallbackDetected,
            createdAt: new Date().toISOString(),
          }

          var newBooking = App.store.addToList('bookings', Object.assign({ id: App.utils.uuid() }, payload))

          // 1. Notifikasi ke Dosen pengampu
          if (App.api && App.api.createNotification) {
            var roomObj = self.selectedRoomObj
            var roomLabel = roomObj ? roomObj.kode : 'Ruangan'
            App.api.createNotification({
              userId: self.form.dosenId,
              type: 'booking_baru',
              title: 'Pengajuan Reservasi Baru',
              message: user.nama + ' mengajukan ' + roomLabel + ' untuk tanggal ' + self.form.tanggal + ' (' + self.form.jamMulai + '-' + self.form.jamSelesai + ').',
              link: App.routes.dosen.daftarAccRuangan,
            })

            // 2. Jika fallback, kirim notifikasi ke Admin
            if (self.isFallbackDetected) {
              var admins = App.store.get('users', []).filter(function (u) { return u.role === 'admin' })
              admins.forEach(function (admin) {
                App.api.createNotification({
                  userId: admin.id,
                  type: 'fallback',
                  title: 'Pemborosan Ruangan Terdeteksi',
                  message: 'Booking baru menggunakan ruangan ' + roomLabel + ' (kapasitas ' + roomObj.kapasitas + ') untuk ' + self.form.jumlahKelas + ' rombel.',
                  link: App.routes.admin.notifikasiPemborosan,
                })
              })
            }
          }

          // 3. Catat di log aktivitas
          if (App.api && App.api.createLog) {
            App.api.createLog({
              userId: user.id,
              role: user.role,
              action: 'buat_booking',
              object: 'booking',
              objectId: payload.id,
              detail: user.nama + ' membuat pengajuan booking ruangan ' + (self.selectedRoomObj ? self.selectedRoomObj.kode : '') + '.',
            })
          }

          self.loading = false
          if (App.toast) {
            App.toast.success('Pengajuan reservasi berhasil dikirim! Menunggu persetujuan dosen.')
          }

          setTimeout(function () {
            window.location.href = App.routes.pj.riwayatBooking
          }, 700)
        }, 500)
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
