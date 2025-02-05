import { supabase } from "@/lib/supabase"
import { receitasService } from "./receitas"
import { despesasService } from "./despesas"
import { sonhosService } from "./sonhos"

interface DadosFinanceiros {
  receitaTotal: number
  despesaTotal: number
  saldoDisponivel: number
  temDespesasAtrasadas: boolean
  despesasAtrasadas: any[]
  totalDespesasAtrasadas: number
  gastosPorCategoria: Record<string, number>
}

export interface Notificacao {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: "alerta" | "lembrete" | "meta" | "dica"
  lida: boolean
  data_referencia?: string
  created_at: string
}

export const notificacoesService = {
  async criar(notificacao: Omit<Notificacao, "id" | "created_at" | "lida">) {
    const { data, error } = await supabase
      .from("notificacoes")
      .insert([{ ...notificacao, lida: false }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async listar() {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error
    return data as Notificacao[]
  },

  async marcarComoLida(id: string) {
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id)

    if (error) throw error
  },

  async verificarContasProximas() {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + 5) // Próximos 5 dias

    const { data: despesas, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("pago", false)
      .lte("data", dataLimite.toISOString().split("T")[0])
      .gte("data", new Date().toISOString().split("T")[0])

    if (error) throw error

    for (const despesa of despesas) {
      const diasRestantes = Math.ceil(
        (new Date(despesa.data).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      await this.criar({
        user_id: despesa.user_id,
        titulo: "Conta Próxima do Vencimento",
        mensagem: `A despesa "${despesa.descricao}" de R$ ${despesa.valor.toFixed(2)} vence em ${diasRestantes} dias.`,
        tipo: "lembrete",
        data_referencia: despesa.data
      })
    }
  },

  async verificarGastosExcessivos() {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    
    // Buscar orçamentos do mês atual
    const { data: orcamentos, error: orcamentosError } = await supabase
      .from("orcamentos")
      .select("*")
      .eq("mes_ano", inicioMes.toISOString().split("T")[0])

    if (orcamentosError) throw orcamentosError

    for (const orcamento of orcamentos) {
      const percentualGasto = (orcamento.valor_atual / orcamento.valor_limite) * 100

      if (percentualGasto >= orcamento.alerta_percentual) {
        await this.criar({
          user_id: orcamento.user_id,
          titulo: "Alerta de Orçamento",
          mensagem: `Você já utilizou ${Math.round(percentualGasto)}% do orçamento de ${orcamento.categoria} este mês.`,
          tipo: "alerta",
          data_referencia: orcamento.mes_ano
        })
      }
    }
  },

  async verificarMetasAtingidas() {
    const { data: sonhos, error } = await supabase
      .from("sonhos")
      .select("*")
      .lt("valor_meta", "valor_atual")
      .eq("notificado", false)

    if (error) throw error

    for (const sonho of sonhos) {
      await this.criar({
        user_id: sonho.user_id,
        titulo: "Meta Atingida! 🎉",
        mensagem: `Parabéns! Você atingiu sua meta "${sonho.titulo}"!`,
        tipo: "meta"
      })

      // Marcar como notificado
      await supabase
        .from("sonhos")
        .update({ notificado: true })
        .eq("id", sonho.id)
    }
  },

  async gerarDicasEconomia() {
    const { data: gastos, error } = await supabase
      .from("despesas")
      .select("categoria, valor")
      .gte("data", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())

    if (error) throw error

    // Agrupar gastos por categoria
    const gastosPorCategoria = gastos.reduce((acc, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.valor
      return acc
    }, {} as Record<string, number>)

    // Encontrar categoria com maior gasto
    const categoriaMaiorGasto = Object.entries(gastosPorCategoria)
      .sort(([,a], [,b]) => b - a)[0]

    if (categoriaMaiorGasto) {
      const [categoria, valor] = categoriaMaiorGasto
      const dicas = {
        alimentacao: "Considere fazer uma lista de compras e evitar ir ao mercado com fome.",
        transporte: "Que tal avaliar alternativas como carona compartilhada ou transporte público?",
        lazer: "Procure por opções gratuitas de entretenimento na sua cidade.",
        default: "Revise seus gastos nesta categoria e identifique oportunidades de economia."
      }

      await this.criar({
        user_id: (await supabase.auth.getUser()).data.user?.id || "",
        titulo: "Dica de Economia",
        mensagem: `Seu maior gasto no último mês foi com ${categoria}: R$ ${valor.toFixed(2)}. ${dicas[categoria as keyof typeof dicas] || dicas.default}`,
        tipo: "dica"
      })
    }
  }
}

export const iaActions = {
  async criarReceitaRecorrente(
    user_id: string,
    descricao: string,
    valor: number
  ) {
    const receita = await receitasService.criar({
      user_id,
      descricao,
      valor,
      data: new Date().toISOString(),
      recorrente: true,
      categoria: "Outros",
    })

    await notificacoesService.criar({
      user_id,
      titulo: "Nova Receita Recorrente",
      mensagem: `Criei uma nova receita recorrente de R$ ${valor.toFixed(2)} para "${descricao}"`,
      tipo: "acao"
    })

    return receita
  },

  async criarDespesaPrevista(
    user_id: string,
    descricao: string,
    valor: number,
    categoria: string
  ) {
    const despesa = await despesasService.criar({
      user_id,
      descricao,
      valor,
      data: new Date().toISOString(),
      categoria,
      status: "prevista",
    })

    await notificacoesService.criar({
      user_id,
      titulo: "Nova Despesa Prevista",
      mensagem: `Registrei uma nova despesa prevista de R$ ${valor.toFixed(2)} para "${descricao}"`,
      tipo: "acao"
    })

    return despesa
  },

  async criarSonho(
    user_id: string,
    descricao: string,
    valor: number,
    categoria: string
  ) {
    const sonho = await sonhosService.criar({
      user_id,
      descricao,
      valor,
      categoria,
      status: "pendente",
    })

    await notificacoesService.criar({
      user_id,
      titulo: "Novo Sonho Financeiro",
      mensagem: `Criei um novo sonho financeiro "${descricao}" com meta de R$ ${valor.toFixed(2)}`,
      tipo: "acao"
    })

    return sonho
  },

  async gerarNotificacoes(user_id: string, dados: DadosFinanceiros) {
    const notificacoes = []

    // Alerta de despesas atrasadas
    if (dados.temDespesasAtrasadas) {
      notificacoes.push({
        user_id,
        titulo: "Despesas Atrasadas",
        mensagem: `Você tem ${dados.despesasAtrasadas.length} despesas atrasadas, totalizando R$ ${dados.totalDespesasAtrasadas.toFixed(2)}`,
        tipo: "alerta" as const,
      })
    }

    // Dica de economia baseada em gastos por categoria
    const maiorGasto = Object.entries(dados.gastosPorCategoria).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    )
    if (maiorGasto[1] > dados.receitaTotal * 0.3) {
      notificacoes.push({
        user_id,
        titulo: "Dica de Economia",
        mensagem: `Seus gastos com ${maiorGasto[0]} representam mais de 30% da sua receita. Que tal tentar reduzir um pouco?`,
        tipo: "dica" as const,
      })
    }

    // Sugestão de investimento
    if (dados.saldoDisponivel > dados.receitaTotal * 0.2) {
      notificacoes.push({
        user_id,
        titulo: "Oportunidade de Investimento",
        mensagem: `Você tem um saldo disponível considerável. Que tal começar a investir?`,
        tipo: "sugestao" as const,
      })
    }

    // Criar as notificações no banco
    for (const notif of notificacoes) {
      await notificacoesService.criar(notif)
    }
  },
} 