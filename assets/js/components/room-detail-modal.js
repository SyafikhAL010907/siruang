/**
 * room-detail-modal.js — Komponen Modal Detail Ruangan (Item #6)
 * Namespace: App.roomDetailModalComponent
 * Menampilkan detail ruangan, kapasitas kelas, fasilitas, status pada waktu terpilih,
 * info perkuliahan jika terpakai, dan tombol booking sesuai hak akses role.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  window.App.roomDetailModalComponent = {
    name: 'room-detail-modal',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      room: {
        type: Object,
        default: null,
      },
      statusData: {
        type: Object,
        default: function () {
          return { status: 'tersedia', sisaKapasitas: 1, maxKapasitas: 1, bookings: [] }
        },
      },
      tanggal: {
        type: String,
        default: '',
      },
      jamMulai: {
        type: String,
        default: '08:00',
      },
      jamSelesai: {
        type: String,
        default: '10:00',
      },
    },
    emits: ['close'],
    data: function () {
      return {
        routes: App.routes,
      }
    },
    computed: {
      currentUser: function () {
        return App.auth ? App.auth.currentUser() : null
      },
      canBook: function () {
        if (!this.currentUser) return false
        // Sesuai tabel bagian 3: PJ dan Admin berhak booking
        return this.currentUser.role === 'pj' || this.currentUser.role === 'admin'
      },
      statusBadgeClass: function () {
        var s = this.statusData ? this.statusData.status : 'tersedia'
        if (s === 'tersedia') return 'badge-success'
        if (s === 'sebagian') return 'badge-warning'
        if (s === 'terpakai') return 'badge-danger'
        return 'badge-neutral'
      },
      statusText: function () {
        var s = this.statusData ? this.statusData.status : 'tersedia'
        if (s === 'tersedia') return 'Tersedia Penuh'
        if (s === 'sebagian') return 'Terisi Sebagian (' + this.statusData.sisaKapasitas + ' dari ' + this.statusData.maxKapasitas + ' kelas kosong)'
        if (s === 'terpakai') return 'Terpakai Penuh'
        return 'Nonaktif / Pemeliharaan'
      },
      activeBookings: function () {
        if (!this.statusData || !this.statusData.bookings) return []
        return this.statusData.bookings
      },
      bookingUrl: function () {
        if (!this.room) return '#'
        var params = {
          ruangan: this.room.id,
          tanggal: this.tanggal,
          jamMulai: this.jamMulai,
          jamSelesai: this.jamSelesai,
        }
        var qs = Object.keys(params)
          .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]) })
          .join('&')
        return this.routes.pj.formReservasi + '?' + qs
      },
      loginRedirectUrl: function () {
        return this.routes.auth.login + '?redirect=' + encodeURIComponent(window.location.href)
      },
    },
    methods: {
      onBackdropClick: function (e) {
        if (e.target === e.currentTarget) {
          this.$emit('close')
        }
      },
      formatDate: function (d) {
        return App.utils ? App.utils.formatDate(d) : d
      },
      getCourseName: function (courseId) {
        var courses = App.store ? App.store.get('courses', []) : []
        for (var i = 0; i < courses.length; i++) {
          if (courses[i].id === courseId) return courses[i].nama
        }
        return 'Mata Kuliah'
      },
      getDosenName: function (dosenId) {
        var users = App.store ? App.store.get('users', []) : []
        for (var i = 0; i < users.length; i++) {
          if (users[i].id === dosenId) return users[i].nama
        }
        return 'Dosen Pengampu'
      },
    },
    template: /* html */ `
      <div
        v-if="show && room"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
        @click="onBackdropClick"
      >
        <div class="modal-card bg-white rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all p-5 sm:p-6">
          <!-- Header Modal -->
          <div class="flex items-start justify-between pb-4 border-b border-border">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-1 rounded-md">
                  Gedung {{ room.gedung }} &bull; Lantai {{ room.lantai }}
                </span>
                <span class="badge" :class="statusBadgeClass">
                  {{ statusText }}
                </span>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-ink mt-2">{{ room.kode }}</h2>
              <p class="text-xs sm:text-sm text-muted">{{ room.nama }}</p>
            </div>
            <button
              type="button"
              @click="$emit('close')"
              class="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-surface transition flex-shrink-0"
              aria-label="Tutup modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Body Info Ruangan -->
          <div class="py-4 space-y-4 sm:space-y-5">
            <!-- Waktu yang Ditinjau -->
            <div class="p-3 bg-surface rounded-xl border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span class="text-muted flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Waktu Pengecekan:
              </span>
              <span class="font-semibold text-ink">
                {{ formatDate(tanggal) }}, {{ jamMulai }} - {{ jamSelesai }} WIB
              </span>
            </div>

            <!-- Kapasitas & Rombel -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted mb-2">Kapasitas Ruang Kelas</h3>
              <div class="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-border">
                <div class="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div class="text-sm font-bold text-ink">
                    Maksimal {{ room.kapasitas }} Rombel / Kelas Bersamaan
                  </div>
                  <div class="text-xs text-muted">
                    Dapat menampung hingga {{ room.kapasitas * 35 }} mahasiswa sekaligus (sisa kapasitas: {{ statusData.sisaKapasitas }} kelas).
                  </div>
                </div>
              </div>
            </div>

            <!-- Fasilitas Ruangan -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted mb-2">Fasilitas Tersedia</h3>
              <div v-if="room.fasilitas && room.fasilitas.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="f in room.fasilitas"
                  :key="f"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-ink text-xs font-medium border border-border"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ f }}
                </span>
              </div>
              <p v-else class="text-xs text-muted italic">Fasilitas standar ruang perkuliahan.</p>
            </div>

            <!-- Detail Penggunaan / Kuliah Berjalan (Jika ada booking aktif) -->
            <div v-if="activeBookings.length > 0" class="p-4 bg-red-50/60 rounded-xl border border-red-200">
              <h3 class="text-xs font-bold uppercase tracking-wider text-red-800 mb-2 flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Jadwal Penggunaan Slot Ini
              </h3>
              <div class="space-y-2.5">
                <div v-for="b in activeBookings" :key="b.id" class="text-xs bg-white p-3 rounded-lg border border-red-100 shadow-xs">
                  <div class="font-bold text-ink text-sm">{{ getCourseName(b.mataKuliahId) }}</div>
                  <div class="text-muted mt-0.5">Dosen: <strong class="text-ink">{{ getDosenName(b.dosenId) }}</strong></div>
                  <div class="text-muted">Waktu: {{ b.jamMulai }} - {{ b.jamSelesai }} WIB ({{ b.jumlahKelas || 1 }} Kelas)</div>
                  <div class="text-muted mt-1 italic">"{{ b.keperluan || 'Perkuliahan Reguler' }}"</div>
                </div>
              </div>
            </div>

            <!-- Pesan Hak Booking -->
            <div v-if="statusData.status === 'nonaktif'" class="p-3 bg-gray-100 rounded-lg text-xs text-gray-700">
              Ruangan ini sedang dalam masa pemeliharaan (maintenance) dan tidak dapat dipesan.
            </div>
            <div v-else-if="!currentUser" class="p-3 bg-primary-soft rounded-lg text-xs text-ink flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Ingin memesan ruangan ini? Silakan masuk terlebih dahulu.</span>
              <a :href="loginRedirectUrl" class="font-bold text-primary hover:underline">Login &rarr;</a>
            </div>
            <div v-else-if="!canBook" class="p-3 bg-surface rounded-lg text-xs text-muted border border-border">
              Peran Anda saat ini adalah <strong>{{ currentUser.role }}</strong>. Pengajuan reservasi ruangan hanya dapat diajukan oleh Penanggung Jawab (PJ) Kelas atau Administrator.
            </div>
          </div>

          <!-- Footer Modal Aksi -->
          <div class="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary text-sm w-full sm:w-auto"
            >
              Tutup
            </button>

            <!-- Tombol Booking (Hanya untuk PJ dan Admin yang berhak, dan jika ruangan masih ada kapasitas) -->
            <a
              v-if="canBook && statusData.status !== 'terpakai' && statusData.status !== 'nonaktif'"
              :href="bookingUrl"
              class="btn btn-primary text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-xs"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              <span>Booking Ruangan Ini</span>
            </a>
          </div>
        </div>
      </div>
    `,
  }
})()
