/**
 * floorplans.js — Data denah lantai (koordinat ruangan untuk rendering)
 * Namespace: App.data.floorplans
 * Layout berbeda tiap lantai. Koordinat dalam grid (col, row, width, height).
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  window.App.data.floorplans = [
    // ===== GEDUNG L =====
    {
      gedung: 'L',
      lantai: 1,
      gridCols: 12,
      gridRows: 6,
      corridor: { orientation: 'horizontal', row: 3 },
      rooms: [
        { roomId: 'room-001', col: 0, row: 0, width: 4, height: 3, label: 'L.101' },
        { roomId: 'room-002', col: 4, row: 0, width: 4, height: 3, label: 'L.102' },
        { roomId: 'room-003', col: 8, row: 0, width: 4, height: 3, label: 'L.103' },
        { roomId: 'room-004', col: 0, row: 3, width: 5, height: 3, label: 'L.104' },
        { roomId: 'room-005', col: 5, row: 3, width: 3, height: 3, label: 'L.105' },
        { roomId: 'room-006', col: 8, row: 3, width: 4, height: 3, label: 'L.106' },
      ],
    },
    {
      gedung: 'L',
      lantai: 2,
      gridCols: 12,
      gridRows: 6,
      corridor: { orientation: 'horizontal', row: 3 },
      rooms: [
        { roomId: 'room-007', col: 0, row: 0, width: 3, height: 3, label: 'L.201' },
        { roomId: 'room-008', col: 3, row: 0, width: 3, height: 3, label: 'L.202' },
        { roomId: 'room-009', col: 6, row: 0, width: 6, height: 3, label: 'L.203' },
        { roomId: 'room-010', col: 0, row: 3, width: 4, height: 3, label: 'L.204' },
        { roomId: 'room-011', col: 4, row: 3, width: 4, height: 3, label: 'L.205' },
        { roomId: 'room-012', col: 8, row: 3, width: 4, height: 3, label: 'L.206' },
      ],
    },
    {
      gedung: 'L',
      lantai: 3,
      gridCols: 12,
      gridRows: 6,
      corridor: { orientation: 'horizontal', row: 3 },
      rooms: [
        { roomId: 'room-013', col: 0, row: 0, width: 6, height: 3, label: 'L.301' },
        { roomId: 'room-014', col: 6, row: 0, width: 6, height: 3, label: 'L.302' },
        { roomId: 'room-015', col: 0, row: 3, width: 3, height: 3, label: 'L.303' },
        { roomId: 'room-016', col: 3, row: 3, width: 3, height: 3, label: 'L.304' },
        { roomId: 'room-017', col: 6, row: 3, width: 3, height: 3, label: 'L.305' },
        { roomId: 'room-018', col: 9, row: 3, width: 3, height: 3, label: 'L.306' },
      ],
    },
    {
      gedung: 'L',
      lantai: 4,
      gridCols: 12,
      gridRows: 6,
      corridor: { orientation: 'horizontal', row: 3 },
      rooms: [
        { roomId: 'room-019', col: 0, row: 0, width: 8, height: 3, label: 'L.401' },
        { roomId: 'room-020', col: 8, row: 0, width: 4, height: 3, label: 'L.402' },
        { roomId: 'room-021', col: 0, row: 3, width: 3, height: 3, label: 'L.403' },
        { roomId: 'room-022', col: 3, row: 3, width: 3, height: 3, label: 'L.404' },
        { roomId: 'room-023', col: 6, row: 3, width: 3, height: 3, label: 'L.405' },
        { roomId: 'room-024', col: 9, row: 3, width: 3, height: 3, label: 'L.406' },
      ],
    },
    // ===== GEDUNG L (RUMPUN SIPIL) =====
    // Layout bervariasi tiap beberapa lantai
  ]

  // Generate floorplans Gedung L Sipil (lantai 1-4) dengan layout bervariasi
  var sipilLayouts = [
    // Layout A: 3 kolom atas, 3 bawah
    function (lantai, startId) {
      return [
        { roomId: 'room-' + String(startId).padStart(3, '0'), col: 0, row: 0, width: 4, height: 3, label: 'LS.' + lantai + '01' },
        { roomId: 'room-' + String(startId + 1).padStart(3, '0'), col: 4, row: 0, width: 4, height: 3, label: 'LS.' + lantai + '02' },
        { roomId: 'room-' + String(startId + 2).padStart(3, '0'), col: 8, row: 0, width: 4, height: 3, label: 'LS.' + lantai + '03' },
        { roomId: 'room-' + String(startId + 3).padStart(3, '0'), col: 0, row: 3, width: 5, height: 3, label: 'LS.' + lantai + '04' },
        { roomId: 'room-' + String(startId + 4).padStart(3, '0'), col: 5, row: 3, width: 4, height: 3, label: 'LS.' + lantai + '05' },
        { roomId: 'room-' + String(startId + 5).padStart(3, '0'), col: 9, row: 3, width: 3, height: 3, label: 'LS.' + lantai + '06' },
      ]
    },
    // Layout B: 2 besar atas, 4 kecil bawah
    function (lantai, startId) {
      return [
        { roomId: 'room-' + String(startId).padStart(3, '0'), col: 0, row: 0, width: 6, height: 3, label: 'LS.' + lantai + '01' },
        { roomId: 'room-' + String(startId + 1).padStart(3, '0'), col: 6, row: 0, width: 6, height: 3, label: 'LS.' + lantai + '02' },
        { roomId: 'room-' + String(startId + 2).padStart(3, '0'), col: 0, row: 3, width: 3, height: 3, label: 'LS.' + lantai + '03' },
        { roomId: 'room-' + String(startId + 3).padStart(3, '0'), col: 3, row: 3, width: 3, height: 3, label: 'LS.' + lantai + '04' },
        { roomId: 'room-' + String(startId + 4).padStart(3, '0'), col: 6, row: 3, width: 3, height: 3, label: 'LS.' + lantai + '05' },
        { roomId: 'room-' + String(startId + 5).padStart(3, '0'), col: 9, row: 3, width: 3, height: 3, label: 'LS.' + lantai + '06' },
      ]
    },
    // Layout C: L-shape mix
    function (lantai, startId) {
      return [
        { roomId: 'room-' + String(startId).padStart(3, '0'), col: 0, row: 0, width: 3, height: 3, label: 'LS.' + lantai + '01' },
        { roomId: 'room-' + String(startId + 1).padStart(3, '0'), col: 3, row: 0, width: 5, height: 3, label: 'LS.' + lantai + '02' },
        { roomId: 'room-' + String(startId + 2).padStart(3, '0'), col: 8, row: 0, width: 4, height: 3, label: 'LS.' + lantai + '03' },
        { roomId: 'room-' + String(startId + 3).padStart(3, '0'), col: 0, row: 3, width: 4, height: 3, label: 'LS.' + lantai + '04' },
        { roomId: 'room-' + String(startId + 4).padStart(3, '0'), col: 4, row: 3, width: 4, height: 3, label: 'LS.' + lantai + '05' },
        { roomId: 'room-' + String(startId + 5).padStart(3, '0'), col: 8, row: 3, width: 4, height: 3, label: 'LS.' + lantai + '06' },
      ]
    },
  ]

  // Gedung L Rumpun Sipil: 4 Lantai
  for (var lantai = 1; lantai <= 4; lantai++) {
    var startId = 24 + (lantai - 1) * 6 + 1 // room-025 dst
    var layoutFn = sipilLayouts[(lantai - 1) % sipilLayouts.length]
    window.App.data.floorplans.push({
      gedung: 'LS',
      lantai: lantai,
      gridCols: 12,
      gridRows: 6,
      corridor: { orientation: 'horizontal', row: 3 },
      rooms: layoutFn(lantai, startId),
    })
  }
})()
