"use client"

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
  Download,
  LogOut,
  PiggyBank,
  Tags,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isInstallable, instalarPWA } = usePWA()
  const router = useRouter()
  const { profile } = useProfile()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: 'text-blue-500' },
    { name: 'Receitas', icon: ArrowUpCircle, href: '/receitas', color: 'text-green-500' },
    { name: 'Despesas', icon: ArrowDownCircle, href: '/despesas', color: 'text-red-500' },
    { name: 'Orçamentos', icon: PiggyBank, href: '/orcamentos', color: 'text-yellow-500' },
    { name: 'Categorias', icon: Tags, href: '/categorias', color: 'text-pink-500' },
    { name: 'Eventuais', icon: Calendar, href: '/eventuais', color: 'text-orange-500' },
    { name: 'Sonhos', icon: Star, href: '/sonhos', color: 'text-purple-500' },
    { name: 'Sugestões', icon: Lightbulb, href: '/sugestoes', color: 'text-indigo-500' },
    { name: 'Relatórios', icon: BarChart3, href: '/relatorios', color: 'text-cyan-500' },
    { name: 'Configurações', icon: Settings, href: '/configuracoes', color: 'text-gray-500' },
    ...(profile?.is_admin ? [
      { name: 'Administração', icon: Shield, href: '/admin', color: 'text-red-500' }
    ] : [])
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <>
      {/* Overlay para fechar o menu no mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base
          'fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 transition-all duration-300',
          // Mobile (tela cheia e desliza da esquerda)
          'md:w-72 md:translate-x-0',
          // Estado aberto/fechado
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo e Perfil */}
        <div className="flex flex-col border-b border-gray-800">
          {/* Logo */}
          <div className="flex items-center h-16 px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowRightLeft className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Financasia
              </span>
            </Link>
          </div>

          {/* Perfil do Usuário */}
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.nome || 'Usuário'}</p>
                <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col h-[calc(100%-8.5rem)] p-4">
          <div className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg transition-all',
                    isActive
                      ? 'bg-gray-800/50 border-r-4 border-blue-500'
                      : 'hover:bg-gray-800/30'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6',
                      item.color,
                      isActive && 'animate-pulse'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Botões de ação */}
          <div className="space-y-2 pt-4 border-t border-gray-800">
            {isInstallable && (
              <button
                onClick={() => {
                  instalarPWA()
                  onClose()
                }}
                className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full hover:bg-gray-800/30 text-emerald-500"
              >
                <Download className="w-6 h-6" />
                <span>Instalar App</span>
              </button>
            )}

            <button
              onClick={() => {
                handleLogout()
                onClose()
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full hover:bg-gray-800/30 text-red-500"
            >
              <LogOut className="w-6 h-6" />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
} 