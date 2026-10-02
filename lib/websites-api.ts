import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export type Website = {
  id: string
  user_id: string
  url: string
  name: string
  status: '' | 'success' | 'failed' | string
  allowed_origins: string[] | null
  created_at: string
  updated_at: string
}

export type IndexedPage = { page_url: string }

type WebsitesResponse = { websites?: Website[] }
type IndexedPagesResponse = { indexed_page?: IndexedPage[] }

export async function getWebsites() {
  const { data } = await api.get<WebsitesResponse | Website[]>('/websites')
  return Array.isArray(data) ? data : data.websites ?? []
}

export async function createWebsite(payload: { url: string; name: string }) {
  const { data } = await api.post<{ website_id: string }>('/websites', payload)
  return data
}

export async function deleteWebsite(id: string) {
  await api.delete(`/websites/${encodeURIComponent(id)}`)
}

export async function getIndexedPages(id: string) {
  const { data } = await api.get<IndexedPagesResponse>(`/websites/${encodeURIComponent(id)}/indexed`)
  return data.indexed_page ?? []
}

export async function updateAllowedOrigins(id: string, origins: string[]) {
  await api.patch(`/websites/${encodeURIComponent(id)}/allowed-origins`, origins)
}

export function isValidWebsiteUrl(value: string) {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname.includes('.'))
  } catch {
    return false
  }
}

export function normalizeWebsiteUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error
    if (typeof message === 'string') return message
  }
  return fallback
}
