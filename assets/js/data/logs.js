/**
 * logs.js — Data dummy log aktivitas (30+)
 * Namespace: App.data.logs
 * 🆕 TAMBAHAN
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  function dateOffset(days, hours, minutes) {
    var d = new Date()
    d.setDate(d.getDate() + days)
    if (hours !== undefined) d.setHours(hours, minutes || 0, 0, 0)
    return d.toISOString()
  }

  window.App.data.logs = [
    // Login
    { id: 'log-01', userId: 'usr-001', role: 'admin', action: 'login', object: 'user', objectId: 'usr-001', detail: 'Dr. Ahmad Fauzi login.', createdAt: dateOffset(0, 7, 30) },
    { id: 'log-02', userId: 'usr-002', role: 'dosen', action: 'login', object: 'user', objectId: 'usr-002', detail: 'Prof. Budi Santoso login.', createdAt: dateOffset(0, 7, 45) },
    { id: 'log-03', userId: 'usr-003', role: 'dosen', action: 'login', object: 'user', objectId: 'usr-003', detail: 'Dr. Siti Rahayu login.', createdAt: dateOffset(0, 8, 0) },
    { id: 'log-04', userId: 'usr-004', role: 'pj', action: 'login', object: 'user', objectId: 'usr-004', detail: 'Andi Pratama login.', createdAt: dateOffset(0, 6, 50) },
    { id: 'log-05', userId: 'usr-005', role: 'pj', action: 'login', object: 'user', objectId: 'usr-005', detail: 'Dewi Lestari login.', createdAt: dateOffset(0, 7, 0) },

    // Booking dibuat
    { id: 'log-06', userId: 'usr-004', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-006', detail: 'Andi Pratama membuat booking Rangkaian Listrik di L.201.', createdAt: dateOffset(0, 7, 5) },
    { id: 'log-07', userId: 'usr-005', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-007', detail: 'Dewi Lestari membuat booking UTS Pemrograman Web di L.104.', createdAt: dateOffset(0, 8, 5) },
    { id: 'log-08', userId: 'usr-004', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-008', detail: 'Andi Pratama membuat booking Seminar Sistem Kendali di L.401.', createdAt: dateOffset(0, 9, 10) },
    { id: 'log-09', userId: 'usr-005', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-009', detail: 'Dewi Lestari membuat booking Praktikum Basis Data di L.302.', createdAt: dateOffset(0, 10, 5) },
    { id: 'log-10', userId: 'usr-004', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-010', detail: 'Andi Pratama membuat booking Elektronika Daya di LS.101.', createdAt: dateOffset(0, 11, 15) },

    // ACC/Tolak
    { id: 'log-11', userId: 'usr-002', role: 'dosen', action: 'acc_booking', object: 'booking', objectId: 'book-001', detail: 'Prof. Budi menyetujui booking Rangkaian Listrik di L.101.', createdAt: dateOffset(-1, 14, 0) },
    { id: 'log-12', userId: 'usr-002', role: 'dosen', action: 'acc_booking', object: 'booking', objectId: 'book-002', detail: 'Prof. Budi menyetujui booking Sistem Kendali di L.102.', createdAt: dateOffset(-1, 14, 30) },
    { id: 'log-13', userId: 'usr-003', role: 'dosen', action: 'acc_booking', object: 'booking', objectId: 'book-003', detail: 'Dr. Siti menyetujui booking Pemrograman Web di L.103.', createdAt: dateOffset(-1, 10, 0) },
    { id: 'log-14', userId: 'usr-003', role: 'dosen', action: 'acc_booking', object: 'booking', objectId: 'book-004', detail: 'Dr. Siti menyetujui booking Basis Data di L.203.', createdAt: dateOffset(-1, 11, 0) },
    { id: 'log-15', userId: 'usr-002', role: 'dosen', action: 'tolak_booking', object: 'booking', objectId: 'book-011', detail: 'Prof. Budi menolak booking kelas tambahan. Alasan: Jadwal bentrok.', createdAt: dateOffset(-4, 16, 0) },
    { id: 'log-16', userId: 'usr-003', role: 'dosen', action: 'tolak_booking', object: 'booking', objectId: 'book-012', detail: 'Dr. Siti menolak booking kelas pengganti. Alasan: Ruangan sudah dialokasikan.', createdAt: dateOffset(-3, 10, 0) },
    { id: 'log-17', userId: 'usr-002', role: 'dosen', action: 'acc_booking', object: 'booking', objectId: 'book-019', detail: 'Prof. Budi menyetujui booking fallback Rangkaian Listrik di L.104.', createdAt: dateOffset(-1, 15, 0) },

    // Pembatalan
    { id: 'log-18', userId: 'usr-005', role: 'pj', action: 'batal_booking', object: 'booking', objectId: 'book-014', detail: 'Dewi Lestari membatalkan booking. Alasan: Dosen berhalangan.', createdAt: dateOffset(-2, 9, 0) },
    { id: 'log-19', userId: 'usr-004', role: 'pj', action: 'batal_booking', object: 'booking', objectId: 'book-015', detail: 'Andi Pratama membatalkan booking. Alasan: Jadwal berubah.', createdAt: dateOffset(-1, 7, 0) },

    // Reservasi paksa
    { id: 'log-20', userId: 'usr-001', role: 'admin', action: 'reservasi_paksa', object: 'booking', objectId: 'book-026', detail: 'Admin membuat reservasi paksa untuk rapat darurat dekanat di L.101.', createdAt: dateOffset(0, 15, 0) },

    // CRUD Ruangan
    { id: 'log-21', userId: 'usr-001', role: 'admin', action: 'nonaktifkan_ruangan', object: 'room', objectId: 'room-024', detail: 'Admin menonaktifkan ruangan L.406 untuk maintenance.', createdAt: dateOffset(-10, 9, 0) },

    // Manajemen akun
    { id: 'log-22', userId: 'usr-001', role: 'admin', action: 'verifikasi_akun', object: 'user', objectId: 'usr-006', detail: 'Admin memverifikasi akun Rizki Aditya.', createdAt: dateOffset(-20, 8, 30) },
    { id: 'log-23', userId: 'usr-001', role: 'admin', action: 'verifikasi_akun', object: 'user', objectId: 'usr-007', detail: 'Admin memverifikasi akun Putri Amanda.', createdAt: dateOffset(-20, 8, 35) },
    { id: 'log-24', userId: 'usr-001', role: 'admin', action: 'verifikasi_akun', object: 'user', objectId: 'usr-008', detail: 'Admin memverifikasi akun Fajar Hidayat.', createdAt: dateOffset(-15, 9, 0) },
    { id: 'log-25', userId: 'usr-001', role: 'admin', action: 'ubah_role', object: 'user', objectId: 'usr-004', detail: 'Admin mengubah role Andi Pratama dari Mahasiswa ke PJ.', createdAt: dateOffset(-30, 9, 0) },
    { id: 'log-26', userId: 'usr-001', role: 'admin', action: 'ubah_role', object: 'user', objectId: 'usr-005', detail: 'Admin mengubah role Dewi Lestari dari Mahasiswa ke PJ.', createdAt: dateOffset(-30, 9, 5) },
    { id: 'log-27', userId: 'usr-001', role: 'admin', action: 'nonaktifkan_akun', object: 'user', objectId: 'usr-010', detail: 'Admin menonaktifkan akun Galih Prakosa.', createdAt: dateOffset(-25, 10, 0) },

    // Login lama
    { id: 'log-28', userId: 'usr-006', role: 'mahasiswa', action: 'login', object: 'user', objectId: 'usr-006', detail: 'Rizki Aditya login.', createdAt: dateOffset(-1, 8, 0) },
    { id: 'log-29', userId: 'usr-007', role: 'mahasiswa', action: 'login', object: 'user', objectId: 'usr-007', detail: 'Putri Amanda login.', createdAt: dateOffset(-2, 9, 0) },
    { id: 'log-30', userId: 'usr-008', role: 'mahasiswa', action: 'login', object: 'user', objectId: 'usr-008', detail: 'Fajar Hidayat login.', createdAt: dateOffset(-3, 7, 30) },

    // Logout
    { id: 'log-31', userId: 'usr-004', role: 'pj', action: 'logout', object: 'user', objectId: 'usr-004', detail: 'Andi Pratama logout.', createdAt: dateOffset(-1, 17, 0) },
    { id: 'log-32', userId: 'usr-005', role: 'pj', action: 'logout', object: 'user', objectId: 'usr-005', detail: 'Dewi Lestari logout.', createdAt: dateOffset(-1, 16, 30) },

    // Booking lama
    { id: 'log-33', userId: 'usr-004', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-001', detail: 'Andi Pratama membuat booking Rangkaian Listrik di L.101.', createdAt: dateOffset(-2, 9, 0) },
    { id: 'log-34', userId: 'usr-004', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-002', detail: 'Andi Pratama membuat booking Sistem Kendali di L.102.', createdAt: dateOffset(-2, 9, 30) },
    { id: 'log-35', userId: 'usr-005', role: 'pj', action: 'buat_booking', object: 'booking', objectId: 'book-003', detail: 'Dewi Lestari membuat booking Pemrograman Web di L.103.', createdAt: dateOffset(-3, 8, 0) },
  ]
})()
