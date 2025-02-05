import { notificacoesService } from "./notificacoes"
import { calcularTotais } from "./financas"

export const analiseAutomatica = {
  async analisarFinancas(userId: string) {
    try {
      const dados = await calcularTotais()

      const notificacoes = []

      // Análise de Despesas Atrasadas
      if (dados.temDespesasAtrasadas) {
        notificacoes.push({
          user_id: userId,
          titulo: "⚠️ Despesas Atrasadas",
          mensagem: `Você tem ${dados.despesasAtrasadas.length} despesas atrasadas, totalizando R$ ${dados.totalDespesasAtrasadas.toFixed(2)}. Que tal organizarmos isso?`,
          tipo: "alerta" as const,
        })
      }

      // Análise de Gastos por Categoria
      const categoriasAltas = Object.entries(dados.gastosPorCategoria)
        .filter(([_, valor]) => valor > dados.receitaTotal * 0.3)
        .map(([categoria]) => categoria)

      if (categoriasAltas.length > 0) {
        notificacoes.push({
          user_id: userId,
          titulo: "💡 Dica de Economia",
          mensagem: `Seus gastos com ${categoriasAltas.join(", ")} estão acima de 30% da sua receita. Vamos criar um plano para reduzir?`,
          tipo: "dica" as const,
        })
      }

      // Análise de Saldo Disponível
      if (dados.saldoDisponivel > dados.receitaTotal * 0.2) {
        notificacoes.push({
          user_id: userId,
          titulo: "🎯 Oportunidade de Investimento",
          mensagem: `Você tem R$ ${dados.saldoDisponivel.toFixed(2)} disponíveis. Que tal começar a investir? Posso te ajudar com algumas sugestões!`,
          tipo: "sugestao" as const,
        })
      }

      // Análise de Receitas vs Despesas
      const taxaComprometimento = (dados.despesaTotal / dados.receitaTotal) * 100
      if (taxaComprometimento > 80) {
        notificacoes.push({
          user_id: userId,
          titulo: "⚠️ Alerta de Orçamento",
          mensagem: `Suas despesas estão comprometendo ${taxaComprometimento.toFixed(1)}% da sua receita. Vamos revisar seu orçamento?`,
          tipo: "alerta" as const,
        })
      }

      // Análise de Sonhos/Metas
      const sonhosPrioritarios = dados.sonhos
        .filter(s => s.percentualConcluido < 50)
        .slice(0, 2)

      if (sonhosPrioritarios.length > 0) {
        notificacoes.push({
          user_id: userId,
          titulo: "✨ Foco nos Sonhos",
          mensagem: `Seus sonhos "${sonhosPrioritarios.map(s => s.descricao).join('" e "')}" estão abaixo de 50% da meta. Vamos criar estratégias para alcançá-los?`,
          tipo: "sugestao" as const,
        })
      }

      // Dicas Sazonais (exemplo: início do mês)
      const hoje = new Date()
      if (hoje.getDate() <= 5) {
        notificacoes.push({
          user_id: userId,
          titulo: "📅 Planejamento Mensal",
          mensagem: "Início do mês é o momento ideal para planejar suas finanças. Quer ajuda para organizar seu orçamento?",
          tipo: "dica" as const,
        })
      }

      // Criar as notificações no banco
      for (const notif of notificacoes) {
        await notificacoesService.criar(
          notif.user_id,
          notif.titulo,
          notif.mensagem,
          notif.tipo
        )
      }

      return notificacoes
    } catch (error) {
      console.error("Erro na análise automática:", error)
      throw error
    }
  },

  async verificarMetas(userId: string) {
    try {
      const dados = await calcularTotais()
      
      // Verificar se alguma meta foi atingida
      const metasAtingidas = dados.sonhos.filter(
        sonho => sonho.percentualConcluido >= 100 && sonho.status !== "concluido"
      )

      for (const meta of metasAtingidas) {
        await notificacoesService.criar(
          userId,
          "🎉 Meta Alcançada!",
          `Parabéns! Você atingiu sua meta "${meta.descricao}"! Que tal definir um novo objetivo?`,
          "acao"
        )
      }

      return metasAtingidas
    } catch (error) {
      console.error("Erro ao verificar metas:", error)
      throw error
    }
  },

  async sugerirAcoes(userId: string) {
    try {
      const dados = await calcularTotais()
      const sugestoes = []

      // Sugerir criação de reserva de emergência
      if (!dados.sonhos.some(s => s.descricao.toLowerCase().includes("emergência"))) {
        sugestoes.push({
          user_id: userId,
          titulo: "💰 Reserva de Emergência",
          mensagem: "Que tal criarmos uma reserva de emergência? É fundamental ter um valor guardado para imprevistos.",
          tipo: "sugestao" as const,
        })
      }

      // Sugerir revisão de despesas fixas
      const despesasFixas = dados.despesas.filter(d => d.recorrente)
      if (despesasFixas.length > 0) {
        const totalFixas = despesasFixas.reduce((acc, d) => acc + d.valor, 0)
        if (totalFixas > dados.receitaTotal * 0.6) {
          sugestoes.push({
            user_id: userId,
            titulo: "📊 Revisão de Despesas Fixas",
            mensagem: "Suas despesas fixas estão altas. Posso te ajudar a identificar onde podemos economizar?",
            tipo: "dica" as const,
          })
        }
      }

      // Criar as sugestões como notificações
      for (const sugestao of sugestoes) {
        await notificacoesService.criar(
          sugestao.user_id,
          sugestao.titulo,
          sugestao.mensagem,
          sugestao.tipo
        )
      }

      return sugestoes
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error)
      throw error
    }
  }
} 