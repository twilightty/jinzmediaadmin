"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"

type JobsStats = {
  success: boolean
  data: {
    overall: { totalJobs: number; successJobs: number; failedJobs: number; queuedJobs: number }
    period: { totalJobs: number; successJobs: number; failedJobs: number; queuedJobs: number }
    dailyJobs: { _id: string; count: number; success: number; failed: number; queued: number }[]
  }
}

type CostsStats = {
  success: boolean
  data: {
    overall: { totalCost: number; infraCost: number; executionCost: number }
    period: { totalCost: number; infraCost: number; executionCost: number }
    dailyCosts: { _id: string; amount: number }[]
  }
}

export default function AutomationAnalyticsPage() {
  const [period, setPeriod] = useState("current-month")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line")
  const [data, setData] = useState<JobsStats["data"] | null>(null)
  const [costs, setCosts] = useState<CostsStats["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const run = async () => {
      let qp = ""
      if (period === "custom" && customStartDate && customEndDate) qp = `startDate=${customStartDate}&endDate=${customEndDate}`
      else if (period === "current-month") {
        const now = new Date()
        const s = new Date(now.getFullYear(), now.getMonth(), 1)
        const e = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        qp = `startDate=${format(s, "yyyy-MM-dd")}&endDate=${format(e, "yyyy-MM-dd")}`
      } else qp = `period=${period}`
      const [jobsRes, costsRes] = await Promise.all([
        fetch(`/api/proxy/automation/analytics/jobs/stats?${qp}`, { cache: "no-store" }),
        fetch(`/api/proxy/automation/analytics/costs/stats?${qp}`, { cache: "no-store" }),
      ])
      const jobsJson: JobsStats = await jobsRes.json()
      const costsJson: CostsStats = await costsRes.json()
      if (!jobsRes.ok || !jobsJson?.success) throw new Error(jobsJson?.["message"] || `Jobs request failed (${jobsRes.status})`)
      if (!costsRes.ok || !costsJson?.success) throw new Error(costsJson?.["message"] || `Costs request failed (${costsRes.status})`)
      setData(jobsJson.data)
      setCosts(costsJson.data)
    }
    run().catch((e: any) => setError(e?.message || "Không thể tải dữ liệu")).finally(() => setLoading(false))
  }, [period, customStartDate, customEndDate])

  const renderChart = () => {
    const series = data?.dailyJobs ?? []
    const common = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
      </>
    )
    if (chartType === "area")
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            {common}
            <Area type="monotone" dataKey="count" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      )
    if (chartType === "bar")
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            {common}
            <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          {common}
          <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-semibold">Automation tool - Analytics</h1>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive text-sm">⚠️ {error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Khoảng thời gian</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Tháng hiện tại</SelectItem>
                  <SelectItem value="7">7 ngày qua</SelectItem>
                  <SelectItem value="30">30 ngày qua</SelectItem>
                  <SelectItem value="90">90 ngày qua</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div>
                  <Label>Từ ngày</Label>
                  <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Đến ngày</Label>
                  <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <Label>Loại biểu đồ</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Đường</SelectItem>
                  <SelectItem value="area">Vùng</SelectItem>
                  <SelectItem value="bar">Cột</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Tổng job (kỳ lọc)" value={data?.period.totalJobs ?? 0} loading={loading} />
        <Kpi title="Thành công (kỳ lọc)" value={data?.period.successJobs ?? 0} loading={loading} />
        <Kpi title="Đang chờ (kỳ lọc)" value={data?.period.queuedJobs ?? 0} loading={loading} />
        <Kpi title="Thất bại (kỳ lọc)" value={data?.period.failedJobs ?? 0} loading={loading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi title="Tổng tiền (kỳ lọc)" value={formatCurrency(costs?.period.totalCost ?? 0)} loading={loading} />
        <Kpi title="Hạ tầng (kỳ lọc)" value={formatCurrency(costs?.period.infraCost ?? 0)} loading={loading} />
        <Kpi title="Thực thi (kỳ lọc)" value={formatCurrency(costs?.period.executionCost ?? 0)} loading={loading} />
      </div>

      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Job theo ngày</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">{loading ? <div className="h-full w-full animate-pulse rounded bg-muted" /> : renderChart()}</CardContent>
      </Card>
    </div>
  )
}

function Kpi({ title, value, loading }: { title: string; value: string | number; loading?: boolean }) {
  const formatCurrency = (n: number) => n.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
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


