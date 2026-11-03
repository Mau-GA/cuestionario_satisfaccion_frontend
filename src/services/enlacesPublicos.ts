/**
 * Las URL que se reparten fuera del sistema: las del enlace público y las que
 * viajan dentro de un código QR.
 *
 * Un QR se imprime y se pega en una mesa, así que tiene que apuntar al sitio
 * público de verdad aunque se genere desde otro origen (localhost, una vista
 * previa, un túnel). Por eso la base sale de VITE_PUBLIC_BASE_URL y solo cae
 * al origen del navegador cuando no está configurada.
 */
const BASE_CONFIGURADA = (import.meta.env.VITE_PUBLIC_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

export function basePublica(): string {
  return BASE_CONFIGURADA || window.location.origin
}

/** Para avisar en pantalla cuando el QR saldría apuntando a esta máquina. */
export function esBaseLocal(): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$|\/)/.test(
    basePublica(),
  )
}

export function enlaceEncuesta(tokenPublico: string): string {
  return `${basePublica()}/responder/${tokenPublico}`
}

export function enlaceEvento(idEvento: number): string {
  return `${basePublica()}/eventos/${idEvento}`
}
