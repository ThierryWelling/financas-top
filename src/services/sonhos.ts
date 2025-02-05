import { supabase } from "@/lib/supabase"

export interface Sonho {
  id: string
  user_id: string
  descricao: string
  valor: number
  categoria: string
  status: "pendente" | "em_andamento" | "concluido" | "cancelado"
  created_at: string
}

export const sonhosService = {
  async criar(sonho: Omit<Sonho, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("sonhos")
      .insert([sonho])
      .select()
      .single()

    if (error) throw error
    return data as Sonho
  },

  async listar() {
    const { data, error } = await supabase
      .from("sonhos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Sonho[]
  },

  async atualizar(id: string, sonho: Partial<Omit<Sonho, "id" | "created_at">>) {
    const { data, error } = await supabase
      .from("sonhos")
      .update(sonho)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Sonho
  },

  async excluir(id: string) {
    const { error } = await supabase
      .from("sonhos")
      .delete()
      .eq("id", id)

    if (error) throw error
  },
} 