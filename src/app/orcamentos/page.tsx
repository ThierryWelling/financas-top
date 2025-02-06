"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Copy, Trash2, AlertTriangle } from "lucide-react"
import { orcamentosService, Orcamento } from "@/services/orcamentos"
import { toast } from "sonner"

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [mesAno, setMesAno] = useState(new Date().toISOString().slice(0, 7))
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    categoria: "",
    valor_limite: "",
    alerta_percentual: "80"
  })

  useEffect(() => {
    carregarOrcamentos()
  }, [mesAno])

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)
      const data = await orcamentosService.listar(`${mesAno}-01`)
      setOrcamentos(data)
    } catch (error) {
      toast.error("Erro ao carregar orçamentos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await orcamentosService.criar({
        categoria: formData.categoria,
        valor_limite: Number(formData.valor_limite),
        alerta_percentual: Number(formData.alerta_percentual),
        mes_ano: `${mesAno}-01`,
        user_id: "" // Será preenchido pelo RLS
      })
      
      toast.success("Orçamento criado com sucesso")
      setFormData({ categoria: "", valor_limite: "", alerta_percentual: "80" })
      setShowForm(false)
      carregarOrcamentos()
    } catch (error) {
      toast.error("Erro ao criar orçamento")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicar = async () => {
    try {
      setLoading(true)
      await orcamentosService.duplicarParaProximoMes(`${mesAno}-01`)
      toast.success("Orçamentos duplicados para o próximo mês")
      
      // Avançar para o próximo mês
      const nextMonth = new Date(mesAno)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      setMesAno(nextMonth.toISOString().slice(0, 7))
    } catch (error) {
      toast.error("Erro ao duplicar orçamentos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return
    
    try {
      setLoading(true)
      await orcamentosService.excluir(id)
      toast.success("Orçamento excluído com sucesso")
      carregarOrcamentos()
    } catch (error) {
      toast.error("Erro ao excluir orçamento")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return "bg-red-500"
    if (percentual >= 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <div className="flex gap-2">
          <Input
            type="month"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </Button>
          <Button onClick={handleDuplicar} variant="outline" className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Duplicar para Próximo Mês
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Input
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Ex: Alimentação"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor Limite</label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_limite}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_limite: e.target.value }))}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Percentual de Alerta</label>
                <Input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alerta_percentual}
                  onChange={(e) => setFormData(prev => ({ ...prev, alerta_percentual: e.target.value }))}
                  placeholder="80%"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Salvar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orcamentos.map((orcamento) => {
          const percentual = (orcamento.valor_atual / orcamento.valor_limite) * 100
          const statusColor = getStatusColor(percentual)
          
          return (
            <Card key={orcamento.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{orcamento.categoria}</h3>
                  <p className="text-sm text-gray-500">
                    Limite: R$ {orcamento.valor_limite.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleExcluir(orcamento.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Progress value={percentual} className={statusColor} />
                <div className="flex justify-between text-sm">
                  <span>R$ {orcamento.valor_atual.toFixed(2)}</span>
                  <span>{Math.round(percentual)}%</span>
                </div>

                {percentual >= orcamento.alerta_percentual && (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      {percentual >= 100
                        ? "Limite excedido!"
                        : `${Math.round(percentual)}% do limite atingido`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {orcamentos.length === 0 && !loading && (
        <Card className="p-4 text-center text-gray-500">
          Nenhum orçamento definido para este mês
        </Card>
      )}
    </div>
  )
} 