"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      window.location.replace("/")
      return
    }
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra xác thực...
      </div>
    )
  }

  return <>{children}</>
}
