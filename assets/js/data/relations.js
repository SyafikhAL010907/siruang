/**
 * relations.js — Data relasi Mata Kuliah ↔ Dosen ↔ PJ
 * Namespace: App.data.relations
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  window.App.data.relations = [
    // Dosen Budi (usr-002) mengajar Rangkaian Listrik, PJ: Andi (usr-004)
    {
      id: 'rel-01',
      courseId: 'course-01',
      dosenId: 'usr-002',
      pjId: 'usr-004',
      status: 'aktif',
      createdAt: '2024-02-01T08:00:00.000Z',
    },
    // Dosen Budi (usr-002) mengajar Sistem Kendali, PJ: Andi (usr-004)
    {
      id: 'rel-02',
      courseId: 'course-02',
      dosenId: 'usr-002',
      pjId: 'usr-004',
      status: 'aktif',
      createdAt: '2024-02-01T08:00:00.000Z',
    },
    // Dosen Siti (usr-003) mengajar Pemrograman Web, PJ: Dewi (usr-005)
    {
      id: 'rel-03',
      courseId: 'course-03',
      dosenId: 'usr-003',
      pjId: 'usr-005',
      status: 'aktif',
      createdAt: '2024-02-01T08:00:00.000Z',
    },
    // Dosen Siti (usr-003) mengajar Basis Data, PJ: Dewi (usr-005)
    {
      id: 'rel-04',
      courseId: 'course-04',
      dosenId: 'usr-003',
      pjId: 'usr-005',
      status: 'aktif',
      createdAt: '2024-02-01T08:00:00.000Z',
    },
    // Dosen Budi (usr-002) mengajar Elektronika Daya, PJ: Andi (usr-004)
    {
      id: 'rel-05',
      courseId: 'course-08',
      dosenId: 'usr-002',
      pjId: 'usr-004',
      status: 'aktif',
      createdAt: '2024-02-15T08:00:00.000Z',
    },
    // Relasi nonaktif: Dosen Siti mengajar Kecerdasan Buatan
    {
      id: 'rel-06',
      courseId: 'course-07',
      dosenId: 'usr-003',
      pjId: 'usr-005',
      status: 'nonaktif',
      createdAt: '2024-01-15T08:00:00.000Z',
    },
  ]
})()
