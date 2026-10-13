// 🆕 TAMBAHAN
/**
 * menunggu-verifikasi.js — Logika Vue Halaman Menunggu Verifikasi (Halaman 11)
 * Menampilkan rincian status akun yang belum diverifikasi admin,
 * menyediakan tombol Cek Status, Simulasi ACC Demo, dan Logout.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        user: null,
        prodiList: [],
        checking: false,
      }
    },
    computed: {
      prodiName: function () {
        if (!this.user || !this.user.prodi) return 'Teknik Elektro'
        for (var i = 0; i < this.prodiList.length; i++) {
          if (this.prodiList[i].id === this.user.prodi) {
            return this.prodiList[i].nama
          }
        }
        return this.user.prodi
      },
      roleLabel: function () {
        if (!this.user) return 'Mahasiswa'
        return App.utils.roleLabel ? App.utils.roleLabel(this.user.role) : this.user.role
      },
    },
    created: function () {
      this.loadUser()
      this.loadProdi()
    },
    methods: {
      /**
       * Memuat profil akun pengguna yang sedang login
       */
      loadUser: function () {
        var user = App.auth.currentUser()
        if (!user) {
          // Fallback ke akun dummy menunggu verifikasi (usr-009: Nina Sari)
          user = App.store.findById('users', 'usr-009')
        }
        this.user = user

        // Jika ternyata sudah aktif, langsung arahkan ke dashboard
        if (this.user && this.user.status === App.config.ACCOUNT_STATUS.AKTIF) {
          if (App.toast) App.toast.success('Akun Anda sudah aktif!')
          setTimeout(function () {
            window.location.href = App.auth.getDefaultRedirect(user.role)
          }, 600)
        }
      },

      /**
       * Memuat daftar prodi
       */
      loadProdi: function () {
        var self = this
        if (App.api && App.api.getProdi) {
          App.api.getProdi().then(function (res) {
            self.prodiList = res || []
          })
        } else {
          self.prodiList = App.store.get('prodi', [])
        }
      },

      /**
       * Memeriksa apakah admin sudah memverifikasi akun ini
       */
      checkVerificationStatus: function () {
        if (!this.user) return
        this.checking = true
        var self = this

        setTimeout(function () {
          self.checking = false
          // Ambil status terbaru dari localStorage
          var freshUser = App.store.findById('users', self.user.id)
          if (!freshUser) {
            if (App.toast) App.toast.error('Data akun tidak ditemukan.')
            return
          }

          self.user = freshUser

          if (freshUser.status === App.config.ACCOUNT_STATUS.AKTIF) {
            // Perbarui sesi aktif
            App.store.set('session', {
              userId: freshUser.id,
              role: freshUser.role,
              status: freshUser.status,
              loginAt: new Date().toISOString(),
            })

            if (App.toast) {
              App.toast.success('Selamat! Akun Anda telah diverifikasi oleh Administrator.')
            }

            setTimeout(function () {
              window.location.href = App.auth.getDefaultRedirect(freshUser.role)
            }, 800)
          } else {
            if (App.toast) {
              App.toast.info('Akun Anda masih dalam antrean peninjauan oleh Administrator UNJ.')
            }
          }
        }, 500)
      },

      /**
       * 🆕 Fitur Demo: Mensimulasikan persetujuan langsung dari Admin
       */
      simulateInstantApproval: function () {
        if (!this.user) return
        var self = this

        App.store.updateById('users', this.user.id, {
          status: App.config.ACCOUNT_STATUS.AKTIF,
          updatedAt: new Date().toISOString(),
        })

        // Perbarui sesi
        App.store.set('session', {
          userId: this.user.id,
          role: this.user.role,
          status: App.config.ACCOUNT_STATUS.AKTIF,
          loginAt: new Date().toISOString(),
        })

        // Buat log aktivitas
        if (App.api && App.api.createLog) {
          App.api.createLog({
            userId: this.user.id,
            role: this.user.role,
            action: 'verifikasi_akun',
            object: 'user',
            objectId: this.user.id,
            detail: 'Akun ' + this.user.nama + ' diverifikasi (simulasi demo).',
          })
        }

        if (App.toast) {
          App.toast.success('Simulasi Berhasil: Akun Anda telah diaktifkan! Mengalihkan ke dashboard...')
        }

        setTimeout(function () {
          window.location.href = App.auth.getDefaultRedirect(self.user.role)
        }, 800)
      },

      /**
       * Keluar dari sesi
       */
      handleLogout: function () {
        App.auth.logout()
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
