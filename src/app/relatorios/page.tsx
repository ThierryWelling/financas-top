"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { relatoriosService } from "@/services/relatorios"
import {
  FileDown,
  TrendingUp,
  Target,
  AlertTriangle,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState({
    inicio: format(new Date().setDate(1), "yyyy-MM-dd"),
    fim: format(new Date(), "yyyy-MM-dd"),
  })
  const [analise, setAnalise] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGerarRelatorio = async () => {
    try {
      setLoading(true)
      const dados = await relatoriosService.buscarDadosPeriodo({
        inicio: new Date(periodo.inicio),
        fim: new Date(periodo.fim),
      })
      const analiseData = await relatoriosService.analisarDados(dados)
      setAnalise(analiseData)
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportarPDF = async () => {
    try {
      setLoading(true)
      await relatoriosService.gerarRelatorioPDF({
        inicio: new Date(periodo.inicio),
        fim: new Date(periodo.fim),
      })
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCorSaude = (indicador: string) => {
    switch (indicador) {
      case "otima":
        return "text-green-500"
      case "boa":
        return "text-blue-500"
      case "regular":
        return "text-yellow-500"
      case "atencao":
        return "text-orange-500"
      case "critica":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
        <Button onClick={handleExportarPDF} disabled={loading}>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Seleção de Período */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inicio">Data Inicial</Label>
            <Input
              id="inicio"
              type="date"
              value={periodo.inicio}
              onChange={(e) =>
                setPeriodo((prev) => ({ ...prev, inicio: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fim">Data Final</Label>
            <Input
              id="fim"
              type="date"
              value={periodo.fim}
              onChange={(e) =>
                setPeriodo((prev) => ({ ...prev, fim: e.target.value }))
              }
            />
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={handleGerarRelatorio}
          disabled={loading}
        >
          Gerar Análise
        </Button>
      </Card>

      {analise && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resumo Financeiro */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Resumo Financeiro</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Receita Total</span>
                <span className="text-green-500">
                  R$ {analise.receitaTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Despesa Total</span>
                <span className="text-red-500">
                  R$ {analise.despesaTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Saldo Líquido</span>
                <span
                  className={
                    analise.saldoLiquido >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  R$ {analise.saldoLiquido.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Saúde Financeira */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Saúde Financeira</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <span className={getCorSaude(analise.saudeFinanceira.indicador)}>
                  {analise.saudeFinanceira.indicador.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pontuação</span>
                <Progress
                  value={analise.saudeFinanceira.pontuacao}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                {analise.saudeFinanceira.recomendacoes.map((rec: string, i: number) => (
                  <Alert key={i}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </Card>

          {/* Tendências */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tendências</h2>
            <div className="space-y-4">
              {analise.tendencias.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{t.categoria}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        t.variacao >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {t.variacao > 0 ? "+" : ""}
                      {t.variacao.toFixed(1)}%
                    </span>
                    {t.variacao >= 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Metas */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Progresso das Metas</h2>
            <div className="space-y-4">
              {analise.metasProgresso.map((meta: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{meta.titulo}</span>
                    <span>{meta.percentualConcluido.toFixed(1)}%</span>
                  </div>
                  <Progress value={meta.percentualConcluido} className="h-2" />
                  <span className="text-xs text-gray-500">
                    Previsão de conclusão:{" "}
                    {format(new Date(meta.previsaoConclusao), "MMM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 