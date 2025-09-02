"use client"

import type React from "react"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const segments = pathname
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "(admin)")

  const crumbHref = (idx: number) => "/" + segments.slice(0, idx + 1).join("/")

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 border-b bg-background/60 backdrop-blur">
            <div className="flex h-14 items-center gap-2 px-4">
              <SidebarTrigger />
              <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Trang chủ
                </Link>
                {segments.map((seg, i) => (
                  <span key={i} className={cn("flex items-center gap-1")}>
                    <span aria-hidden>/</span>
                    <Link href={crumbHref(i)} className={cn("hover:text-foreground capitalize")}>
                      {decodeURIComponent(seg)}
                    </Link>
                  </span>
                ))}
              </nav>
              {/* App Switcher */}
              <div className="ml-4">
                <select
                  className="h-8 rounded-md border bg-background px-2 text-sm text-foreground"
                  defaultValue="admin"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "admin") window.location.href = "/dashboard"
                    if (val === "automation") window.location.href = "/automation/dashboard"
                  }}
                >
                  <option value="admin">AI Automation Admin</option>
                  <option value="automation">Automation tool</option>
                </select>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <Button asChild variant="outline" className="hidden sm:inline-flex bg-transparent">
                  <a href="https://jinzmedia.com" target="_blank" rel="noreferrer">
                    Mở API
                  </a>
                </Button>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
