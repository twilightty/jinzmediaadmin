"use client"

import ProtectedShell from "@/components/protected-shell"
import { apiFetch } from "@/lib/api"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyVND } from "@/lib/format"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts"

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
  const [period, setPeriod] = useState("30")
  const [source, setSource] = useState<"payments" | "transactions">("payments")
  const [paymentData, setPaymentData] = useState<PaymentStats["data"] | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionStats["data"] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const load = async () => {
      if (source === "payments") {
        const res = await apiFetch<PaymentStats>(`payments/stats?period=${period}`, { method: "GET" })
        setPaymentData(res.data)
      } else {
        const res = await apiFetch<TransactionStats>(`transactions/stats?period=${period}`, { method: "GET" })
        setTransactionData(res.data)
      }
    }
    load().finally(() => setLoading(false))
  }, [period, source])

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-xl font-semibold">Phân tích</h1>
          <div className="flex gap-3">
            <div className="w-40">
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
        </div>

        {source === "payments" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                title="Tổng doanh thu"
                value={formatCurrencyVND(paymentData?.overall.totalRevenue ?? 0)}
                loading={loading}
              />
              <Kpi title="Tổng thanh toán" value={paymentData?.overall.totalPayments ?? 0} loading={loading} />
              <Kpi title="Hoàn tất" value={paymentData?.overall.completedPayments ?? 0} loading={loading} />
              <Kpi title="Đang chờ" value={paymentData?.overall.pendingPayments ?? 0} loading={loading} />
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
                    <LineChart data={paymentData?.dailyRevenue ?? []}>
                      <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: any) => formatCurrencyVND(Number(v))} />
                      <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi title="Tổng số GD" value={transactionData?.overall.totalTransactions ?? 0} loading={loading} />
              <Kpi
                title="Tổng giá trị"
                value={formatCurrencyVND(transactionData?.overall.totalAmount ?? 0)}
                loading={loading}
              />
              <Kpi title="Hoàn tất" value={transactionData?.overall.completedTransactions ?? 0} loading={loading} />
              <Kpi title="Đang chờ" value={transactionData?.overall.pendingTransactions ?? 0} loading={loading} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="h-[360px]">
                <CardHeader>
                  <CardTitle>Giá trị giao dịch theo ngày</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  {loading ? (
                    <div className="h-full w-full animate-pulse rounded bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={transactionData?.dailyTransactions ?? []}>
                        <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: any) => formatCurrencyVND(Number(v))} />
                        <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="h-[360px]">
                <CardHeader>
                  <CardTitle>Tỷ lệ trạng thái</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
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
                          outerRadius={100}
                          label
                        >
                          {COLORS.map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gói phổ biến</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-12 w-full animate-pulse rounded bg-muted" />
                ) : transactionData?.packageStats?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Package</th>
                          <th className="p-2 text-left">Số GD</th>
                          <th className="p-2 text-left">Hoàn tất</th>
                          <th className="p-2 text-left">Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionData.packageStats.map((p) => (
                          <tr key={p._id} className="border-t">
                            <td className="p-2">{p._id}</td>
                            <td className="p-2">{p.count}</td>
                            <td className="p-2">{p.completedCount}</td>
                            <td className="p-2">{formatCurrencyVND(p.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
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
