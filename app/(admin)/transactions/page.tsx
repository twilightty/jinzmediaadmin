"use client"

import ProtectedShell from "@/components/protected-shell"
import TransactionDetailDialog from "@/components/transaction-detail-dialog"
import { apiFetch } from "@/lib/api"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrencyVND, formatDate, formatDateTime } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TransactionsResponse = {
  success: boolean
  data: {
    transactions: any[]
    summary?: { _id: string; count: number; total: number }[]
    pagination: {
      currentPage: number
      totalPages: number
      totalTransactions: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

const defaultFilters = {
  page: 1,
  limit: 10,
  status: "all",
  userId: "",
  packageId: "",
  search: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
}

export default function TransactionsPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState({ ...defaultFilters })
  const [data, setData] = useState<TransactionsResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set("page", String(filters.page))
    p.set("limit", String(filters.limit))
    if (filters.status !== "all") p.set("status", filters.status)
    if (filters.userId) p.set("userId", filters.userId)
    if (filters.packageId) p.set("packageId", filters.packageId)
    if (filters.search) p.set("search", filters.search)
    if (filters.dateFrom) p.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) p.set("dateTo", filters.dateTo)
    p.set("sortBy", filters.sortBy)
    p.set("sortOrder", filters.sortOrder)
    return p.toString()
  }, [filters])

  useEffect(() => {
    setLoading(true)
    apiFetch<TransactionsResponse>(`transactions?${params}`, { method: "GET" })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [params])

  const updateStatus = async (transactionId: string, status: string, notes?: string) => {
    try {
      await apiFetch(`transactions/${transactionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes: notes || "" }),
      })
      toast({ title: "Đã cập nhật trạng thái giao dịch" })
      apiFetch<TransactionsResponse>(`transactions?${params}`, { method: "GET" }).then((res) => setData(res.data))
    } catch (e: any) {
      toast({ title: "Cập nhật trạng thái thất bại", description: e.message, variant: "destructive" })
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    try {
      await apiFetch(`transactions/${transactionId}`, { method: "DELETE" })
      toast({ title: "Đã xoá giao dịch" })
      apiFetch<TransactionsResponse>(`transactions?${params}`, { method: "GET" }).then((res) => setData(res.data))
    } catch (e: any) {
      toast({ title: "Xoá giao dịch thất bại", description: e.message, variant: "destructive" })
    }
  }

  return (
    <ProtectedShell>
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-8">
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
                  <SelectItem value="cancelled">Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label>Tìm kiếm</Label>
              <Input
                placeholder="Mã GD, email, hoặc mã gói"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label>User ID</Label>
              <Input
                placeholder="Lọc theo userId"
                value={filters.userId}
                onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label>Package ID</Label>
              <Input
                placeholder="Lọc theo packageId"
                value={filters.packageId}
                onChange={(e) => setFilters((f) => ({ ...f, packageId: e.target.value, page: 1 }))}
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
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: filters.limit }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <div className="h-6 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : (data?.transactions ?? []).map((t: any) => (
                      <TableRow key={t._id}>
                        <TableCell className="min-w-40">
                          <div className="font-medium">{t.transactionCode}</div>
                          <div className="text-xs text-muted-foreground uppercase">
                            <Badge className="uppercase">{t.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-48">
                          <div className="font-medium">{t.userId?.name || t.userId?._id}</div>
                          <div className="text-xs text-muted-foreground">{t.email || t.userId?.email}</div>
                        </TableCell>
                        <TableCell className="min-w-48">{t.packageId || "-"}</TableCell>
                        <TableCell>{formatCurrencyVND(t.amount)}</TableCell>
                        <TableCell className="min-w-28">
                          {t.duration || "-"} {t.durationMonths ? `(${t.durationMonths} tháng)` : ""}
                        </TableCell>
                        <TableCell className="min-w-36">{formatDate(t.expirationDate)}</TableCell>
                        <TableCell className="min-w-44">
                          {(t.bankName || "-") + " • " + (t.bankAccount || "-")}
                        </TableCell>
                        <TableCell className="min-w-36">{formatDateTime(t.createdAt)}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <TransactionDetailDialog
                            transactionId={t._id}
                            onUpdated={() =>
                              apiFetch<TransactionsResponse>(`transactions?${params}`, { method: "GET" }).then((res) =>
                                setData(res.data),
                              )
                            }
                          />
                          <Select onValueChange={(v) => updateStatus(t._id, v)} defaultValue={t.status}>
                            <SelectTrigger className="inline-flex h-9 w-[140px]">
                              <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ xử lý</SelectItem>
                              <SelectItem value="completed">Hoàn tất</SelectItem>
                              <SelectItem value="failed">Thất bại</SelectItem>
                              <SelectItem value="cancelled">Hủy</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={t.status === "completed"}>
                                Xoá
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xoá giao dịch?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Chỉ có thể xoá các giao dịch chưa hoàn tất. Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTransaction(t._id)}>Xoá</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {data?.pagination
                ? `Trang ${data.pagination.currentPage} / ${data.pagination.totalPages} • ${data.pagination.totalTransactions} giao dịch`
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
