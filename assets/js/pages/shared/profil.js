// 🆕 TAMBAHAN
/**
 * profil.js — Logika Vue Halaman Profil Pengguna (Halaman 12)
 * Digunakan oleh seluruh role yang telah terautentikasi (Admin, Dosen, PJ, Mahasiswa).
 * Mendukung pembaruan nama, email, prodi; penggantian kata sandi dengan validasi;
 * serta peninjauan riwayat sesi & log aktivitas.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  // Pastikan data demo telah di-seed jika halaman dibuka langsung
  if (App.store && typeof App.store.seed === 'function') {
    App.store.seed()
  }

  // Guard: Hanya pengguna yang telah login dengan status aktif
  var allowed = App.guard({ roles: ['admin', 'dosen', 'pj', 'mahasiswa'] })
  if (!allowed) return

  var app = Vue.createApp({
    data: function () {
      return {
        routes: App.routes,
        user: null,
        activeTab: 'info', // 'info' | 'security' | 'session'
        prodiList: [],
        userLogs: [],
        // Form Profil
        profileForm: {
          nama: '',
          email: '',
          prodi: '',
        },
        errors: {
          nama: '',
          email: '',
          prodi: '',
        },
        savingProfile: false,
        // Form Password
        passwordForm: {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        passErrors: {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        savingPassword: false,
        showPassword: false,
      }
    },
    computed: {
      avatarInitials: function () {
        if (!this.user || !this.user.nama) return 'UNJ'
        var parts = this.user.nama.replace(/(Dr\.|Prof\.|M\.T\.|M\.Sc\.|M\.Pd\.|,)/g, '').trim().split(' ').filter(Boolean)
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
        return 'U'
      },
      roleLabel: function () {
        if (!this.user) return ''
        return App.utils.roleLabel ? App.utils.roleLabel(this.user.role) : this.user.role
      },
      roleBadgeClass: function () {
        if (!this.user) return 'badge-neutral'
        var map = {
          admin: 'badge-danger',
          dosen: 'badge-info',
          pj: 'badge-warning',
          mahasiswa: 'badge-neutral',
        }
        return map[this.user.role] || 'badge-neutral'
      },
      prodiName: function () {
        if (!this.user || !this.user.prodi) return '-'
        for (var i = 0; i < this.prodiList.length; i++) {
          if (this.prodiList[i].id === this.user.prodi) {
            return this.prodiList[i].nama
          }
        }
        return this.user.prodi
      },
      userCreatedAt: function () {
        if (!this.user || !this.user.createdAt) return '-'
        return App.utils.formatDate(this.user.createdAt)
      },
      sessionLoginAt: function () {
        var sess = App.auth.getSession ? App.auth.getSession() : null
        if (!sess || !sess.loginAt) return 'Sesi Ini'
        return App.utils.formatDateTime(sess.loginAt)
      },
      homeUrl: function () {
        if (!this.user) return App.routes.public.landing
        return App.auth.getDefaultRedirect(this.user.role)
      },
      passwordScore: function () {
        if (!this.passwordForm.newPassword) return 0
        return App.utils.passwordStrength(this.passwordForm.newPassword)
      },
      passwordStrengthText: function () {
        if (!this.passwordForm.newPassword) return ''
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
      this.loadInitialData()
    },
    methods: {
      /**
       * Memuat data pengguna, prodi, dan log aktivitas
       */
      loadInitialData: function () {
        var user = App.auth.currentUser()
        if (!user) {
          window.location.href = App.routes.auth.login
          return
        }
        this.user = user
        this.resetProfileForm()

        var self = this
        // Load prodi
        if (App.api && App.api.getProdi) {
          App.api.getProdi().then(function (res) {
            self.prodiList = res || []
          })
        } else {
          self.prodiList = App.store.get('prodi', [])
        }

        // Load logs untuk user ini
        if (App.api && App.api.getLogs) {
          App.api.getLogs({ userId: user.id }).then(function (logs) {
            self.userLogs = (logs || []).slice(0, 5)
          })
        }
      },

      /**
       * Mengembalikan form profil sesuai data user terkini
       */
      resetProfileForm: function () {
        if (this.user) {
          this.profileForm.nama = this.user.nama || ''
          this.profileForm.email = this.user.email || ''
          this.profileForm.prodi = this.user.prodi || ''
        }
        this.errors = { nama: '', email: '', prodi: '' }
      },

      /**
       * Mengosongkan form ganti password
       */
      resetPasswordForm: function () {
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }
        this.passErrors = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }
      },

      /**
       * Validasi input profil
       */
      validateProfile: function () {
        var isValid = true
        var errs = { nama: '', email: '', prodi: '' }

        if (App.utils.isEmpty(this.profileForm.nama)) {
          errs.nama = 'Nama lengkap wajib diisi.'
          isValid = false
        } else if (this.profileForm.nama.length < 3) {
          errs.nama = 'Nama lengkap minimal 3 karakter.'
          isValid = false
        }

        if (App.utils.isEmpty(this.profileForm.email)) {
          errs.email = 'Alamat email wajib diisi.'
          isValid = false
        } else if (!App.utils.isValidEmail(this.profileForm.email)) {
          errs.email = 'Format email tidak valid.'
          isValid = false
        }

        if (App.utils.isEmpty(this.profileForm.prodi)) {
          errs.prodi = 'Program studi wajib dipilih.'
          isValid = false
        }

        this.errors = errs
        return isValid
      },

      /**
       * Simpan pembaruan profil
       */
      handleUpdateProfile: function () {
        if (!this.validateProfile()) return

        this.savingProfile = true
        var self = this

        setTimeout(function () {
          var updated = App.auth.updateProfile({
            nama: self.profileForm.nama,
            email: self.profileForm.email,
            prodi: self.profileForm.prodi,
            updatedAt: new Date().toISOString(),
          })

          self.savingProfile = false
          if (updated) {
            self.user = updated
            if (App.toast) App.toast.success('Profil Anda berhasil diperbarui!')

            // Catat log aktivitas jika ada
            if (App.api && App.api.createLog) {
              App.api.createLog({
                userId: updated.id,
                role: updated.role,
                action: 'update_profil',
                object: 'user',
                objectId: updated.id,
                detail: updated.nama + ' memperbarui informasi profil akun.',
              })
            }
          } else {
            if (App.toast) App.toast.error('Gagal memperbarui profil.')
          }
        }, 350)
      },

      /**
       * Validasi formulir ganti kata sandi
       */
      validatePassword: function () {
        var isValid = true
        var errs = { oldPassword: '', newPassword: '', confirmPassword: '' }

        if (App.utils.isEmpty(this.passwordForm.oldPassword)) {
          errs.oldPassword = 'Kata sandi saat ini wajib diisi.'
          isValid = false
        } else if (this.user && this.user.password !== this.passwordForm.oldPassword) {
          errs.oldPassword = 'Kata sandi saat ini tidak sesuai.'
          isValid = false
        }

        if (App.utils.isEmpty(this.passwordForm.newPassword)) {
          errs.newPassword = 'Kata sandi baru wajib diisi.'
          isValid = false
        } else if (this.passwordForm.newPassword.length < 6) {
          errs.newPassword = 'Kata sandi baru minimal 6 karakter.'
          isValid = false
        } else if (this.passwordForm.newPassword === this.passwordForm.oldPassword) {
          errs.newPassword = 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.'
          isValid = false
        }

        if (App.utils.isEmpty(this.passwordForm.confirmPassword)) {
          errs.confirmPassword = 'Ulangi kata sandi baru Anda.'
          isValid = false
        } else if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          errs.confirmPassword = 'Kata sandi konfirmasi tidak cocok.'
          isValid = false
        }

        this.passErrors = errs
        return isValid
      },

      /**
       * Simpan penggantian kata sandi
       */
      handleChangePassword: function () {
        if (!this.validatePassword()) return

        this.savingPassword = true
        var self = this

        setTimeout(function () {
          var res = App.auth.changePassword(
            self.passwordForm.oldPassword,
            self.passwordForm.newPassword
          )

          self.savingPassword = false

          if (!res.success) {
            self.passErrors.oldPassword = res.error || 'Gagal mengubah kata sandi.'
            if (App.toast) App.toast.error(self.passErrors.oldPassword)
            return
          }

          // Segarkan data user di state
          self.user = App.auth.currentUser()
          self.resetPasswordForm()

          if (App.toast) {
            App.toast.success('Kata sandi berhasil diperbarui!')
          }

          // Catat log aktivitas jika ada
          if (App.api && App.api.createLog && self.user) {
            App.api.createLog({
              userId: self.user.id,
              role: self.user.role,
              action: 'ganti_password',
              object: 'user',
              objectId: self.user.id,
              detail: self.user.nama + ' mengganti kata sandi akun.',
            })
          }
        }, 400)
      },

      /**
       * Format tanggal bantuan
       */
      formatDate: function (dateStr) {
        return App.utils.formatDateTime(dateStr)
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
