"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setToken } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function Page() {
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiFetch<{ data: { token: string } }>("login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      const token = res?.data?.token
      if (!token) throw new Error("Không nhận được token")
      setToken(token)
      toast({ title: "Đăng nhập thành công" })
      router.replace("/dashboard")
    } catch (err: any) {
      toast({
        title: "Đăng nhập thất bại",
        description: err?.message || "Thông tin đăng nhập không hợp lệ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Đăng nhập Quản trị</CardTitle>
          <CardDescription>Đăng nhập bằng tài khoản quản trị để truy cập bảng điều khiển.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
