import { supabase } from "@/lib/supabase"

const CATEGORIAS_VALIDAS = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Outros"
] as const;

type CategoriaValida = typeof CATEGORIAS_VALIDAS[number];

export interface Despesa {
  id: string
  created_at: string
  user_id: string
  descricao: string
  valor: number
  categoria: CategoriaValida
  data: string
  pago: boolean
}

const validarCategoria = (categoria: string): CategoriaValida => {
  return CATEGORIAS_VALIDAS.includes(categoria as CategoriaValida) 
    ? (categoria as CategoriaValida) 
    : "Outros";
}

export const despesasService = {
  async criar(dados: Omit<Despesa, "id" | "created_at">) {
    try {
      // Garantir que a data está no formato correto
      const dataFormatada = new Date(dados.data).toISOString().split('T')[0]
      
      const despesa = {
        ...dados,
        data: dataFormatada,
        pago: false, // Toda nova despesa começa como não paga
        categoria: validarCategoria(dados.categoria)
      }

      const { data, error } = await supabase
        .from("despesas")
        .insert([despesa])
        .select()
        .single()

      if (error) {
        console.error("Erro Supabase:", error)
        throw new Error(error.message)
      }

      return data as Despesa
    } catch (error) {
      console.error("Erro ao criar despesa:", error)
      throw error
    }
  },

  async listar() {
    try {
      const { data, error } = await supabase
        .from("despesas")
        .select("*")
        .order("data", { ascending: false })

      if (error) throw error
      return data as Despesa[]
    } catch (error) {
      console.error("Erro ao listar despesas:", error)
      throw error
    }
  },

  async atualizar(id: string, dados: Partial<Omit<Despesa, "id" | "created_at">>) {
    try {
      const atualizacao: any = { ...dados }
      
      // Se houver data, garantir que está no formato correto
      if (dados.data) {
        atualizacao.data = new Date(dados.data).toISOString().split('T')[0]
      }

      const { data, error } = await supabase
        .from("despesas")
        .update(atualizacao)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as Despesa
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error)
      throw error
    }
  },

  async excluir(id: string) {
    try {
      const { error } = await supabase
        .from("despesas")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao excluir despesa:", error)
      throw error
    }
  },

  async marcarComoPaga(id: string) {
    try {
      const { data, error } = await supabase
        .from("despesas")
        .update({ pago: true })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as Despesa
    } catch (error) {
      console.error("Erro ao marcar despesa como paga:", error)
      throw error
    }
  },

  async desmarcarComoPaga(id: string) {
    try {
      const { data, error } = await supabase
        .from("despesas")
        .update({ pago: false })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as Despesa
    } catch (error) {
      console.error("Erro ao desmarcar despesa como paga:", error)
      throw error
    }
  },

  async verificarAtrasadas() {
    const { error } = await supabase.rpc('atualizar_status_despesas_atrasadas')
    if (error) throw error
  }
} 