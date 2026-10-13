/**
 * master-data-ruangan.js — Logika Vue Halaman Master Data Ruangan (Halaman 25)
 * CRUD Ruang Kelas: kode, nama, gedung, lantai, kapasitas multi-rombel, fasilitas, dan status aktif/maintenance.
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

  var availableFasilitas = [
    'Proyektor',
    'AC',
    'Whiteboard',
    'Sound System',
    'Mic',
    'Komputer',
    'Kamera Hybrid',
  ]

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        loading: true,
        rooms: [],
        bookings: [],
        selectedGedung: 'L', // 'L' (Elektro) atau 'LS' (Sipil)
        selectedLantai: 'semua', // 'semua', 1, 2, 3, 4
        searchQuery: '',
        facilityList: availableFasilitas,
        currentPage: 1,
        perPage: 12,
        // Modal State
        modalOpen: false,
        isEditing: false,
        formData: {
          id: '',
          gedung: 'L',
          lantai: 1,
          kode: '',
          nama: '',
          kapasitas: 1,
          fasilitas: [],
          statusAktif: true,
        },
        formErrors: {},
        actionLoading: false,
      }
    },
    computed: {
      filteredRooms: function () {
        var self = this
        var list = self.rooms.filter(function (r) {
          return r.gedung === self.selectedGedung
        })

        if (self.selectedLantai !== 'semua') {
          list = list.filter(function (r) {
            return r.lantai === parseInt(self.selectedLantai)
          })
        }

        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase().trim()
          list = list.filter(function (r) {
            var matchKode = (r.kode || '').toLowerCase().indexOf(q) !== -1
            var matchNama = (r.nama || '').toLowerCase().indexOf(q) !== -1
            var matchFasilitas = r.fasilitas && r.fasilitas.some(function (f) {
              return f.toLowerCase().indexOf(q) !== -1
            })
            return matchKode || matchNama || matchFasilitas
          })
        }

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredRooms.length / this.perPage) || 1
      },
      paginatedRooms: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredRooms.slice(start, start + this.perPage)
      },
      statsGedung: function () {
        var self = this
        var roomsL = self.rooms.filter(function (r) { return r.gedung === 'L' })
        var roomsLS = self.rooms.filter(function (r) { return r.gedung === 'LS' })
        return {
          totalL: roomsL.length,
          aktifL: roomsL.filter(function (r) { return r.statusAktif !== false }).length,
          totalLS: roomsLS.length,
          aktifLS: roomsLS.filter(function (r) { return r.statusAktif !== false }).length,
        }
      },
    },
    created: function () {
      this.loadRooms()
    },
    methods: {
      loadRooms: function () {
        var self = this
        self.loading = true

        Promise.all([
          App.api.getRooms(),
          App.api.getBookings(),
        ]).then(function (results) {
          self.rooms = results[0] || []
          self.bookings = results[1] || []
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading rooms:', err)
          self.loading = false
        })
      },

      switchGedung: function (gedung) {
        this.selectedGedung = gedung
        this.selectedLantai = 'semua'
        this.currentPage = 1
      },

      openCreateModal: function () {
        this.isEditing = false
        var defaultPrefix = this.selectedGedung === 'LS' ? 'LS.' : 'L.'
        this.formData = {
          id: '',
          gedung: this.selectedGedung,
          lantai: 1,
          kode: defaultPrefix + '10' + (this.filteredRooms.length + 1),
          nama: 'Ruang Kelas Baru',
          kapasitas: 1,
          fasilitas: ['Proyektor', 'AC', 'Whiteboard'],
          statusAktif: true,
        }
        this.formErrors = {}
        this.modalOpen = true
      },

      openEditModal: function (room) {
        this.isEditing = true
        this.formData = {
          id: room.id,
          gedung: room.gedung,
          lantai: room.lantai,
          kode: room.kode,
          nama: room.nama,
          kapasitas: room.kapasitas || 1,
          fasilitas: room.fasilitas ? [].concat(room.fasilitas) : [],
          statusAktif: room.statusAktif !== false,
        }
        this.formErrors = {}
        this.modalOpen = true
      },

      closeModal: function () {
        this.modalOpen = false
      },

      toggleFacilityCheckbox: function (f) {
        var idx = this.formData.fasilitas.indexOf(f)
        if (idx === -1) {
          this.formData.fasilitas.push(f)
        } else {
          this.formData.fasilitas.splice(idx, 1)
        }
      },

      submitForm: function () {
        var self = this
        self.formErrors = {}

        if (!self.formData.kode) self.formErrors.kode = 'Kode ruangan wajib diisi.'
        if (!self.formData.nama) self.formErrors.nama = 'Nama ruangan wajib diisi.'

        if (Object.keys(self.formErrors).length > 0) return

        self.actionLoading = true

        if (self.isEditing) {
          App.api.updateRoom(self.formData.id, {
            gedung: self.formData.gedung,
            lantai: parseInt(self.formData.lantai),
            kode: self.formData.kode,
            nama: self.formData.nama,
            kapasitas: parseInt(self.formData.kapasitas),
            fasilitas: self.formData.fasilitas,
            statusAktif: self.formData.statusAktif,
          }).then(function () {
            App.api.createLog({
              userId: self.currentUser.id,
              userName: self.currentUser.nama,
              role: 'admin',
              action: 'UPDATE_ROOM',
              object: 'Ruangan ' + self.formData.kode,
              detail: 'Memperbarui master data ruangan ' + self.formData.kode,
            })
            alert('Ruangan berhasil diperbarui.')
            self.actionLoading = false
            self.closeModal()
            self.loadRooms()
          }).catch(function (err) {
            alert('Gagal memperbarui ruangan: ' + err.message)
            self.actionLoading = false
          })
        } else {
          App.api.createRoom({
            gedung: self.formData.gedung,
            lantai: parseInt(self.formData.lantai),
            kode: self.formData.kode,
            nama: self.formData.nama,
            kapasitas: parseInt(self.formData.kapasitas),
            fasilitas: self.formData.fasilitas,
            statusAktif: self.formData.statusAktif,
          }).then(function () {
            App.api.createLog({
              userId: self.currentUser.id,
              userName: self.currentUser.nama,
              role: 'admin',
              action: 'CREATE_ROOM',
              object: 'Ruangan ' + self.formData.kode,
              detail: 'Menambahkan ruangan baru ' + self.formData.kode,
            })
            alert('Ruangan baru berhasil ditambahkan!')
            self.actionLoading = false
            self.closeModal()
            self.loadRooms()
          }).catch(function (err) {
            alert('Gagal menambahkan ruangan: ' + err.message)
            self.actionLoading = false
          })
        }
      },

      toggleMaintenance: function (room) {
        var self = this
        var isCurrentlyActive = room.statusAktif !== false
        var nextStatus = !isCurrentlyActive
        var label = nextStatus ? 'mengaktifkan kembali' : 'menonaktifkan (mode maintenance)'

        if (!confirm('Apakah Anda yakin ingin ' + label + ' ruangan ' + room.kode + '?')) return

        App.api.updateRoom(room.id, { statusAktif: nextStatus }).then(function () {
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: nextStatus ? 'ACTIVATE_ROOM' : 'MAINTENANCE_ROOM',
            object: 'Ruangan ' + room.kode,
            detail: 'Mengubah status ruangan ' + room.kode + ' menjadi ' + (nextStatus ? 'Aktif' : 'Maintenance'),
          })
          self.loadRooms()
        })
      },

      deleteRoom: function (room) {
        var self = this
        // Validasi: Ruangan dengan booking aktif tidak boleh dihapus!
        var hasActiveBooking = self.bookings.some(function (b) {
          return b.ruanganId === room.id && (b.status === 'disetujui' || b.status === 'menunggu')
        })

        if (hasActiveBooking) {
          alert('Aksi Ditolak: Ruangan ' + room.kode + ' memiliki jadwal booking aktif (Menunggu/Disetujui). Hapus atau batalkan jadwal booking terlebih dahulu sebelum menghapus ruangan!')
          return
        }

        if (!confirm('Hapus permanen ruangan ' + room.kode + ' (' + room.nama + ')?')) return

        App.api.deleteRoom(room.id).then(function () {
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'DELETE_ROOM',
            object: 'Ruangan ' + room.kode,
            detail: 'Menghapus master data ruangan ' + room.kode,
          })
          alert('Ruangan berhasil dihapus.')
          self.loadRooms()
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
