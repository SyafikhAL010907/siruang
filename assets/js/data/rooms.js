/**
 * rooms.js — Data dummy ruangan
 * Namespace: App.data.rooms
 * Minimal 6 ruangan per lantai
 */
;(function () {
  'use strict'

  window.App = window.App || {}
  window.App.data = window.App.data || {}

  var rooms = []
  var roomId = 1

  // Helper buat ruangan
  function makeRoom(gedung, lantai, kode, nama, kapasitas, fasilitas, statusAktif) {
    return {
      id: 'room-' + String(roomId++).padStart(3, '0'),
      gedung: gedung,
      lantai: lantai,
      kode: kode,
      nama: nama,
      kapasitas: kapasitas, // 1, 2, atau 3 kelas
      fasilitas: fasilitas || [],
      statusAktif: statusAktif !== false, // default true
      createdAt: '2024-01-01T08:00:00.000Z',
    }
  }

  // ===== GEDUNG L =====
  // Lantai 1
  rooms.push(makeRoom('L', 1, 'L.101', 'Ruang 101', 1, ['Proyektor', 'AC', 'Whiteboard']))
  rooms.push(makeRoom('L', 1, 'L.102', 'Ruang 102', 2, ['Proyektor', 'AC', 'Whiteboard', 'Sound System']))
  rooms.push(makeRoom('L', 1, 'L.103', 'Ruang 103', 1, ['Proyektor', 'AC']))
  rooms.push(makeRoom('L', 1, 'L.104', 'Ruang 104', 3, ['Proyektor', 'AC', 'Whiteboard', 'Sound System', 'Mic']))
  rooms.push(makeRoom('L', 1, 'L.105', 'Ruang 105', 1, ['Proyektor', 'Whiteboard']))
  rooms.push(makeRoom('L', 1, 'L.106', 'Ruang 106', 2, ['Proyektor', 'AC', 'Whiteboard']))

  // Lantai 2
  rooms.push(makeRoom('L', 2, 'L.201', 'Ruang 201', 1, ['Proyektor', 'AC', 'Whiteboard']))
  rooms.push(makeRoom('L', 2, 'L.202', 'Ruang 202', 1, ['Proyektor', 'AC']))
  rooms.push(makeRoom('L', 2, 'L.203', 'Ruang 203', 2, ['Proyektor', 'AC', 'Whiteboard', 'Sound System']))
  rooms.push(makeRoom('L', 2, 'L.204', 'Ruang 204', 1, ['Proyektor', 'Whiteboard']))
  rooms.push(makeRoom('L', 2, 'L.205', 'Ruang 205', 3, ['Proyektor', 'AC', 'Whiteboard', 'Sound System', 'Mic']))
  rooms.push(makeRoom('L', 2, 'L.206', 'Ruang 206', 1, ['AC', 'Whiteboard']))

  // Lantai 3
  rooms.push(makeRoom('L', 3, 'L.301', 'Lab Komputer 1', 2, ['Proyektor', 'AC', 'Komputer', 'Whiteboard']))
  rooms.push(makeRoom('L', 3, 'L.302', 'Lab Komputer 2', 1, ['Proyektor', 'AC', 'Komputer']))
  rooms.push(makeRoom('L', 3, 'L.303', 'Ruang 303', 1, ['Proyektor', 'AC', 'Whiteboard']))
  rooms.push(makeRoom('L', 3, 'L.304', 'Ruang 304', 2, ['Proyektor', 'AC', 'Whiteboard']))
  rooms.push(makeRoom('L', 3, 'L.305', 'Ruang 305', 1, ['Proyektor', 'Whiteboard']))
  rooms.push(makeRoom('L', 3, 'L.306', 'Ruang 306', 1, ['AC', 'Whiteboard']))

  // Lantai 4
  rooms.push(makeRoom('L', 4, 'L.401', 'Ruang Seminar', 3, ['Proyektor', 'AC', 'Sound System', 'Mic', 'Whiteboard']))
  rooms.push(makeRoom('L', 4, 'L.402', 'Ruang 402', 1, ['Proyektor', 'AC', 'Whiteboard']))
  rooms.push(makeRoom('L', 4, 'L.403', 'Ruang 403', 1, ['Proyektor', 'AC']))
  rooms.push(makeRoom('L', 4, 'L.404', 'Ruang 404', 2, ['Proyektor', 'AC', 'Whiteboard']))
  rooms.push(makeRoom('L', 4, 'L.405', 'Ruang 405', 1, ['Whiteboard']))
  rooms.push(makeRoom('L', 4, 'L.406', 'Ruang 406', 1, ['Proyektor', 'AC', 'Whiteboard'], false)) // 🆕 TAMBAHAN: maintenance

  // ===== GEDUNG L (RUMPUN SIPIL) =====
  // 4 Lantai, masing-masing 6 ruangan (total 24 ruangan)
  var sipilFasilitas = [
    ['Proyektor', 'AC', 'Whiteboard'],
    ['Proyektor', 'AC', 'Whiteboard', 'Sound System'],
    ['Proyektor', 'AC'],
    ['Proyektor', 'AC', 'Whiteboard', 'Sound System', 'Mic'],
    ['Proyektor', 'Whiteboard'],
    ['AC', 'Whiteboard'],
  ]

  for (var lantai = 1; lantai <= 4; lantai++) {
    var kapasitasPerLantai = [1, 2, 1, 3, 1, 2]
    for (var r = 1; r <= 6; r++) {
      var kode = 'LS.' + lantai + '0' + r
      var nama = 'Ruang Sipil ' + lantai + '0' + r
      // Beri nama khusus untuk beberapa ruangan
      if (lantai === 1 && r === 1) nama = 'Aula Sipil'
      if (lantai === 2 && r === 1) nama = 'Lab Mekanika Tanah'
      if (lantai === 3 && r === 1) nama = 'Lab Struktur & Bahan'
      if (lantai === 4 && r === 1) nama = 'Ruang Seminar Sipil'

      var isActive = true
      // Ruangan maintenance contoh
      if (lantai === 3 && r === 6) isActive = false // 🆕 TAMBAHAN

      rooms.push(makeRoom('LS', lantai, kode, nama, kapasitasPerLantai[r - 1], sipilFasilitas[r - 1], isActive))
    }
  }

  window.App.data.rooms = rooms
})()
