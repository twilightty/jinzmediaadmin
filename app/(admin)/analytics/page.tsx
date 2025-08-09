"use client"

import ProtectedShell from "@/components/protected-shell"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyVND } from "@/lib/format"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type Stats = {
  success: boolean
  data: {
    overall: {
      totalPayments: number
      totalRevenue: number
      completedPayments: number
      pendingPayments: number
      failedPayments: number
    }
    period: {
      totalPayments: number
      totalRevenue: number
      completedPayments: number
      pendingPayments: number
      failedPayments: number
    }
    dailyRevenue: { _id: string; revenue: number; count: number }[]
    period: number
  }
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30")
  const [data, setData] = useState<Stats["data"] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiFetch<Stats>(`payments/stats?period=${period}`, { method: "GET" })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-xl font-semibold">Phân tích</h1>
          <div className="w-40">
            <Label>Khoảng thời gian</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
                <SelectItem value="90">90 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Tổng doanh thu" value={formatCurrencyVND(data?.overall.totalRevenue ?? 0)} loading={loading} />
          <Kpi title="Tổng giao dịch" value={data?.overall.totalPayments ?? 0} loading={loading} />
          <Kpi title="Hoàn tất" value={data?.overall.completedPayments ?? 0} loading={loading} />
          <Kpi title="Đang chờ" value={data?.overall.pendingPayments ?? 0} loading={loading} />
        </div>

        <Card className="h-[360px]">
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded bg-muted" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.dailyRevenue ?? []}>
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => formatCurrencyVND(Number(v))} />
                  <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedShell>
  )
}

function Kpi({ title, value, loading }: { title: string; value: string | number; loading?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-semibold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}
