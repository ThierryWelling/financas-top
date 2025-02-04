"use client"

import { useState, useEffect } from "react"
import {
  PlusCircle,
  Home,
  Car,
  Plane,
  GraduationCap,
  Briefcase,
  Hammer,
  Heart,
  Laptop,
  PiggyBank,
  Target,
  TrendingUp,
  ShoppingBag,
} from "lucide-react"
import { sonhosService } from "@/services/financas"

// Categorias de sonhos
const CATEGORIAS = {
  imovel: {
    nome: "Imóvel",
    icon: Home,
    cor: "text-blue-500",
    descricao: "Casa própria, apartamento, terreno",
  },
  veiculo: {
    nome: "Veículo",
    icon: Car,
    cor: "text-green-500",
    descricao: "Carro, moto, bicicleta",
  },
  viagem: {
    nome: "Viagem",
    icon: Plane,
    cor: "text-purple-500",
    descricao: "Viagens nacionais e internacionais",
  },
  educacao: {
    nome: "Educação",
    icon: GraduationCap,
    cor: "text-yellow-500",
    descricao: "Cursos, faculdade, pós-graduação",
  },
  negocios: {
    nome: "Negócios",
    icon: Briefcase,
    cor: "text-indigo-500",
    descricao: "Abrir empresa, investimentos",
  },
  reforma: {
    nome: "Reforma",
    icon: Hammer,
    cor: "text-orange-500",
    descricao: "Reforma da casa, móveis novos",
  },
  saude: {
    nome: "Saúde",
    icon: Heart,
    cor: "text-red-500",
    descricao: "Tratamentos, cirurgias, bem-estar",
  },
  tecnologia: {
    nome: "Tecnologia",
    icon: Laptop,
    cor: "text-cyan-500",
    descricao: "Computador, celular, gadgets",
  },
  investimento: {
    nome: "Investimento",
    icon: PiggyBank,
    cor: "text-emerald-500",
    descricao: "Reserva de emergência, aposentadoria",
  },
  outros: {
    nome: "Outros",
    icon: Target,
    cor: "text-gray-500",
    descricao: "Outros objetivos",
  },
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
  const [sonhos, setSonhos] = useState<Sonho[]>([])
  const [loading, setLoading] = useState(true)
  const [novoSonho, setNovoSonho] = useState({
    titulo: "",
    descricao: "",
    valor_meta: "",
    valor_atual: "0",
    data_meta: new Date().toISOString().split("T")[0],
    categoria: "outros" as keyof typeof CATEGORIAS,
    prioridade: 1,
  })

  // Carregar sonhos ao montar o componente
  useEffect(() => {
    carregarSonhos()
  }, [])

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
        prioridade: novoSonho.prioridade
      }
      
      await sonhosService.criar(novoRegistro)
      await carregarSonhos()

      setNovoSonho({
        titulo: "",
        descricao: "",
        valor_meta: "",
        valor_atual: "0",
        data_meta: new Date().toISOString().split("T")[0],
        categoria: "outros",
        prioridade: 1,
      })
    } catch (error) {
      console.error('Erro ao salvar sonho:', error)
      alert('Erro ao salvar sonho. Por favor, tente novamente.')
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sonhos e Objetivos</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 p-4">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-purple-500">Total de Sonhos</p>
              <p className="font-bold text-purple-500">{sonhos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Novo Sonho */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Registrar Novo Sonho</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  setNovoSonho({ ...novoSonho, categoria: e.target.value as keyof typeof CATEGORIAS })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
              >
                {Object.entries(CATEGORIAS).map(([key, categoria]) => (
                  <option key={key} value={key}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
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

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-400">
                Descrição
              </label>
              <textarea
                value={novoSonho.descricao}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, descricao: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="Descreva seu sonho..."
                rows={3}
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
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Sonhos Registrados</h2>
          <div className="space-y-4">
            {sonhos.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum sonho registrado ainda.
              </p>
            ) : (
              sonhos.map((sonho) => {
                const categoriaInfo = CATEGORIAS[sonho.categoria as keyof typeof CATEGORIAS] || CATEGORIAS.outros
                const Icon = categoriaInfo.icon
                const progresso = calcularProgresso(sonho)
                
                return (
                  <div
                    key={sonho.id}
                    className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-2 ${categoriaInfo.cor} bg-opacity-10`}>
                          <Icon className={`h-6 w-6 ${categoriaInfo.cor}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{sonho.titulo}</h3>
                          <p className="mt-1 text-sm text-gray-400">
                            {sonho.descricao}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className={categoriaInfo.cor}>{categoriaInfo.nome}</span>
                            <span>•</span>
                            <span className="text-gray-400">
                              Meta: {new Date(sonho.data_meta).toLocaleDateString("pt-BR")}
                            </span>
                            <span>•</span>
                            <span className="text-gray-400">
                              Prioridade: {sonho.prioridade === 1 ? "Alta" : sonho.prioridade === 2 ? "Média" : "Baixa"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-500">
                          R$ {sonho.valor_atual.toFixed(2)} / R$ {sonho.valor_meta.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {progresso.toFixed(1)}% concluído
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 w-full rounded-full bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-purple-500 transition-all"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 