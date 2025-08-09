export function formatCurrencyVND(amount: number) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
      amount,
    )
  } catch {
    return `${amount.toLocaleString("vi-VN")} ₫`
  }
}

export function formatDateTime(iso: string | number | Date) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString()
}

export function formatDate(iso: string | number | Date) {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toISOString().slice(0, 10)
}
