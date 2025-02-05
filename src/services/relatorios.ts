import { supabase } from "@/lib/supabase"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => any
  lastAutoTable: { finalY: number }
}

interface DadosRelatorio {
  receitas: any[]
  despesas: any[]
  sonhos: any[]
  orcamentos: any[]
  periodo: {
    inicio: Date
    fim: Date
  }
}

interface AnaliseFinanceira {
  receitaTotal: number
  despesaTotal: number
  saldoLiquido: number
  gastosPorCategoria: Record<string, number>
  percentualPorCategoria: Record<string, number>
  tendencias: {
    categoria: string
    variacao: number
    previsaoProximoMes: number
  }[]
  metasProgresso: {
    titulo: string
    percentualConcluido: number
    previsaoConclusao: Date
  }[]
  saudeFinanceira: {
    indicador: "otima" | "boa" | "regular" | "atencao" | "critica"
    pontuacao: number
    recomendacoes: string[]
  }
}

export const relatoriosService = {
  async gerarRelatorioPDF(periodo: { inicio: Date; fim: Date }) {
    // Buscar dados do período
    const dados = await this.buscarDadosPeriodo(periodo)
    
    // Criar documento PDF
    const doc = new jsPDF() as jsPDFWithAutoTable
    
    // Cabeçalho
    doc.setFontSize(20)
    doc.text("Relatório Financeiro", 105, 15, { align: "center" })
    doc.setFontSize(12)
    doc.text(
      `Período: ${format(periodo.inicio, "dd/MM/yyyy")} a ${format(periodo.fim, "dd/MM/yyyy")}`,
      105,
      25,
      { align: "center" }
    )

    // Resumo Financeiro
    doc.setFontSize(16)
    doc.text("Resumo Financeiro", 14, 40)
    
    const analise = await this.analisarDados(dados)
    doc.autoTable({
      startY: 45,
      head: [["Indicador", "Valor"]],
      body: [
        ["Receita Total", `R$ ${analise.receitaTotal.toFixed(2)}`],
        ["Despesa Total", `R$ ${analise.despesaTotal.toFixed(2)}`],
        ["Saldo Líquido", `R$ ${analise.saldoLiquido.toFixed(2)}`],
      ],
    })

    // Gastos por Categoria
    doc.setFontSize(16)
    doc.text("Gastos por Categoria", 14, doc.lastAutoTable.finalY + 15)
    
    const categorias = Object.entries(analise.gastosPorCategoria).map(([categoria, valor]) => [
      categoria,
      `R$ ${valor.toFixed(2)}`,
      `${analise.percentualPorCategoria[categoria].toFixed(1)}%`,
    ])
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Categoria", "Valor", "Percentual"]],
      body: categorias,
    })

    // Tendências
    doc.setFontSize(16)
    doc.text("Tendências e Previsões", 14, doc.lastAutoTable.finalY + 15)
    
    const tendencias = analise.tendencias.map(t => [
      t.categoria,
      `${t.variacao > 0 ? "+" : ""}${t.variacao.toFixed(1)}%`,
      `R$ ${t.previsaoProximoMes.toFixed(2)}`,
    ])
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Categoria", "Variação", "Previsão Próximo Mês"]],
      body: tendencias,
    })

    // Saúde Financeira
    doc.setFontSize(16)
    doc.text("Saúde Financeira", 14, doc.lastAutoTable.finalY + 15)
    
    doc.setFontSize(12)
    doc.text(`Indicador: ${analise.saudeFinanceira.indicador.toUpperCase()}`, 14, doc.lastAutoTable.finalY + 25)
    doc.text(`Pontuação: ${analise.saudeFinanceira.pontuacao}/100`, 14, doc.lastAutoTable.finalY + 32)
    
    doc.setFontSize(14)
    doc.text("Recomendações:", 14, doc.lastAutoTable.finalY + 42)
    analise.saudeFinanceira.recomendacoes.forEach((rec, i) => {
      doc.setFontSize(12)
      doc.text(`• ${rec}`, 20, doc.lastAutoTable.finalY + 50 + (i * 7))
    })

    // Salvar PDF
    return doc.save("relatorio-financeiro.pdf")
  },

  async buscarDadosPeriodo(periodo: { inicio: Date; fim: Date }): Promise<DadosRelatorio> {
    const [receitas, despesas, sonhos, orcamentos] = await Promise.all([
      // Buscar receitas
      supabase
        .from("receitas")
        .select("*")
        .gte("data", periodo.inicio.toISOString())
        .lte("data", periodo.fim.toISOString())
        .order("data", { ascending: true }),
      
      // Buscar despesas
      supabase
        .from("despesas")
        .select("*")
        .gte("data", periodo.inicio.toISOString())
        .lte("data", periodo.fim.toISOString())
        .order("data", { ascending: true }),
      
      // Buscar sonhos
      supabase
        .from("sonhos")
        .select("*")
        .order("created_at", { ascending: true }),
      
      // Buscar orçamentos
      supabase
        .from("orcamentos")
        .select("*")
        .gte("mes_ano", periodo.inicio.toISOString().split("T")[0])
        .lte("mes_ano", periodo.fim.toISOString().split("T")[0])
    ])

    return {
      receitas: receitas.data || [],
      despesas: despesas.data || [],
      sonhos: sonhos.data || [],
      orcamentos: orcamentos.data || [],
      periodo
    }
  },

  async analisarDados(dados: DadosRelatorio): Promise<AnaliseFinanceira> {
    // Cálculos básicos
    const receitaTotal = dados.receitas.reduce((sum, r) => sum + r.valor, 0)
    const despesaTotal = dados.despesas.reduce((sum, d) => sum + d.valor, 0)
    const saldoLiquido = receitaTotal - despesaTotal

    // Análise por categoria
    const gastosPorCategoria = dados.despesas.reduce((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + d.valor
      return acc
    }, {} as Record<string, number>)

    const percentualPorCategoria = Object.entries(gastosPorCategoria).reduce((acc, [cat, valor]) => {
      acc[cat] = ((valor as number) / despesaTotal) * 100
      return acc
    }, {} as Record<string, number>)

    // Análise de tendências
    const tendencias = await this.analisarTendencias(dados)

    // Progresso das metas
    const metasProgresso = dados.sonhos.map(sonho => ({
      titulo: sonho.titulo,
      percentualConcluido: (sonho.valor_atual / sonho.valor_meta) * 100,
      previsaoConclusao: this.calcularPrevisaoConclusao(sonho)
    }))

    // Cálculo da saúde financeira
    const saudeFinanceira = this.calcularSaudeFinanceira({
      receitaTotal,
      despesaTotal,
      gastosPorCategoria,
      orcamentos: dados.orcamentos
    })

    return {
      receitaTotal,
      despesaTotal,
      saldoLiquido,
      gastosPorCategoria,
      percentualPorCategoria,
      tendencias,
      metasProgresso,
      saudeFinanceira
    }
  },

  async analisarTendencias(dados: DadosRelatorio) {
    const categorias = Array.from(new Set(dados.despesas.map(d => d.categoria)))
    const tendencias = []

    for (const categoria of categorias) {
      const gastosMensais = this.agruparGastosPorMes(
        dados.despesas.filter(d => d.categoria === categoria)
      )

      const variacao = this.calcularVariacaoPercentual(gastosMensais)
      const previsaoProximoMes = await this.preverGastosFuturos(gastosMensais)

      tendencias.push({
        categoria,
        variacao,
        previsaoProximoMes
      })
    }

    return tendencias
  },

  agruparGastosPorMes(despesas: any[]) {
    return despesas.reduce((acc, despesa) => {
      const mes = format(new Date(despesa.data), "yyyy-MM")
      acc[mes] = (acc[mes] || 0) + despesa.valor
      return acc
    }, {} as Record<string, number>)
  },

  calcularVariacaoPercentual(gastosMensais: Record<string, number>) {
    const meses = Object.keys(gastosMensais).sort()
    if (meses.length < 2) return 0

    const mesAnterior = gastosMensais[meses[meses.length - 2]]
    const mesAtual = gastosMensais[meses[meses.length - 1]]

    return ((mesAtual - mesAnterior) / mesAnterior) * 100
  },

  async preverGastosFuturos(gastosMensais: Record<string, number>) {
    const valores = Object.values(gastosMensais)
    if (valores.length < 3) return valores[valores.length - 1] || 0

    // Média móvel ponderada
    const pesos = [0.5, 0.3, 0.2]
    const ultimosValores = valores.slice(-3)
    
    return ultimosValores.reduce((acc, valor, i) => acc + (valor * pesos[i]), 0)
  },

  calcularPrevisaoConclusao(sonho: any) {
    const valorRestante = sonho.valor_meta - sonho.valor_atual
    const valorMedioPorMes = sonho.valor_atual / this.getMesesDecorridos(sonho.created_at)
    const mesesRestantes = valorRestante / valorMedioPorMes

    const dataPrevisao = new Date()
    dataPrevisao.setMonth(dataPrevisao.getMonth() + Math.ceil(mesesRestantes))
    return dataPrevisao
  },

  getMesesDecorridos(dataInicio: string) {
    const inicio = new Date(dataInicio)
    const agora = new Date()
    return (agora.getFullYear() - inicio.getFullYear()) * 12 + 
           (agora.getMonth() - inicio.getMonth())
  },

  calcularSaudeFinanceira(dados: {
    receitaTotal: number
    despesaTotal: number
    gastosPorCategoria: Record<string, number>
    orcamentos: any[]
  }) {
    let pontuacao = 100
    const recomendacoes: string[] = []

    // Comprometimento da renda
    const comprometimento = (dados.despesaTotal / dados.receitaTotal) * 100
    if (comprometimento > 80) {
      pontuacao -= 30
      recomendacoes.push("Reduza seus gastos mensais para no máximo 80% da sua renda")
    }

    // Orçamentos estourados
    const orcamentosEstourados = dados.orcamentos.filter(o => 
      dados.gastosPorCategoria[o.categoria] > o.valor_limite
    )
    if (orcamentosEstourados.length > 0) {
      pontuacao -= 10 * orcamentosEstourados.length
      recomendacoes.push(`Você estourou ${orcamentosEstourados.length} orçamentos este mês`)
    }

    // Gastos essenciais vs não essenciais
    const categoriasEssenciais = ["moradia", "alimentacao", "saude", "transporte"]
    const gastosEssenciais = categoriasEssenciais.reduce(
      (sum, cat) => sum + (dados.gastosPorCategoria[cat] || 0),
      0
    )
    const percentualEssenciais = (gastosEssenciais / dados.despesaTotal) * 100

    if (percentualEssenciais < 50) {
      pontuacao -= 20
      recomendacoes.push("Priorize gastos essenciais como moradia, alimentação e saúde")
    }

    // Determinar indicador
    let indicador: "otima" | "boa" | "regular" | "atencao" | "critica"
    if (pontuacao >= 90) indicador = "otima"
    else if (pontuacao >= 70) indicador = "boa"
    else if (pontuacao >= 50) indicador = "regular"
    else if (pontuacao >= 30) indicador = "atencao"
    else indicador = "critica"

    return {
      indicador,
      pontuacao,
      recomendacoes
    }
  }
} 