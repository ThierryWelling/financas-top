"use client"

import { useState, useEffect } from "react"
import {
  PlusCircle,
  Home,
  ShoppingCart,
  Car,
  Utensils,
  Heart,
  Smartphone,
  Dumbbell,
  Lightbulb,
  TrendingDown,
  AlertCircle,
  PieChart,
  ArrowDown,
  DollarSign,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Calculator,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { despesasService } from "@/services/financas"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { ImportarDespesas } from "@/components/importar-despesas"
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ChatIA } from "@/components/chat-ia"

// Categorias de despesas
const CATEGORIAS = {
  "Moradia": { nome: "Moradia", icone: "🏠" },
  "Alimentação": { nome: "Alimentação", icone: "🍽️" },
  "Transporte": { nome: "Transporte", icone: "🚗" },
  "Saúde": { nome: "Saúde", icone: "⚕️" },
  "Educação": { nome: "Educação", icone: "📚" },
  "Lazer": { nome: "Lazer", icone: "🎮" },
  "Outros": { nome: "Outros", icone: "📦" }
} as const;

interface Despesa {
  id: string
  created_at?: string
  user_id?: string
  valor: number
  descricao: string
  categoria: string
  data: string
  pago: boolean
}

export default function DespesasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [novaDescricao, setNovaDescricao] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [novaCategoria, setNovaCategoria] = useState('')
  const [novaData, setNovaData] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      carregarDespesas()
    }
  }, [user])

  const carregarDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false })

      if (error) throw error
      setDespesas(data || [])
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
      toast.error('Erro ao carregar despesas')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotalDespesas = () => {
    return despesas.reduce((acc, despesa) => acc + despesa.valor, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const novaDespesa = {
        descricao: novaDescricao,
        valor: parseFloat(novoValor),
        categoria: novaCategoria,
        data: novaData,
        pago: false
      }

      const { error } = await supabase
        .from('despesas')
        .insert([novaDespesa])

      if (error) throw error

      toast.success('Despesa adicionada com sucesso!')
      setNovaDescricao('')
      setNovoValor('')
      setNovaCategoria('')
      setNovaData('')
      carregarDespesas()
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error)
      toast.error('Erro ao adicionar despesa')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Despesa excluída com sucesso!')
      carregarDespesas()
    } catch (error) {
      console.error('Erro ao excluir despesa:', error)
      toast.error('Erro ao excluir despesa')
    }
  }

  const handleEdit = (despesa: Despesa) => {
    setEditando(despesa.id)
    setModalAberto(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return

    try {
      const { error } = await supabase
        .from('despesas')
        .update({
          descricao: novaDescricao,
          valor: parseFloat(novoValor),
          categoria: novaCategoria,
          data: novaData,
          pago: false
        })
        .eq('id', editando)

      if (error) throw error

      toast.success('Despesa atualizada com sucesso!')
      setModalAberto(false)
      setEditando(null)
      setNovaDescricao('')
      setNovoValor('')
      setNovaCategoria('')
      setNovaData('')
      carregarDespesas()
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error)
      toast.error('Erro ao atualizar despesa')
    }
  }

  const togglePago = async (despesa: Despesa) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .update({ pago: !despesa.pago })
        .eq('id', despesa.id)

      if (error) throw error

      toast.success(`Despesa marcada como ${!despesa.pago ? 'paga' : 'não paga'}`)
      carregarDespesas()
    } catch (error) {
      console.error('Erro ao atualizar status da despesa:', error)
      toast.error('Erro ao atualizar status da despesa')
    }
  }

  // Função auxiliar para garantir categoria válida
  const getCategoriaInfo = (categoria: string) => {
    const categoriaInfo = CATEGORIAS[categoria as keyof typeof CATEGORIAS];
    return categoriaInfo || CATEGORIAS["Outros"]; // Retorna "Outros" como fallback
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Despesas</h1>
          <p className="text-gray-400">Gerencie suas despesas mensais</p>
        </div>
        <ImportarDespesas onImportComplete={carregarDespesas} />
      </div>

      {/* Formulário de Nova Despesa */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="Descrição"
            value={novaDescricao}
            onChange={(e) => setNovaDescricao(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <input
            type="date"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
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

      {/* Lista de Despesas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {despesas.map((despesa) => (
          <Card key={despesa.id} className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{despesa.descricao}</h3>
                <p className="text-sm text-gray-400">{despesa.categoria}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePago(despesa)}
                  className={cn(
                    "p-1 rounded-lg transition-colors",
                    despesa.pago ? "text-green-500 hover:bg-green-500/10" : "text-gray-400 hover:bg-gray-700"
                  )}
                >
                  {despesa.pago ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleDelete(despesa.id)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{new Date(despesa.data).toLocaleDateString()}</span>
              <span className="font-medium text-lg">{formatCurrency(despesa.valor)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {!loading && despesas.length === 0 && (
        <Card className="p-8 text-center">
          <ArrowDownCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-medium mb-2">Nenhuma despesa registrada</h3>
          <p className="text-gray-400">Comece adicionando sua primeira despesa</p>
        </Card>
      )}

      {/* Chat IA */}
      <ChatIA />

      {/* Modal de Edição */}
      {modalAberto && editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Editar Despesa</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Categoria
                </label>
                <select
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                >
                  {Object.entries(CATEGORIAS).map(([value, { nome }]) => (
                    <option key={value} value={value}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Descrição
                </label>
                <input
                  type="text"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Valor
                </label>
                <input
                  type="number"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Data
                </label>
                <input
                  type="date"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false)
                    setEditando(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 