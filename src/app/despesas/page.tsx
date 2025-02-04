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
} from "lucide-react"

// Categorias de despesas
const CATEGORIAS = {
  moradia: {
    nome: "Moradia",
    icon: Home,
    cor: "text-blue-500",
    palavrasChave: ["aluguel", "condomínio", "água", "luz", "gás", "internet", "iptu"],
  },
  alimentacao: {
    nome: "Alimentação",
    icon: Utensils,
    cor: "text-orange-500",
    palavrasChave: ["mercado", "restaurante", "ifood", "supermercado", "feira"],
  },
  transporte: {
    nome: "Transporte",
    icon: Car,
    cor: "text-green-500",
    palavrasChave: ["gasolina", "uber", "ônibus", "metrô", "estacionamento", "ipva"],
  },
  saude: {
    nome: "Saúde",
    icon: Heart,
    cor: "text-red-500",
    palavrasChave: ["farmácia", "médico", "consulta", "exame", "academia"],
  },
  lazer: {
    nome: "Lazer",
    icon: Dumbbell,
    cor: "text-purple-500",
    palavrasChave: ["cinema", "netflix", "spotify", "viagem", "jogos"],
  },
  outros: {
    nome: "Outros",
    icon: ShoppingCart,
    cor: "text-gray-500",
    palavrasChave: [],
  },
}

interface Despesa {
  id: string
  tipo: "fixo" | "variavel"
  categoria: keyof typeof CATEGORIAS
  descricao: string
  valor: number
  data: string
}

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [novaDespesa, setNovaDespesa] = useState({
    tipo: "variavel",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
  })

  // Categorização automática baseada na descrição
  const categorizarDespesa = (descricao: string): keyof typeof CATEGORIAS => {
    const descricaoLower = descricao.toLowerCase()
    
    for (const [categoria, config] of Object.entries(CATEGORIAS)) {
      if (config.palavrasChave.some(palavra => descricaoLower.includes(palavra))) {
        return categoria as keyof typeof CATEGORIAS
      }
    }
    
    return "outros"
  }

  // Análise de padrões de gastos
  const analisarPadroes = () => {
    if (despesas.length === 0) return null

    const gastosPorCategoria = Object.fromEntries(
      Object.keys(CATEGORIAS).map(cat => [cat, 0])
    )

    despesas.forEach(despesa => {
      gastosPorCategoria[despesa.categoria] += despesa.valor
    })

    const totalGastos = Object.values(gastosPorCategoria).reduce((a, b) => a + b, 0)
    const categoriaMaisGasto = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0]

    return {
      totalGastos,
      gastosPorCategoria,
      categoriaMaisGasto,
    }
  }

  // Sugestões de otimização
  const gerarSugestoes = () => {
    const analise = analisarPadroes()
    if (!analise) return []

    const sugestoes: string[] = []
    const { gastosPorCategoria, totalGastos } = analise

    // Regras para sugestões
    Object.entries(gastosPorCategoria).forEach(([categoria, valor]) => {
      const percentual = (valor / totalGastos) * 100
      
      if (categoria === "lazer" && percentual > 15) {
        sugestoes.push("Considere reduzir gastos com lazer, que estão acima de 15% do total")
      }
      
      if (categoria === "alimentacao" && percentual > 30) {
        sugestoes.push("Seus gastos com alimentação estão elevados. Que tal preparar mais refeições em casa?")
      }
    })

    return sugestoes
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const categoria = categorizarDespesa(novaDespesa.descricao)
    
    const novoDespesa: Despesa = {
      id: Math.random().toString(36).substr(2, 9),
      tipo: novaDespesa.tipo as "fixo" | "variavel",
      categoria,
      descricao: novaDespesa.descricao,
      valor: Number(novaDespesa.valor),
      data: novaDespesa.data,
    }
    
    setDespesas([...despesas, novoDespesa])
    setNovaDespesa({
      tipo: "variavel",
      descricao: "",
      valor: "",
      data: new Date().toISOString().split("T")[0],
    })
  }

  const analise = analisarPadroes()
  const sugestoes = gerarSugestoes()

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Análise */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-gray-400">Total de Despesas</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-500">
            R$ {analise?.totalGastos.toFixed(2) || "0,00"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-400">Maior Categoria</h3>
          </div>
          {analise?.categoriaMaisGasto && (
            <p className="mt-2 text-lg font-bold">
              {CATEGORIAS[analise.categoriaMaisGasto[0] as keyof typeof CATEGORIAS].nome}
            </p>
          )}
        </div>

        <div className="col-span-2 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-medium text-gray-400">Sugestões de Otimização</h3>
          </div>
          <div className="mt-2 space-y-1">
            {sugestoes.length > 0 ? (
              sugestoes.map((sugestao, index) => (
                <p key={index} className="text-sm text-gray-300">
                  • {sugestao}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Sem sugestões no momento. Continue registrando suas despesas!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de Nova Despesa */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Registrar Nova Despesa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Tipo
              </label>
              <select
                value={novaDespesa.tipo}
                onChange={(e) =>
                  setNovaDespesa({ ...novaDespesa, tipo: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
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
                value={novaDespesa.descricao}
                onChange={(e) =>
                  setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-red-500 focus:ring-red-500"
                placeholder="Ex: Aluguel"
                required
              />
            </div>

            <div>
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

            <div>
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

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Despesa
          </button>
        </form>
      </div>

      {/* Lista de Despesas */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Despesas Registradas</h2>
          <div className="space-y-4">
            {despesas.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhuma despesa registrada ainda.
              </p>
            ) : (
              despesas.map((despesa) => {
                const categoria = CATEGORIAS[despesa.categoria]
                const Icon = categoria.icon
                
                return (
                  <div
                    key={despesa.id}
                    className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`h-8 w-8 ${categoria.cor}`} />
                      <div>
                        <h3 className="font-medium">{despesa.descricao}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{new Date(despesa.data).toLocaleDateString("pt-BR")}</span>
                          <span>•</span>
                          <span>{categoria.nome}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-500">
                        R$ {despesa.valor.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {despesa.tipo === "fixo" ? "Despesa Fixa" : "Despesa Variável"}
                      </p>
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