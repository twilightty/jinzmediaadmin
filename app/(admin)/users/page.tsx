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
import { formatDateTime } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
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
import { Badge } from "@/components/ui/badge"
import UserDetailDialog from "@/components/user-detail-dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"

type UsersResponse = {
  success: boolean
  data: {
    users: any[]
    pagination: { currentPage: number; totalPages: number; totalUsers: number; hasNext: boolean; hasPrev: boolean }
  }
}

const defaultFilters = {
  page: 1,
  limit: 10,
  search: "",
  role: "all",
  isActive: "all",
  isVerified: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
}

export default function UsersPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState({ ...defaultFilters })
  const [data, setData] = useState<UsersResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set("page", String(filters.page))
    p.set("limit", String(filters.limit))
    if (filters.search) p.set("search", filters.search)
    if (filters.role && filters.role !== "all") p.set("role", filters.role)
    if (filters.isActive !== "all") p.set("isActive", String(filters.isActive === "true"))
    if (filters.isVerified !== "all") p.set("isVerified", String(filters.isVerified === "true"))
    if (filters.sortBy) p.set("sortBy", filters.sortBy)
    if (filters.sortOrder) p.set("sortOrder", filters.sortOrder)
    return p.toString()
  }, [filters])

  useEffect(() => {
    setLoading(true)
    apiFetch<UsersResponse>(`users?${params}`, { method: "GET" })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [params])

  const updateStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiFetch(`users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      })
      toast({ title: `Đã ${isActive ? "kích hoạt" : "ngừng kích hoạt"} người dùng` })
      apiFetch<UsersResponse>(`users?${params}`, { method: "GET" }).then((res) => setData(res.data))
    } catch (e: any) {
      toast({ title: "Cập nhật trạng thái thất bại", description: e.message, variant: "destructive" })
    }
  }

  const updateRole = async (userId: string, role: string) => {
    try {
      await apiFetch(`users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })
      toast({ title: `Đã cập nhật vai trò: ${role}` })
      apiFetch<UsersResponse>(`users?${params}`, { method: "GET" }).then((res) => setData(res.data))
    } catch (e: any) {
      toast({ title: "Cập nhật vai trò thất bại", description: e.message, variant: "destructive" })
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await apiFetch(`users/${userId}`, { method: "DELETE" })
      toast({ title: "Đã xóa người dùng" })
      apiFetch<UsersResponse>(`users?${params}`, { method: "GET" }).then((res) => setData(res.data))
    } catch (e: any) {
      toast({ title: "Xóa người dùng thất bại", description: e.message, variant: "destructive" })
    }
  }

  return (
    <ProtectedShell>
      <Card>
        <CardHeader>
          <CardTitle>Người dùng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                placeholder="Tìm theo tên hoặc email"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
            <div>
              <Label>Vai trò</Label>
              <Select value={filters.role} onValueChange={(v) => setFilters((f) => ({ ...f, role: v, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="admin">Quản trị</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select
                value={filters.isActive}
                onValueChange={(v) => setFilters((f) => ({ ...f, isActive: v, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Ngừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Xác minh</Label>
              <Select
                value={filters.isVerified}
                onValueChange={(v) => setFilters((f) => ({ ...f, isVerified: v, page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Đã xác minh</SelectItem>
                  <SelectItem value="false">Chưa xác minh</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="lastLogin:desc">Đăng nhập gần nhất ↓</SelectItem>
                  <SelectItem value="lastLogin:asc">Đăng nhập gần nhất ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Xác minh</TableHead>
                  <TableHead>Đăng nhập gần nhất</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
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
                  : (data?.users ?? []).map((u: any) => (
                      <TableRow key={u._id}>
                        <TableCell className="min-w-40">
                          <div className="font-medium">{u.name}</div>
                        </TableCell>
                        <TableCell className="min-w-48 text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                            {u.role === "admin" ? "Quản trị" : "Người dùng"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.isActive ? "default" : "outline"}>
                            {u.isActive ? "Hoạt động" : "Ngừng"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.isVerified ? "default" : "outline"}>{u.isVerified ? "Có" : "Không"}</Badge>
                        </TableCell>
                        <TableCell className="min-w-40">{formatDateTime(u.lastLogin)}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <UserDetailDialog
                            userId={u._id}
                            onUpdated={() =>
                              apiFetch<UsersResponse>(`users?${params}`, { method: "GET" }).then((res) =>
                                setData(res.data),
                              )
                            }
                          />
                          <Button size="sm" variant="outline" onClick={() => updateStatus(u._id, !u.isActive)}>
                            {u.isActive ? "Ngừng kích hoạt" : "Kích hoạt"}
                          </Button>
                          <Select onValueChange={(v) => updateRole(u._id, v)} defaultValue={u.role}>
                            <SelectTrigger className="inline-flex h-9 w-[130px]">
                              <SelectValue placeholder="Vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Người dùng</SelectItem>
                              <SelectItem value="admin">Quản trị</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                Xóa
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này sẽ xóa vĩnh viễn người dùng và toàn bộ dữ liệu liên quan. Không thể hoàn
                                  tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(u._id)}>Xóa</AlertDialogAction>
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
                ? `Trang ${data.pagination.currentPage} / ${data.pagination.totalPages} • ${data.pagination.totalUsers} người dùng`
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
