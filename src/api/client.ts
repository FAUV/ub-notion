
export const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_URL + path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json() as Promise<T>
}
