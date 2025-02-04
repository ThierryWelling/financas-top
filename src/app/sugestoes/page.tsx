"use client"

import { useEffect, useState } from "react"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PieChart,
  Calendar,
  Target,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  DollarSign,
} from "lucide-react"
import { supabase, Receita, Despesa, Sonho } from "@/lib/supabase"

interface InsightFinanceiro {
  tipo: "positivo" | "negativo" | "alerta" | "dica"
  titulo: string
  descricao: string
  valor?: number
  variacao?: number
  categoria?: string
  prioridade?: number
}

interface DadosFinanceiros {
  receitas: Receita[]
  despesas: Despesa[]
  sonhos: Sonho[]
  receitaTotal: number
  despesaTotal: number
  saldoDisponivel: number
  gastosPorCategoria: Record<string, number>
}

export default function SugestoesPage() {
  const [dados, setDados] = useState<DadosFinanceiros | null>(null)
  const [insights, setInsights] = useState<InsightFinanceiro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return

      // Buscar dados do Supabase
      const [receitasRes, despesasRes, sonhosRes] = await Promise.all([
        supabase.from('receitas').select('*').eq('user_id', user.id),
        supabase.from('despesas').select('*').eq('user_id', user.id),
        supabase.from('sonhos').select('*').eq('user_id', user.id)
      ])

      const receitas = receitasRes.data || []
      const despesas = despesasRes.data || []
      const sonhos = sonhosRes.data || []

      // Calcular totais
      const receitaTotal = receitas.reduce((acc, r) => acc + r.valor, 0)
      const despesaTotal = despesas.reduce((acc, d) => acc + d.valor, 0)
      const saldoDisponivel = receitaTotal - despesaTotal

      // Calcular gastos por categoria
      const gastosPorCategoria = despesas.reduce((acc, d) => {
        acc[d.categoria] = (acc[d.categoria] || 0) + d.valor
        return acc
      }, {} as Record<string, number>)

      const dadosFinanceiros = {
        receitas,
        despesas,
        sonhos,
        receitaTotal,
        despesaTotal,
        saldoDisponivel,
        gastosPorCategoria
      }

      setDados(dadosFinanceiros)
      const novosInsights = await gerarInsights(dadosFinanceiros)
      setInsights(novosInsights)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const gerarInsights = async (dados: DadosFinanceiros): Promise<InsightFinanceiro[]> => {
    const insights: InsightFinanceiro[] = []

    // Análise de saldo e sonhos
    if (dados.saldoDisponivel > 0) {
      const sonhosPriorizados = dados.sonhos
        .map(sonho => ({
          ...sonho,
          percentualConcluido: (sonho.valor_atual / sonho.valor_meta) * 100,
          valorFaltante: sonho.valor_meta - sonho.valor_atual
        }))
        .sort((a, b) => a.percentualConcluido - b.percentualConcluido)

      if (sonhosPriorizados.length > 0) {
        const sonhoPrioritario = sonhosPriorizados[0]
        insights.push({
          tipo: "dica",
          titulo: "Alocação de Saldo Disponível",
          descricao: `Você tem R$ ${dados.saldoDisponivel.toFixed(2)} disponíveis. Sugerimos investir R$ ${Math.min(dados.saldoDisponivel, sonhoPrioritario.valorFaltante).toFixed(2)} no seu sonho "${sonhoPrioritario.titulo}" que está ${sonhoPrioritario.percentualConcluido.toFixed(1)}% concluído.`,
          valor: dados.saldoDisponivel,
          prioridade: 1
        })
      }
    }

    // Análise de despesas
    const categoriasPrioritarias = ['moradia', 'alimentação', 'saúde', 'transporte']
    const despesasPriorizadas = dados.despesas
      .sort((a, b) => {
        const prioridadeA = categoriasPrioritarias.indexOf(a.categoria.toLowerCase())
        const prioridadeB = categoriasPrioritarias.indexOf(b.categoria.toLowerCase())
        return prioridadeA - prioridadeB
      })

    // Alertas de gastos elevados
    Object.entries(dados.gastosPorCategoria).forEach(([categoria, valor]) => {
      const percentualDaReceita = (valor / dados.receitaTotal) * 100
      const limitesPorCategoria: Record<string, number> = {
        moradia: 30,
        alimentação: 20,
        transporte: 15,
        lazer: 10
      }

      if (percentualDaReceita > (limitesPorCategoria[categoria.toLowerCase()] || 15)) {
        insights.push({
          tipo: "alerta",
          titulo: `Gasto Elevado em ${categoria}`,
          descricao: `Seus gastos com ${categoria.toLowerCase()} representam ${percentualDaReceita.toFixed(1)}% da sua renda, acima do recomendado de ${limitesPorCategoria[categoria.toLowerCase()] || 15}%.`,
          valor,
          categoria,
          prioridade: 2
        })
      }
    })

    // Análise de economia
    const taxaEconomia = ((dados.receitaTotal - dados.despesaTotal) / dados.receitaTotal) * 100
    if (taxaEconomia < 20) {
      insights.push({
        tipo: "negativo",
        titulo: "Taxa de Economia Baixa",
        descricao: `Sua taxa de economia atual é de ${taxaEconomia.toFixed(1)}%. O recomendado é economizar pelo menos 20% da sua renda.`,
        valor: taxaEconomia,
        prioridade: 3
      })
    } else {
      insights.push({
        tipo: "positivo",
        titulo: "Boa Taxa de Economia",
        descricao: `Parabéns! Você está economizando ${taxaEconomia.toFixed(1)}% da sua renda, acima do recomendado de 20%.`,
        valor: taxaEconomia,
        prioridade: 3
      })
    }

    return insights.sort((a, b) => (a.prioridade || 99) - (b.prioridade || 99))
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
        <div>
          <h1 className="text-3xl font-bold">Inteligência Financeira</h1>
          <p className="mt-1 text-gray-400">
            Análises e recomendações personalizadas baseadas em IA
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-indigo-500/10 p-4">
            <Brain className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm text-indigo-500">Insights Ativos</p>
              <p className="font-bold text-indigo-500">{insights.length}</p>
            </div>
          </div>
        </div>
      </div>

      {dados && (
        <>
          {/* Visão Geral */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Saúde Financeira</h3>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Receitas vs Despesas</span>
                  <span className={dados.saldoDisponivel >= 0 ? "text-green-500" : "text-red-500"}>
                    {((dados.saldoDisponivel / dados.receitaTotal) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-800">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      dados.saldoDisponivel >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min((dados.despesaTotal / dados.receitaTotal) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Sonhos Ativos</h3>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{dados.sonhos.length}</p>
                <p className="text-sm text-gray-400">Objetivos em andamento</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">Saldo Disponível</h3>
              </div>
              <div className="mt-4">
                <p className={`text-2xl font-bold ${dados.saldoDisponivel >= 0 ? "text-green-500" : "text-red-500"}`}>
                  R$ {dados.saldoDisponivel.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Para investir em sonhos</p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="border-b border-gray-800 p-4">
              <h2 className="text-xl font-semibold">Insights e Recomendações</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg p-2 ${
                          insight.tipo === "positivo"
                            ? "bg-green-500/10 text-green-500"
                            : insight.tipo === "negativo"
                            ? "bg-red-500/10 text-red-500"
                            : insight.tipo === "alerta"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {insight.tipo === "positivo" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : insight.tipo === "negativo" ? (
                          <TrendingDown className="h-5 w-5" />
                        ) : insight.tipo === "alerta" ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <Lightbulb className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{insight.titulo}</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {insight.descricao}
                        </p>
                        {insight.valor && (
                          <div className="mt-2 flex items-center gap-2">
                            {insight.categoria && (
                              <span className="text-sm text-gray-500">
                                {insight.categoria}
                              </span>
                            )}
                            {typeof insight.valor === 'number' && !insight.valor.toString().includes('%') && (
                              <span className="text-sm font-medium">
                                R$ {insight.valor.toFixed(2)}
                              </span>
                            )}
                            {insight.variacao && (
                              <span
                                className={`flex items-center text-sm ${
                                  insight.variacao > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {insight.variacao > 0 ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                )}
                                {Math.abs(insight.variacao).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 