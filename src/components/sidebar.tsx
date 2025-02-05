"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Lightbulb,
  LogOut,
  Shield,
  Settings,
  ArrowRightLeft,
  Calendar,
  Star,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  MessageSquarePlus,
  FileBarChart,
  Tags,
  Menu
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { supabase } from "@/lib/supabase"
import { cn } from '@/lib/utils'
import { Button } from "./ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin, loading } = useProfile()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      label: "Orçamentos",
      icon: PiggyBank,
      href: "/orcamentos",
    },
    {
      label: "Categorias",
      icon: Tags,
      href: "/categorias",
    },
    {
      label: "Eventuais",
      icon: Calendar,
      href: "/eventuais",
    },
    {
      label: "Sonhos",
      icon: Target,
      href: "/sonhos",
    },
    {
      label: "Sugestões",
      icon: MessageSquarePlus,
      href: "/sugestoes",
    },
    {
      label: "Relatórios",
      icon: FileBarChart,
      href: "/relatorios",
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/configuracoes",
    },
    // Link de Administração (visível apenas para admins)
    ...(isAdmin ? [{
      label: "Administração",
      icon: Shield,
      href: "/admin",
    }] : []),
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <span className="text-xl font-bold">
            {!isCollapsed && "Financasia"}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </aside>
    )
  }

  return (
    <>
      {/* Sidebar para Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Logo e Botão de Colapso */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <Link href="/dashboard" className="flex items-center">
            <Menu className="h-6 w-6" />
            {!isCollapsed && (
              <span className="ml-2 text-xl font-bold">Financasia</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors group relative",
                  isActive
                    ? "bg-indigo-500 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && link.label}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 rounded-md bg-gray-900 px-2 py-1 text-sm invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                    {link.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white w-full group relative",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && "Sair"}
            {isCollapsed && (
              <span className="absolute left-full ml-2 rounded-md bg-gray-900 px-2 py-1 text-sm invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all">
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Menu flutuante para Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-gray-900 border-t border-gray-800">
        <div className="flex w-full justify-around items-center">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 text-xs",
                  isActive
                    ? "text-indigo-500"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-3 text-xs text-gray-400 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </>
  )
} 