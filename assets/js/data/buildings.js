/**
 * buildings.js — Data gedung
 * Namespace: App.data.buildings
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  window.App.data.buildings = [
    {
      id: 'gedung-L',
      code: 'L',
      name: 'Gedung L (Rumpun Elektro)',
      floors: 4,
      description: 'Gedung perkuliahan Rumpun Teknik Elektro Fakultas Teknik, 4 lantai.',
      totalRooms: 24,
    },
    {
      id: 'gedung-LS',
      code: 'LS',
      name: 'Gedung L (Rumpun Sipil)',
      floors: 4,
      description: 'Gedung perkuliahan Rumpun Teknik Sipil Fakultas Teknik, 4 lantai.',
      totalRooms: 24,
    },
  ]
})()
