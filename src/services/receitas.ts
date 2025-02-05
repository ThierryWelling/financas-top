import { supabase } from "@/lib/supabase"

export interface Receita {
  id: string
  user_id: string
  descricao: string
  valor: number
  data: string
  categoria: string
  recorrente: boolean
  created_at: string
}

export const receitasService = {
  async criar(receita: Omit<Receita, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("receitas")
      .insert([receita])
      .select()
      .single()

    if (error) throw error
    return data as Receita
  },

  async listar() {
    const { data, error } = await supabase
      .from("receitas")
      .select("*")
      .order("data", { ascending: false })

    if (error) throw error
    return data as Receita[]
  },

  async atualizar(id: string, receita: Partial<Omit<Receita, "id" | "created_at">>) {
    const { data, error } = await supabase
      .from("receitas")
      .update(receita)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Receita
  },

  async excluir(id: string) {
    const { error } = await supabase
      .from("receitas")
      .delete()
      .eq("id", id)

    if (error) throw error
  },
} 