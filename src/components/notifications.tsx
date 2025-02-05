import { Bell, AlertTriangle, Calendar, Target, Lightbulb } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useEffect, useState } from "react"
import { notificacoesService } from "@/services/notificacoes"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: "alerta" | "lembrete" | "meta" | "dica"
  lida: boolean
  created_at: string
}

export function NotificationsButton() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const naoLidas = notificacoes.filter(n => !n.lida).length

  useEffect(() => {
    carregarNotificacoes()
  }, [])

  const carregarNotificacoes = async () => {
    try {
      const data = await notificacoesService.listar()
      setNotificacoes(data)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    }
  }

  const marcarComoLida = async (id: string) => {
    try {
      await notificacoesService.marcarComoLida(id)
      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      )
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  const getIconByTipo = (tipo: Notificacao["tipo"]) => {
    switch (tipo) {
      case "alerta":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "lembrete":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "meta":
        return <Target className="h-4 w-4 text-green-500" />
      case "dica":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
    }
  }

  const getBackgroundByTipo = (tipo: Notificacao["tipo"]) => {
    switch (tipo) {
      case "alerta":
        return "bg-red-500/10 hover:bg-red-500/20"
      case "lembrete":
        return "bg-blue-500/10 hover:bg-blue-500/20"
      case "meta":
        return "bg-green-500/10 hover:bg-green-500/20"
      case "dica":
        return "bg-yellow-500/10 hover:bg-yellow-500/20"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium flex items-center justify-center text-white">
              {naoLidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notificações</p>
            <p className="text-xs text-muted-foreground">
              {naoLidas} notificações não lidas
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notificacoes.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`flex flex-col space-y-1 p-4 ${
                  getBackgroundByTipo(notificacao.tipo)
                } ${!notificacao.lida ? "font-medium" : "opacity-70"}`}
                onClick={() => marcarComoLida(notificacao.id)}
              >
                <div className="flex items-center gap-2">
                  {getIconByTipo(notificacao.tipo)}
                  <span className="text-sm">{notificacao.titulo}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {notificacao.mensagem}
                </p>
                <span className="text-[10px] text-muted-foreground pl-6">
                  {formatDistanceToNow(new Date(notificacao.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 