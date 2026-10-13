/**
 * notifications.js — Data dummy notifikasi (15+)
 * Namespace: App.data.notifications
 * 🆕 TAMBAHAN
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  function dateOffset(days, hours) {
    var d = new Date()
    d.setDate(d.getDate() + days)
    if (hours) d.setHours(hours, 0, 0, 0)
    return d.toISOString()
  }

  window.App.data.notifications = [
    // Notifikasi untuk admin (usr-001)
    {
      id: 'notif-01',
      userId: 'usr-001',
      type: 'akun_baru',
      title: 'Akun Baru Mendaftar',
      message: 'Nina Sari (2234567893) mendaftar sebagai Mahasiswa dan menunggu verifikasi.',
      link: null,
      read: false,
      createdAt: dateOffset(0, 9),
    },
    {
      id: 'notif-02',
      userId: 'usr-001',
      type: 'fallback',
      title: 'Pemborosan Ruangan Terdeteksi',
      message: 'Booking #book-019 menggunakan ruangan L.104 (kapasitas 3) untuk 1 kelas.',
      link: null,
      read: false,
      createdAt: dateOffset(-1, 15),
    },
    {
      id: 'notif-03',
      userId: 'usr-001',
      type: 'fallback',
      title: 'Pemborosan Ruangan Terdeteksi',
      message: 'Booking #book-021 mengajukan L.205 (kapasitas 3) untuk 1 kelas.',
      link: null,
      read: true,
      createdAt: dateOffset(0, 12),
    },
    {
      id: 'notif-04',
      userId: 'usr-001',
      type: 'booking_baru',
      title: 'Booking Baru',
      message: 'Andi Pratama mengajukan booking untuk Rangkaian Listrik.',
      link: null,
      read: true,
      createdAt: dateOffset(0, 7),
    },

    // Notifikasi untuk dosen Budi (usr-002)
    {
      id: 'notif-05',
      userId: 'usr-002',
      type: 'pengajuan_baru',
      title: 'Pengajuan Baru Menunggu ACC',
      message: 'Andi Pratama mengajukan booking Rangkaian Listrik di L.201 tanggal ' + new Date(Date.now() + 2*86400000).toLocaleDateString('id-ID') + '.',
      link: null,
      read: false,
      createdAt: dateOffset(0, 7),
    },
    {
      id: 'notif-06',
      userId: 'usr-002',
      type: 'pengajuan_baru',
      title: 'Pengajuan Baru Menunggu ACC',
      message: 'Andi Pratama mengajukan booking Sistem Kendali di L.401 (Seminar).',
      link: null,
      read: false,
      createdAt: dateOffset(0, 9),
    },
    {
      id: 'notif-07',
      userId: 'usr-002',
      type: 'pengajuan_baru',
      title: 'Pengajuan Baru Menunggu ACC',
      message: 'Andi Pratama mengajukan booking Elektronika Daya (fallback ruangan).',
      link: null,
      read: false,
      createdAt: dateOffset(0, 12),
    },

    // Notifikasi untuk dosen Siti (usr-003)
    {
      id: 'notif-08',
      userId: 'usr-003',
      type: 'pengajuan_baru',
      title: 'Pengajuan Baru Menunggu ACC',
      message: 'Dewi Lestari mengajukan booking UTS Pemrograman Web di L.104.',
      link: null,
      read: false,
      createdAt: dateOffset(0, 8),
    },
    {
      id: 'notif-09',
      userId: 'usr-003',
      type: 'pengajuan_baru',
      title: 'Pengajuan Baru Menunggu ACC',
      message: 'Dewi Lestari mengajukan booking Basis Data di Lab Komputer 2.',
      link: null,
      read: true,
      createdAt: dateOffset(0, 10),
    },

    // Notifikasi untuk PJ Andi (usr-004)
    {
      id: 'notif-10',
      userId: 'usr-004',
      type: 'booking_disetujui',
      title: 'Booking Disetujui',
      message: 'Booking Rangkaian Listrik di L.101 telah disetujui oleh Prof. Budi.',
      link: null,
      read: true,
      createdAt: dateOffset(-1, 14),
    },
    {
      id: 'notif-11',
      userId: 'usr-004',
      type: 'booking_disetujui',
      title: 'Booking Disetujui',
      message: 'Booking Sistem Kendali di L.102 telah disetujui.',
      link: null,
      read: true,
      createdAt: dateOffset(-1, 14),
    },
    {
      id: 'notif-12',
      userId: 'usr-004',
      type: 'booking_ditolak',
      title: 'Booking Ditolak',
      message: 'Booking kelas tambahan di L.101 ditolak. Alasan: Jadwal bentrok dengan kegiatan fakultas.',
      link: null,
      read: false,
      createdAt: dateOffset(-4, 16),
    },
    {
      id: 'notif-13',
      userId: 'usr-004',
      type: 'booking_disetujui',
      title: 'Booking Disetujui (Fallback)',
      message: 'Booking Rangkaian Listrik disetujui di L.104 (fallback - kapasitas lebih besar dari kebutuhan).',
      link: null,
      read: false,
      createdAt: dateOffset(-1, 15),
    },

    // Notifikasi untuk PJ Dewi (usr-005)
    {
      id: 'notif-14',
      userId: 'usr-005',
      type: 'booking_disetujui',
      title: 'Booking Disetujui',
      message: 'Booking Pemrograman Web di L.103 telah disetujui oleh Dr. Siti.',
      link: null,
      read: true,
      createdAt: dateOffset(-1, 10),
    },
    {
      id: 'notif-15',
      userId: 'usr-005',
      type: 'booking_ditolak',
      title: 'Booking Ditolak',
      message: 'Booking kelas pengganti di L.106 ditolak. Alasan: Ruangan sudah dialokasikan.',
      link: null,
      read: false,
      createdAt: dateOffset(-3, 10),
    },
    {
      id: 'notif-16',
      userId: 'usr-005',
      type: 'perubahan_role',
      title: 'Role Diubah',
      message: 'Role Anda telah diubah menjadi Penanggung Jawab (PJ) oleh Admin.',
      link: null,
      read: true,
      createdAt: dateOffset(-30, 9),
    },

    // Notifikasi untuk mahasiswa
    {
      id: 'notif-17',
      userId: 'usr-006',
      type: 'info',
      title: 'Selamat Datang',
      message: 'Selamat datang di Sistem Reservasi Ruangan UNJ. Akun Anda telah diverifikasi.',
      link: null,
      read: true,
      createdAt: dateOffset(-20, 8),
    },
  ]
})()
