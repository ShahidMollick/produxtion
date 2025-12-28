"use client"

import { useState } from "react"
import { Menu, BarChart3, Factory, Package, Settings, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  label: string
  href: string
  icon: any
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: BarChart3 },
  { label: "Production", href: "/production", icon: Factory },
  { label: "Workers", href: "/workers", icon: Users },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl lg:block fixed h-full inset-y-0 z-50">
        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Factory OS
          </span>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === item.href 
                  ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)] border border-indigo-500/20" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header (Minimal) */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zinc-800 bg-black/80 backdrop-blur-md px-4 lg:hidden">
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Factory OS
          </span>
          <div className="ml-auto text-sm font-medium text-zinc-400">
             {navItems.find(i => i.href === pathname)?.label}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around lg:hidden pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
              pathname === item.href 
                ? "text-indigo-400" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <item.icon className={cn("h-6 w-6", pathname === item.href && "fill-current/20")} />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
