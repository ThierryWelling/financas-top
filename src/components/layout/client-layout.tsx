"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ChatIA } from "@/components/chat-ia"
import { analiseAutomatica } from "@/services/analise-automatica"
import { useProfile } from "@/hooks/useProfile"
import { NotificationsButton } from "@/components/notifications"
import { Toaster } from "@/components/ui/toaster"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const { profile } = useProfile()
  const isAuthPage = pathname === '/login' || pathname === '/register'

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
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>
      <ChatIA />
      <div className="fixed top-4 right-4 z-50">
        <NotificationsButton />
      </div>
      <Toaster />
    </div>
  )
} 