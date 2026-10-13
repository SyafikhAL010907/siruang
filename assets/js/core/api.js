/**
 * api.js — Akses data lewat fungsi async (simulasi API)
 * Namespace: App.api
 * Semua fungsi mengembalikan Promise dengan delay simulasi.
 * Halaman TIDAK boleh membaca localStorage langsung.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  var api = {}

  // ====== ROOMS ======
  api.getRooms = function (filters) {
    return App.utils.apiDelay().then(function () {
      var rooms = App.store.get('rooms')
      if (!rooms || rooms.length === 0) {
        rooms = (App.data && App.data.rooms) ? App.data.rooms : []
      }
      if (filters) {
        if (filters.gedung) {
          rooms = rooms.filter(function (r) {
            return r.gedung === filters.gedung || (filters.gedung === 'LS' && r.gedung === 'SFD')
          })
        }
        if (filters.lantai) rooms = rooms.filter(function (r) { return parseInt(r.lantai) === parseInt(filters.lantai) })
        if (filters.status) rooms = rooms.filter(function (r) { return r.status !== 'nonaktif' || filters.status === 'nonaktif' })
      }
      return App.utils.deepClone(rooms)
    })
  }

  // ====== FLOORPLANS ======
  api.getFloorplans = function () {
    return App.utils.apiDelay().then(function () {
      var allFp = App.store.get('floorplans')
      if (!allFp || allFp.length === 0) {
        allFp = (App.data && App.data.floorplans) ? App.data.floorplans : []
      }
      return App.utils.deepClone(allFp)
    })
  }

  api.getFloorplan = function (gedung, lantai) {
    return App.utils.apiDelay().then(function () {
      var allFp = App.store.get('floorplans')
      if (!allFp || allFp.length === 0) {
        allFp = (App.data && App.data.floorplans) ? App.data.floorplans : []
      }
      var targetLantai = parseInt(lantai)
      var targetGedung = String(gedung || 'L').toUpperCase()

      var fp = allFp.find(function (p) {
        var matchGedung = (p.gedung === targetGedung) || (targetGedung === 'LS' && p.gedung === 'SFD')
        return matchGedung && parseInt(p.lantai) === targetLantai
      })

      // Fallback cadangan langsung ke raw data file
      if (!fp && App.data && App.data.floorplans) {
        fp = App.data.floorplans.find(function (p) {
          var matchGedung = (p.gedung === targetGedung) || (targetGedung === 'LS' && p.gedung === 'SFD')
          return matchGedung && parseInt(p.lantai) === targetLantai
        })
      }

      return fp ? App.utils.deepClone(fp) : null
    })
  }

  api.getRoomById = function (id) {
    return App.utils.apiDelay().then(function () {
      var room = App.store.findById('rooms', id)
      return room ? App.utils.deepClone(room) : null
    })
  }

  api.createRoom = function (data) {
    return App.utils.apiDelay().then(function () {
      var room = Object.assign({ id: App.utils.uuid(), createdAt: new Date().toISOString() }, data)
      App.store.addToList('rooms', room)
      return App.utils.deepClone(room)
    })
  }

  api.updateRoom = function (id, updates) {
    return App.utils.apiDelay().then(function () {
      updates.updatedAt = new Date().toISOString()
      return App.store.updateById('rooms', id, updates)
    })
  }

  api.deleteRoom = function (id) {
    return App.utils.apiDelay().then(function () {
      return App.store.deleteById('rooms', id)
    })
  }

  /**
   * Hitung status ruangan berdasarkan tanggal dan jam
   * @param {string} roomId
   * @param {string} tanggal - YYYY-MM-DD
   * @param {string} jamMulai - HH:mm
   * @param {string} jamSelesai - HH:mm
   * @returns {Promise<Object>} { status, sisaKapasitas, bookings }
   */
  api.getRoomStatus = function (roomId, tanggal, jamMulai, jamSelesai) {
    return App.utils.apiDelay().then(function () {
      var room = App.store.findById('rooms', roomId)
      if (!room) return { status: 'nonaktif', sisaKapasitas: 0, bookings: [] }
      if (room.statusAktif === false) return { status: 'nonaktif', sisaKapasitas: 0, bookings: [] }

      var bookings = App.store.get('bookings', [])
      var relevantBookings = bookings.filter(function (b) {
        if (b.ruanganId !== roomId) return false
        if (b.tanggal !== tanggal) return false
        if (b.status !== 'disetujui' && b.status !== 'menunggu') return false
        // Cek overlap waktu
        var bStart = App.utils.timeToMinutes(b.jamMulai)
        var bEnd = App.utils.timeToMinutes(b.jamSelesai)
        var qStart = App.utils.timeToMinutes(jamMulai || '00:00')
        var qEnd = App.utils.timeToMinutes(jamSelesai || '23:59')
        return bStart < qEnd && bEnd > qStart
      })

      var approvedBookings = relevantBookings.filter(function (b) { return b.status === 'disetujui' })
      var pendingBookings = relevantBookings.filter(function (b) { return b.status === 'menunggu' })

      var usedKelas = 0
      approvedBookings.forEach(function (b) { usedKelas += (b.jumlahKelas || 1) })

      var maxKapasitas = room.kapasitas || 1
      var sisaKapasitas = Math.max(0, maxKapasitas - usedKelas)

      var status = 'tersedia'
      if (sisaKapasitas === 0) {
        status = 'terpakai'
      } else if (usedKelas > 0 || pendingBookings.length > 0) {
        status = 'sebagian'
      }

      return {
        status: status,
        sisaKapasitas: sisaKapasitas,
        usedKelas: usedKelas,
        maxKapasitas: maxKapasitas,
        bookings: App.utils.deepClone(relevantBookings),
      }
    })
  }

  // ====== BOOKINGS ======
  api.getBookings = function (filters) {
    return App.utils.apiDelay().then(function () {
      var bookings = App.store.get('bookings', [])
      if (filters) {
        if (filters.userId) bookings = bookings.filter(function (b) { return b.userId === filters.userId })
        if (filters.dosenId) bookings = bookings.filter(function (b) { return b.dosenId === filters.dosenId })
        if (filters.status) bookings = bookings.filter(function (b) { return b.status === filters.status })
        if (filters.tanggal) bookings = bookings.filter(function (b) { return b.tanggal === filters.tanggal })
        if (filters.ruanganId) bookings = bookings.filter(function (b) { return b.ruanganId === filters.ruanganId })
      }
      // Urutkan terbaru
      bookings.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt) })
      return App.utils.deepClone(bookings)
    })
  }

  api.getBookingById = function (id) {
    return App.utils.apiDelay().then(function () {
      var booking = App.store.findById('bookings', id)
      return booking ? App.utils.deepClone(booking) : null
    })
  }

  api.createBooking = function (data) {
    return App.utils.apiDelay().then(function () {
      var booking = Object.assign({
        id: App.utils.uuid(),
        status: 'menunggu',
        createdAt: new Date().toISOString(),
      }, data)
      App.store.addToList('bookings', booking)
      return App.utils.deepClone(booking)
    })
  }

  api.updateBooking = function (id, updates) {
    return App.utils.apiDelay().then(function () {
      updates.updatedAt = new Date().toISOString()
      return App.store.updateById('bookings', id, updates)
    })
  }

  // 🆕 TAMBAHAN: Approve pengajuan booking dengan auto notifikasi & audit log
  api.approveBooking = function (id, processedById) {
    return App.utils.apiDelay().then(function () {
      var booking = App.store.findById('bookings', id)
      if (!booking) throw new Error('Booking tidak ditemukan')
      var now = new Date().toISOString()
      var updated = App.store.updateById('bookings', id, {
        status: 'disetujui',
        processedBy: processedById,
        processedAt: now,
        updatedAt: now,
      })
      // Notifikasi otomatis ke pemohon
      var room = App.store.findById('rooms', booking.ruanganId)
      var roomName = room ? room.kode : 'Ruangan'
      var processor = App.store.findById('users', processedById)
      var processorName = processor ? processor.nama : 'Dosen'
      api.createNotification({
        userId: booking.userId,
        title: 'Pengajuan Disetujui',
        message: 'Pengajuan ruangan ' + roomName + ' pada tanggal ' + App.utils.formatDate(booking.tanggal) + ' telah disetujui oleh ' + processorName + '.',
        link: App.routes.pj.detailBooking + '?id=' + id,
        type: 'success',
      })
      // Catat audit log
      api.createLog({
        userId: processedById,
        userName: processorName,
        role: processor ? processor.role : 'dosen',
        action: 'APPROVE_BOOKING',
        object: 'Booking #' + id,
        detail: 'Menyetujui reservasi ' + roomName + ' (' + booking.tanggal + ' ' + booking.jamMulai + '-' + booking.jamSelesai + ')',
      })
      return App.utils.deepClone(updated)
    })
  }

  // 🆕 TAMBAHAN: Reject pengajuan booking dengan auto notifikasi & audit log
  api.rejectBooking = function (id, processedById, alasanPenolakan) {
    return App.utils.apiDelay().then(function () {
      var booking = App.store.findById('bookings', id)
      if (!booking) throw new Error('Booking tidak ditemukan')
      var now = new Date().toISOString()
      var updated = App.store.updateById('bookings', id, {
        status: 'ditolak',
        alasanPenolakan: alasanPenolakan,
        processedBy: processedById,
        processedAt: now,
        updatedAt: now,
      })
      // Notifikasi otomatis ke pemohon
      var room = App.store.findById('rooms', booking.ruanganId)
      var roomName = room ? room.kode : 'Ruangan'
      var processor = App.store.findById('users', processedById)
      var processorName = processor ? processor.nama : 'Dosen'
      api.createNotification({
        userId: booking.userId,
        title: 'Pengajuan Ditolak',
        message: 'Pengajuan ruangan ' + roomName + ' ditolak oleh ' + processorName + '. Alasan: ' + alasanPenolakan,
        link: App.routes.pj.detailBooking + '?id=' + id,
        type: 'danger',
      })
      // Catat audit log
      api.createLog({
        userId: processedById,
        userName: processorName,
        role: processor ? processor.role : 'dosen',
        action: 'REJECT_BOOKING',
        object: 'Booking #' + id,
        detail: 'Menolak reservasi ' + roomName + '. Alasan: ' + alasanPenolakan,
      })
      return App.utils.deepClone(updated)
    })
  }

  // ====== USERS ======
  api.getUsers = function (filters) {
    return App.utils.apiDelay().then(function () {
      var users = App.store.get('users', [])
      if (filters) {
        if (filters.role) users = users.filter(function (u) { return u.role === filters.role })
        if (filters.status) users = users.filter(function (u) { return u.status === filters.status })
        if (filters.search) {
          var s = filters.search.toLowerCase()
          users = users.filter(function (u) {
            return u.nama.toLowerCase().indexOf(s) !== -1 ||
              u.nim_nip.toLowerCase().indexOf(s) !== -1 ||
              u.email.toLowerCase().indexOf(s) !== -1
          })
        }
      }
      // Hapus password dari response
      return users.map(function (u) {
        var copy = App.utils.deepClone(u)
        delete copy.password
        return copy
      })
    })
  }

  api.getUserById = function (id) {
    return App.utils.apiDelay().then(function () {
      var user = App.store.findById('users', id)
      if (!user) return null
      var copy = App.utils.deepClone(user)
      delete copy.password
      return copy
    })
  }

  api.updateUser = function (id, updates) {
    return App.utils.apiDelay().then(function () {
      updates.updatedAt = new Date().toISOString()
      return App.store.updateById('users', id, updates)
    })
  }

  // ====== COURSES ======
  api.getCourses = function (filters) {
    return App.utils.apiDelay().then(function () {
      var courses = App.store.get('courses', [])
      if (filters && filters.prodi) {
        courses = courses.filter(function (c) { return c.prodi === filters.prodi })
      }
      return App.utils.deepClone(courses)
    })
  }

  // ====== RELATIONS (Matkul-Dosen-PJ) ======
  api.getRelations = function (filters) {
    return App.utils.apiDelay().then(function () {
      var relations = App.store.get('relations', [])
      if (filters) {
        if (filters.dosenId) relations = relations.filter(function (r) { return r.dosenId === filters.dosenId })
        if (filters.pjId) relations = relations.filter(function (r) { return r.pjId === filters.pjId })
        if (filters.courseId) relations = relations.filter(function (r) { return r.courseId === filters.courseId })
        if (filters.status) relations = relations.filter(function (r) { return r.status === filters.status })
      }
      return App.utils.deepClone(relations)
    })
  }

  api.createRelation = function (data) {
    return App.utils.apiDelay().then(function () {
      var relation = Object.assign({ id: App.utils.uuid(), status: 'aktif', createdAt: new Date().toISOString() }, data)
      App.store.addToList('relations', relation)
      return App.utils.deepClone(relation)
    })
  }

  api.updateRelation = function (id, updates) {
    return App.utils.apiDelay().then(function () {
      return App.store.updateById('relations', id, updates)
    })
  }

  api.deleteRelation = function (id) {
    return App.utils.apiDelay().then(function () {
      return App.store.deleteById('relations', id)
    })
  }

  // ====== PRODI ======
  api.getProdi = function () {
    return App.utils.apiDelay().then(function () {
      return App.utils.deepClone(App.store.get('prodi', []))
    })
  }

  // ====== NOTIFICATIONS ======
  // 🆕 TAMBAHAN
  api.getNotifications = function (userId) {
    return App.utils.apiDelay().then(function () {
      var notifs = App.store.get('notifications', [])
      if (userId) {
        notifs = notifs.filter(function (n) { return n.userId === userId })
      }
      notifs.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt) })
      return App.utils.deepClone(notifs)
    })
  }

  api.getUnreadNotificationCount = function (userId) {
    return App.utils.apiDelay().then(function () {
      var notifs = App.store.get('notifications', [])
      return notifs.filter(function (n) {
        return n.userId === userId && !n.read
      }).length
    })
  }

  api.markNotificationRead = function (id) {
    return App.utils.apiDelay().then(function () {
      return App.store.updateById('notifications', id, { read: true })
    })
  }

  api.markAllNotificationsRead = function (userId) {
    return App.utils.apiDelay().then(function () {
      var notifs = App.store.get('notifications', [])
      notifs.forEach(function (n) {
        if (n.userId === userId) n.read = true
      })
      App.store.set('notifications', notifs)
      return true
    })
  }

  api.createNotification = function (data) {
    var notif = Object.assign({
      id: App.utils.uuid(),
      read: false,
      createdAt: new Date().toISOString(),
    }, data)
    App.store.addToList('notifications', notif)
    return notif
  }

  // ====== LOGS ======
  // 🆕 TAMBAHAN
  api.getLogs = function (filters) {
    return App.utils.apiDelay().then(function () {
      var logs = App.store.get('logs', [])
      if (filters) {
        if (filters.userId) logs = logs.filter(function (l) { return l.userId === filters.userId })
        if (filters.action) logs = logs.filter(function (l) { return l.action === filters.action })
      }
      logs.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt) })
      return App.utils.deepClone(logs)
    })
  }

  api.createLog = function (data) {
    var log = Object.assign({
      id: App.utils.uuid(),
      createdAt: new Date().toISOString(),
    }, data)
    App.store.addToList('logs', log)
    return log
  }

  // ====== BUILDINGS ======
  api.getBuildings = function () {
    return App.utils.apiDelay().then(function () {
      return App.utils.deepClone(App.store.get('buildings', []))
    })
  }

  // ====== FLOORPLANS ======
  api.getFloorplan = function (gedung, lantai) {
    return App.utils.apiDelay().then(function () {
      var plans = App.store.get('floorplans', [])
      var plan = plans.find(function (p) {
        return p.gedung === gedung && p.lantai === parseInt(lantai)
      })
      return plan ? App.utils.deepClone(plan) : null
    })
  }

  // ====== STATISTICS ======
  // 🆕 TAMBAHAN
  api.getStatistics = function () {
    return App.utils.apiDelay().then(function () {
      var bookings = App.store.get('bookings', [])
      var rooms = App.store.get('rooms', [])
      var users = App.store.get('users', [])
      var today = App.utils.todayISO()

      return {
        totalBookings: bookings.length,
        bookingHariIni: bookings.filter(function (b) { return b.tanggal === today }).length,
        bookingMenunggu: bookings.filter(function (b) { return b.status === 'menunggu' }).length,
        bookingDisetujui: bookings.filter(function (b) { return b.status === 'disetujui' }).length,
        bookingDitolak: bookings.filter(function (b) { return b.status === 'ditolak' }).length,
        bookingDibatalkan: bookings.filter(function (b) { return b.status === 'dibatalkan' }).length,
        bookingSelesai: bookings.filter(function (b) { return b.status === 'selesai' }).length,
        bookingFallback: bookings.filter(function (b) { return b.isFallback }).length,
        totalRuangan: rooms.length,
        ruanganAktif: rooms.filter(function (r) { return r.statusAktif !== false }).length,
        totalUsers: users.length,
        userMenungguVerifikasi: users.filter(function (u) { return u.status === 'menunggu_verifikasi' }).length,
      }
    })
  }

  window.App.api = api
})()
