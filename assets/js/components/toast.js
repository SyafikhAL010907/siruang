/**
 * toast.js — Komponen toast notification
 * Namespace: App.toast
 * Dipakai untuk feedback aksi (sukses, error, warning, info).
 */
;(function () {
  'use strict'

  window.App = window.App || {}

  var containerId = 'toast-container'

  function getContainer() {
    var container = document.getElementById(containerId)
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      container.className = 'toast-container'
      document.body.appendChild(container)
    }
    return container
  }

  function createIcon(type) {
    var icons = {
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill="currentColor"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill="currentColor"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fill="currentColor"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0 1 1 0 002 0zm-1 3a1 1 0 00-1 1v3a1 1 0 002 0v-3a1 1 0 00-1-1z" fill="currentColor"/></svg>',
    }
    return icons[type] || icons.info
  }

  /**
   * Tampilkan toast
   * @param {string} message
   * @param {string} [type='info'] - success, error, warning, info
   * @param {number} [duration=3000] - Durasi tampil (ms)
   */
  window.App.toast = function (message, type, duration) {
    type = type || 'info'
    duration = duration || 3000

    var container = getContainer()
    var toast = document.createElement('div')
    toast.className = 'toast toast-' + type
    toast.innerHTML =
      '<span class="toast-icon">' + createIcon(type) + '</span>' +
      '<span class="toast-message" style="flex:1;font-size:0.875rem;">' + App.utils.escapeHtml(message) + '</span>' +
      '<button class="toast-close" style="background:none;border:none;cursor:pointer;padding:0.25rem;opacity:0.6;color:inherit;" aria-label="Tutup">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>'

    container.appendChild(toast)

    // Tutup manual
    var closeBtn = toast.querySelector('.toast-close')
    closeBtn.addEventListener('click', function () {
      removeToast(toast)
    })

    // Auto tutup
    var timer = setTimeout(function () {
      removeToast(toast)
    }, duration)

    toast._timer = timer
  }

  function removeToast(toast) {
    if (toast._removing) return
    toast._removing = true
    clearTimeout(toast._timer)
    toast.style.animation = 'toastSlideOut 0.25s ease-in forwards'
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast)
    }, 250)
  }

  // Shortcut
  window.App.toast.success = function (msg, dur) { App.toast(msg, 'success', dur) }
  window.App.toast.error = function (msg, dur) { App.toast(msg, 'error', dur) }
  window.App.toast.warning = function (msg, dur) { App.toast(msg, 'warning', dur) }
  window.App.toast.info = function (msg, dur) { App.toast(msg, 'info', dur) }
})()
