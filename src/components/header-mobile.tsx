"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useProfile } from "@/hooks/useProfile"
import { Bell } from 'lucide-react'

export function HeaderMobile() {
  const router = useRouter()
  const { profile } = useProfile()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 md:hidden">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Financasia"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Financasia
          </span>
        </div>

        {/* Perfil e Notificações */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {/* Indicador de notificações */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button 
            className="flex items-center gap-2 rounded-full bg-gray-800/50 px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {profile?.nome?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <span className="truncate max-w-[100px]">
              {profile?.nome || 'Usuário'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
} 