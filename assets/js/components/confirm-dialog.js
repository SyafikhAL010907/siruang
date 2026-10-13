/**
 * confirm-dialog.js — Komponen dialog konfirmasi
 * Namespace: App.confirm
 * Dialog konfirmasi untuk aksi destruktif/penting.
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  /**
   * Tampilkan dialog konfirmasi
   * @param {Object} options
   * @param {string} options.title - Judul dialog
   * @param {string} options.message - Pesan dialog
   * @param {string} [options.confirmText='Ya, Lanjutkan'] - Teks tombol konfirmasi
   * @param {string} [options.cancelText='Batal'] - Teks tombol batal
   * @param {string} [options.type='danger'] - Tipe: danger, warning, info
   * @param {boolean} [options.requireReason=false] - Perlu input alasan
   * @param {string} [options.reasonLabel='Alasan'] - Label input alasan
   * @param {number} [options.reasonMinLength=0] - Panjang minimum alasan
   * @returns {Promise<{confirmed: boolean, reason?: string}>}
   */
  window.App.confirm = function (options) {
    return new Promise(function (resolve) {
      var title = options.title || 'Konfirmasi'
      var message = options.message || 'Apakah Anda yakin?'
      var confirmText = options.confirmText || 'Ya, Lanjutkan'
      var cancelText = options.cancelText || 'Batal'
      var type = options.type || 'danger'
      var requireReason = options.requireReason || false
      var reasonLabel = options.reasonLabel || 'Alasan'
      var reasonMinLength = options.reasonMinLength || 0

      var btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary'

      var iconSvg = {
        danger: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="color:#DC2626"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2" fill="#FEE2E2"/><path d="M20 12v10M20 26v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
        warning: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="color:#EAB308"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2" fill="#FEF9C3"/><path d="M20 12v10M20 26v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
        info: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="color:#0EA5E9"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2" fill="#E0F2FE"/><path d="M20 18v8M20 12v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
      }

      var reasonHtml = ''
      if (requireReason) {
        reasonHtml =
          '<div style="margin-top:1rem;" class="form-group">' +
          '<label class="form-label">' + reasonLabel + (reasonMinLength > 0 ? ' <span class="required">*</span>' : '') + '</label>' +
          '<textarea id="confirm-reason" class="form-textarea" rows="3" placeholder="Masukkan ' + reasonLabel.toLowerCase() + '..."></textarea>' +
          '<p id="confirm-reason-error" class="form-error" style="display:none;">Minimal ' + reasonMinLength + ' karakter.</p>' +
          '</div>'
      }

      // Buat overlay
      var overlay = document.createElement('div')
      overlay.className = 'dialog-overlay'
      overlay.innerHTML =
        '<div class="dialog-panel">' +
        '<div style="text-align:center;margin-bottom:1rem;">' + (iconSvg[type] || iconSvg.info) + '</div>' +
        '<h3 style="text-align:center;font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;">' + App.utils.escapeHtml(title) + '</h3>' +
        '<p style="text-align:center;color:var(--color-muted);font-size:0.875rem;">' + App.utils.escapeHtml(message) + '</p>' +
        reasonHtml +
        '<div style="display:flex;gap:0.75rem;margin-top:1.5rem;">' +
        '<button id="confirm-cancel" class="btn btn-secondary" style="flex:1;">' + cancelText + '</button>' +
        '<button id="confirm-ok" class="btn ' + btnClass + '" style="flex:1;">' + confirmText + '</button>' +
        '</div>' +
        '</div>'

      document.body.appendChild(overlay)
      document.body.style.overflow = 'hidden'

      var cancelBtn = overlay.querySelector('#confirm-cancel')
      var okBtn = overlay.querySelector('#confirm-ok')
      var reasonInput = overlay.querySelector('#confirm-reason')
      var reasonError = overlay.querySelector('#confirm-reason-error')

      function cleanup() {
        document.body.removeChild(overlay)
        document.body.style.overflow = ''
      }

      cancelBtn.addEventListener('click', function () {
        cleanup()
        resolve({ confirmed: false })
      })

      okBtn.addEventListener('click', function () {
        if (requireReason && reasonMinLength > 0) {
          var reason = reasonInput.value.trim()
          if (reason.length < reasonMinLength) {
            reasonInput.classList.add('is-error')
            reasonError.style.display = 'block'
            reasonInput.focus()
            return
          }
        }
        var result = { confirmed: true }
        if (requireReason && reasonInput) {
          result.reason = reasonInput.value.trim()
        }
        cleanup()
        resolve(result)
      })

      // Tutup dengan klik overlay
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          cleanup()
          resolve({ confirmed: false })
        }
      })

      // Tutup dengan Escape
      function onEsc(e) {
        if (e.key === 'Escape') {
          cleanup()
          resolve({ confirmed: false })
          document.removeEventListener('keydown', onEsc)
        }
      }
      document.addEventListener('keydown', onEsc)

      // Focus alasan jika ada
      if (reasonInput) {
        setTimeout(function () { reasonInput.focus() }, 100)
        reasonInput.addEventListener('input', function () {
          if (this.value.trim().length >= reasonMinLength) {
            this.classList.remove('is-error')
            reasonError.style.display = 'none'
          }
        })
      }
    })
  }
})()
