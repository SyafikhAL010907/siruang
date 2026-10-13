/**
 * login.js — Logika Vue Halaman Login (Halaman 8)
 * Mendukung autentikasi via NIM/NIP atau Email, show/hide password,
 * redirect sesuai role, menghormati query param ?redirect=,
 * serta akun demo cepat.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Cek apakah sudah login
  var currentUser = App.auth ? App.auth.currentUser() : null
  if (currentUser) {
    if (currentUser.status === App.config.ACCOUNT_STATUS.MENUNGGU_VERIFIKASI) {
      window.location.href = App.routes.auth.menungguVerifikasi
      return
    } else if (currentUser.status === App.config.ACCOUNT_STATUS.AKTIF) {
      var redirectParam = App.utils.getQueryParam('redirect')
      if (redirectParam) {
        window.location.href = redirectParam
      } else {
        window.location.href = App.auth.getDefaultRedirect(currentUser.role)
      }
      return
    }
  }

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        form: {
          identifier: '',
          password: '',
        },
        errors: {
          identifier: '',
          password: '',
        },
        showPassword: false,
        loading: false,
        errorMessage: '',
        showDemoAccounts: true,
      }
    },
    methods: {
      /**
       * Mengisi kredensial demo dan langsung login
       */
      fillDemo: function (identifier, password) {
        this.form.identifier = identifier
        this.form.password = password
        this.errorMessage = ''
        this.errors.identifier = ''
        this.errors.password = ''
        this.handleLogin()
      },

      /**
       * Validasi input sebelum submit
       */
      validate: function () {
        var isValid = true
        this.errors.identifier = ''
        this.errors.password = ''
        this.errorMessage = ''

        if (App.utils.isEmpty(this.form.identifier)) {
          this.errors.identifier = 'NIM, NIP, atau Email wajib diisi.'
          isValid = false
        }

        if (App.utils.isEmpty(this.form.password)) {
          this.errors.password = 'Kata sandi wajib diisi.'
          isValid = false
        }

        return isValid
      },

      /**
       * Proses autentikasi pengguna
       */
      handleLogin: function () {
        if (!this.validate()) return

        this.loading = true
        var self = this

        // Simulasi delay singkat agar UX loading terasa halus
        setTimeout(function () {
          var result = App.auth.login(self.form.identifier, self.form.password)
          self.loading = false

          if (!result.success) {
            self.errorMessage = result.error || 'Terjadi kesalahan saat masuk.'
            if (App.toast) {
              App.toast.error(self.errorMessage)
            }
            return
          }

          // Kasus akun menunggu verifikasi
          if (result.needVerification) {
            if (App.toast) {
              App.toast.warning('Akun Anda sedang menunggu verifikasi oleh Admin.')
            }
            setTimeout(function () {
              window.location.href = App.routes.auth.menungguVerifikasi
            }, 600)
            return
          }

          // Login Berhasil
          if (App.toast) {
            App.toast.success('Selamat datang kembali, ' + result.user.nama + '!')
          }

          // Hormati redirect param jika ada
          var redirectParam = App.utils.getQueryParam('redirect')
          var targetUrl = redirectParam || App.auth.getDefaultRedirect(result.user.role)

          setTimeout(function () {
            window.location.href = targetUrl
          }, 600)
        }, 300)
      },
    },
  })

  // Registrasi komponen navbar
  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
