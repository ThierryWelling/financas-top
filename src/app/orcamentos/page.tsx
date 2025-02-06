"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { PiggyBank, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ChatIA } from "@/components/chat-ia"

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [novaCategoria, setNovaCategoria] = useState('')
  const [novoLimite, setNovoLimite] = useState('')
  const [novoMesAno, setNovoMesAno] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarOrcamentos()
  }, [])

  const carregarOrcamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('mes_ano', { ascending: false })

      if (error) throw error
      setOrcamentos(data || [])
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const novoOrcamento = {
        categoria: novaCategoria,
        valor_limite: parseFloat(novoLimite),
        mes_ano: novoMesAno,
        valor_atual: 0,
        alerta_percentual: 80
      }

      const { error } = await supabase
        .from('orcamentos')
        .insert([novoOrcamento])

      if (error) throw error

      toast.success('Orçamento adicionado com sucesso!')
      setNovaCategoria('')
      setNovoLimite('')
      setNovoMesAno('')
      carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error)
      toast.error('Erro ao adicionar orçamento')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Orçamento excluído com sucesso!')
      carregarOrcamentos()
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)
      toast.error('Erro ao excluir orçamento')
    }
  }

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return 'bg-red-500'
    if (percentual >= 80) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <p className="text-gray-400">Defina limites de gastos por categoria</p>
      </div>

      {/* Formulário de Novo Orçamento */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Limite"
            value={novoLimite}
            onChange={(e) => setNovoLimite(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="month"
            value={novoMesAno}
            onChange={(e) => setNovoMesAno(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white font-medium"
          >
            Adicionar
          </button>
        </form>
      </Card>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orcamentos.map((orcamento) => {
          const percentual = Math.round((orcamento.valor_atual / orcamento.valor_limite) * 100)
          const excedido = percentual > 100

          return (
            <Card key={orcamento.id} className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{orcamento.categoria}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(orcamento.mes_ano).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(orcamento.id)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span className={percentual >= 80 ? 'text-yellow-500' : 'text-gray-400'}>
                    {percentual}%
                  </span>
                </div>
                <Progress
                  value={percentual > 100 ? 100 : percentual}
                  className="h-2"
                  indicatorClassName={getStatusColor(percentual)}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {formatCurrency(orcamento.valor_atual)} de {formatCurrency(orcamento.valor_limite)}
                  </span>
                </div>
              </div>

              {excedido && (
                <Alert variant="warning" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Limite excedido em {formatCurrency(orcamento.valor_atual - orcamento.valor_limite)}
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          )
        })}
      </div>

      {/* Estado vazio */}
      {!loading && orcamentos.length === 0 && (
        <Card className="p-8 text-center">
          <PiggyBank className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-medium mb-2">Nenhum orçamento definido</h3>
          <p className="text-gray-400">Comece definindo seu primeiro orçamento</p>
        </Card>
      )}

      {/* Chat IA */}
      <ChatIA />
    </div>
  )
} 