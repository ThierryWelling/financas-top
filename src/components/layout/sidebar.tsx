"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useProfile } from "@/hooks/useProfile"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Star,
  Lightbulb,
  BarChart3,
  Settings,
  Wallet,
  Target,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAdmin } = useProfile()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Receitas', icon: ArrowUpCircle, href: '/receitas' },
    { name: 'Despesas', icon: ArrowDownCircle, href: '/despesas' },
    { name: 'Eventuais', icon: Calendar, href: '/eventuais' },
    { name: 'Sonhos', icon: Star, href: '/sonhos' },
    { name: 'Sugestões', icon: Lightbulb, href: '/sugestoes' },
    { name: 'Relatórios', icon: BarChart3, href: '/relatorios' },
    { name: 'Categorias', icon: Target, href: '/categorias' },
    { name: 'Orçamentos', icon: Wallet, href: '/orcamentos' },
    { name: 'Configurações', icon: Settings, href: '/configuracoes' },
    ...(isAdmin ? [{ name: 'Admin', icon: Shield, href: '/admin' }] : []),
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900/95 border-r border-gray-800/50 transition-all duration-300 ${
      !isOpen ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800/50">
        <Image
          src="/logo.svg"
          alt="Financasia"
          width={32}
          height={32}
          className="shrink-0"
        />
        {isOpen && (
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Financasia
          </span>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-white' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }
              `}
            >
              <div className={`shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-white'}`}>
                <item.icon size={20} />
              </div>
              {isOpen && (
                <span className="truncate">{item.name}</span>
              )}
              {isActive && isOpen && (
                <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-r-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-800/50 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span>Sair</span>}
        </button>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
        >
          {!isOpen ? (
            <ChevronRight size={20} className="shrink-0" />
          ) : (
            <>
              <ChevronLeft size={20} className="shrink-0" />
              <span>Recolher menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
} 