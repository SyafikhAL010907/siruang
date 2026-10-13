/**
 * navbar-guest.js — Navbar untuk pengunjung (belum login)
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
          <!-- Logo -->
          <a :href="routes.public.landing" class="navbar-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="flex-shrink:0">
              <rect width="28" height="28" rx="6" fill="#E8F3EC"/>
              <path d="M7 20V10l7-4 7 4v10l-7 4-7-4z" fill="#14532D"/>
              <path d="M14 6v18M7 10l7 4 7-4" stroke="#E8F3EC" stroke-width="1.5"/>
            </svg>
            <span class="navbar-brand-text">Reservasi UNJ</span>
          </a>

          <!-- Hamburger -->
          <button class="navbar-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menu navigasi">
            <svg v-if="!mobileOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Menu -->
          <div class="navbar-menu" :class="{ 'navbar-menu-open': mobileOpen }">
            <a :href="routes.public.landing" class="navbar-link" :class="{ active: isActive('landing') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Beranda
            </a>
            <a :href="routes.public.pilihGedung" class="navbar-link" :class="{ active: isActive('pilih-gedung') || isActive('denah') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              Denah Gedung
            </a>
            <div class="navbar-spacer"></div>
            <a :href="routes.auth.login" class="navbar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Login
            </a>
            <a :href="routes.auth.signup" class="btn btn-primary navbar-btn">
              Sign Up
            </a>
          </div>
        </div>
      </nav>
    `,
    data: function () {
      return {
        mobileOpen: false,
        routes: App.routes,
      }
    },
    methods: {
      isActive: function (page) {
        return window.location.pathname.indexOf(page) !== -1
      },
    },
  }
})()
