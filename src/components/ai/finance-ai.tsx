"use client"

import { Brain, Lightbulb, AlertCircle } from "lucide-react"

interface FinanceAIProps {
  data: {
    tipo: "receita" | "despesa" | "sonho"
    valor?: number
    categoria?: string
    descricao?: string
    data?: string
    meta?: number
    prazo?: string
  }
}

export function FinanceAI({ data }: FinanceAIProps) {
  const gerarSugestoes = () => {
    const sugestoes: string[] = []

    switch (data.tipo) {
      case "receita":
        if (data.valor && data.valor > 5000) {
          sugestoes.push("Considere investir parte deste valor em renda fixa")
        }
        sugestoes.push("Defina metas de economia com base nesta receita")
        break

      case "despesa":
        if (data.categoria === "alimentacao") {
          sugestoes.push("Compare preços em diferentes estabelecimentos")
          sugestoes.push("Considere fazer compras em atacado")
        }
        if (data.categoria === "lazer") {
          sugestoes.push("Procure alternativas gratuitas de entretenimento")
        }
        break

      case "sonho":
        if (data.meta && data.valor) {
          const percentualAtingido = (data.valor / data.meta) * 100
          if (percentualAtingido < 30) {
            sugestoes.push("Aumente suas economias mensais para atingir seu objetivo mais rápido")
          }
        }
        if (data.prazo) {
          sugestoes.push("Revise seu progresso mensalmente")
        }
        break
    }

    return sugestoes
  }

  const sugestoes = gerarSugestoes()

  if (sugestoes.length === 0) return null

  return (
    <div className="mt-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-indigo-500">
        <Brain className="h-5 w-5" />
        <h4 className="font-medium">Sugestões da IA</h4>
      </div>
      <div className="space-y-2">
        {sugestoes.map((sugestao, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <Lightbulb className="mt-0.5 h-4 w-4 text-indigo-500" />
            <span className="text-gray-300">{sugestao}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AIAlertProps {
  message: string
  type?: "warning" | "info"
}

export function AIAlert({ message, type = "info" }: AIAlertProps) {
  return (
    <div
      className={`mt-2 flex items-center gap-2 rounded-lg p-2 text-sm ${
        type === "warning"
          ? "bg-yellow-500/10 text-yellow-500"
          : "bg-blue-500/10 text-blue-500"
      }`}
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
} 