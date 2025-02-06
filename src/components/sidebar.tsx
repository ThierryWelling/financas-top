"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Star,
  Lightbulb,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  LogOut,
  Shield,
  Settings,
  MessageSquarePlus,
  FileBarChart,
  Tags,
  Menu
} from 'lucide-react'
import { useProfile } from "@/hooks/useProfile"
import { supabase } from "@/lib/supabase"
import { usePWA } from '@/hooks/usePWA'
import { Button } from "./ui/button"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: 'text-blue-500' },
  { name: 'Receitas', icon: ArrowUpCircle, href: '/receitas', color: 'text-green-500' },
  { name: 'Despesas', icon: ArrowDownCircle, href: '/despesas', color: 'text-red-500' },
  { name: 'Eventuais', icon: Calendar, href: '/eventuais', color: 'text-orange-500' },
  { name: 'Sonhos', icon: Star, href: '/sonhos', color: 'text-purple-500' },
  { name: 'Sugestões', icon: Lightbulb, href: '/sugestoes', color: 'text-indigo-500' },
  { name: 'Relatórios', icon: BarChart3, href: '/relatorios', color: 'text-cyan-500' },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin, loading } = useProfile()
  const { isInstallable, instalarPWA } = usePWA()

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
      icon: ArrowUpCircle,
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
      icon: Star,
      href: "/sonhos",
    },
    {
      label: "Sugestões",
      icon: Lightbulb,
      href: "/sugestoes",
    },
    {
      label: "Relatórios",
      icon: BarChart3,
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
        isOpen ? "w-72" : "w-20"
      )}>
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <span className="text-xl font-bold">
            {!isOpen && "Financasia"}
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
        isOpen ? "w-72" : "w-20"
      )}>
        {/* Logo e Botão de Colapso */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowRightLeft className="w-8 h-8 text-blue-500" />
            {isOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Financasia
              </span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
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
                title={!isOpen ? link.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && link.label}
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
              !isOpen && "justify-center"
            )}
            title={!isOpen ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && "Sair"}
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