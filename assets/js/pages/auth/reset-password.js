// 🆕 TAMBAHAN
/**
 * reset-password.js — Logika Vue Halaman Reset Kata Sandi (Halaman 10)
 * Memperbarui kata sandi baru dengan konfirmasi dan indikator kekuatan sandi.
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
        targetEmail: App.utils.getQueryParam('email') || '',
        newPassword: '',
        confirmPassword: '',
        showPassword: false,
        loading: false,
        errorMessage: '',
        errors: {
          newPassword: '',
          confirmPassword: '',
        },
      }
    },
    computed: {
      passwordScore: function () {
        if (!this.newPassword) return 0
        return App.utils.passwordStrength(this.newPassword)
      },
      passwordStrengthText: function () {
        if (!this.newPassword) return ''
        return App.utils.passwordStrengthLabel(this.passwordScore)
      },
      passwordStrengthColorClass: function () {
        var score = this.passwordScore
        if (score <= 1) return 'text-red-600'
        if (score === 2) return 'text-yellow-600'
        return 'text-green-600'
      },
      passwordStrengthBarClass: function () {
        var score = this.passwordScore
        if (score <= 1) return 'bg-red-500'
        if (score === 2) return 'bg-yellow-500'
        return 'bg-green-600'
      },
    },
    methods: {
      /**
       * Validasi input kata sandi baru
       */
      validate: function () {
        var isValid = true
        this.errors.newPassword = ''
        this.errors.confirmPassword = ''
        this.errorMessage = ''

        if (App.utils.isEmpty(this.newPassword)) {
          this.errors.newPassword = 'Kata sandi baru wajib diisi.'
          isValid = false
        } else if (this.newPassword.length < 6) {
          this.errors.newPassword = 'Kata sandi baru minimal 6 karakter.'
          isValid = false
        }

        if (App.utils.isEmpty(this.confirmPassword)) {
          this.errors.confirmPassword = 'Ulangi kata sandi baru Anda.'
          isValid = false
        } else if (this.newPassword !== this.confirmPassword) {
          this.errors.confirmPassword = 'Kata sandi konfirmasi tidak cocok.'
          isValid = false
        }

        return isValid
      },

      /**
       * Simpan pembaruan kata sandi
       */
      handleResetPassword: function () {
        if (!this.validate()) return

        this.loading = true
        var self = this

        setTimeout(function () {
          var users = App.store.get('users', [])
          var userFound = null

          // Cari pengguna berdasarkan targetEmail jika ada
          if (self.targetEmail) {
            for (var i = 0; i < users.length; i++) {
              if (users[i].email.toLowerCase() === self.targetEmail.toLowerCase()) {
                userFound = users[i]
                break
              }
            }
          }

          // Jika tidak ada email khusus, update akun demo pertama yang cocok atau fallback
          if (!userFound && users.length > 0) {
            userFound = users[0] // Dr. Ahmad Fauzi (Admin) atau user pertama
          }

          if (userFound) {
            App.store.updateById('users', userFound.id, {
              password: self.newPassword,
              updatedAt: new Date().toISOString(),
            })

            // Catat log aktivitas jika ada
            if (App.api && App.api.createLog) {
              App.api.createLog({
                userId: userFound.id,
                role: userFound.role,
                action: 'reset_password',
                object: 'user',
                objectId: userFound.id,
                detail: 'Pengguna mereset kata sandi melalui tautan email.',
              })
            }
          }

          self.loading = false
          if (App.toast) {
            App.toast.success('Kata sandi berhasil diperbarui! Silakan masuk kembali.')
          }

          setTimeout(function () {
            window.location.href = App.routes.auth.login
          }, 800)
        }, 500)
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
