"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrencyVND, formatDateTime } from "@/lib/format"

export default function TransactionDetailDialog({
  transactionId,
  onUpdated,
}: {
  transactionId: string
  onUpdated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    apiFetch(`transactions/${transactionId}`, { method: "GET" })
      .then((res: any) => setData(res.data))
      .finally(() => setLoading(false))
  }, [open, transactionId])

  const t = data?.transaction
  const related = data?.relatedPayment

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Xem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết giao dịch</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : t ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Mã GD: {t.transactionCode}</div>
                <div className="text-sm text-muted-foreground">ID: {t._id}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="uppercase">{t.status}</Badge>
                {t.duration && <Badge variant="secondary">{t.duration}</Badge>}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Người dùng" value={`${t.userId?.name ?? "-"} (${t.userId?._id ?? "-"})`} />
              <Info label="Email" value={t.email ?? t.userId?.email ?? "-"} />
              <Info label="Gói" value={t.packageId ?? "-"} />
              <Info label="Số tiền" value={formatCurrencyVND(t.amount ?? 0)} />
              <Info label="Thời lượng (tháng)" value={String(t.durationMonths ?? "-")} />
              <Info label="Hết hạn" value={formatDateTime(t.expirationDate)} />
              <Info label="Ngân hàng" value={`${t.bankName ?? "-"} • ${t.bankAccount ?? "-"}`} />
              <Info label="Tạo lúc" value={formatDateTime(t.createdAt)} />
              <Info label="Cập nhật" value={formatDateTime(t.updatedAt)} />
              {t.completedAt && <Info label="Hoàn tất lúc" value={formatDateTime(t.completedAt)} />}
            </div>

            {t.status === "pending" && t.qrCodeUrl && (
              <div>
                <div className="mb-2 text-sm font-medium">QR thanh toán</div>
                {/* hiển thị ảnh QR */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.qrCodeUrl || "/placeholder.svg"}
                  alt="QR thanh toán"
                  className="h-auto max-h-80 w-full max-w-sm rounded border object-contain"
                />
              </div>
            )}

            <div>
              <div className="mb-2 text-sm font-medium">Thanh toán liên quan</div>
              {related ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Info label="Payment ID" value={related._id} />
                  <Info label="User ID" value={related.userId} />
                  <Info label="Số tiền" value={formatCurrencyVND(related.amount ?? 0)} />
                  <Info label="Trạng thái" value={String(related.status)} />
                  <Info label="Tạo lúc" value={formatDateTime(related.createdAt)} />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Không có dữ liệu thanh toán liên quan</div>
              )}
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
      <div className="font-medium break-words">{value}</div>
    </div>
  )
}
