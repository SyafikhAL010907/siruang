// 🆕 TAMBAHAN
/**
 * notifikasi.js — Logika Vue Halaman Notifikasi & Pemberitahuan (Halaman 31)
 * Menampilkan daftar notifikasi pengguna, filter status dibaca/belum,
 * serta aksi tandai dibaca per item dan massal.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Guard: Seluruh role yang telah login
  var allowed = App.guard({ roles: ['admin', 'dosen', 'pj', 'mahasiswa'] })
  if (!allowed) return

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        currentUser: App.auth ? App.auth.currentUser() : null,
        notifList: [],
        filterTab: 'semua', // 'semua' | 'unread' | 'read'
      }
    },
    computed: {
      unreadCount: function () {
        return this.notifList.filter(function (n) { return !n.read }).length
      },
      filteredNotifs: function () {
        var list = this.notifList
        if (this.filterTab === 'unread') {
          return list.filter(function (n) { return !n.read })
        }
        if (this.filterTab === 'read') {
          return list.filter(function (n) { return n.read })
        }
        return list
      },
    },
    created: function () {
      this.loadNotifs()
    },
    methods: {
      loadNotifs: function () {
        var self = this
        if (!this.currentUser) return

        if (App.api && App.api.getNotifications) {
          App.api.getNotifications(this.currentUser.id).then(function (res) {
            self.notifList = res || []
          })
        }
      },

      markAsRead: function (id) {
        var self = this
        if (App.api && App.api.markNotificationRead) {
          App.api.markNotificationRead(id).then(function () {
            var item = self.notifList.find(function (n) { return n.id === id })
            if (item) item.read = true
          })
        }
      },

      markAllAsRead: function () {
        var self = this
        if (!this.currentUser) return

        if (App.api && App.api.markAllNotificationsRead) {
          App.api.markAllNotificationsRead(this.currentUser.id).then(function () {
            self.notifList.forEach(function (n) { n.read = true })
            if (App.toast) {
              App.toast.success('Semua notifikasi ditandai sebagai telah dibaca.')
            }
          })
        }
      },

      formatDateTime: function (dt) {
        return App.utils.formatDateTime(dt)
      },

      getIconBgClass: function (type) {
        var map = {
          acc: 'bg-emerald-100 text-emerald-700',
          tolak: 'bg-red-100 text-red-700',
          batal: 'bg-gray-100 text-gray-700',
          fallback: 'bg-amber-100 text-amber-800',
          akun_baru: 'bg-primary-soft text-primary',
          booking_baru: 'bg-blue-100 text-blue-700',
        }
        return map[type] || 'bg-surface text-muted'
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
