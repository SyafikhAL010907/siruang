/**
 * signup.js — Logika Vue Halaman Registrasi (Halaman 7)
 * Mendukung pendaftaran role Mahasiswa dan Dosen, dropdown prodi,
 * validasi lengkap, konfirmasi password, indikator kekuatan sandi,
 * dan integrasi ke halaman menunggu-verifikasi.
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
        prodiList: [],
        form: {
          nama: '',
          role: 'mahasiswa', // default: mahasiswa
          nim_nip: '',
          email: '',
          prodi: '',
          password: '',
          confirmPassword: '',
        },
        errors: {
          nama: '',
          nim_nip: '',
          email: '',
          prodi: '',
          password: '',
          confirmPassword: '',
        },
        showPassword: false,
        loading: false,
        generalError: '',
      }
    },
    computed: {
      passwordScore: function () {
        if (!this.form.password) return 0
        return App.utils.passwordStrength(this.form.password)
      },
      passwordStrengthText: function () {
        if (!this.form.password) return ''
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
    created: function () {
      this.loadProdi()
    },
    methods: {
      /**
       * Memuat daftar program studi
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
       * Reset error spesifik saat ganti role
       */
      onRoleChange: function () {
        this.errors.nim_nip = ''
      },

      /**
       * Validasi input formulir pendaftaran
       */
      validate: function () {
        var isValid = true
        this.generalError = ''
        var errs = {
          nama: '',
          nim_nip: '',
          email: '',
          prodi: '',
          password: '',
          confirmPassword: '',
        }

        // Nama
        if (App.utils.isEmpty(this.form.nama)) {
          errs.nama = 'Nama lengkap wajib diisi.'
          isValid = false
        } else if (this.form.nama.length < 3) {
          errs.nama = 'Nama lengkap minimal 3 karakter.'
          isValid = false
        }

        // NIM / NIP
        var labelIdentifier = this.form.role === 'dosen' ? 'NIP' : 'NIM'
        if (App.utils.isEmpty(this.form.nim_nip)) {
          errs.nim_nip = labelIdentifier + ' wajib diisi.'
          isValid = false
        } else if (this.form.nim_nip.length < 8) {
          errs.nim_nip = labelIdentifier + ' minimal 8 karakter/digit.'
          isValid = false
        }

        // Email
        if (App.utils.isEmpty(this.form.email)) {
          errs.email = 'Alamat email wajib diisi.'
          isValid = false
        } else if (!App.utils.isValidEmail(this.form.email)) {
          errs.email = 'Format alamat email tidak valid (contoh: user@unj.ac.id).'
          isValid = false
        }

        // Program Studi
        if (App.utils.isEmpty(this.form.prodi)) {
          errs.prodi = 'Silakan pilih Program Studi Anda.'
          isValid = false
        }

        // Password
        if (App.utils.isEmpty(this.form.password)) {
          errs.password = 'Kata sandi wajib diisi.'
          isValid = false
        } else if (this.form.password.length < 6) {
          errs.password = 'Kata sandi minimal 6 karakter.'
          isValid = false
        }

        // Konfirmasi Password
        if (App.utils.isEmpty(this.form.confirmPassword)) {
          errs.confirmPassword = 'Ulangi kata sandi Anda.'
          isValid = false
        } else if (this.form.password !== this.form.confirmPassword) {
          errs.confirmPassword = 'Kata sandi konfirmasi tidak cocok.'
          isValid = false
        }

        this.errors = errs
        return isValid
      },

      /**
       * Menangani pengiriman formulir pendaftaran
       */
      handleRegister: function () {
        if (!this.validate()) return

        this.loading = true
        this.generalError = ''
        var self = this

        setTimeout(function () {
          var payload = {
            nama: self.form.nama,
            nim_nip: self.form.nim_nip,
            email: self.form.email,
            prodi: self.form.prodi,
            password: self.form.password,
            role: self.form.role,
          }

          var result = App.auth.register(payload)
          self.loading = false

          if (!result.success) {
            self.generalError = result.error || 'Pendaftaran gagal dilakukan.'
            if (result.error && result.error.indexOf('NIM/NIP') !== -1) {
              self.errors.nim_nip = result.error
            } else if (result.error && result.error.indexOf('Email') !== -1) {
              self.errors.email = result.error
            }
            if (App.toast) App.toast.error(self.generalError)
            return
          }

          // Otomatis simpan sesi pengguna yang baru mendaftar (status: menunggu_verifikasi)
          // agar saat menuju halaman menunggu-verifikasi.html data pengguna dapat langsung dibaca
          App.store.set('session', {
            userId: result.user.id,
            role: result.user.role,
            status: result.user.status,
            loginAt: new Date().toISOString(),
          })

          if (App.toast) {
            App.toast.success('Pendaftaran berhasil! Akun Anda kini menunggu verifikasi admin.')
          }

          setTimeout(function () {
            window.location.href = App.routes.auth.menungguVerifikasi
          }, 600)
        }, 400)
      },
    },
  })

  if (App.navbarComponent) {
    app.component('app-navbar', App.navbarComponent)
  }

  app.mount('#app')
})()
