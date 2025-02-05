import { notificacoesService } from "@/services/notificacoes"

// Intervalo de verificação em minutos
const INTERVALO_VERIFICACAO = 30

// Horário para verificar contas a vencer (8h da manhã)
const HORA_VERIFICACAO_CONTAS = 8

// Percentual padrão para alertas de orçamento
const PERCENTUAL_ALERTA_PADRAO = 80

export async function iniciarVerificacaoNotificacoes() {
  // Verificar contas próximas do vencimento
  const verificarContas = async () => {
    const agora = new Date()
    if (agora.getHours() === HORA_VERIFICACAO_CONTAS) {
      await notificacoesService.verificarContasProximas()
    }
  }

  // Verificar gastos excessivos
  const verificarGastos = async () => {
    await notificacoesService.verificarGastosExcessivos()
  }

  // Verificar metas atingidas
  const verificarMetas = async () => {
    await notificacoesService.verificarMetasAtingidas()
  }

  // Gerar dicas de economia
  const gerarDicas = async () => {
    await notificacoesService.gerarDicasEconomia()
  }

  // Executar todas as verificações
  const executarVerificacoes = async () => {
    try {
      await verificarContas()
      await verificarGastos()
      await verificarMetas()
      await gerarDicas()
    } catch (error) {
      console.error("Erro ao executar verificações de notificações:", error)
    }
  }

  // Executar imediatamente e agendar próximas verificações
  executarVerificacoes()
  setInterval(executarVerificacoes, INTERVALO_VERIFICACAO * 60 * 1000)
}

export const configNotificacoes = {
  INTERVALO_VERIFICACAO,
  HORA_VERIFICACAO_CONTAS,
  PERCENTUAL_ALERTA_PADRAO,
} 