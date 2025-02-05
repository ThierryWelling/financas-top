"use client"

import { useState, useEffect } from "react"
import {
  PlusCircle,
  Target,
  Pencil,
  Trash2,
  Star,
  Calculator,
  Home,
  Plane,
  Car,
  GraduationCap,
  Smartphone,
  Heart
} from "lucide-react"
import { sonhosService } from "@/services/financas"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

// Categorias de sonhos
const CATEGORIAS = {
  imovel: {
    nome: "Imóvel",
    icon: Home,
    cor: "text-blue-500"
  },
  viagem: {
    nome: "Viagem",
    icon: Plane,
    cor: "text-green-500"
  },
  veiculo: {
    nome: "Veículo",
    icon: Car,
    cor: "text-yellow-500"
  },
  educacao: {
    nome: "Educação",
    icon: GraduationCap,
    cor: "text-purple-500"
  },
  tecnologia: {
    nome: "Tecnologia",
    icon: Smartphone,
    cor: "text-indigo-500"
  },
  outros: {
    nome: "Outros",
    icon: Star,
    cor: "text-gray-500"
  }
}

// Função auxiliar para obter categoria com fallback seguro
const getCategoriaInfo = (categoria: string) => {
  return CATEGORIAS[categoria as keyof typeof CATEGORIAS] || CATEGORIAS.outros
}

interface Sonho {
  id: string
  created_at?: string
  user_id?: string
  titulo: string
  descricao: string
  valor_meta: number
  valor_atual: number
  data_meta: string
  categoria: string
  prioridade: number
}

