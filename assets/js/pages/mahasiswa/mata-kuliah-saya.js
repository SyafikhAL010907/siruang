// 🆕 TAMBAHAN
/**
 * mata-kuliah-saya.js — Logika Vue Halaman Mata Kuliah Saya (Halaman 17)
 * Menampilkan daftar mata kuliah dengan relasi Dosen dan PJ aktif,
 * serta filter program studi dan pencarian teks.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Guard: Mahasiswa, PJ, dan Admin berhak mengakses
  var allowed = App.guard({ roles: ['mahasiswa', 'pj', 'admin'] })
  if (!allowed) return

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        courses: [],
        relations: [],
        users: [],
        prodiList: [],
        filterProdi: 'semua',
        searchKeyword: '',
      }
    },
    computed: {
      canBook: function () {
        if (!this.currentUser) return false
        return this.currentUser.role === 'pj' || this.currentUser.role === 'admin'
      },
      enrichedCourses: function () {
        var self = this
        return this.courses.map(function (c) {
          // Cari relasi aktif untuk matkul ini
          var rel = self.relations.find(function (r) {
            return r.courseId === c.id && r.status === 'aktif'
          })

          var dosenUser = rel ? self.users.find(function (u) { return u.id === rel.dosenId }) : null
          var pjUser = rel ? self.users.find(function (u) { return u.id === rel.pjId }) : null
          var prodi = self.prodiList.find(function (p) { return p.id === c.prodi })

          return {
            id: c.id,
            kode: c.kode,
            nama: c.nama,
            sks: c.sks,
            prodi: c.prodi,
            prodiName: prodi ? prodi.nama : c.prodi,
            relationStatus: rel ? rel.status : 'none',
            dosenName: dosenUser ? dosenUser.nama : 'Belum Ditentukan',
            pjName: pjUser ? pjUser.nama + ' (' + pjUser.nim_nip + ')' : 'Belum Ditugaskan',
          }
        })
      },
      filteredCourseList: function () {
        var list = this.enrichedCourses
        var self = this

        if (this.filterProdi !== 'semua') {
          list = list.filter(function (item) { return item.prodi === self.filterProdi })
        }

        if (this.searchKeyword) {
          var q = this.searchKeyword.toLowerCase()
          list = list.filter(function (item) {
            return item.nama.toLowerCase().indexOf(q) !== -1 ||
                   item.kode.toLowerCase().indexOf(q) !== -1 ||
                   item.dosenName.toLowerCase().indexOf(q) !== -1 ||
                   item.pjName.toLowerCase().indexOf(q) !== -1
          })
        }

        return list
      },
    },
    created: function () {
      this.loadData()
    },
    methods: {
      loadData: function () {
        this.courses = App.store.get('courses', [])
        this.relations = App.store.get('relations', [])
        this.users = App.store.get('users', [])
        this.prodiList = App.store.get('prodi', [])
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
