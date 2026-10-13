/**
 * log-aktivitas.js — Logika Vue Halaman Log Aktivitas Admin (Halaman 29)
 * Audit trail sistem lengkap: waktu, pengguna, role, aksi, objek, dan rincian transaksi (read-only).
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
        logs: [],
        filterAction: 'semua',
        filterDate: '',
        searchQuery: '',
        currentPage: 1,
        perPage: 12,
      }
    },
    computed: {
      filteredLogs: function () {
        var self = this
        var list = self.logs

        // Filter Aksi
        if (self.filterAction !== 'semua') {
          list = list.filter(function (l) {
            return (l.action || '').indexOf(self.filterAction) !== -1
          })
        }

        // Filter Tanggal
        if (self.filterDate) {
          list = list.filter(function (l) {
            return (l.createdAt || '').slice(0, 10) === self.filterDate
          })
        }

        // Search Query
        if (self.searchQuery) {
          var q = self.searchQuery.toLowerCase().trim()
          list = list.filter(function (l) {
            return (l.userName || '').toLowerCase().indexOf(q) !== -1 ||
                   (l.action || '').toLowerCase().indexOf(q) !== -1 ||
                   (l.object || '').toLowerCase().indexOf(q) !== -1 ||
                   (l.detail || '').toLowerCase().indexOf(q) !== -1
          })
        }

        return list
      },
      totalPages: function () {
        return Math.ceil(this.filteredLogs.length / this.perPage) || 1
      },
      paginatedLogs: function () {
        var start = (this.currentPage - 1) * this.perPage
        return this.filteredLogs.slice(start, start + this.perPage)
      },
    },
    created: function () {
      this.loadLogs()
    },
    methods: {
      loadLogs: function () {
        var self = this
        self.loading = true

        App.api.getLogs().then(function (logs) {
          self.logs = logs || []
          self.loading = false
        }).catch(function (err) {
          console.error('Error loading logs:', err)
          self.loading = false
        })
      },

      formatDateTime: function (iso) {
        if (!iso) return '-'
        var d = new Date(iso)
        return App.utils.formatDate(d) + ', ' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0') + ':' +
          String(d.getSeconds()).padStart(2, '0')
      },

      getActionBadgeClass: function (action) {
        if (!action) return 'badge-info'
        if (action.indexOf('APPROVE') !== -1 || action.indexOf('VERIFY') !== -1 || action.indexOf('CREATE') !== -1) return 'badge-success'
        if (action.indexOf('REJECT') !== -1 || action.indexOf('CANCEL') !== -1 || action.indexOf('DELETE') !== -1 || action.indexOf('DEACTIVATE') !== -1) return 'badge-danger'
        if (action.indexOf('FORCE') !== -1 || action.indexOf('WASTE') !== -1) return 'badge-warning'
        return 'badge-info'
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
