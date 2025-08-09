"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrencyVND, formatDateTime } from "@/lib/format"

export default function UserDetailDialog({ userId, onUpdated }: { userId: string; onUpdated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    apiFetch(`users/${userId}`, { method: "GET" })
      .then((res: any) => setData(res.data))
      .finally(() => setLoading(false))
  }, [open, userId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Xem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{data.user.name}</div>
                <div className="text-sm text-muted-foreground">{data.user.email}</div>
              </div>
              <div className="flex gap-2">
                <Badge variant={data.user.isActive ? "default" : "outline"}>
                  {data.user.isActive ? "Hoạt động" : "Ngừng"}
                </Badge>
                <Badge variant={data.user.isVerified ? "default" : "outline"}>
                  {data.user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                </Badge>
                <Badge className="capitalize">{data.user.role === "admin" ? "Quản trị" : "Người dùng"}</Badge>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Info label="Số điện thoại" value={data.user.phone || "-"} />
              <Info label="Tạo lúc" value={formatDateTime(data.user.createdAt)} />
              <Info label="Đăng nhập gần nhất" value={formatDateTime(data.user.lastLogin)} />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Thống kê</div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Giao dịch" value={data.stats?.totalPayments ?? 0} />
                <Stat label="Hoàn tất" value={data.stats?.completedPayments ?? 0} />
                <Stat label="Tổng chi" value={formatCurrencyVND(data.stats?.totalSpent ?? 0)} />
                <Stat label="Số gói" value={data.stats?.packagesCount ?? 0} />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Thanh toán gần đây</div>
              <div className="max-h-56 overflow-auto rounded border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="p-2 text-left">Số tiền</th>
                      <th className="p-2 text-left">Trạng thái</th>
                      <th className="p-2 text-left">Gói</th>
                      <th className="p-2 text-left">Tạo lúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.payments ?? []).map((p: any) => (
                      <tr key={p._id} className="border-t">
                        <td className="p-2">{formatCurrencyVND(p.amount)}</td>
                        <td className="p-2 uppercase">{p.status}</td>
                        <td className="p-2">{p.packageId}</td>
                        <td className="p-2">{formatDateTime(p.createdAt)}</td>
                      </tr>
                    ))}
                    {(!data.payments || data.payments.length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-muted-foreground">
                          Không có thanh toán
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setOpen(false)
                  onUpdated?.()
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
