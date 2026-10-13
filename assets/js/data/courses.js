/**
 * courses.js — Data mata kuliah
 * Namespace: App.data.courses
 * 6-8 mata kuliah dengan relasi prodi
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  window.App.data.courses = [
    {
      id: 'course-01',
      kode: 'TE201',
      nama: 'Rangkaian Listrik',
      prodi: 'prodi-01',
      sks: 3,
    },
    {
      id: 'course-02',
      kode: 'TE301',
      nama: 'Sistem Kendali',
      prodi: 'prodi-01',
      sks: 3,
    },
    {
      id: 'course-03',
      kode: 'TI201',
      nama: 'Pemrograman Web',
      prodi: 'prodi-02',
      sks: 3,
    },
    {
      id: 'course-04',
      kode: 'TI301',
      nama: 'Basis Data',
      prodi: 'prodi-02',
      sks: 3,
    },
    {
      id: 'course-05',
      kode: 'PTI201',
      nama: 'Media Pembelajaran',
      prodi: 'prodi-03',
      sks: 2,
    },
    {
      id: 'course-06',
      kode: 'PTE301',
      nama: 'Teknik Instalasi Listrik',
      prodi: 'prodi-04',
      sks: 3,
    },
    {
      id: 'course-07',
      kode: 'TI401',
      nama: 'Kecerdasan Buatan',
      prodi: 'prodi-02',
      sks: 3,
    },
    {
      id: 'course-08',
      kode: 'TE401',
      nama: 'Elektronika Daya',
      prodi: 'prodi-01',
      sks: 3,
    },
  ]
})()
