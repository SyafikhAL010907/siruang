/**
 * store.js — Wrapper localStorage + seeding data dummy
 * Namespace: App.store
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  var STORE_PREFIX = 'rrUnj_'
  var SEEDED_KEY = STORE_PREFIX + 'seeded'

  var VERSION_KEY = STORE_PREFIX + 'version'
  var CURRENT_VERSION = '2.0.0' // Versi gedung 4 lantai (Elektro & Sipil)

  window.App.store = {
    /**
     * Simpan data ke localStorage
     * @param {string} key
     * @param {*} value
     */
    set: function (key, value) {
      try {
        localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value))
      } catch (e) {
        console.error('Store.set error:', e)
      }
    },

    /**
     * Ambil data dari localStorage
     * @param {string} key
     * @param {*} [fallback] - Nilai default
     * @returns {*}
     */
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(STORE_PREFIX + key)
        if (raw === null) return fallback !== undefined ? fallback : null
        return JSON.parse(raw)
      } catch (e) {
        console.error('Store.get error:', e)
        return fallback !== undefined ? fallback : null
      }
    },

    /**
     * Hapus data
     * @param {string} key
     */
    remove: function (key) {
      localStorage.removeItem(STORE_PREFIX + key)
    },

    /**
     * Cek apakah key ada
     * @param {string} key
     * @returns {boolean}
     */
    has: function (key) {
      return localStorage.getItem(STORE_PREFIX + key) !== null
    },

    /**
     * Seed data dummy saat pertama kali dibuka atau bila ada update skema gedung
     */
    seed: function () {
      var savedVersion = localStorage.getItem(VERSION_KEY)
      var isAlreadySeeded = localStorage.getItem(SEEDED_KEY)

      // Jika versi sudah mutakhir, lakukan migrasi cepat jika ada data lama SFD
      if (isAlreadySeeded && savedVersion === CURRENT_VERSION) {
        return
      }

      // Auto-update / reseed data spasial jika ada perubahan versi gedung
      if (window.App.data) {
        if (App.data.buildings) this.set('buildings', App.data.buildings)
        if (App.data.rooms) this.set('rooms', App.data.rooms)
        if (App.data.floorplans) this.set('floorplans', App.data.floorplans)

        // Seed entitas lain bila belum pernah di-seed
        if (!isAlreadySeeded) {
          if (App.data.users) this.set('users', App.data.users)
          if (App.data.prodi) this.set('prodi', App.data.prodi)
          if (App.data.courses) this.set('courses', App.data.courses)
          if (App.data.relations) this.set('relations', App.data.relations)
          if (App.data.bookings) this.set('bookings', App.data.bookings)
          if (App.data.notifications) this.set('notifications', App.data.notifications)
          if (App.data.logs) this.set('logs', App.data.logs)
        }
      }

      localStorage.setItem(SEEDED_KEY, 'true')
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      console.log('✅ Data dummy & denah gedung v' + CURRENT_VERSION + ' berhasil di-seed ke localStorage')
    },

    /**
     * Reset data demo (kembali ke data awal)
     */
    reset: function () {
      // Hapus semua data dengan prefix
      var keysToRemove = []
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i)
        if (key && key.indexOf(STORE_PREFIX) === 0) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(function (k) {
        localStorage.removeItem(k)
      })
      localStorage.removeItem(SEEDED_KEY)
      console.log('🔄 Data demo di-reset')
      // Re-seed
      this.seed()
    },

    /**
     * Update item dalam array berdasarkan ID
     * @param {string} key - Key localStorage
     * @param {string} id - ID item
     * @param {Object} updates - Object perubahan
     * @returns {Object|null}
     */
    updateById: function (key, id, updates) {
      var items = this.get(key, [])
      var found = null
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          Object.assign(items[i], updates)
          found = items[i]
          break
        }
      }
      if (found) this.set(key, items)
      return found
    },

    /**
     * Hapus item dari array berdasarkan ID
     * @param {string} key
     * @param {string} id
     * @returns {boolean}
     */
    deleteById: function (key, id) {
      var items = this.get(key, [])
      var newItems = items.filter(function (item) { return item.id !== id })
      if (newItems.length !== items.length) {
        this.set(key, newItems)
        return true
      }
      return false
    },

    /**
     * Tambah item ke array
     * @param {string} key
     * @param {Object} item
     */
    addToList: function (key, item) {
      var items = this.get(key, [])
      items.push(item)
      this.set(key, items)
    },

    /**
     * Cari item berdasarkan ID
     * @param {string} key
     * @param {string} id
     * @returns {Object|null}
     */
    findById: function (key, id) {
      var items = this.get(key, [])
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) return items[i]
      }
      return null
    },
  }
})()
