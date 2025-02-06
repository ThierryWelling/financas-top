"use client"

import { useState, useEffect } from 'react'
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
  Plus,
  Wallet,
  Target,
  LogOut,
  Shield,
  Menu
} from 'lucide-react'

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [animatingItems, setAnimatingItems] = useState<number[]>([])
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

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        const items: number[] = []
        const interval = setInterval(() => {
          if (items.length < menuItems.length + 1) {
            items.push(items.length)
            setAnimatingItems([...items])
          } else {
            clearInterval(interval)
          }
        }, 50)
        return () => clearInterval(interval)
      }, 100)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        const items = Array.from({ length: menuItems.length + 1 }, (_, i) => i)
        const interval = setInterval(() => {
          if (items.length > 0) {
            items.pop()
            setAnimatingItems([...items])
          } else {
            clearInterval(interval)
          }
        }, 50)
        return () => clearInterval(interval)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [isOpen, menuItems.length])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-all duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        style={{ zIndex: 40 }}
      />

      <div className="fixed bottom-4 left-4 flex flex-col items-start gap-2 z-50 md:hidden">
        <div className="flex flex-col gap-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <button
                key={index}
                onClick={() => handleClick(item.href)}
                className={`group relative h-12 flex items-center gap-3 px-4 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                    : 'bg-zinc-800/90 hover:bg-zinc-700/90'
                } ${
                  isOpen ? (animatingItems.includes(index) ? 'menu-item-enter' : 'opacity-0 translate-y-full scale-50') 
                        : animatingItems.includes(index) ? 'menu-item-exit' : 'opacity-0 translate-y-full scale-50'
                }`}
                style={{ 
                  position: 'relative',
                  zIndex: menuItems.length - index
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <item.icon 
                  size={20} 
                  className={`shrink-0 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                  }`} 
                />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                }`}>
                  {item.name}
                </span>
              </button>
            )
          })}
          <button
            onClick={handleLogout}
            className={`group relative h-12 flex items-center gap-3 px-4 bg-zinc-800/90 hover:bg-zinc-700/90 text-rose-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
              isOpen ? (animatingItems.includes(menuItems.length) ? 'menu-item-enter' : 'opacity-0 translate-y-full scale-50')
                    : animatingItems.includes(menuItems.length) ? 'menu-item-exit' : 'opacity-0 translate-y-full scale-50'
            }`}
            style={{ 
              position: 'relative',
              zIndex: 0
            }}
          >
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <LogOut size={20} className="shrink-0 text-rose-400 transition-transform duration-300" />
            <span className="text-sm font-medium whitespace-nowrap text-rose-400">Sair</span>
          </button>
        </div>
        <button
          className={`w-16 h-16 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 ${
            isOpen ? 'rotate-45' : ''
          }`}
          onClick={toggleMenu}
          style={{ position: 'relative', zIndex: menuItems.length + 1 }}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
          <Menu size={32} className="transition-transform duration-500" />
        </button>
      </div>
    </>
  )
} 