"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b bg-background/60 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/automation/dashboard" className="hover:text-foreground transition-colors">
                Automation tool
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex h-8 items-center rounded-md border bg-transparent px-3 text-sm"
              >
                Quay về Admin
              </Link>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </ThemeProvider>
  )
}


