"use client"

import { useState } from "react"
import {
  PlusCircle,
  Target,
  Calendar,
  Plane,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Trash2,
  PiggyBank,
  TrendingUp,
} from "lucide-react"

// Categorias de sonhos
const CATEGORIAS = {
  viagem: {
    nome: "Viagem",
    icon: Plane,
    cor: "text-blue-500",
    sugestoes: [
      "Pesquise passagens com antecedência",
      "Considere viajar na baixa temporada",
      "Utilize programas de milhas",
    ],
  },
  imovel: {
    nome: "Imóvel",
    icon: Home,
    cor: "text-green-500",
    sugestoes: [
      "Poupe pelo menos 20% do valor para entrada",
      "Compare diferentes financiamentos",
      "Considere consórcio como alternativa",
    ],
  },
  veiculo: {
    nome: "Veículo",
    icon: Car,
    cor: "text-red-500",
    sugestoes: [
      "Compare preços em diferentes concessionárias",
      "Considere um seminovo em bom estado",
      "Pesquise o custo total de propriedade",
    ],
  },
  educacao: {
    nome: "Educação",
    icon: GraduationCap,
    cor: "text-purple-500",
    sugestoes: [
      "Procure bolsas de estudo",
      "Compare diferentes instituições",
      "Verifique opções de financiamento estudantil",
    ],
  },
  empreendimento: {
    nome: "Empreendimento",
    icon: Briefcase,
    cor: "text-orange-500",
    sugestoes: [
      "Desenvolva um plano de negócios detalhado",
      "Pesquise linhas de crédito para MEI/PME",
      "Considere começar como side project",
    ],
  },
}

interface Sonho {
  id: string
  categoria: keyof typeof CATEGORIAS
  titulo: string
  descricao: string
  valorAlvo: number
  valorAtual: number
  prazo: string
  dataCriacao: string
}

export default function SonhosPage() {
  const [sonhos, setSonhos] = useState<Sonho[]>([])
  const [novoSonho, setNovoSonho] = useState({
    categoria: "viagem" as keyof typeof CATEGORIAS,
    titulo: "",
    descricao: "",
    valorAlvo: "",
    valorAtual: "",
    prazo: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const novoRegistro: Sonho = {
      id: Math.random().toString(36).substr(2, 9),
      categoria: novoSonho.categoria,
      titulo: novoSonho.titulo,
      descricao: novoSonho.descricao,
      valorAlvo: Number(novoSonho.valorAlvo),
      valorAtual: Number(novoSonho.valorAtual),
      prazo: novoSonho.prazo,
      dataCriacao: new Date().toISOString(),
    }
    setSonhos([...sonhos, novoRegistro])
    setNovoSonho({
      categoria: "viagem",
      titulo: "",
      descricao: "",
      valorAlvo: "",
      valorAtual: "",
      prazo: "",
    })
  }

  const calcularProgresso = (valorAtual: number, valorAlvo: number) => {
    return Math.min((valorAtual / valorAlvo) * 100, 100)
  }

  const calcularTempoRestante = (prazo: string) => {
    const hoje = new Date()
    const dataFinal = new Date(prazo)
    const diff = dataFinal.getTime() - hoje.getTime()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (dias < 0) return "Prazo expirado"
    if (dias === 0) return "Último dia"
    if (dias === 1) return "1 dia restante"
    return `${dias} dias restantes`
  }

  const deletarSonho = (id: string) => {
    setSonhos(sonhos.filter(sonho => sonho.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meus Sonhos e Objetivos</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 p-4">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-purple-500">Total de Objetivos</p>
              <p className="font-bold text-purple-500">{sonhos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Novo Sonho */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Definir Novo Objetivo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Categoria
              </label>
              <select
                value={novoSonho.categoria}
                onChange={(e) =>
                  setNovoSonho({
                    ...novoSonho,
                    categoria: e.target.value as keyof typeof CATEGORIAS,
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
              >
                {Object.entries(CATEGORIAS).map(([key, { nome }]) => (
                  <option key={key} value={key}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

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
                placeholder="Ex: Viagem para Europa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Descrição
              </label>
              <input
                type="text"
                value={novoSonho.descricao}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, descricao: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="Descreva seu objetivo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Valor Alvo
              </label>
              <input
                type="number"
                value={novoSonho.valorAlvo}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, valorAlvo: e.target.value })
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
                value={novoSonho.valorAtual}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, valorAtual: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-purple-500 focus:ring-purple-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Data Alvo
              </label>
              <input
                type="date"
                value={novoSonho.prazo}
                onChange={(e) =>
                  setNovoSonho({ ...novoSonho, prazo: e.target.value })
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
            Adicionar Objetivo
          </button>
        </form>
      </div>

      {/* Lista de Sonhos */}
      <div className="grid gap-4 md:grid-cols-2">
        {sonhos.length === 0 ? (
          <div className="col-span-2 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
            <PiggyBank className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-2 text-gray-500">
              Você ainda não definiu nenhum objetivo. Comece adicionando seu primeiro sonho!
            </p>
          </div>
        ) : (
          sonhos.map((sonho) => {
            const categoria = CATEGORIAS[sonho.categoria]
            const Icon = categoria.icon
            const progresso = calcularProgresso(sonho.valorAtual, sonho.valorAlvo)
            const tempoRestante = calcularTempoRestante(sonho.prazo)
            
            return (
              <div
                key={sonho.id}
                className="rounded-lg border border-gray-800 bg-gray-900/50 p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg bg-gray-800 p-2 ${categoria.cor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{sonho.titulo}</h3>
                      <p className="text-sm text-gray-400">{sonho.descricao}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletarSonho(sonho.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progresso */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="font-medium">{progresso.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-purple-500 transition-all"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Valor Atual</p>
                    <p className="font-medium">
                      R$ {sonho.valorAtual.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Valor Alvo</p>
                    <p className="font-medium">
                      R$ {sonho.valorAlvo.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Prazo</p>
                    <p className="font-medium">{tempoRestante}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Valor Restante</p>
                    <p className="font-medium">
                      R$ {(sonho.valorAlvo - sonho.valorAtual).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Sugestões */}
                <div className="mt-4 rounded-lg bg-gray-800/50 p-4">
                  <p className="mb-2 text-sm font-medium">Sugestões</p>
                  <ul className="space-y-1">
                    {categoria.sugestoes.map((sugestao, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                        <TrendingUp className="mt-0.5 h-4 w-4 text-purple-500" />
                        {sugestao}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 