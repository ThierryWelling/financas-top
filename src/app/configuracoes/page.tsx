"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { configuracoesService } from "@/services/configuracoes"
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Download,
  UserX,
  Loader2,
} from "lucide-react"

interface Configuracoes {
  id: string
  user_id: string
  cor_primaria: string
  cores_secundarias: {
    background: string
    foreground: string
    card: string
    popover: string
    primary: string
    secondary: string
    muted: string
    accent: string
  }
  notificacoes: {
    despesas_proximas: boolean
    despesas_atrasadas: boolean
    metas_atingidas: boolean
    dicas_economia: boolean
  }
  created_at?: string
  updated_at?: string
}

export default function ConfiguracoesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    id: "",
    user_id: "",
    cor_primaria: "#7C3AED",
    cores_secundarias: {
      background: "hsl(240 10% 3.9%)",
      foreground: "hsl(0 0% 98%)",
      card: "hsl(240 10% 3.9%)",
      popover: "hsl(240 10% 3.9%)",
      primary: "hsl(263.4 70% 50.4%)",
      secondary: "hsl(240 3.7% 15.9%)",
      muted: "hsl(240 3.7% 15.9%)",
      accent: "hsl(240 3.7% 15.9%)"
    },
    notificacoes: {
      despesas_proximas: true,
      despesas_atrasadas: true,
      metas_atingidas: true,
      dicas_economia: true
    }
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      carregarConfiguracoes()
    }
  }, [user])

  const carregarConfiguracoes = async () => {
    try {
      const config = await configuracoesService.carregar()
      if (config) {
        setConfiguracoes(config)
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSalvarConfiguracoes = async () => {
    setSalvando(true)
    try {
      await configuracoesService.atualizar(configuracoes)
      toast({
        title: "Sucesso",
        description: "Suas configurações foram salvas.",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas configurações.",
        variant: "destructive",
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleResetarConfiguracoes = async () => {
    setSalvando(true)
    try {
      await configuracoesService.resetar()
      await carregarConfiguracoes()
      toast({
        title: "Sucesso",
        description: "Suas configurações foram resetadas.",
      })
    } catch (error) {
      console.error("Erro ao resetar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível resetar suas configurações.",
        variant: "destructive",
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleExportarDados = async () => {
    try {
      await configuracoesService.exportarDados()
      toast({
        title: "Sucesso",
        description: "Seus dados foram exportados com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível exportar seus dados.",
        variant: "destructive",
      })
    }
  }

  const handleExcluirConta = async () => {
    if (
      confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        await configuracoesService.excluirConta()
        toast({
          title: "Conta excluída",
          description: "Sua conta foi excluída com sucesso.",
        })
        router.push("/login")
      } catch (error) {
        console.error("Erro ao excluir conta:", error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir sua conta.",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Configurações</h1>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Notificações</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="despesas_proximas">
                Alertar sobre despesas próximas
              </Label>
              <Switch
                id="despesas_proximas"
                checked={configuracoes.notificacoes.despesas_proximas}
                onCheckedChange={(checked: boolean) =>
                  setConfiguracoes({
                    ...configuracoes,
                    notificacoes: {
                      ...configuracoes.notificacoes,
                      despesas_proximas: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="despesas_atrasadas">
                Alertar sobre despesas atrasadas
              </Label>
              <Switch
                id="despesas_atrasadas"
                checked={configuracoes.notificacoes.despesas_atrasadas}
                onCheckedChange={(checked: boolean) =>
                  setConfiguracoes({
                    ...configuracoes,
                    notificacoes: {
                      ...configuracoes.notificacoes,
                      despesas_atrasadas: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="metas_atingidas">
                Notificar quando metas forem atingidas
              </Label>
              <Switch
                id="metas_atingidas"
                checked={configuracoes.notificacoes.metas_atingidas}
                onCheckedChange={(checked: boolean) =>
                  setConfiguracoes({
                    ...configuracoes,
                    notificacoes: {
                      ...configuracoes.notificacoes,
                      metas_atingidas: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dicas_economia">
                Receber dicas de economia
              </Label>
              <Switch
                id="dicas_economia"
                checked={configuracoes.notificacoes.dicas_economia}
                onCheckedChange={(checked: boolean) =>
                  setConfiguracoes({
                    ...configuracoes,
                    notificacoes: {
                      ...configuracoes.notificacoes,
                      dicas_economia: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleResetarConfiguracoes}
            disabled={salvando}
          >
            Resetar
          </Button>
          <Button onClick={handleSalvarConfiguracoes} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Dados</h2>
        <div className="space-y-4">
          <div>
            <Button variant="outline" onClick={handleExportarDados}>
              Exportar Dados
            </Button>
            <p className="mt-2 text-sm text-gray-400">
              Baixe todos os seus dados em formato JSON
            </p>
          </div>

          <div>
            <Button
              variant="destructive"
              onClick={handleExcluirConta}
            >
              Excluir Conta
            </Button>
            <p className="mt-2 text-sm text-gray-400">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 