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
  const [novaDespesa, setNovaDespesa] = useState({
    categoria: "outros",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    pago: false
  })
  const [editandoDespesa, setEditandoDespesa] = useState<Despesa | null>(null)
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
      const data = await despesasService.listar()
      setDespesas(data)
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
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
      const novoRegistro = {
        descricao: novaDespesa.descricao,
        valor: Number(novaDespesa.valor),
        data: novaDespesa.data,
        categoria: novaDespesa.categoria,
        pago: novaDespesa.pago
      }
      
      await despesasService.criar(novoRegistro)
      await carregarDespesas()

      setNovaDespesa({
        categoria: "outros",
        descricao: "",
        valor: "",
        data: new Date().toISOString().split("T")[0],
        pago: false
      })
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
      alert('Erro ao salvar despesa. Por favor, tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await despesasService.excluir(id)
        await carregarDespesas()
      } catch (error) {
        console.error('Erro ao excluir despesa:', error)
        alert('Erro ao excluir despesa. Por favor, tente novamente.')
      }
    }
  }

  const handleEdit = (despesa: Despesa) => {
    setEditandoDespesa(despesa)
    setModalAberto(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editandoDespesa) return

    try {
      await despesasService.atualizar(editandoDespesa.id, {
        descricao: editandoDespesa.descricao,
        valor: Number(editandoDespesa.valor),
        data: editandoDespesa.data,
        categoria: editandoDespesa.categoria,
        pago: editandoDespesa.pago
      })
      await carregarDespesas()
      setModalAberto(false)
      setEditandoDespesa(null)
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error)
      alert('Erro ao atualizar despesa. Por favor, tente novamente.')
    }
  }

  const togglePago = async (despesa: Despesa) => {
    try {
      await despesasService.atualizar(despesa.id, {
        ...despesa,
        pago: !despesa.pago
      })
      await carregarDespesas()
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error)
      alert('Erro ao atualizar status. Por favor, tente novamente.')
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
    <div className="space-y-6 max-w-full overflow-x-hidden px-2 md:px-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Despesas</h1>
        <div className="w-full sm:w-auto">
          <ImportarDespesas />
        </div>
      </div>

      {/* Formulário de Nova Despesa */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <h2 className="mb-4 text-xl font-semibold">Registrar Nova Despesa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-400">
                Categoria
              </label>
              <select
                value={novaDespesa.categoria}
                onChange={(e) =>
                  setNovaDespesa({ ...novaDespesa, categoria: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
              >
                {Object.entries(CATEGORIAS).map(([value, { nome }]) => (
                  <option key={value} value={value}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-400">
                Descrição
              </label>
              <input
                type="text"
                value={novaDespesa.descricao}
                onChange={(e) =>
                  setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                placeholder="Ex: Aluguel"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-400">
                Valor
              </label>
              <input
                type="number"
                value={novaDespesa.valor}
                onChange={(e) =>
                  setNovaDespesa({ ...novaDespesa, valor: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-400">
                Data
              </label>
              <input
                type="date"
                value={novaDespesa.data}
                onChange={(e) =>
                  setNovaDespesa({ ...novaDespesa, data: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pago"
              checked={novaDespesa.pago}
              onChange={(e) =>
                setNovaDespesa({ ...novaDespesa, pago: e.target.checked })
              }
              className="rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500"
            />
            <label htmlFor="pago" className="text-sm font-medium text-gray-400">
              Já foi pago
            </label>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Despesa
          </button>
        </form>
      </div>

      {/* Lista de Despesas */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Despesas Registradas</h2>
            <div className="text-sm text-gray-400">
              Total: <span className="text-red-500 font-semibold">R$ {calcularTotalDespesas().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {despesas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center">Nenhuma despesa registrada ainda.</p>
                <p className="text-sm text-gray-600">Clique no botão acima para adicionar sua primeira despesa.</p>
              </div>
            ) : (
              despesas.map((despesa) => {
                const dataVencimento = new Date(despesa.data)
                const hoje = new Date()
                hoje.setHours(0, 0, 0, 0)
                dataVencimento.setHours(0, 0, 0, 0)
                const estaAtrasada = !despesa.pago && dataVencimento < hoje

                return (
                  <div
                    key={despesa.id}
                    className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                      estaAtrasada 
                        ? 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30' 
                        : despesa.pago
                        ? 'border-green-500/20 bg-green-500/5 hover:border-green-500/30'
                        : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                    }`}
                  >
                    {/* Indicador de status */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        estaAtrasada ? 'bg-yellow-500' : despesa.pago ? 'bg-green-500' : 'bg-gray-700'
                      }`} 
                    />
                    
                    <div className="p-4 pl-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-full p-2 ${
                            estaAtrasada ? 'bg-yellow-500/10 text-yellow-500' : 
                            despesa.pago ? 'bg-green-500/10 text-green-500' : 
                            'bg-gray-700/50 text-gray-400'
                          }`}>
                            <DollarSign className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{despesa.descricao}</h3>
                              {estaAtrasada && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Atrasada
                                </span>
                              )}
                              {despesa.pago && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500 border border-green-500/20">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Paga
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
                              <span>{new Date(despesa.data).toLocaleDateString("pt-BR")}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {getCategoriaInfo(despesa.categoria).icone}
                                {getCategoriaInfo(despesa.categoria).nome}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className={`text-lg font-bold ${
                            estaAtrasada ? 'text-yellow-500' : 
                            despesa.pago ? 'text-green-500' : 
                            'text-red-500'
                          }`}>
                            R$ {despesa.valor.toFixed(2)}
                          </p>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => togglePago(despesa)}
                              className={`p-2 rounded-lg transition-colors ${
                                despesa.pago 
                                  ? 'text-green-500 hover:bg-green-500/10' 
                                  : 'text-gray-400 hover:bg-gray-700'
                              }`}
                              title={despesa.pago ? "Marcar como não pago" : "Marcar como pago"}
                            >
                              {despesa.pago ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(despesa)}
                              className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title="Editar despesa"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(despesa.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Excluir despesa"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {modalAberto && editandoDespesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Editar Despesa</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Categoria
                </label>
                <select
                  value={editandoDespesa.categoria}
                  onChange={(e) =>
                    setEditandoDespesa({
                      ...editandoDespesa,
                      categoria: e.target.value,
                    })
                  }
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
                  value={editandoDespesa.descricao}
                  onChange={(e) =>
                    setEditandoDespesa({
                      ...editandoDespesa,
                      descricao: e.target.value,
                    })
                  }
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
                  value={editandoDespesa.valor}
                  onChange={(e) =>
                    setEditandoDespesa({
                      ...editandoDespesa,
                      valor: Number(e.target.value),
                    })
                  }
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
                  value={editandoDespesa.data}
                  onChange={(e) =>
                    setEditandoDespesa({
                      ...editandoDespesa,
                      data: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-pago"
                  checked={editandoDespesa.pago}
                  onChange={(e) =>
                    setEditandoDespesa({
                      ...editandoDespesa,
                      pago: e.target.checked,
                    })
                  }
                  className="rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="edit-pago" className="text-sm font-medium text-gray-400">
                  Já foi pago
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false)
                    setEditandoDespesa(null)
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
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