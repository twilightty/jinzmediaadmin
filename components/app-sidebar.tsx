"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BarChart, Home, LogOut, ShieldCheck, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname.startsWith(href)
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const items = [
    { title: "Bảng điều khiển", icon: Home, href: "/dashboard" },
    { title: "Người dùng", icon: Users, href: "/users" },
    { title: "Thanh toán", icon: Wallet, href: "/payments" },
    { title: "Phân tích", icon: BarChart, href: "/analytics" },
    { title: "Hồ sơ", icon: ShieldCheck, href: "/profile" },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-semibold tracking-tight">JINZMedia Admin</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(pathname, item.href)} tooltip={item.title}>
                    <Link href={item.href} className="flex items-center">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            localStorage.removeItem("adminToken")
            router.replace("/")
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
