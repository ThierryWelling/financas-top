"use client"

import { useState, useEffect } from "react"
import { PlusCircle, DollarSign, TrendingUp, Calculator, Pencil, Trash2 } from "lucide-react"
import { receitasService } from "@/services/financas"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface Receita {
  id: string
  created_at?: string
  user_id?: string
  valor: number
  descricao: string
  categoria: string
  data: string
}

export default function ReceitasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(true)
  const [novaReceita, setNovaReceita] = useState({
    tipo: "fixo",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0]
  })
  const [editandoReceita, setEditandoReceita] = useState<Receita | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Carregar receitas ao montar o componente
  useEffect(() => {
    if (user) {
      carregarReceitas()
    }
  }, [user])

  const carregarReceitas = async () => {
    try {
      const data = await receitasService.listar()
      setReceitas(data)
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularMediaMensal = () => {
    if (receitas.length === 0) return 0
    const somaTotal = receitas.reduce((acc, receita) => acc + receita.valor, 0)
    return somaTotal / receitas.length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const novoRegistro = {
        descricao: novaReceita.descricao,
        valor: Number(novaReceita.valor),
        data: novaReceita.data,
        categoria: novaReceita.tipo
      }
      
      await receitasService.criar(novoRegistro)
      await carregarReceitas()

      setNovaReceita({
        tipo: "fixo",
        descricao: "",
        valor: "",
        data: new Date().toISOString().split("T")[0]
      })
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      alert('Erro ao salvar receita. Por favor, tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await receitasService.excluir(id)
        await carregarReceitas()
      } catch (error) {
        console.error('Erro ao excluir receita:', error)
        alert('Erro ao excluir receita. Por favor, tente novamente.')
      }
    }
  }

  const handleEdit = (receita: Receita) => {
    setEditandoReceita(receita)
    setModalAberto(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editandoReceita) return

    try {
      await receitasService.atualizar(editandoReceita.id, {
        descricao: editandoReceita.descricao,
        valor: Number(editandoReceita.valor),
        data: editandoReceita.data,
        categoria: editandoReceita.categoria
      })
      await carregarReceitas()
      setModalAberto(false)
      setEditandoReceita(null)
    } catch (error) {
      console.error('Erro ao atualizar receita:', error)
      alert('Erro ao atualizar receita. Por favor, tente novamente.')
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Gestão de Receitas</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 w-full md:w-auto">
            <Calculator className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-green-500">Média Mensal</p>
              <p className="font-bold text-green-500">
                R$ {calcularMediaMensal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Nova Receita */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
        <h2 className="mb-4 text-xl font-semibold">Registrar Nova Receita</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Tipo
              </label>
              <select
                value={novaReceita.tipo}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, tipo: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
              >
                <option value="fixo">Fixo</option>
                <option value="variavel">Variável</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Descrição
              </label>
              <input
                type="text"
                value={novaReceita.descricao}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, descricao: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                placeholder="Ex: Salário"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Valor
              </label>
              <input
                type="number"
                value={novaReceita.valor}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, valor: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Data
              </label>
              <input
                type="date"
                value={novaReceita.data}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, data: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Receita
          </button>
        </form>
      </div>

      {/* Lista de Receitas */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50">
        <div className="p-4 md:p-6">
          <h2 className="mb-4 text-xl font-semibold">Receitas Registradas</h2>
          <div className="space-y-4">
            {receitas.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhuma receita registrada ainda.
              </p>
            ) : (
              receitas.map((receita) => (
                <div
                  key={receita.id}
                  className="flex flex-col md:flex-row md:items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4 gap-4"
                >
                  <div className="flex items-center gap-4">
                    {receita.categoria === "fixo" ? (
                      <DollarSign className="h-8 w-8 text-green-500 shrink-0" />
                    ) : (
                      <TrendingUp className="h-8 w-8 text-blue-500 shrink-0" />
                    )}
                    <div>
                      <h3 className="font-medium">{receita.descricao}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(receita.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-green-500">
                      R$ {receita.valor.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(receita)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-blue-500"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(receita.id)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {modalAberto && editandoReceita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Editar Receita</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Tipo
                </label>
                <select
                  value={editandoReceita.categoria}
                  onChange={(e) =>
                    setEditandoReceita({
                      ...editandoReceita,
                      categoria: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                >
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Descrição
                </label>
                <input
                  type="text"
                  value={editandoReceita.descricao}
                  onChange={(e) =>
                    setEditandoReceita({
                      ...editandoReceita,
                      descricao: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Valor
                </label>
                <input
                  type="number"
                  value={editandoReceita.valor}
                  onChange={(e) =>
                    setEditandoReceita({
                      ...editandoReceita,
                      valor: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Data
                </label>
                <input
                  type="date"
                  value={editandoReceita.data}
                  onChange={(e) =>
                    setEditandoReceita({
                      ...editandoReceita,
                      data: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false)
                    setEditandoReceita(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50"
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