/**
 * auth.js — Autentikasi dan sesi pengguna
 * Namespace: App.auth
 * Sesi disimpan di localStorage via App.store.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  var SESSION_KEY = 'session'

  window.App.auth = {
    /**
     * Login pengguna
     * @param {string} identifier - NIM/NIP atau email
     * @param {string} password
     * @returns {Object} { success, user?, error? }
     */
    login: function (identifier, password) {
      var users = App.store.get('users', [])
      var user = null

      for (var i = 0; i < users.length; i++) {
        var u = users[i]
        if ((u.nim_nip === identifier || u.email === identifier) && u.password === password) {
          user = u
          break
        }
      }

      if (!user) {
        return { success: false, error: 'NIM/NIP/email atau password salah.' }
      }

      // Cek status akun
      if (user.status === App.config.ACCOUNT_STATUS.NONAKTIF) {
        return { success: false, error: 'Akun Anda telah dinonaktifkan. Hubungi admin.' }
      }

      if (user.status === App.config.ACCOUNT_STATUS.MENUNGGU_VERIFIKASI) {
        // Simpan sesi terbatas
        App.store.set(SESSION_KEY, {
          userId: user.id,
          role: user.role,
          status: user.status,
          loginAt: new Date().toISOString(),
        })
        return { success: true, user: user, needVerification: true }
      }

      // Simpan sesi
      App.store.set(SESSION_KEY, {
        userId: user.id,
        role: user.role,
        status: user.status,
        loginAt: new Date().toISOString(),
      })

      // Catat log aktivitas
      if (App.api && App.api.createLog) {
        App.api.createLog({
          userId: user.id,
          role: user.role,
          action: 'login',
          object: 'user',
          objectId: user.id,
          detail: user.nama + ' berhasil login.',
        })
      }

      return { success: true, user: user }
    },

    /**
     * Logout pengguna
     */
    logout: function () {
      var session = App.store.get(SESSION_KEY)
      if (session && App.api && App.api.createLog) {
        App.api.createLog({
          userId: session.userId,
          role: session.role,
          action: 'logout',
          object: 'user',
          objectId: session.userId,
          detail: 'Pengguna logout.',
        })
      }
      App.store.remove(SESSION_KEY)
      App.navigateTo(App.routes.auth.login)
    },

    /**
     * Register pengguna baru
     * @param {Object} data - { nim_nip, email, password, nama, prodi, role }
     * @returns {Object} { success, user?, error? }
     */
    register: function (data) {
      var users = App.store.get('users', [])

      // Cek duplikat NIM/NIP
      for (var i = 0; i < users.length; i++) {
        if (users[i].nim_nip === data.nim_nip) {
          return { success: false, error: 'NIM/NIP sudah terdaftar.' }
        }
        if (users[i].email === data.email) {
          return { success: false, error: 'Email sudah terdaftar.' }
        }
      }

      var newUser = {
        id: App.utils.uuid(),
        nim_nip: data.nim_nip,
        email: data.email,
        password: data.password,
        nama: data.nama,
        prodi: data.prodi,
        role: data.role || 'mahasiswa', // default mahasiswa
        status: App.config.ACCOUNT_STATUS.MENUNGGU_VERIFIKASI,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      App.store.set('users', users)

      // Notifikasi admin
      if (App.api && App.api.createNotification) {
        var admins = users.filter(function (u) { return u.role === 'admin' })
        admins.forEach(function (admin) {
          App.api.createNotification({
            userId: admin.id,
            type: 'akun_baru',
            title: 'Akun Baru Mendaftar',
            message: data.nama + ' (' + data.nim_nip + ') mendaftar sebagai ' + App.utils.roleLabel(data.role) + '.',
            link: App.routes.admin.manajemenAkun,
          })
        })
      }

      return { success: true, user: newUser }
    },

    /**
     * Ambil user yang sedang login
     * @returns {Object|null}
     */
    currentUser: function () {
      var session = App.store.get(SESSION_KEY)
      if (!session || !session.userId) return null
      return App.store.findById('users', session.userId)
    },

    /**
     * Ambil sesi aktif
     * @returns {Object|null}
     */
    getSession: function () {
      return App.store.get(SESSION_KEY)
    },

    /**
     * Cek apakah pengguna sudah login
     * @returns {boolean}
     */
    isLoggedIn: function () {
      return this.currentUser() !== null
    },

    /**
     * Cek apakah pengguna punya role tertentu
     * @param {string|string[]} roles
     * @returns {boolean}
     */
    hasRole: function (roles) {
      var user = this.currentUser()
      if (!user) return false
      if (typeof roles === 'string') roles = [roles]
      // Admin selalu lolos
      if (user.role === 'admin') return true
      return roles.indexOf(user.role) !== -1
    },

    /**
     * Cek permission tertentu
     * @param {string} permission - Key di App.config.PERMISSIONS
     * @returns {boolean}
     */
    hasPermission: function (permission) {
      var roles = App.config.PERMISSIONS[permission]
      if (!roles) return false
      return this.hasRole(roles)
    },

    /**
     * Update profil pengguna
     * @param {Object} updates
     * @returns {Object|null}
     */
    updateProfile: function (updates) {
      var user = this.currentUser()
      if (!user) return null
      return App.store.updateById('users', user.id, updates)
    },

    /**
     * Ganti password
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Object} { success, error? }
     */
    changePassword: function (oldPassword, newPassword) {
      var user = this.currentUser()
      if (!user) return { success: false, error: 'Tidak ada sesi aktif.' }
      if (user.password !== oldPassword) {
        return { success: false, error: 'Password lama salah.' }
      }
      App.store.updateById('users', user.id, { password: newPassword })
      return { success: true }
    },

    /**
     * Ambil redirect URL sesuai role
     * @param {string} role
     * @returns {string}
     */
    getDefaultRedirect: function (role) {
      switch (role) {
        case 'admin': return App.routes.admin.dashboard
        case 'dosen': return App.routes.dosen.dashboardPersetujuan
        case 'pj': return App.routes.pj.dashboardBooking
        default: return App.routes.public.landing
      }
    },
  }
})()
