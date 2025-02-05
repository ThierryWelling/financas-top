"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/useProfile"
import { calcularTotais } from "@/services/financas"
import { receitasService } from "@/services/receitas"
import { despesasService } from "@/services/despesas"
import { sonhosService } from "@/services/sonhos"

interface Mensagem {
  tipo: "usuario" | "ia"
  texto: string
}

interface DadosCriacao {
  tipo: "receita" | "despesa" | "sonho" | null
  etapa: number
  dados: Record<string, any>
}

export function ChatIA() {
  const [chatAberto, setChatAberto] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loading, setLoading] = useState(false)
  const [criacao, setCriacao] = useState<DadosCriacao>({ tipo: null, etapa: 0, dados: {} })
  const chatRef = useRef<HTMLDivElement>(null)
  const { profile } = useProfile()

  useEffect(() => {
    if (chatAberto && mensagens.length === 0) {
      // Mensagem de boas-vindas personalizada
      const horario = new Date().getHours()
      let saudacao = "Bom dia"
      if (horario >= 12 && horario < 18) saudacao = "Boa tarde"
      if (horario >= 18) saudacao = "Boa noite"
      
      setMensagens([{
        tipo: "ia",
        texto: `${saudacao}, ${profile?.nome || 'visitante'}! Sou sua assistente financeira. Como posso ajudar você hoje?`
      }])
    }
  }, [chatAberto, profile])

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  const determinarCategoria = (tipo: "receita" | "despesa" | "sonho", descricao: string): string => {
    const descricaoLower = descricao.toLowerCase()
    
    switch (tipo) {
      case "receita":
        if (descricaoLower.includes("salário") || 
            descricaoLower.includes("pagamento") || 
            descricaoLower.includes("remuneração")) {
          return "Salário"
        }
        if (descricaoLower.includes("dividendo") || 
            descricaoLower.includes("juros") || 
            descricaoLower.includes("rendimento")) {
          return "Investimentos"
        }
        if (descricaoLower.includes("aluguel") && 
            (descricaoLower.includes("receb") || descricaoLower.includes("recibo"))) {
          return "Aluguel"
        }
        if (descricaoLower.includes("freelance") || 
            descricaoLower.includes("extra") || 
            descricaoLower.includes("bico")) {
          return "Trabalho Extra"
        }
        return "Outros"

      case "despesa":
        if (descricaoLower.includes("aluguel") || 
            descricaoLower.includes("condomínio") || 
            descricaoLower.includes("iptu") ||
            descricaoLower.includes("água") ||
            descricaoLower.includes("luz") ||
            descricaoLower.includes("gás")) {
          return "Moradia"
        }
        if (descricaoLower.includes("mercado") || 
            descricaoLower.includes("supermercado") || 
            descricaoLower.includes("feira") ||
            descricaoLower.includes("restaurante") ||
            descricaoLower.includes("lanche")) {
          return "Alimentação"
        }
        if (descricaoLower.includes("uber") || 
            descricaoLower.includes("ônibus") || 
            descricaoLower.includes("metrô") ||
            descricaoLower.includes("combustível") ||
            descricaoLower.includes("gasolina") ||
            descricaoLower.includes("passagem")) {
          return "Transporte"
        }
        if (descricaoLower.includes("academia") || 
            descricaoLower.includes("médico") || 
            descricaoLower.includes("dentista") ||
            descricaoLower.includes("farmácia") ||
            descricaoLower.includes("remédio")) {
          return "Saúde"
        }
        if (descricaoLower.includes("netflix") || 
            descricaoLower.includes("spotify") || 
            descricaoLower.includes("cinema") ||
            descricaoLower.includes("show") ||
            descricaoLower.includes("teatro")) {
          return "Lazer"
        }
        if (descricaoLower.includes("curso") || 
            descricaoLower.includes("livro") || 
            descricaoLower.includes("faculdade") ||
            descricaoLower.includes("escola")) {
          return "Educação"
        }
        return "Outros"

      case "sonho":
        if (descricaoLower.includes("casa") || 
            descricaoLower.includes("apartamento") || 
            descricaoLower.includes("imóvel")) {
          return "Imóvel"
        }
        if (descricaoLower.includes("carro") || 
            descricaoLower.includes("moto") || 
            descricaoLower.includes("veículo")) {
          return "Veículo"
        }
        if (descricaoLower.includes("viagem") || 
            descricaoLower.includes("férias") || 
            descricaoLower.includes("passeio")) {
          return "Viagem"
        }
        if (descricaoLower.includes("curso") || 
            descricaoLower.includes("faculdade") || 
            descricaoLower.includes("graduação") ||
            descricaoLower.includes("mestrado") ||
            descricaoLower.includes("doutorado")) {
          return "Educação"
        }
        if (descricaoLower.includes("negócio") || 
            descricaoLower.includes("empresa") || 
            descricaoLower.includes("empreender")) {
          return "Empreendimento"
        }
        return "Outros"
    }
  }

  const processarCriacao = async (resposta: string) => {
    if (!criacao.tipo || !profile?.id) return { mensagem: "", continuar: false }

    const respostaLower = resposta.toLowerCase()
    let proximaEtapa = criacao.etapa
    let dados = { ...criacao.dados }
    let concluido = false
    let mensagemRetorno = ""

    switch (criacao.tipo) {
      case "receita":
        switch (criacao.etapa) {
          case 1: // Descrição
            dados.descricao = resposta
            dados.categoria = determinarCategoria("receita", resposta)
            proximaEtapa = 2
            mensagemRetorno = "Qual o valor da receita?"
            break
          case 2: // Valor
            const valorReceita = parseFloat(resposta.replace(/[^0-9.,]/g, "").replace(",", "."))
            if (isNaN(valorReceita)) {
              mensagemRetorno = "Por favor, informe um valor válido."
            } else {
              dados.valor = valorReceita
              proximaEtapa = 3
              mensagemRetorno = `Baseado na descrição, identifiquei a categoria como "${dados.categoria}". Confirma a criação da receita?\nDescrição: ${dados.descricao}\nValor: R$ ${dados.valor}\nCategoria: ${dados.categoria}\n(Responda sim ou não)`
            }
            break
          case 3: // Confirmação
            if (respostaLower === "sim") {
              await receitasService.criar({
                user_id: profile.id,
                descricao: dados.descricao,
                valor: dados.valor,
                categoria: dados.categoria,
                data: new Date().toISOString(),
                recorrente: false
              })
              mensagemRetorno = "✅ Receita criada com sucesso!"
            } else {
              mensagemRetorno = "❌ Operação cancelada."
            }
            concluido = true
            break
        }
        break

      case "despesa":
        switch (criacao.etapa) {
          case 1: // Descrição
            dados.descricao = resposta
            dados.categoria = determinarCategoria("despesa", resposta)
            proximaEtapa = 2
            mensagemRetorno = "Qual o valor da despesa?"
            break
          case 2: // Valor
            const valorDespesa = parseFloat(resposta.replace(/[^0-9.,]/g, "").replace(",", "."))
            if (isNaN(valorDespesa)) {
              mensagemRetorno = "Por favor, informe um valor válido."
            } else {
              dados.valor = valorDespesa
              proximaEtapa = 3
              mensagemRetorno = "Qual a data da despesa? (formato: dd/mm/aaaa)"
            }
            break
          case 3: // Data
            const partesData = resposta.split("/")
            const dataValida = partesData.length === 3 && !isNaN(Date.parse(`${partesData[2]}-${partesData[1]}-${partesData[0]}`))
            
            if (!dataValida) {
              mensagemRetorno = "Por favor, informe uma data válida no formato dd/mm/aaaa."
            } else {
              dados.data = `${partesData[2]}-${partesData[1]}-${partesData[0]}`
              proximaEtapa = 4
              mensagemRetorno = `Baseado na descrição, identifiquei a categoria como "${dados.categoria}". Confirma a criação da despesa?\nDescrição: ${dados.descricao}\nValor: R$ ${dados.valor}\nData: ${resposta}\nCategoria: ${dados.categoria}\n(Responda sim ou não)`
            }
            break
          case 4: // Confirmação
            if (respostaLower === "sim") {
              await despesasService.criar({
                user_id: profile.id,
                descricao: dados.descricao,
                valor: dados.valor,
                categoria: dados.categoria,
                data: dados.data,
                status: "prevista"
              })
              mensagemRetorno = "✅ Despesa criada com sucesso!"
            } else {
              mensagemRetorno = "❌ Operação cancelada."
            }
            concluido = true
            break
        }
        break

      case "sonho":
        switch (criacao.etapa) {
          case 1: // Título
            dados.titulo = resposta
            dados.categoria = determinarCategoria("sonho", resposta)
            proximaEtapa = 2
            mensagemRetorno = "Qual o valor do objetivo?"
            break
          case 2: // Valor
            const valorSonho = parseFloat(resposta.replace(/[^0-9.,]/g, "").replace(",", "."))
            if (isNaN(valorSonho)) {
              mensagemRetorno = "Por favor, informe um valor válido."
            } else {
              dados.valor = valorSonho
              proximaEtapa = 3
              mensagemRetorno = `Baseado na descrição, identifiquei a categoria como "${dados.categoria}". Confirma a criação do sonho?\nTítulo: ${dados.titulo}\nValor: R$ ${dados.valor}\nCategoria: ${dados.categoria}\n(Responda sim ou não)`
            }
            break
          case 3: // Confirmação
            if (respostaLower === "sim") {
              await sonhosService.criar({
                user_id: profile.id,
                descricao: dados.titulo,
                valor: dados.valor,
                categoria: dados.categoria,
                status: "pendente"
              })
              mensagemRetorno = "✅ Sonho criado com sucesso!"
            } else {
              mensagemRetorno = "❌ Operação cancelada."
            }
            concluido = true
            break
        }
        break
    }

    if (concluido) {
      setCriacao({ tipo: null, etapa: 0, dados: {} })
    } else {
      setCriacao({ tipo: criacao.tipo, etapa: proximaEtapa, dados })
    }

    return { mensagem: mensagemRetorno, continuar: !concluido }
  }

  const gerarRespostaIA = async (pergunta: string): Promise<string> => {
    try {
      // Se estiver em processo de criação, processa a resposta
      if (criacao.tipo) {
        const resultado = await processarCriacao(pergunta)
        return resultado.mensagem
      }

      const perguntaLower = pergunta.toLowerCase()
      const nome = profile?.nome || "usuário"

      // Iniciar criação de item
      if (perguntaLower.includes("criar") || perguntaLower.includes("nova") || perguntaLower.includes("novo")) {
        if (perguntaLower.includes("receita")) {
          setCriacao({ tipo: "receita", etapa: 1, dados: {} })
          return "Vamos criar uma nova receita! Qual a descrição da receita?"
        }
        if (perguntaLower.includes("despesa")) {
          setCriacao({ tipo: "despesa", etapa: 1, dados: {} })
          return "Vamos criar uma nova despesa! Qual a descrição da despesa?"
        }
        if (perguntaLower.includes("sonho") || perguntaLower.includes("objetivo")) {
          setCriacao({ tipo: "sonho", etapa: 1, dados: {} })
          return "Vamos criar um novo sonho! Qual o título do seu objetivo?"
        }
      }

      // Respostas normais para outras perguntas
      const dados = await calcularTotais()

      if (perguntaLower.includes("saldo")) {
        return `${nome}, seu saldo disponível é R$ ${dados.saldoDisponivel.toFixed(2)}.`
      }

      if (perguntaLower.includes("despesa")) {
        return `${nome}, você tem um total de R$ ${dados.despesaTotal.toFixed(2)} em despesas este mês.`
      }

      if (perguntaLower.includes("receita")) {
        return `${nome}, suas receitas somam R$ ${dados.receitaTotal.toFixed(2)} este mês.`
      }

      return `${nome}, estou aqui para ajudar! Você pode:\n- Criar uma nova receita\n- Criar uma nova despesa\n- Criar um novo sonho/objetivo\n- Consultar seu saldo\n- Verificar receitas e despesas`
    } catch (error) {
      console.error("Erro ao gerar resposta:", error)
      return "Desculpe, tive um problema ao processar sua pergunta. Pode tentar novamente?"
    }
  }

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return

    const novaMensagem: Mensagem = {
      tipo: "usuario",
      texto: mensagem
    }

    setMensagens(prev => [...prev, novaMensagem])
    setMensagem("")
    setLoading(true)

    try {
      const resposta = await gerarRespostaIA(mensagem)
      const mensagemIA: Mensagem = {
        tipo: "ia",
        texto: resposta
      }
      setMensagens(prev => [...prev, mensagemIA])
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      const mensagemErro: Mensagem = {
        tipo: "ia",
        texto: "Desculpe, ocorreu um erro ao processar sua mensagem."
      }
      setMensagens(prev => [...prev, mensagemErro])
    } finally {
      setLoading(false)
    }
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
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && enviarMensagem()}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                onClick={enviarMensagem}
                disabled={loading || !mensagem.trim()}
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