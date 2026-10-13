// 🆕 TAMBAHAN
/**
 * lupa-password.js — Logika Vue Halaman Lupa Password (Halaman 9)
 * Memvalidasi input email dan mensimulasikan pengiriman tautan reset kata sandi.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        email: '',
        errorEmail: '',
        loading: false,
        isSubmitted: false,
        submittedEmail: '',
      }
    },
    computed: {
      resetLink: function () {
        return this.routes.auth.resetPassword + '?email=' + encodeURIComponent(this.submittedEmail)
      },
    },
    methods: {
      /**
       * Validasi email sebelum kirim
       */
      validate: function () {
        this.errorEmail = ''
        if (App.utils.isEmpty(this.email)) {
          this.errorEmail = 'Alamat email wajib diisi.'
          return false
        }
        if (!App.utils.isValidEmail(this.email)) {
          this.errorEmail = 'Format email tidak valid (contoh: user@unj.ac.id).'
          return false
        }
        return true
      },

      /**
       * Simulasi pengiriman tautan reset kata sandi
       */
      handleSendReset: function () {
        if (!this.validate()) return

        this.loading = true
        var self = this

        setTimeout(function () {
          self.loading = false
          self.submittedEmail = self.email
          self.isSubmitted = true

          if (App.toast) {
            App.toast.success('Tautan reset password berhasil dikirim ke ' + self.submittedEmail)
          }
        }, 400)
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
