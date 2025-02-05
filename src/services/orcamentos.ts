import { supabase } from "@/lib/supabase"

export interface Orcamento {
  id: string
  user_id: string
  categoria: string
  valor_limite: number
  mes_ano: string // Data no formato YYYY-MM-DD
  valor_atual: number
  alerta_percentual: number
  created_at?: string
  updated_at?: string
}

export const orcamentosService = {
  async criar(orcamento: Omit<Orcamento, "id" | "created_at" | "updated_at" | "valor_atual">) {
    const { data, error } = await supabase
      .from("orcamentos")
      .insert([orcamento])
      .select()
      .single()

    if (error) throw error
    return data as Orcamento
  },

  async listar(mes_ano?: string) {
    let query = supabase
      .from("orcamentos")
      .select("*")
      
    if (mes_ano) {
      query = query.eq("mes_ano", mes_ano)
    }

    const { data, error } = await query.order("categoria")

    if (error) throw error
    return data as Orcamento[]
  },

  async atualizar(id: string, orcamento: Partial<Omit<Orcamento, "id" | "created_at" | "updated_at">>) {
    const { data, error } = await supabase
      .from("orcamentos")
      .update(orcamento)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Orcamento
  },

  async excluir(id: string) {
    const { error } = await supabase
      .from("orcamentos")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  async obterProgresso(categoria: string, mes_ano: string) {
    const { data, error } = await supabase
      .from("orcamentos")
      .select("valor_limite, valor_atual")
      .eq("categoria", categoria)
      .eq("mes_ano", mes_ano)
      .single()

    if (error) throw error

    if (!data) return null

    const percentual = (data.valor_atual / data.valor_limite) * 100
    return {
      valor_limite: data.valor_limite,
      valor_atual: data.valor_atual,
      percentual: Math.round(percentual),
      status: percentual >= 100 ? "excedido" : percentual >= 80 ? "alerta" : "normal"
    }
  },

  async duplicarParaProximoMes(mes_ano: string) {
    const orcamentosAtuais = await this.listar(mes_ano)
    const proximoMes = new Date(mes_ano)
    proximoMes.setMonth(proximoMes.getMonth() + 1)
    
    for (const orcamento of orcamentosAtuais) {
      await this.criar({
        user_id: orcamento.user_id,
        categoria: orcamento.categoria,
        valor_limite: orcamento.valor_limite,
        mes_ano: proximoMes.toISOString().split("T")[0],
        alerta_percentual: orcamento.alerta_percentual
      })
    }
  }
} 