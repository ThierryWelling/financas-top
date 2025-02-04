"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Lightbulb,
  LogOut,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Receitas",
      icon: ArrowUpCircle,
      href: "/receitas",
    },
    {
      label: "Despesas",
      icon: ArrowDownCircle,
      href: "/despesas",
    },
    {
      label: "Sonhos",
      icon: Target,
      href: "/sonhos",
    },
    {
      label: "Sugestões",
      icon: Lightbulb,
      href: "/sugestoes",
    },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <aside className="flex w-64 flex-col border-r border-gray-800 bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link href="/dashboard" className="text-xl font-bold">
          T-LowCode
        </Link>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-indigo-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  )
} 