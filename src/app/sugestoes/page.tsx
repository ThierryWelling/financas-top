"use client"

import { useState } from "react"
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

interface InsightFinanceiro {
  tipo: "positivo" | "negativo" | "alerta" | "dica"
  titulo: string
  descricao: string
  valor?: number
  variacao?: number
  categoria?: string
}

export default function SugestoesPage() {
  // Simulação de dados financeiros
  const dadosFinanceiros = {
    gastosPorCategoria: {
      alimentacao: 1200,
      moradia: 2500,
      transporte: 800,
      lazer: 600,
      saude: 400,
    },
    receitaTotal: 8000,
    despesaTotal: 5500,
    historicoMensal: [
      { mes: "Jan", valor: 5200 },
      { mes: "Fev", valor: 5400 },
      { mes: "Mar", valor: 5500 },
    ],
    metasAtivas: 3,
    economiasMensais: 2500,
  }

  // Geração de insights baseados em IA
  const gerarInsights = (): InsightFinanceiro[] => {
    const insights: InsightFinanceiro[] = []

    // Análise de gastos por categoria
    const gastoAlimentacao = dadosFinanceiros.gastosPorCategoria.alimentacao
    if (gastoAlimentacao > dadosFinanceiros.receitaTotal * 0.2) {
      insights.push({
        tipo: "alerta",
        titulo: "Gastos elevados com alimentação",
        descricao: "Seus gastos com alimentação representam mais de 20% da sua renda. Considere preparar mais refeições em casa.",
        valor: gastoAlimentacao,
        categoria: "Alimentação",
      })
    }

    // Análise de economia
    const taxaEconomia = (dadosFinanceiros.economiasMensais / dadosFinanceiros.receitaTotal) * 100
    if (taxaEconomia > 20) {
      insights.push({
        tipo: "positivo",
        titulo: "Ótima taxa de economia",
        descricao: "Você está economizando mais de 20% da sua renda. Continue assim!",
        valor: taxaEconomia,
        variacao: 5,
      })
    }

    // Previsões financeiras
    const ultimosGastos = dadosFinanceiros.historicoMensal
    const tendencia = ultimosGastos[ultimosGastos.length - 1].valor - ultimosGastos[0].valor
    if (tendencia > 0) {
      insights.push({
        tipo: "alerta",
        titulo: "Tendência de aumento nos gastos",
        descricao: "Seus gastos têm aumentado nos últimos meses. Fique atento ao orçamento.",
        valor: tendencia,
        variacao: (tendencia / ultimosGastos[0].valor) * 100,
      })
    }

    // Dicas personalizadas
    insights.push({
      tipo: "dica",
      titulo: "Oportunidade de investimento",
      descricao: "Com base no seu perfil de gastos, você poderia investir mais em renda fixa.",
    })

    return insights
  }

  const insights = gerarInsights()

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
              <span className="text-green-500">
                {((dadosFinanceiros.receitaTotal - dadosFinanceiros.despesaTotal) / dadosFinanceiros.receitaTotal * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-800">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{
                  width: `${(dadosFinanceiros.despesaTotal / dadosFinanceiros.receitaTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Metas Financeiras</h3>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">{dadosFinanceiros.metasAtivas}</p>
            <p className="text-sm text-gray-400">Objetivos em andamento</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium">Economia Mensal</h3>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">
              R$ {dadosFinanceiros.economiasMensais.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">Média de economia</p>
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
                        <span className="text-sm font-medium">
                          R$ {insight.valor.toFixed(2)}
                        </span>
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

      {/* Previsões */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-xl font-semibold">Previsões Financeiras</h2>
        </div>
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
              <h3 className="mb-2 font-medium">Projeção de Gastos</h3>
              <p className="text-sm text-gray-400">
                Com base nos seus padrões de gastos, estimamos que seus gastos nos
                próximos 3 meses serão:
              </p>
              <div className="mt-4 space-y-2">
                {dadosFinanceiros.historicoMensal.map((mes, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">{mes.mes}</span>
                    <span className="font-medium">
                      R$ {(mes.valor * 1.05).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
              <h3 className="mb-2 font-medium">Economia Projetada</h3>
              <p className="text-sm text-gray-400">
                Mantendo seus hábitos atuais, você poderá economizar:
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Meta mensal</span>
                  <span className="font-medium text-green-500">
                    R$ {dadosFinanceiros.economiasMensais.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Projeção anual</span>
                    <span className="font-medium text-green-500">
                      R$ {(dadosFinanceiros.economiasMensais * 12).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 