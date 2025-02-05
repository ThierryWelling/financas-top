"use client"

import { Menu, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { NotificationsButton } from "./notifications"
import { useProfile } from "@/hooks/useProfile"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { profile } = useProfile()

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
    <header className="flex h-16 items-center border-b bg-background px-4 dark:bg-zinc-800/40">
      <button
        onClick={onMenuClick}
        className="inline-flex items-center justify-center rounded-md p-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-4 px-6">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar transações..."
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationsButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:text-zinc-400 dark:hover:bg-zinc-800">
              <Avatar>
                <AvatarImage src="https://github.com/thierryaraujo.png" />
                <AvatarFallback>{profile?.nome?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
              </Avatar>
              {profile?.nome || 'Usuário'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-500 dark:text-rose-400 cursor-pointer">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 