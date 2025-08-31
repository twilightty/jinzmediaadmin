"use client"

import ProtectedShell from "@/components/protected-shell"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyVND } from "@/lib/format"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart,
  CartesianGrid
} from "recharts"
import { Download, Calendar, Filter, TrendingUp, TrendingDown } from "lucide-react"
import { format, subDays, parseISO } from "date-fns"

type PaymentStats = {
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
  }
}

type TransactionStats = {
  success: boolean
  data: {
    overall: {
      totalTransactions: number
      totalAmount: number
      completedTransactions: number
      pendingTransactions: number
      failedTransactions: number
      cancelledTransactions: number
    }
    period: {
      totalTransactions: number
      totalAmount: number
      completedTransactions: number
      pendingTransactions: number
      failedTransactions: number
      cancelledTransactions: number
    }
    dailyTransactions: {
      _id: string
      amount: number
      count: number
      completed: number
      pending: number
      failed: number
    }[]
    packageStats?: { _id: string; count: number; totalAmount: number; completedCount: number }[]
  }
}

const COLORS = ["#16a34a", "#f59e0b", "#ef4444", "#64748b"]

export default function AnalyticsPage() {
  const { theme, resolvedTheme } = useTheme()
  const [period, setPeriod] = useState("current-month")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1) // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [source, setSource] = useState<"payments" | "transactions">("payments")
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line")
  const [paymentData, setPaymentData] = useState<PaymentStats["data"] | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionStats["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>("_id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Theme-aware colors
  const isDark = resolvedTheme === 'dark'
  const textColor = isDark ? '#a1a1aa' : '#71717a' // muted-foreground
  const borderColor = isDark ? '#27272a' : '#e4e4e7' // border
  const gridColor = isDark ? '#3f3f46' : '#d4d4d8' // muted-foreground for grid

  useEffect(() => {
    setLoading(true)
    setError(null)
    const load = async () => {
      let queryParams = ""
      
      if (period === "custom" && customStartDate && customEndDate) {
        queryParams = `startDate=${customStartDate}&endDate=${customEndDate}`
      } else if (period === "specific-month") {
        // Calculate start and end of selected month
        const startDate = new Date(selectedYear, selectedMonth - 1, 1)
        const endDate = new Date(selectedYear, selectedMonth, 0) // Last day of the month
        queryParams = `startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
        console.log(`📅 ${selectedMonth}/${selectedYear}: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')} (${endDate.getDate()} days)`)
      } else if (period === "current-month") {
        // Current month
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        queryParams = `startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
        console.log(`📅 Current month: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')} (${endDate.getDate()} days)`)
      } else if (period === "last-month") {
        // Previous month
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        queryParams = `startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
        console.log(`📅 Last month: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')} (${endDate.getDate()} days)`)
      } else {
        // Fallback to period-based for backward compatibility
        queryParams = `period=${period}`
      }
      
      const endpoint = source === "payments" ? "payments/stats" : "transactions/stats"
      const fullUrl = `${endpoint}?${queryParams}`
      
      console.log("🔍 Analytics API Request:")
      console.log("- Source:", source)
      console.log("- Period:", period)
      console.log("- Custom dates:", { customStartDate, customEndDate })
      console.log("- Query params:", queryParams)
      console.log("- Full endpoint:", fullUrl)
      console.log("- Full URL will be:", `/api/proxy/admin/${fullUrl}`)
      
      try {
        if (source === "payments") {
          console.log("📊 Fetching payment stats...")
          const res = await apiFetch<PaymentStats>(fullUrl, { method: "GET" })
          console.log("✅ Payment stats response:", res)
          console.log("- Overall data:", res.data?.overall)
          console.log("- Period data:", res.data?.period)
          console.log("- Daily revenue count:", res.data?.dailyRevenue?.length)
          setPaymentData(res.data)
        } else {
          console.log("📊 Fetching transaction stats...")
          const res = await apiFetch<TransactionStats>(fullUrl, { method: "GET" })
          console.log("✅ Transaction stats response:", res)
          console.log("- Overall data:", res.data?.overall)
          console.log("- Period data:", res.data?.period)
          console.log("- Daily transactions count:", res.data?.dailyTransactions?.length)
          console.log("- Package stats count:", res.data?.packageStats?.length)
          setTransactionData(res.data)
        }
      } catch (error: any) {
        console.error("❌ Analytics API Error:", error)
        console.error("- Error message:", error.message)
        console.error("- Error stack:", error.stack)
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu")
      }
    }
    load().finally(() => setLoading(false))
  }, [period, selectedMonth, selectedYear, customStartDate, customEndDate, source])

  // Export to CSV function
  const exportToCSV = () => {
    const data = source === "payments" ? paymentData : transactionData
    if (!data) return

    const csvContent = source === "payments" 
      ? generatePaymentsCSV(data as PaymentStats["data"])
      : generateTransactionsCSV(data as TransactionStats["data"])
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${source}_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Custom tooltip component for dark mode support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
          <p className="text-foreground font-medium mb-2">{`Ngày: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-foreground">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {`${entry.name}: ${source === "payments" ? formatCurrencyVND(entry.value) : entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Format currency for Y-axis
  const formatYAxisCurrency = (value: number) => {
    if (source === "payments") {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`
      } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`
      }
      return value.toString()
    } else {
      return value.toLocaleString()
    }
  }

  // Format date for X-axis
  const formatXAxisDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'dd/MM')
    } catch {
      return dateString
    }
  }

  // Chart rendering function
  const renderChart = (data: any[], dataKey: string, color: string = "#16a34a") => {
    const sortedData = [...data].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1
      } else {
        return a[sortField] < b[sortField] ? 1 : -1
      }
    })

    const chartProps = {
      data: sortedData,
      margin: { top: 20, right: 30, left: 60, bottom: 60 }
    }

    switch (chartType) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                tickFormatter={formatXAxisDate}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                tickFormatter={formatYAxisCurrency}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                fill={color} 
                fillOpacity={0.4}
                strokeWidth={3}
                name={source === "payments" ? "Doanh thu" : "Giá trị"}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                tickFormatter={formatXAxisDate}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                tickFormatter={formatYAxisCurrency}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill={color}
                radius={[4, 4, 0, 0]}
                name={source === "payments" ? "Doanh thu" : "Giá trị"}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                tickFormatter={formatXAxisDate}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={{ stroke: borderColor }}
                tickLine={{ stroke: borderColor }}
                tickFormatter={formatYAxisCurrency}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={4}
                dot={{ fill: color, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: color, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                name={source === "payments" ? "Doanh thu" : "Giá trị"}
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-xl font-semibold">Phân tích</h1>
          <div className="flex gap-3">
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc và điều khiển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Nguồn dữ liệu</Label>
                <Select value={source} onValueChange={(v) => setSource(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payments">Thanh toán</SelectItem>
                    <SelectItem value="transactions">Giao dịch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Khoảng thời gian</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Tháng hiện tại</SelectItem>
                    <SelectItem value="last-month">Tháng trước</SelectItem>
                    <SelectItem value="specific-month">Chọn tháng cụ thể</SelectItem>
                    <SelectItem value="7">7 ngày qua</SelectItem>
                    <SelectItem value="30">30 ngày qua</SelectItem>
                    <SelectItem value="90">90 ngày qua</SelectItem>
                    <SelectItem value="365">1 năm qua</SelectItem>
                    <SelectItem value="custom">Tùy chỉnh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div>
                <Label>Sắp xếp</Label>
                <div className="flex gap-2">
                  <Select value={sortField} onValueChange={setSortField}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_id">Ngày</SelectItem>
                      <SelectItem value={source === "payments" ? "revenue" : "amount"}>
                        {source === "payments" ? "Doanh thu" : "Giá trị"}
                      </SelectItem>
                      <SelectItem value="count">Số lượng</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  >
                    {sortDirection === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Month and Year Selection */}
            {period === "specific-month" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tháng</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tháng 1</SelectItem>
                      <SelectItem value="2">Tháng 2</SelectItem>
                      <SelectItem value="3">Tháng 3</SelectItem>
                      <SelectItem value="4">Tháng 4</SelectItem>
                      <SelectItem value="5">Tháng 5</SelectItem>
                      <SelectItem value="6">Tháng 6</SelectItem>
                      <SelectItem value="7">Tháng 7</SelectItem>
                      <SelectItem value="8">Tháng 8</SelectItem>
                      <SelectItem value="9">Tháng 9</SelectItem>
                      <SelectItem value="10">Tháng 10</SelectItem>
                      <SelectItem value="11">Tháng 11</SelectItem>
                      <SelectItem value="12">Tháng 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Năm</Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Custom Date Range */}
            {period === "custom" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Từ ngày</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div>
                  <Label>Đến ngày</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <div className="text-sm">⚠️ {error}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {source === "payments" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                title="Doanh thu (kỳ lọc)"
                value={formatCurrencyVND(paymentData?.period.totalRevenue ?? 0)}
                loading={loading}
              />
              <Kpi title="Thanh toán (kỳ lọc)" value={paymentData?.period.totalPayments ?? 0} loading={loading} />
              <Kpi title="Hoàn tất (kỳ lọc)" value={paymentData?.period.completedPayments ?? 0} loading={loading} />
              <Kpi title="Đang chờ (kỳ lọc)" value={paymentData?.period.pendingPayments ?? 0} loading={loading} />
            </div>

            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Doanh thu theo ngày</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                {loading ? (
                  <div className="h-full w-full animate-pulse rounded bg-muted" />
                ) : (
                  renderChart(paymentData?.dailyRevenue ?? [], "revenue", "#16a34a")
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi title="Số GD (kỳ lọc)" value={transactionData?.period.totalTransactions ?? 0} loading={loading} />
              <Kpi
                title="Giá trị (kỳ lọc)"
                value={formatCurrencyVND(transactionData?.period.totalAmount ?? 0)}
                loading={loading}
              />
              <Kpi title="Hoàn tất (kỳ lọc)" value={transactionData?.period.completedTransactions ?? 0} loading={loading} />
              <Kpi title="Đang chờ (kỳ lọc)" value={transactionData?.period.pendingTransactions ?? 0} loading={loading} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle>Giá trị giao dịch theo ngày</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {loading ? (
                    <div className="h-full w-full animate-pulse rounded bg-muted" />
                  ) : (
                    renderChart(transactionData?.dailyTransactions ?? [], "amount", "#16a34a")
                  )}
                </CardContent>
              </Card>

              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle>Tỷ lệ trạng thái</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {loading ? (
                    <div className="h-full w-full animate-pulse rounded bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Hoàn tất", value: transactionData?.overall.completedTransactions ?? 0 },
                            { name: "Chờ xử lý", value: transactionData?.overall.pendingTransactions ?? 0 },
                            { name: "Thất bại", value: transactionData?.overall.failedTransactions ?? 0 },
                            { name: "Hủy", value: transactionData?.overall.cancelledTransactions ?? 0 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          innerRadius={40}
                          paddingAngle={2}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          labelLine={false}
                        >
                          {COLORS.map((c, i) => (
                            <Cell key={i} fill={c} stroke="hsl(var(--background))" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ 
                            color: textColor,
                            fontSize: '14px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Gói phổ biến
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPackageStatsToCSV()}
                    className="gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Xuất
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-12 w-full animate-pulse rounded bg-muted" />
                ) : transactionData?.packageStats?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-3 text-left font-medium">Package</th>
                          <th className="p-3 text-left font-medium">Số GD</th>
                          <th className="p-3 text-left font-medium">Hoàn tất</th>
                          <th className="p-3 text-left font-medium">Tỷ lệ TC (%)</th>
                          <th className="p-3 text-left font-medium">Tổng tiền</th>
                          <th className="p-3 text-left font-medium">TB/GD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionData.packageStats
                          .sort((a, b) => b.totalAmount - a.totalAmount)
                          .map((p) => (
                          <tr key={p._id} className="border-t hover:bg-muted/50">
                            <td className="p-3 font-medium">{p._id}</td>
                            <td className="p-3">{p.count.toLocaleString()}</td>
                            <td className="p-3 text-green-600">{p.completedCount.toLocaleString()}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm">
                                  {((p.completedCount / p.count) * 100).toFixed(1)}%
                                </div>
                                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 transition-all"
                                    style={{ width: `${(p.completedCount / p.count) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-medium">{formatCurrencyVND(p.totalAmount)}</td>
                            <td className="p-3 text-muted-foreground">
                              {formatCurrencyVND(p.totalAmount / p.count)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Không có dữ liệu package
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedShell>
  )
}

// CSV Generation Functions
function generatePaymentsCSV(data: PaymentStats["data"]): string {
  const headers = ["Ngày", "Doanh thu", "Số lượng thanh toán"]
  const rows = data.dailyRevenue.map(item => [
    item._id,
    item.revenue.toString(),
    item.count.toString()
  ])
  
  return [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n")
}

function generateTransactionsCSV(data: TransactionStats["data"]): string {
  const headers = ["Ngày", "Tổng giá trị", "Số giao dịch", "Hoàn tất", "Đang chờ", "Thất bại"]
  const rows = data.dailyTransactions.map(item => [
    item._id,
    item.amount.toString(),
    item.count.toString(),
    item.completed.toString(),
    item.pending.toString(),
    item.failed.toString()
  ])
  
  return [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n")
}

function exportPackageStatsToCSV() {
  // This function will be used for package stats export
  const data = document.querySelector('table')
  if (!data) return
  
  const csvContent = Array.from(data.querySelectorAll('tr'))
    .map(row => Array.from(row.querySelectorAll('th, td'))
      .map(cell => `"${cell.textContent?.replace(/"/g, '""') || ''}"`)
      .join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `package_stats_${format(new Date(), 'yyyy-MM-dd')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
