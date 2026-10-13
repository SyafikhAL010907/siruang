/**
 * utils.js — Fungsi utilitas bersama
 * Namespace: App.utils
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  window.App.utils = {
    /**
     * Buat UUID v4 sederhana
     */
    uuid: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0
        var v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },

    /**
     * Format tanggal ke "DD MMM YYYY"
     * @param {string|Date} date
     * @returns {string}
     */
    formatDate: function (date) {
      if (!date) return '-'
      var d = new Date(date)
      if (isNaN(d.getTime())) return '-'
      var bulan = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
      ]
      return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear()
    },

    /**
     * Format tanggal lengkap ke "DD MMM YYYY, HH:mm"
     * @param {string|Date} date
     * @returns {string}
     */
    formatDateTime: function (date) {
      if (!date) return '-'
      var d = new Date(date)
      if (isNaN(d.getTime())) return '-'
      var jam = String(d.getHours()).padStart(2, '0')
      var menit = String(d.getMinutes()).padStart(2, '0')
      return this.formatDate(date) + ', ' + jam + ':' + menit
    },

    /**
     * Format jam ke "HH:mm"
     * @param {number} jam - Jam (0-23)
     * @param {number} [menit=0] - Menit
     * @returns {string}
     */
    formatJam: function (jam, menit) {
      return String(jam).padStart(2, '0') + ':' + String(menit || 0).padStart(2, '0')
    },

    /**
     * Ambil tanggal hari ini (YYYY-MM-DD)
     * @returns {string}
     */
    todayISO: function () {
      var d = new Date()
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    },

    /**
     * Ambil jam sekarang (bulat ke bawah)
     * @returns {number}
     */
    currentHour: function () {
      return new Date().getHours()
    },

    /**
     * Ambil query parameter dari URL
     * @param {string} name
     * @returns {string|null}
     */
    getQueryParam: function (name) {
      var params = new URLSearchParams(window.location.search)
      return params.get(name)
    },

    /**
     * Debounce fungsi
     * @param {Function} fn
     * @param {number} delay
     * @returns {Function}
     */
    debounce: function (fn, delay) {
      var timer
      return function () {
        var context = this
        var args = arguments
        clearTimeout(timer)
        timer = setTimeout(function () {
          fn.apply(context, args)
        }, delay)
      }
    },

    /**
     * Deep clone objek sederhana (JSON-safe)
     * @param {*} obj
     * @returns {*}
     */
    deepClone: function (obj) {
      return JSON.parse(JSON.stringify(obj))
    },

    /**
     * Cek apakah string kosong atau hanya whitespace
     * @param {string} str
     * @returns {boolean}
     */
    isEmpty: function (str) {
      return !str || String(str).trim().length === 0
    },

    /**
     * Kapitalisasi huruf pertama
     * @param {string} str
     * @returns {string}
     */
    capitalize: function (str) {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    },

    /**
     * Delay async (Promise)
     * @param {number} ms
     * @returns {Promise}
     */
    delay: function (ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms)
      })
    },

    /**
     * Random delay API simulasi
     * @returns {Promise}
     */
    apiDelay: function () {
      var min = App.config.API_DELAY_MIN || 200
      var max = App.config.API_DELAY_MAX || 400
      var ms = Math.floor(Math.random() * (max - min + 1)) + min
      return this.delay(ms)
    },

    /**
     * Validasi email sederhana
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail: function (email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },

    /**
     * Hitung kekuatan password (0-4)
     * @param {string} password
     * @returns {number}
     */
    passwordStrength: function (password) {
      if (!password) return 0
      var score = 0
      if (password.length >= 6) score++
      if (password.length >= 10) score++
      if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
      if (/\d/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++
      return Math.min(score, 4)
    },

    /**
     * Label kekuatan password
     * @param {number} strength
     * @returns {string}
     */
    passwordStrengthLabel: function (strength) {
      var labels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat']
      return labels[strength] || labels[0]
    },

    /**
     * Label status booking
     * @param {string} status
     * @returns {string}
     */
    bookingStatusLabel: function (status) {
      var map = {
        menunggu: 'Menunggu',
        disetujui: 'Disetujui',
        ditolak: 'Ditolak',
        dibatalkan: 'Dibatalkan',
        selesai: 'Selesai',
      }
      return map[status] || status
    },

    /**
     * Kelas badge berdasarkan status booking
     * @param {string} status
     * @returns {string}
     */
    bookingStatusBadge: function (status) {
      var map = {
        menunggu: 'badge-warning',
        disetujui: 'badge-success',
        ditolak: 'badge-danger',
        dibatalkan: 'badge-neutral',
        selesai: 'badge-info',
      }
      return 'badge ' + (map[status] || 'badge-neutral')
    },

    /**
     * Label status ruangan
     * @param {string} status
     * @returns {string}
     */
    roomStatusLabel: function (status) {
      var map = {
        tersedia: '🟢 Tersedia',
        sebagian: '🟡 Sebagian Terisi',
        terpakai: '🔴 Terpakai',
        nonaktif: '⚫ Nonaktif',
      }
      return map[status] || status
    },

    /**
     * Label status akun
     * @param {string} status
     * @returns {string}
     */
    accountStatusLabel: function (status) {
      var map = {
        aktif: 'Aktif',
        menunggu_verifikasi: 'Menunggu Verifikasi',
        nonaktif: 'Nonaktif',
      }
      return map[status] || status
    },

    /**
     * Label role
     * @param {string} role
     * @returns {string}
     */
    roleLabel: function (role) {
      var map = {
        admin: 'Admin',
        dosen: 'Dosen',
        pj: 'Penanggung Jawab (PJ)',
        mahasiswa: 'Mahasiswa',
        guest: 'Tamu',
      }
      return map[role] || role
    },

    /**
     * Buat slot waktu dari jam buka hingga jam tutup
     * @returns {Array<string>} Array slot waktu
     */
    generateTimeSlots: function () {
      var rules = App.config.BOOKING_RULES
      var slots = []
      for (var h = rules.JAM_BUKA; h < rules.JAM_TUTUP; h++) {
        for (var m = 0; m < 60; m += rules.SLOT_MENIT) {
          slots.push(this.formatJam(h, m))
        }
      }
      // Tambah slot akhir
      slots.push(this.formatJam(rules.JAM_TUTUP, 0))
      return slots
    },

    /**
     * Konversi waktu string ke menit
     * @param {string} time "HH:mm"
     * @returns {number}
     */
    timeToMinutes: function (time) {
      var parts = time.split(':')
      return parseInt(parts[0]) * 60 + parseInt(parts[1])
    },

    /**
     * Escape HTML
     * @param {string} str
     * @returns {string}
     */
    escapeHtml: function (str) {
      if (!str) return ''
      var div = document.createElement('div')
      div.appendChild(document.createTextNode(str))
      return div.innerHTML
    },

    /**
     * Export data ke CSV (client-side)
     * @param {Array<Object>} data
     * @param {Array<string>} headers
     * @param {string} filename
     */
    exportCSV: function (data, headers, filename) {
      var csv = headers.join(',') + '\n'
      data.forEach(function (row) {
        var line = headers.map(function (h) {
          var val = row[h] !== undefined ? String(row[h]) : ''
          // Escape koma dan kutip
          if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1) {
            val = '"' + val.replace(/"/g, '""') + '"'
          }
          return val
        })
        csv += line.join(',') + '\n'
      })

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      var url = URL.createObjectURL(blob)
      var link = document.createElement('a')
      link.href = url
      link.download = filename || 'export.csv'
      link.click()
      URL.revokeObjectURL(url)
    },
  }
})()
