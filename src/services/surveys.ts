import { http } from './http'

export interface Survey {
  id: number
  title: string
  responses: number
}

export function listSurveys(): Promise<Survey[]> {
  return http.request<Survey[]>('/surveys')
}