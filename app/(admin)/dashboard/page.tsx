"use client"

import ProtectedShell from "@/components/protected-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { formatCurrencyVND, formatDateTime } from "@/lib/format"

type DashboardResponse = {
  success: boolean
  data: {
    users: { totalUsers: number; activeUsers: number; verifiedUsers: number; adminUsers: number }
    payments: { totalPayments: number; totalRevenue: number; recentPayments: number; recentRevenue: number }
    recentActivity: {
      users: { _id: string; name: string; email: string; createdAt: string }[]
      payments: {
        _id: string
        userId: { _id: string; name: string; email: string }
        amount: number
        status: string
        createdAt: string
      }[]
    }
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiFetch<DashboardResponse>("dashboard/stats", { method: "GET" })
        setData(res.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Tổng người dùng" value={data?.users.totalUsers ?? 0} />
          <StatCard title="Người dùng hoạt động" value={data?.users.activeUsers ?? 0} />
          <StatCard title="Đã xác minh" value={data?.users.verifiedUsers ?? 0} />
          <StatCard title="Quản trị viên" value={data?.users.adminUsers ?? 0} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Tổng giao dịch" value={data?.payments.totalPayments ?? 0} />
          <StatCard title="Tổng doanh thu" value={formatCurrencyVND(data?.payments.totalRevenue ?? 0)} />
          <StatCard title="Giao dịch gần đây" value={data?.payments.recentPayments ?? 0} />
          <StatCard title="Doanh thu gần đây" value={formatCurrencyVND(data?.payments.recentRevenue ?? 0)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Người dùng gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonList />
              ) : (
                <ul className="divide-y">
                  {(data?.recentActivity.users ?? []).slice(0, 5).map((u) => (
                    <li key={u._id} className="py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                      <div className="text-xs text-muted-foreground">Tham gia: {formatDateTime(u.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thanh toán gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonList />
              ) : (
                <ul className="divide-y">
                  {(data?.recentActivity.payments ?? []).slice(0, 5).map((p) => (
                    <li key={p._id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.userId?.name || p.userId?._id}</div>
                          <div className="text-sm text-muted-foreground">{p.userId?.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrencyVND(p.amount)}</div>
                          <div className="text-xs uppercase text-muted-foreground">{p.status}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">Lúc: {formatDateTime(p.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedShell>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  )
}
