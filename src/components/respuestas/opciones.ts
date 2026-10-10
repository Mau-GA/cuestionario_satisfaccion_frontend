import type { OpcionRespuesta } from '../../types/respuestas'

const CARITAS = ['😠', '🙁', '😐', '🙂', '😄']

function valorPeso(peso: OpcionRespuesta['peso']): number {
  return peso === null ? Number.POSITIVE_INFINITY : Number(peso)
}

export function ordenarPorPeso(opciones: OpcionRespuesta[]): OpcionRespuesta[] {
  return [...opciones].sort((a, b) => valorPeso(a.peso) - valorPeso(b.peso))
}

export function caritaPara(indice: number, total: number): string {
  if (total <= 1) return CARITAS[2]
  const posicion = Math.round((indice / (total - 1)) * (CARITAS.length - 1))
  return CARITAS[posicion]
}

export function idError(id: string, error?: string | null): string | undefined {
  return error ? `${id}-error` : undefined
}

export function describedBy(
  ...ids: (string | undefined)[]
): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined
}