export default function SonhosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sonhos, setSonhos] = useState<Sonho[]>([])
  const [loading, setLoading] = useState(true)
  const [novoSonho, setNovoSonho] = useState({
    titulo: "",
    descricao: "",
    valor_meta: "",
    valor_atual: "",
    data_meta: new Date().toISOString().split("T")[0],
    categoria: "outros",
    prioridade: 1
  })
  const [editandoSonho, setEditandoSonho] = useState<Sonho | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      carregarSonhos()
    }
  }, [user])

  const carregarSonhos = async () => {
    try {
      const data = await sonhosService.listar()
      setSonhos(data)
    } catch (error) {
      console.error('Erro ao carregar sonhos:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularTotalSonhos = () => {
    return sonhos.reduce((acc, sonho) => acc + sonho.valor_meta, 0)
  }

  const calcularProgresso = (sonho: Sonho) => {
    return (sonho.valor_atual / sonho.valor_meta) * 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const novoRegistro = {
        titulo: novoSonho.titulo,
        descricao: novoSonho.descricao,
        valor_meta: Number(novoSonho.valor_meta),
        valor_atual: Number(novoSonho.valor_atual),
        data_meta: novoSonho.data_meta,
        categoria: novoSonho.categoria,
        prioridade: Number(novoSonho.prioridade)
      }
      
      await sonhosService.criar(novoRegistro)
      await carregarSonhos()

      setNovoSonho({
        titulo: "",
        descricao: "",
        valor_meta: "",
        valor_atual: "",
        data_meta: new Date().toISOString().split("T")[0],
        categoria: "outros",
        prioridade: 1
      })
    } catch (error) {
      console.error('Erro ao salvar sonho:', error)
      alert('Erro ao salvar sonho. Por favor, tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este sonho?')) {
      try {
        await sonhosService.excluir(id)
        await carregarSonhos()
      } catch (error) {
        console.error('Erro ao excluir sonho:', error)
        alert('Erro ao excluir sonho. Por favor, tente novamente.')
      }
    }
  }

  const handleEdit = (sonho: Sonho) => {
    setEditandoSonho(sonho)
    setModalAberto(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editandoSonho) return

    try {
      await sonhosService.atualizar(editandoSonho.id, {
        titulo: editandoSonho.titulo,
        descricao: editandoSonho.descricao,
        valor_meta: Number(editandoSonho.valor_meta),
        valor_atual: Number(editandoSonho.valor_atual),
        data_meta: editandoSonho.data_meta,
        categoria: editandoSonho.categoria,
        prioridade: Number(editandoSonho.prioridade)
      })
      await carregarSonhos()
      setModalAberto(false)
      setEditandoSonho(null)
    } catch (error) {
      console.error('Erro ao atualizar sonho:', error)
      alert('Erro ao atualizar sonho. Por favor, tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Sonhos e Objetivos</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 p-4 w-full md:w-auto">
            <Calculator className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-purple-500">Total em Objetivos</p>
              <p className="font-bold text-purple-500">
                R$ {calcularTotalSonhos().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Novo Sonho */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
        <h2 className="mb-4 text-xl font-semibold">Registrar Novo Sonho</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Título
              </label>
              <input
                type="text"
                value={novoSonho.titulo}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, titulo: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="Ex: Casa Própria"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Categoria
              </label>
              <select
                value={novoSonho.categoria}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, categoria: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
              >
                {Object.entries(CATEGORIAS).map(([value, { nome }]) => (
                  <option key={value} value={value}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-400">
                Descrição
              </label>
              <textarea
                value={novoSonho.descricao}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, descricao: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="Descreva seu sonho..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Valor Meta
              </label>
              <input
                type="number"
                value={novoSonho.valor_meta}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, valor_meta: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Valor Atual
              </label>
              <input
                type="number"
                value={novoSonho.valor_atual}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, valor_atual: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Data Meta
              </label>
              <input
                type="date"
                value={novoSonho.data_meta}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, data_meta: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Prioridade
              </label>
              <select
                value={novoSonho.prioridade}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, prioridade: Number(e.target.value) })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
              >
                <option value={1}>Alta</option>
                <option value={2}>Média</option>
                <option value={3}>Baixa</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Sonho
          </button>
        </form>
      </div>

      {/* Lista de Sonhos */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50">
        <div className="p-4 md:p-6">
          <h2 className="mb-4 text-xl font-semibold">Sonhos Registrados</h2>
          <div className="space-y-4">
            {sonhos.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum sonho registrado ainda.
              </p>
            ) : (
              sonhos.map((sonho) => {
                const progresso = calcularProgresso(sonho)
                const categoriaInfo = getCategoriaInfo(sonho.categoria)
                const CategoriaIcon = categoriaInfo.icon

                return (
                  <div
                    key={sonho.id}
                    className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-gray-700/50 ${categoriaInfo.cor}`}>
                          <CategoriaIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{sonho.titulo}</h3>
                          <p className="text-sm text-gray-400">{sonho.descricao}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                            <span>{new Date(sonho.data_meta).toLocaleDateString("pt-BR")}</span>
                            <span>•</span>
                            <span>{categoriaInfo.nome}</span>
                            <span>•</span>
                            <span>Prioridade: {sonho.prioridade === 1 ? "Alta" : sonho.prioridade === 2 ? "Média" : "Baixa"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Progresso</p>
                            <p className="font-bold text-purple-500">
                              R$ {sonho.valor_atual.toFixed(2)} / R$ {sonho.valor_meta.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(sonho)}
                              className="p-2 rounded-lg hover:bg-gray-700 text-blue-500"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sonho.id)}
                              className="p-2 rounded-lg hover:bg-gray-700 text-red-500"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full md:w-64">
                          <div className="h-2 w-full rounded-full bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-purple-500 transition-all"
                              style={{ width: `${progresso}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-sm text-gray-400">
                            {progresso.toFixed(1)}% concluído
                          </p>
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
      {modalAberto && editandoSonho && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Editar Sonho</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editandoSonho.titulo}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        titulo: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Categoria
                  </label>
                  <select
                    value={editandoSonho.categoria}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        categoria: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                  >
                    {Object.entries(CATEGORIAS).map(([value, { nome }]) => (
                      <option key={value} value={value}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Descrição
                  </label>
                  <textarea
                    value={editandoSonho.descricao}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        descricao: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Valor Meta
                  </label>
                  <input
                    type="number"
                    value={editandoSonho.valor_meta}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        valor_meta: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Valor Atual
                  </label>
                  <input
                    type="number"
                    value={editandoSonho.valor_atual}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        valor_atual: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Data Meta
                  </label>
                  <input
                    type="date"
                    value={editandoSonho.data_meta}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        data_meta: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">
                    Prioridade
                  </label>
                  <select
                    value={editandoSonho.prioridade}
                    onChange={(e) =>
                      setEditandoSonho({
                        ...editandoSonho,
                        prioridade: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value={1}>Alta</option>
                    <option value={2}>Média</option>
                    <option value={3}>Baixa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false)
                    setEditandoSonho(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
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