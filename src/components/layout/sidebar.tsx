import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

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
  const { isInstallable, instalarPWA } = usePWA()
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px é o breakpoint para tablets/desktop
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Determinar se o menu deve estar expandido
  const shouldExpand = isMobile ? isOpen : isHovered

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={cn(
        'relative h-screen bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 transition-all duration-300',
        shouldExpand ? 'w-72' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowRightLeft className="w-8 h-8 text-blue-500" />
          {shouldExpand && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Financasia
            </span>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors md:hidden"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-gray-800/50 border-r-4 border-blue-500'
                  : 'hover:bg-gray-800/30',
                !shouldExpand && 'justify-center'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  item.color,
                  isActive && 'animate-pulse'
                )}
              />
              {shouldExpand && <span>{item.name}</span>}
            </Link>
          )
        })}

        {/* Botão de Instalação do PWA */}
        {isInstallable && (
          <button
            onClick={instalarPWA}
            className={cn(
              'flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full',
              'hover:bg-gray-800/30 text-emerald-500',
              !shouldExpand && 'justify-center'
            )}
          >
            <Download className="w-6 h-6" />
            {shouldExpand && <span>Instalar App</span>}
          </button>
        )}
      </nav>
    </aside>
  )
} 