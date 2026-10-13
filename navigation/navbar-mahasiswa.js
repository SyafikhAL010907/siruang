/**
 * navbar-mahasiswa.js — Navbar untuk role mahasiswa
 * Komponen Vue: app-navbar
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.navbarComponent = {
    name: 'app-navbar',
    template: /* html */ `
      <nav class="navbar" :class="{ 'navbar-open': mobileOpen }">
        <div class="navbar-container">
          <a :href="routes.public.landing" class="navbar-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="flex-shrink:0">
              <rect width="28" height="28" rx="6" fill="#E8F3EC"/>
              <path d="M7 20V10l7-4 7 4v10l-7 4-7-4z" fill="#14532D"/>
              <path d="M14 6v18M7 10l7 4 7-4" stroke="#E8F3EC" stroke-width="1.5"/>
            </svg>
            <span class="navbar-brand-text">Reservasi UNJ</span>
          </a>

          <button class="navbar-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menu navigasi">
            <svg v-if="!mobileOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div class="navbar-menu" :class="{ 'navbar-menu-open': mobileOpen }">
            <a :href="routes.public.landing" class="navbar-link" :class="{ active: isActive('landing') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Beranda
            </a>
            <a :href="routes.public.pilihGedung" class="navbar-link" :class="{ active: isActive('pilih-gedung') || isActive('denah') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              Denah Gedung
            </a>
            <!-- 🆕 TAMBAHAN -->
            <a :href="routes.mahasiswa.mataKuliahSaya" class="navbar-link" :class="{ active: isActive('mata-kuliah') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              Mata Kuliah Saya
            </a>
            <div class="navbar-spacer"></div>
            <!-- 🆕 TAMBAHAN -->
            <a :href="routes.shared.notifikasi" class="navbar-link navbar-link-icon" :class="{ active: isActive('notifikasi') }">
              <span class="navbar-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span v-if="unreadCount > 0" class="navbar-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </span>
              <span class="navbar-link-label">Notifikasi</span>
            </a>
            <!-- 🆕 TAMBAHAN -->
            <a :href="routes.shared.profil" class="navbar-link" :class="{ active: isActive('profil') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profil
            </a>
            <button @click="logout" class="navbar-link navbar-link-danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      </nav>
    `,
    data: function () {
      return {
        mobileOpen: false,
        routes: App.routes,
        unreadCount: 0,
      }
    },
    created: function () {
      var self = this
      var user = App.auth.currentUser()
      if (user) {
        App.api.getUnreadNotificationCount(user.id).then(function (count) {
          self.unreadCount = count
        })
      }
    },
    methods: {
      isActive: function (page) {
        return window.location.pathname.indexOf(page) !== -1
      },
      logout: function () {
        App.auth.logout()
      },
    },
  }
})()
