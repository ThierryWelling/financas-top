"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { NotificationsButton } from "@/components/notifications"
import { Toaster } from "@/components/ui/toaster"
import { analiseAutomatica } from "@/services/analise-automatica"
import { useProfile } from "@/hooks/useProfile"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const { profile } = useProfile()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Fechar a sidebar automaticamente em desktop
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    if (!isAuthPage && profile?.id) {
      // Executar análise inicial
      executarAnaliseAutomatica()

      // Configurar intervalos de análise
      const intervalAnalise = setInterval(() => executarAnaliseAutomatica(), 5 * 60 * 1000) // A cada 5 minutos
      const intervalMetas = setInterval(() => verificarMetas(), 10 * 60 * 1000) // A cada 10 minutos
      const intervalSugestoes = setInterval(() => sugerirAcoes(), 30 * 60 * 1000) // A cada 30 minutos

      return () => {
        clearInterval(intervalAnalise)
        clearInterval(intervalMetas)
        clearInterval(intervalSugestoes)
      }
    }
  }, [isAuthPage, profile?.id])

  const executarAnaliseAutomatica = async () => {
    if (!profile?.id) return
    try {
      await analiseAutomatica.analisarFinancas(profile.id)
    } catch (error) {
      console.error("Erro na análise automática:", error)
    }
  }

  const verificarMetas = async () => {
    if (!profile?.id) return
    try {
      await analiseAutomatica.verificarMetas(profile.id)
    } catch (error) {
      console.error("Erro ao verificar metas:", error)
    }
  }

  const sugerirAcoes = async () => {
    if (!profile?.id) return
    try {
      await analiseAutomatica.sugerirAcoes(profile.id)
    } catch (error) {
      console.error("Erro ao sugerir ações:", error)
    }
  }

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Grid de fundo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Layout principal */}
      <div className="relative flex w-full">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Conteúdo principal */}
        <div className="flex-1">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="mt-16 p-4 md:p-8">
            {children}
          </main>
        </div>

        {/* Notificações */}
        <div className="fixed top-4 right-4 z-50">
          <NotificationsButton />
        </div>
      </div>

      <Toaster />
    </div>
  )
} 