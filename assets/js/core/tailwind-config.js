/**
 * Tailwind CSS v4 — Konfigurasi tema via style block
 * File ini menjadi referensi token warna untuk Tailwind v4 CDN.
 * Di Tailwind v4, konfigurasi dilakukan via CSS @theme, bukan JS config.
 * File ini menyisipkan <style type="text/tailwindcss"> ke <head>.
 */
;(function () {
  'use strict'

  var style = document.createElement('style')
  style.setAttribute('type', 'text/tailwindcss')
  style.textContent = [
    '@theme {',
    '  --color-primary: #14532D;',
    '  --color-primary-hover: #166534;',
    '  --color-primary-soft: #E8F3EC;',
    '  --color-ink: #0B1F16;',
    '  --color-muted: #4B5B52;',
    '  --color-border: #D5E2D9;',
    '  --color-surface: #F5F9F6;',
    '',
    '  --color-available: #16A34A;',
    '  --color-partial: #EAB308;',
    '  --color-occupied: #DC2626;',
    '  --color-inactive: #6B7280;',
    '',
    '  --color-success: #16A34A;',
    '  --color-warning: #EAB308;',
    '  --color-danger: #DC2626;',
    '  --color-info: #0EA5E9;',
    '',
    '  --font-family-inter: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
    '}',
  ].join('\n')

  // Sisipkan sebelum tag <style> atau <link> pertama di head
  var firstStyleOrLink = document.head.querySelector('style, link[rel="stylesheet"]')
  if (firstStyleOrLink) {
    document.head.insertBefore(style, firstStyleOrLink)
  } else {
    document.head.appendChild(style)
  }
})()
