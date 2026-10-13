/**
 * manajemen-akun.js — Logika Vue Halaman Manajemen Akun Pengguna (Halaman 23)
 * Menangani pencarian, filter role/status, verifikasi akun, ubah role, dan toggle aktif/nonaktif.
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
        users: [],
        prodiList: [],
        searchQuery: '',
        filterRole: 'semua',
        filterStatus: 'semua',
        currentPage: 1,
        perPage: 10,
        // Modal Ubah Role
        roleModalOpen: false,
        selectedUserForRole: null,
        newRoleValue: '',
        // Modal Tambah User Baru
        createModalOpen: false,
        newUser: {
          nim_nip: '',
          nama: '',
          email: '',
          password: 'password123',
          role: 'mahasiswa',
          prodi: 'Pendidikan Teknik Elektro',
          status: 'aktif',
        },
        createErrors: {},
        actionLoading: false,
      }
    },
    computed: {
      filteredUsers: function () {
        var self = this
        var list = self.users

        // Filter Role
        if (self.filterRole !== 'semua') {
          list = list.filter(function (u) { return u.role === self.filterRole })
        }

        // Filter Status
        if (self.filterStatus !== 'semua') {
          list = list.filter(function (u) { return u.status === self.filterStatus })
        }

        // Pencarian
        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase().trim()
          list = list.filter(function (u) {
            return (u.nama || '').toLowerCase().indexOf(q) !== -1 ||
                   (u.nim_nip || '').toLowerCase().indexOf(q) !== -1 ||
                   (u.email || '').toLowerCase().indexOf(q) !== -1 ||
                   (u.prodi || '').toLowerCase().indexOf(q) !== -1
          })
        }

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredUsers.length / this.perPage) || 1
      },
      paginatedUsers: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredUsers.slice(start, start + this.perPage)
      },
      summaryStats: function () {
        var self = this
        return {
          total: self.users.length,
          menunggu: self.users.filter(function (u) { return u.status === 'menunggu_verifikasi' }).length,
          aktif: self.users.filter(function (u) { return u.status === 'aktif' }).length,
          nonaktif: self.users.filter(function (u) { return u.status === 'nonaktif' }).length,
        }
      },
    },
    created: function () {
      this.loadUsers()
    },
    methods: {
      loadUsers: function () {
        var self = this
        self.loading = true

        Promise.all([
          App.api.getUsers(),
          App.api.getProdi(),
        ]).then(function (results) {
          self.users = results[0] || []
          self.prodiList = results[1] || []
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading users:', err)
          self.loading = false
        })
      },

      formatDate: function (iso) {
        return App.utils ? App.utils.formatDate(iso) : iso
      },

      // Verifikasi Akun Baru
      verifyUser: function (user) {
        var self = this
        if (!confirm('Verifikasi dan aktifkan akun ' + user.nama + ' (' + user.nim_nip + ')?')) return

        self.actionLoading = true
        App.api.updateUser(user.id, { status: 'aktif' }).then(function () {
          // Kirim notifikasi ke user
          App.api.createNotification({
            userId: user.id,
            title: 'Akun Terverifikasi',
            message: 'Selamat! Akun Anda telah diverifikasi oleh Administrator dan siap digunakan.',
            link: App.routes.public.landing,
            type: 'success',
          })
          // Catat audit log
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'VERIFY_USER',
            object: 'User #' + user.id,
            detail: 'Memverifikasi akun ' + user.nama + ' (' + user.role + ')',
          })
          alert('Akun berhasil diverifikasi dan diaktifkan.')
          self.actionLoading = false
          self.loadUsers()
        }).catch(function (err) {
          alert('Gagal memverifikasi akun: ' + err.message)
          self.actionLoading = false
        })
      },

      // Modal Ubah Role
      openRoleModal: function (user) {
        this.selectedUserForRole = user
        this.newRoleValue = user.role
        this.roleModalOpen = true
      },
      closeRoleModal: function () {
        this.roleModalOpen = false
        this.selectedUserForRole = null
      },
      confirmChangeRole: function () {
        var self = this
        if (!self.selectedUserForRole) return

        var user = self.selectedUserForRole
        var oldRole = user.role
        var newRole = self.newRoleValue

        if (oldRole === newRole) {
          self.closeRoleModal()
          return
        }

        self.actionLoading = true
        App.api.updateUser(user.id, { role: newRole }).then(function () {
          // Notifikasi ke user
          App.api.createNotification({
            userId: user.id,
            title: 'Perubahan Peran Akun',
            message: 'Peran akun Anda telah diubah oleh Administrator dari ' + oldRole.toUpperCase() + ' menjadi ' + newRole.toUpperCase() + '.',
            link: App.routes.shared.profil,
            type: 'info',
          })
          // Log audit
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'CHANGE_USER_ROLE',
            object: 'User #' + user.id,
            detail: 'Mengubah role ' + user.nama + ' dari ' + oldRole + ' menjadi ' + newRole,
          })
          alert('Role berhasil diperbarui.')
          self.actionLoading = false
          self.closeRoleModal()
          self.loadUsers()
        }).catch(function (err) {
          alert('Gagal mengubah role: ' + err.message)
          self.actionLoading = false
        })
      },

      // Toggle Nonaktifkan / Aktifkan Akun
      toggleUserStatus: function (user) {
        var self = this
        // Aturan: Admin tidak bisa menonaktifkan dirinya sendiri 🆕
        if (user.id === self.currentUser.id) {
          alert('Aksi Ditolak: Anda tidak dapat menonaktifkan akun Administrator Anda sendiri!')
          return
        }

        var isAktif = user.status === 'aktif'
        var newStatus = isAktif ? 'nonaktif' : 'aktif'
        var actionLabel = isAktif ? 'menonaktifkan' : 'mengaktifkan kembali'

        if (!confirm('Apakah Anda yakin ingin ' + actionLabel + ' akun ' + user.nama + '?')) return

        self.actionLoading = true
        App.api.updateUser(user.id, { status: newStatus }).then(function () {
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: isAktif ? 'DEACTIVATE_USER' : 'ACTIVATE_USER',
            object: 'User #' + user.id,
            detail: 'Mengubah status akun ' + user.nama + ' menjadi ' + newStatus,
          })
          alert('Status akun berhasil diubah menjadi ' + newStatus + '.')
          self.actionLoading = false
          self.loadUsers()
        }).catch(function (err) {
          alert('Gagal mengubah status akun: ' + err.message)
          self.actionLoading = false
        })
      },

      // Modal Tambah User Baru
      openCreateModal: function () {
        this.newUser = {
          nim_nip: '',
          nama: '',
          email: '',
          password: 'password123',
          role: 'mahasiswa',
          prodi: this.prodiList[0] ? this.prodiList[0].nama : 'Pendidikan Teknik Elektro',
          status: 'aktif',
        }
        this.createErrors = {}
        this.createModalOpen = true
      },
      closeCreateModal: function () {
        this.createModalOpen = false
      },
      submitCreateUser: function () {
        var self = this
        self.createErrors = {}

        if (!self.newUser.nim_nip) self.createErrors.nim_nip = 'NIM/NIP wajib diisi.'
        if (!self.newUser.nama) self.createErrors.nama = 'Nama lengkap wajib diisi.'
        if (!self.newUser.email) self.createErrors.email = 'Email wajib diisi.'

        if (Object.keys(self.createErrors).length > 0) return

        self.actionLoading = true
        var createdData = Object.assign({}, self.newUser, {
          createdAt: new Date().toISOString(),
        })

        App.store.addToList('users', createdData)

        App.api.createLog({
          userId: self.currentUser.id,
          userName: self.currentUser.nama,
          role: 'admin',
          action: 'CREATE_USER',
          object: 'User ' + createdData.nim_nip,
          detail: 'Menambahkan akun baru ' + createdData.nama + ' (' + createdData.role + ')',
        })

        alert('Akun pengguna baru berhasil ditambahkan!')
        self.actionLoading = false
        self.closeCreateModal()
        self.loadUsers()
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
