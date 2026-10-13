/**
 * daftar-acc-ruangan.js — Logika Vue Halaman Daftar ACC Ruangan Dosen (Halaman 19)
 * 3 Tab (Menunggu, Disetujui, Ditolak), filter, tabel aksi cepat ACC/Tolak, klik baris ke detail.
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
      // Baca tab dari query param jika ada
      var initialTab = App.utils.getQueryParam('tab') || 'menunggu'
      if (['menunggu', 'disetujui', 'ditolak'].indexOf(initialTab) === -1) {
        initialTab = 'menunggu'
      }

      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        loading: true,
        activeTab: initialTab,
        searchQuery: '',
        filterDate: '',
        bookings: [],
        allRooms: [],
        allCourses: [],
        allUsers: [],
        currentPage: 1,
        perPage: 10,
        // Modal Tolak
        rejectModalOpen: false,
        selectedBooking: null,
        alasanTolak: '',
        rejectError: '',
        actionLoading: false,
      }
    },
    computed: {
      tabCounts: function () {
        var self = this
        return {
          menunggu: self.bookings.filter(function (b) { return b.status === 'menunggu' }).length,
          disetujui: self.bookings.filter(function (b) { return b.status === 'disetujui' }).length,
          ditolak: self.bookings.filter(function (b) { return b.status === 'ditolak' }).length,
        }
      },
      filteredBookings: function () {
        var self = this
        var list = self.bookings.filter(function (b) {
          return b.status === self.activeTab
        })

        // Filter tanggal jika dipilih
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

            return roomCode.indexOf(q) !== -1 ||
                   courseName.indexOf(q) !== -1 ||
                   requester.indexOf(q) !== -1 ||
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
          console.error('Error loading daftar acc:', err)
          self.loading = false
        })
      },

      setTab: function (tab) {
        this.activeTab = tab
        this.currentPage = 1
        if (window.history && window.history.replaceState) {
          var url = window.location.pathname + '?tab=' + tab
          window.history.replaceState(null, '', url)
        }
      },

      getRoom: function (id) {
        return this.allRooms.find(function (r) { return r.id === id }) || null
      },
      getRoomCode: function (id) {
        var r = this.getRoom(id)
        return r ? r.kode : '-'
      },
      getRoomFloor: function (id) {
        var r = this.getRoom(id)
        return r ? 'Gedung ' + r.gedung + ' Lt ' + r.lantai : ''
      },
      getCourseName: function (id) {
        var c = this.allCourses.find(function (item) { return item.id === id })
        return c ? c.nama : 'Mata Kuliah'
      },
      getCourseCode: function (id) {
        var c = this.allCourses.find(function (item) { return item.id === id })
        return c ? c.kode : ''
      },
      getRequesterName: function (id) {
        var u = this.allUsers.find(function (item) { return item.id === id })
        return u ? u.nama : 'Penanggung Jawab'
      },
      getRequesterNim: function (id) {
        var u = this.allUsers.find(function (item) { return item.id === id })
        return u ? u.nim_nip : ''
      },
      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },
      formatTime: function (jamMulai, jamSelesai) {
        return jamMulai + ' - ' + jamSelesai
      },

      goToDetail: function (id) {
        window.location.href = this.routes.dosen.detailPengajuan + '?id=' + id
      },

      // Aksi Cepat ACC
      quickApprove: function (booking, event) {
        if (event) event.stopPropagation()
        var self = this
        var room = self.getRoom(booking.ruanganId)
        var roomCode = room ? room.kode : 'Ruangan'
        var confirmMsg = 'Setujui permohonan ruang ' + roomCode + ' untuk ' + self.getCourseName(booking.courseId) + ' pada ' + self.formatDate(booking.tanggal) + '?'

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
      openRejectModal: function (booking, event) {
        if (event) event.stopPropagation()
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
