"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyVND } from "@/lib/format"

type AutomationDashboardResponse = {
  success: boolean
  data: {
    users: { totalUsers: number; activeUsers: number; verifiedUsers: number; adminUsers: number }
    workflows: { totalWorkflows: number; activeWorkflows: number; failedWorkflows: number }
    jobs: { totalJobs: number; recentJobs: number; recentSuccess: number }
  }
}

export default function AutomationDashboardPage() {
  const [data, setData] = useState<AutomationDashboardResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setError(null)
        setLoading(true)
        const res = await fetch("/api/proxy/automation/dashboard/stats", { cache: "no-store" })
        const json: AutomationDashboardResponse = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.["message"] || `Request failed (${res.status})`)
        setData(json.data)
      } catch (e: any) {
        setError(e?.message || "Không thể tải dữ liệu")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-semibold">Automation tool - Dashboard</h1>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive text-sm">⚠️ {error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng người dùng" value={data?.users.totalUsers ?? 0} loading={loading} />
        <StatCard title="Người dùng hoạt động" value={data?.users.activeUsers ?? 0} loading={loading} />
        <StatCard title="Đã xác minh" value={data?.users.verifiedUsers ?? 0} loading={loading} />
        <StatCard title="Quản trị viên" value={data?.users.adminUsers ?? 0} loading={loading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Tổng workflow" value={data?.workflows.totalWorkflows ?? 0} loading={loading} />
        <StatCard title="Đang chạy" value={data?.workflows.activeWorkflows ?? 0} loading={loading} />
        <StatCard title="Thất bại" value={data?.workflows.failedWorkflows ?? 0} loading={loading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Tổng job" value={data?.jobs.totalJobs ?? 0} loading={loading} />
        <StatCard title="Job gần đây" value={data?.jobs.recentJobs ?? 0} loading={loading} />
        <StatCard title="Thành công gần đây" value={data?.jobs.recentSuccess ?? 0} loading={loading} />
      </div>
    </div>
  )
}

function StatCard({ title, value, loading }: { title: string; value: string | number; loading?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        )}
      </CardContent>
    </Card>
  )
}


