/**
 * users.js — Data dummy pengguna
 * Namespace: App.data.users
 * Kredensial demo: lihat README.md
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  window.App.data.users = [
    // Admin
    {
      id: 'usr-001',
      nim_nip: '198501012010011001',
      email: 'admin@unj.ac.id',
      password: 'admin123',
      nama: 'Dr. Ahmad Fauzi, M.T.',
      prodi: 'prodi-01',
      role: 'admin',
      status: 'aktif',
      createdAt: '2024-01-01T08:00:00.000Z',
    },
    // Dosen 1
    {
      id: 'usr-002',
      nim_nip: '197903152005011002',
      email: 'budi.santoso@unj.ac.id',
      password: 'dosen123',
      nama: 'Prof. Budi Santoso, M.Sc.',
      prodi: 'prodi-01',
      role: 'dosen',
      status: 'aktif',
      createdAt: '2024-01-05T08:00:00.000Z',
    },
    // Dosen 2
    {
      id: 'usr-003',
      nim_nip: '198207202008012003',
      email: 'siti.rahayu@unj.ac.id',
      password: 'dosen123',
      nama: 'Dr. Siti Rahayu, M.Pd.',
      prodi: 'prodi-02',
      role: 'dosen',
      status: 'aktif',
      createdAt: '2024-01-05T08:00:00.000Z',
    },
    // PJ 1
    {
      id: 'usr-004',
      nim_nip: '1234567890',
      email: 'andi.pratama@mhs.unj.ac.id',
      password: 'pj123',
      nama: 'Andi Pratama',
      prodi: 'prodi-01',
      role: 'pj',
      status: 'aktif',
      createdAt: '2024-02-01T08:00:00.000Z',
    },
    // PJ 2
    {
      id: 'usr-005',
      nim_nip: '1234567891',
      email: 'dewi.lestari@mhs.unj.ac.id',
      password: 'pj123',
      nama: 'Dewi Lestari',
      prodi: 'prodi-02',
      role: 'pj',
      status: 'aktif',
      createdAt: '2024-02-01T08:00:00.000Z',
    },
    // Mahasiswa 1
    {
      id: 'usr-006',
      nim_nip: '2234567890',
      email: 'rizki.aditya@mhs.unj.ac.id',
      password: 'mhs123',
      nama: 'Rizki Aditya',
      prodi: 'prodi-01',
      role: 'mahasiswa',
      status: 'aktif',
      createdAt: '2024-02-10T08:00:00.000Z',
    },
    // Mahasiswa 2
    {
      id: 'usr-007',
      nim_nip: '2234567891',
      email: 'putri.amanda@mhs.unj.ac.id',
      password: 'mhs123',
      nama: 'Putri Amanda',
      prodi: 'prodi-03',
      role: 'mahasiswa',
      status: 'aktif',
      createdAt: '2024-02-10T08:00:00.000Z',
    },
    // Mahasiswa 3
    {
      id: 'usr-008',
      nim_nip: '2234567892',
      email: 'fajar.hidayat@mhs.unj.ac.id',
      password: 'mhs123',
      nama: 'Fajar Hidayat',
      prodi: 'prodi-02',
      role: 'mahasiswa',
      status: 'aktif',
      createdAt: '2024-02-15T08:00:00.000Z',
    },
    // Akun menunggu verifikasi
    {
      id: 'usr-009',
      nim_nip: '2234567893',
      email: 'nina.sari@mhs.unj.ac.id',
      password: 'mhs123',
      nama: 'Nina Sari',
      prodi: 'prodi-01',
      role: 'mahasiswa',
      status: 'menunggu_verifikasi',
      createdAt: '2024-03-01T08:00:00.000Z',
    },
    // Akun nonaktif
    {
      id: 'usr-010',
      nim_nip: '2234567894',
      email: 'galih.prakosa@mhs.unj.ac.id',
      password: 'mhs123',
      nama: 'Galih Prakosa',
      prodi: 'prodi-03',
      role: 'mahasiswa',
      status: 'nonaktif',
      createdAt: '2024-01-20T08:00:00.000Z',
    },
  ]
})()
