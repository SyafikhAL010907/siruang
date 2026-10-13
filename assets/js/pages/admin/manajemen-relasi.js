/**
 * manajemen-relasi.js — Logika Vue Halaman Manajemen Relasi (Halaman 24)
 * CRUD Relasi Mata Kuliah ↔ Dosen Pengampu ↔ Penanggung Jawab (PJ Kelas).
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
        relations: [],
        courses: [],
        users: [],
        searchQuery: '',
        filterStatus: 'semua',
        currentPage: 1,
        perPage: 10,
        // Modal Form Relasi
        modalOpen: false,
        isEditing: false,
        formData: {
          id: '',
          courseId: '',
          dosenId: '',
          pjId: '',
          status: 'aktif',
        },
        formErrors: {},
        actionLoading: false,
      }
    },
    computed: {
      dosenOptions: function () {
        return this.users.filter(function (u) { return u.role === 'dosen' || u.role === 'admin' })
      },
      pjOptions: function () {
        return this.users.filter(function (u) { return u.role === 'pj' || u.role === 'mahasiswa' })
      },
      filteredRelations: function () {
        var self = this
        var list = self.relations

        if (self.filterStatus !== 'semua') {
          list = list.filter(function (r) { return r.status === self.filterStatus })
        }

        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase().trim()
          list = list.filter(function (r) {
            var c = self.getCourse(r.courseId)
            var courseName = c ? (c.nama + ' ' + c.kode).toLowerCase() : ''
            var dosenName = self.getUserName(r.dosenId).toLowerCase()
            var pjName = self.getUserName(r.pjId).toLowerCase()

            return courseName.indexOf(q) !== -1 ||
                   dosenName.indexOf(q) !== -1 ||
                   pjName.indexOf(q) !== -1
          })
        }

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredRelations.length / this.perPage) || 1
      },
      paginatedRelations: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredRelations.slice(start, start + this.perPage)
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
          App.api.getRelations(),
          App.api.getCourses(),
          App.api.getUsers(),
        ]).then(function (results) {
          self.relations = results[0] || []
          self.courses = results[1] || []
          self.users = results[2] || []
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading relations:', err)
          self.loading = false
        })
      },

      getCourse: function (id) {
        return this.courses.find(function (c) { return c.id === id }) || null
      },
      getCourseName: function (id) {
        var c = this.getCourse(id)
        return c ? c.kode + ' — ' + c.nama : 'Mata Kuliah'
      },
      getUser: function (id) {
        return this.users.find(function (u) { return u.id === id }) || null
      },
      getUserName: function (id) {
        var u = this.getUser(id)
        return u ? u.nama : 'Pengguna'
      },

      openCreateModal: function () {
        this.isEditing = false
        this.formData = {
          id: '',
          courseId: this.courses[0] ? this.courses[0].id : '',
          dosenId: this.dosenOptions[0] ? this.dosenOptions[0].id : '',
          pjId: this.pjOptions[0] ? this.pjOptions[0].id : '',
          status: 'aktif',
        }
        this.formErrors = {}
        this.modalOpen = true
      },

      openEditModal: function (rel) {
        this.isEditing = true
        this.formData = {
          id: rel.id,
          courseId: rel.courseId,
          dosenId: rel.dosenId,
          pjId: rel.pjId,
          status: rel.status,
        }
        this.formErrors = {}
        this.modalOpen = true
      },

      closeModal: function () {
        this.modalOpen = false
      },

      submitForm: function () {
        var self = this
        self.formErrors = {}

        if (!self.formData.courseId) self.formErrors.courseId = 'Pilih mata kuliah.'
        if (!self.formData.dosenId) self.formErrors.dosenId = 'Pilih dosen pengampu.'
        if (!self.formData.pjId) self.formErrors.pjId = 'Pilih penanggung jawab (PJ).'

        if (Object.keys(self.formErrors).length > 0) return

        self.actionLoading = true

        if (self.isEditing) {
          App.api.updateRelation(self.formData.id, {
            courseId: self.formData.courseId,
            dosenId: self.formData.dosenId,
            pjId: self.formData.pjId,
            status: self.formData.status,
          }).then(function () {
            App.api.createLog({
              userId: self.currentUser.id,
              userName: self.currentUser.nama,
              role: 'admin',
              action: 'UPDATE_RELATION',
              object: 'Relasi #' + self.formData.id,
              detail: 'Memperbarui relasi mata kuliah ' + self.getCourseName(self.formData.courseId),
            })
            alert('Relasi berhasil diperbarui.')
            self.actionLoading = false
            self.closeModal()
            self.loadData()
          }).catch(function (err) {
            alert('Gagal memperbarui relasi: ' + err.message)
            self.actionLoading = false
          })
        } else {
          App.api.createRelation({
            courseId: self.formData.courseId,
            dosenId: self.formData.dosenId,
            pjId: self.formData.pjId,
            status: self.formData.status,
          }).then(function () {
            App.api.createLog({
              userId: self.currentUser.id,
              userName: self.currentUser.nama,
              role: 'admin',
              action: 'CREATE_RELATION',
              object: 'Relasi Baru',
              detail: 'Menambahkan relasi ' + self.getCourseName(self.formData.courseId),
            })
            alert('Relasi baru berhasil ditambahkan.')
            self.actionLoading = false
            self.closeModal()
            self.loadData()
          }).catch(function (err) {
            alert('Gagal menambah relasi: ' + err.message)
            self.actionLoading = false
          })
        }
      },

      toggleStatus: function (rel) {
        var self = this
        var newStatus = rel.status === 'aktif' ? 'nonaktif' : 'aktif'
        if (!confirm('Ubah status relasi ini menjadi ' + newStatus + '?')) return

        App.api.updateRelation(rel.id, { status: newStatus }).then(function () {
          self.loadData()
        })
      },

      deleteRelation: function (rel) {
        var self = this
        if (!confirm('Apakah Anda yakin ingin menghapus relasi ini?')) return

        App.api.deleteRelation(rel.id).then(function () {
          App.api.createLog({
            userId: self.currentUser.id,
            userName: self.currentUser.nama,
            role: 'admin',
            action: 'DELETE_RELATION',
            object: 'Relasi #' + rel.id,
            detail: 'Menghapus relasi perkuliahan',
          })
          alert('Relasi berhasil dihapus.')
          self.loadData()
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
