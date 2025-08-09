"use client"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("adminToken")
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("adminToken", token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("adminToken")
}
