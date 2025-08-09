"use client"

import { getToken, clearToken } from "./auth"

type ApiOptions = RequestInit & { raw?: boolean }

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    ...(options.headers || {}),
  }
  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }
  if (!(headers as Record<string, string>)["Content-Type"] && options.body) {
    ;(headers as Record<string, string>)["Content-Type"] = "application/json"
  }

  const res = await fetch(`/api/proxy/admin/${path}`, {
    ...options,
    headers,
    cache: "no-store",
  })

  if (res.status === 401) {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.replace("/")
    }
    throw new Error("Unauthorized")
  }

  if (options.raw) {
    // @ts-expect-error
    return res
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`
    throw new Error(msg)
  }
  return data
}
