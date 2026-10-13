/**
 * navbar-admin.js — Navbar untuk role admin
 * Admin mendapat SEMUA akses plus menu Manajemen Akun
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
          <a :href="routes.admin.dashboard" class="navbar-brand">
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
            <a :href="routes.admin.dashboard" class="navbar-link" :class="{ active: isActive('dashboard-admin') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a :href="routes.public.pilihGedung" class="navbar-link" :class="{ active: isActive('pilih-gedung') || isActive('denah') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              Denah Gedung
            </a>

            <!-- Grup Persetujuan -->
            <div class="navbar-group">
              <button class="navbar-group-toggle" @click="toggleGroup('approval')" :class="{ open: openGroups.approval }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                Persetujuan
                <svg class="navbar-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="navbar-group-items" v-show="openGroups.approval">
                <a :href="routes.dosen.daftarAccRuangan" class="navbar-link navbar-link-sub">Daftar ACC</a>
                <a :href="routes.dosen.riwayatKeputusan" class="navbar-link navbar-link-sub">Riwayat Keputusan</a>
              </div>
            </div>

            <!-- Grup Reservasi -->
            <div class="navbar-group">
              <button class="navbar-group-toggle" @click="toggleGroup('reservasi')" :class="{ open: openGroups.reservasi }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Reservasi
                <svg class="navbar-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="navbar-group-items" v-show="openGroups.reservasi">
                <a :href="routes.admin.semuaBooking" class="navbar-link navbar-link-sub">Semua Booking</a>
                <a :href="routes.admin.reservasiPaksa" class="navbar-link navbar-link-sub">Reservasi Paksa</a>
                <a :href="routes.pj.formReservasi" class="navbar-link navbar-link-sub">Buat Reservasi</a>
              </div>
            </div>

            <a :href="routes.admin.masterDataRuangan" class="navbar-link" :class="{ active: isActive('master-data') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Master Data Ruangan
            </a>

            <a :href="routes.admin.manajemenAkun" class="navbar-link" :class="{ active: isActive('manajemen-akun') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              Manajemen Akun
            </a>

            <!-- 🆕 TAMBAHAN (opsional) -->
            <a :href="routes.admin.manajemenRelasi" class="navbar-link" :class="{ active: isActive('manajemen-relasi') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Manajemen Relasi
            </a>

            <a :href="routes.admin.notifikasiPemborosan" class="navbar-link" :class="{ active: isActive('notifikasi-pemborosan') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Notifikasi Pemborosan
            </a>

            <!-- 🆕 TAMBAHAN -->
            <a :href="routes.admin.logAktivitas" class="navbar-link" :class="{ active: isActive('log-aktivitas') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Log Aktivitas
            </a>

            <!-- 🆕 TAMBAHAN -->
            <a :href="routes.admin.statistikLaporan" class="navbar-link" :class="{ active: isActive('statistik') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Statistik & Laporan
            </a>

            <div class="navbar-spacer"></div>

            <a :href="routes.shared.notifikasi" class="navbar-link navbar-link-icon" :class="{ active: isActive('notifikasi.html') }">
              <span class="navbar-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span v-if="unreadCount > 0" class="navbar-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </span>
              <span class="navbar-link-label">Notifikasi</span>
            </a>

            <a :href="routes.shared.profil" class="navbar-link" :class="{ active: isActive('profil') }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profil
            </a>
            <button @click="logout" class="navbar-link navbar-link-danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
        openGroups: {
          approval: false,
          reservasi: false,
        },
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
      // Auto-open grup jika halaman aktif di dalamnya
      var path = window.location.pathname
      if (path.indexOf('daftar-acc') !== -1 || path.indexOf('riwayat-keputusan') !== -1 || path.indexOf('detail-pengajuan') !== -1) {
        this.openGroups.approval = true
      }
      if (path.indexOf('semua-booking') !== -1 || path.indexOf('reservasi-paksa') !== -1 || path.indexOf('form-reservasi') !== -1) {
        this.openGroups.reservasi = true
      }
    },
    methods: {
      isActive: function (page) {
        return window.location.pathname.indexOf(page) !== -1
      },
      toggleGroup: function (group) {
        this.openGroups[group] = !this.openGroups[group]
      },
      logout: function () {
        App.auth.logout()
      },
    },
  }
})()
