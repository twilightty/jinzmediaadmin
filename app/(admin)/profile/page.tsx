"use client"

import ProtectedShell from "@/components/protected-shell"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

type ProfileResponse = {
  success: boolean
  data: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    isVerified: boolean
    createdAt: string
    lastLogin: string
  }
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<ProfileResponse>("profile", { method: "GET" })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedShell>
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : data ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{data.name}</div>
                  <div className="text-sm text-muted-foreground">{data.email}</div>
                </div>
                <div className="flex gap-2">
                  <Badge className="capitalize">{data.role === "admin" ? "Quản trị" : "Người dùng"}</Badge>
                  <Badge variant={data.isActive ? "default" : "outline"}>{data.isActive ? "Hoạt động" : "Ngừng"}</Badge>
                  <Badge variant={data.isVerified ? "default" : "outline"}>
                    {data.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Info label="Tạo lúc" value={formatDateTime(data.createdAt)} />
                <Info label="Đăng nhập gần nhất" value={formatDateTime(data.lastLogin)} />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Không có dữ liệu hồ sơ</div>
          )}
        </CardContent>
      </Card>
    </ProtectedShell>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
