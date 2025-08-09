"use client"

import ProtectedShell from "@/components/protected-shell"
import { apiFetch } from "@/lib/api"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrencyVND, formatDate } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type PaymentsResponse = {
  success: boolean
  data: {
    payments: any[]
    summary?: { _id: string; count: number; total: number }[]
    pagination: { currentPage: number; totalPages: number; totalPayments: number; hasNext: boolean; hasPrev: boolean }
  }
}

const defaultFilters = {
  page: 1,
  limit: 10,
  status: "all",
  userId: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState({ ...defaultFilters })
  const [data, setData] = useState<PaymentsResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set("page", String(filters.page))
    p.set("limit", String(filters.limit))
    if (filters.status !== "all") p.set("status", filters.status)
    if (filters.userId) p.set("userId", filters.userId)
    if (filters.dateFrom) p.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) p.set("dateTo", filters.dateTo)
    p.set("sortBy", filters.sortBy)
    p.set("sortOrder", filters.sortOrder)
    return p.toString()
  }, [filters])

  useEffect(() => {
    setLoading(true)
    apiFetch<PaymentsResponse>(`payments?${params}`, { method: "GET" })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [params])

  const updatePaymentStatus = async (paymentId: string, status: string, notes?: string) => {
    try {
      await apiFetch(`payments/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes: notes || "" }),
      })
      toast({ title: "Cập nhật trạng thái thanh toán thành công" })
      apiFetch<PaymentsResponse>(`payments?${params}`, { method: "GET" }).then((res) => setData(res.data))
    } catch (e: any) {
      toast({ title: "Cập nhật trạng thái thất bại", description: e.message, variant: "destructive" })
    }
  }

  return (
    <ProtectedShell>
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div>
              <Label>Trạng thái</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn tất</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="refunded">Hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mã người dùng</Label>
              <Input
                placeholder="Lọc theo userId"
                value={filters.userId}
                onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label>Từ</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label>Đến</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label>Sắp xếp</Label>
              <Select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onValueChange={(v) => {
                  const [sortBy, sortOrder] = v.split(":")
                  setFilters((f) => ({ ...f, sortBy, sortOrder }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Ngày tạo ↓</SelectItem>
                  <SelectItem value="createdAt:asc">Ngày tạo ↑</SelectItem>
                  <SelectItem value="amount:desc">Số tiền ↓</SelectItem>
                  <SelectItem value="amount:asc">Số tiền ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead className="text-right">Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: filters.limit }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <div className="h-6 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : (data?.payments ?? []).map((p: any) => (
                      <TableRow key={p._id}>
                        <TableCell className="min-w-48">
                          <div className="font-medium">{p.userId?.name || p.userId?._id}</div>
                          <div className="text-xs text-muted-foreground">{p.userId?.email}</div>
                        </TableCell>
                        <TableCell>{formatCurrencyVND(p.amount)}</TableCell>
                        <TableCell>
                          <Badge className="uppercase">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="uppercase">{p.paymentMethod || "-"}</TableCell>
                        <TableCell className="min-w-48">{p.packageId || "-"}</TableCell>
                        <TableCell>{formatDate(p.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Select onValueChange={(v) => updatePaymentStatus(p._id, v)} defaultValue={p.status}>
                            <SelectTrigger className="inline-flex h-9 w-[140px]">
                              <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ xử lý</SelectItem>
                              <SelectItem value="completed">Hoàn tất</SelectItem>
                              <SelectItem value="failed">Thất bại</SelectItem>
                              <SelectItem value="refunded">Hoàn tiền</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {data?.pagination
                ? `Trang ${data.pagination.currentPage} / ${data.pagination.totalPages} • ${data.pagination.totalPayments} giao dịch`
                : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data?.pagination?.hasPrev}
                onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data?.pagination?.hasNext}
                onClick={() => setFilters((f) => ({ ...f, page: (data?.pagination?.currentPage || 1) + 1 }))}
              >
                Sau <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ProtectedShell>
  )
}
