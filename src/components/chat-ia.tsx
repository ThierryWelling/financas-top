"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { calcularTotais } from "@/services/financas"

interface Mensagem {
  tipo: "usuario" | "ia"
  texto: string
}

interface DadosFinanceiros {
  receitas: any[]
  despesas: any[]
  sonhos: any[]
  receitaTotal: number
  despesaTotal: number
  saldoDisponivel: number
  gastosPorCategoria: Record<string, number>
}

export function ChatIA() {
  const [chatAberto, setChatAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      tipo: "ia",
      texto: "Olá! Sou sua assistente financeira. Como posso ajudar você hoje?"
    }
  ])
  const [novaMensagem, setNovaMensagem] = useState("")
  const [dados, setDados] = useState<DadosFinanceiros | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (chatAberto) {
      carregarDados()
    }
  }, [chatAberto])

  const carregarDados = async () => {
    try {
      const dadosFinanceiros = await calcularTotais()
      setDados(dadosFinanceiros)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const gerarRespostaIA = async (pergunta: string): Promise<string> => {
    if (!dados) return "Desculpe, não consegui acessar seus dados financeiros."

    // Análise de palavras-chave para gerar respostas contextualizadas
    const perguntaLower = pergunta.toLowerCase()

    if (perguntaLower.includes("saldo") || perguntaLower.includes("disponível")) {
      return `Seu saldo disponível é R$ ${dados.saldoDisponivel.toFixed(2)}. ${
        dados.saldoDisponivel > 0
          ? "Você pode investir este valor em seus sonhos!"
          : "Recomendo revisar seus gastos para equilibrar as finanças."
      }`
    }

    if (perguntaLower.includes("gasto") || perguntaLower.includes("despesa")) {
      const maioresGastos = Object.entries(dados.gastosPorCategoria)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

      return `Seus principais gastos são:\n${maioresGastos
        .map(([categoria, valor]) => `- ${categoria}: R$ ${valor.toFixed(2)}`)
        .join("\n")}`
    }

    if (perguntaLower.includes("sonho") || perguntaLower.includes("meta")) {
      if (dados.sonhos.length === 0) {
        return "Você ainda não cadastrou nenhum sonho. Que tal começar agora?"
      }

      const sonhoPrioritario = dados.sonhos[0] // Já está ordenado por percentual concluído
      return `Seu sonho prioritário é "${sonhoPrioritario.titulo}" (${sonhoPrioritario.percentualConcluido.toFixed(1)}% concluído). ${
        dados.saldoDisponivel > 0
          ? `Você pode investir R$ ${Math.min(
              dados.saldoDisponivel,
              sonhoPrioritario.valorFaltante
            ).toFixed(2)} nele!`
          : "Continue economizando para alcançá-lo!"
      }`
    }

    if (perguntaLower.includes("receita") || perguntaLower.includes("ganho")) {
      return `Sua receita total é R$ ${dados.receitaTotal.toFixed(2)}. ${
        dados.saldoDisponivel > 0
          ? "Você está conseguindo economizar, parabéns!"
          : "Seus gastos estão superando sua receita, vamos trabalhar nisso?"
      }`
    }

    if (perguntaLower.includes("economia") || perguntaLower.includes("poupar")) {
      const taxaEconomia = ((dados.receitaTotal - dados.despesaTotal) / dados.receitaTotal) * 100
      return `Sua taxa de economia é ${taxaEconomia.toFixed(1)}%. ${
        taxaEconomia >= 20
          ? "Parabéns! Você está acima da meta recomendada de 20%."
          : "O ideal é economizar pelo menos 20% da sua renda. Vamos trabalhar para alcançar isso!"
      }`
    }

    return "Desculpe, não entendi sua pergunta. Você pode me perguntar sobre seu saldo, gastos, receitas, sonhos ou economia!"
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return
    setLoading(true)

    // Adiciona a mensagem do usuário
    const mensagemUsuario: Mensagem = {
      tipo: "usuario",
      texto: novaMensagem
    }
    setMensagens(prev => [...prev, mensagemUsuario])
    setNovaMensagem("")

    // Gera resposta da IA
    const resposta = await gerarRespostaIA(novaMensagem)
    const mensagemIA: Mensagem = {
      tipo: "ia",
      texto: resposta
    }
    setMensagens(prev => [...prev, mensagemIA])
    setLoading(false)
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setChatAberto(true)}
        className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-indigo-500 p-4 text-white shadow-lg transition-all hover:bg-indigo-600 ${
          chatAberto ? "hidden" : ""
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="text-sm font-medium">Assistente Financeiro</span>
      </button>

      {/* Modal do chat */}
      {chatAberto && (
        <div className="fixed bottom-6 right-6 w-96 rounded-lg border border-gray-800 bg-gray-900 shadow-xl">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-500" />
              <h3 className="font-medium">Assistente Financeiro</h3>
            </div>
            <button
              onClick={() => setChatAberto(false)}
              className="rounded p-1 hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="h-96 overflow-y-auto p-4">
            <div className="space-y-4">
              {mensagens.map((mensagem, index) => (
                <div
                  key={index}
                  className={`flex ${
                    mensagem.tipo === "usuario" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      mensagem.tipo === "usuario"
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{mensagem.texto}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-gray-800 p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && enviarMensagem()}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                onClick={enviarMensagem}
                disabled={loading}
                className="rounded-lg bg-indigo-500 p-2 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 