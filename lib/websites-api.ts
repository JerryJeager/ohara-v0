import axios, { AxiosHeaders } from 'axios'
import { getCookie } from '@/actions/handleCookies'

const getAuthToken = async () => {
  const cookie = await getCookie('ohara_token')
  return cookie?.value ?? ''
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken()

  if (!token) return config

  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers

  return config
})

export type Website = {
  id: string
  user_id: string
  url: string
  name: string
  contact?: string | null
  status: '' | 'success' | 'failed' | string
  allowed_origins: string[] | null
  created_at: string
  updated_at: string
}

export type IndexedPage = { page_url: string }

type WebsitesResponse = { websites?: Website[] }
type IndexedPagesResponse = { indexed_pages?: IndexedPage[] }

export async function getWebsites() {
  const { data } = await api.get<WebsitesResponse | Website[]>('/websites')
  return Array.isArray(data) ? data : data.websites ?? []
}

export async function createWebsite(payload: { url: string; name: string; contact?: string }) {
  const { data } = await api.post<{ website_id: string }>('/websites', payload)
  return data
}

export async function deleteWebsite(id: string) {
  await api.delete(`/websites/${encodeURIComponent(id)}`)
}

export async function getIndexedPages(id: string) {
  const { data } = await api.get<IndexedPage[] | IndexedPagesResponse>(`/websites/${encodeURIComponent(id)}/indexed`)
  return Array.isArray(data) ? data : data.indexed_pages ?? []
}

export async function getAllowedOrigins(id: string) {
  const { data } = await api.get<{ allowed_origins: string[] | null }>(`/websites/${encodeURIComponent(id)}/allowed-origins`)
  return data.allowed_origins ?? []
}

export async function updateAllowedOrigins(id: string, origins: string[]) {
  // send as an explicit object to match the GET shape { allowed_origins: [...] }
  await api.patch(`/websites/${encodeURIComponent(id)}/allowed-origins`, [...origins])
}

export function isValidWebsiteUrl(value: string) {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    // allow http(s) and also localhost or numeric IPv4 addresses
    const isHttp = ['http:', 'https:'].includes(url.protocol)
    const host = url.hostname || ''
    const isLocalhost = host === 'localhost'
    const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)
    const isDomain = host.includes('.')
    return isHttp && (isDomain || isLocalhost || isIPv4)
  } catch {
    return false
  }
}

export function isValidContact(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  const isPhone = /^[+]?[(]?[0-9A-Za-z\s().-]{7,20}$/.test(trimmed.replace(/\s+/g, ' '))

  return isEmail || isPhone
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
