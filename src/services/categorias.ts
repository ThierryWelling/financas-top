import { supabase } from "@/lib/supabase"

export interface Categoria {
  id: string
  user_id: string
  nome: string
  descricao?: string
  icone: string
  cor: string
  tipo: "receita" | "despesa" | "ambos"
  categoria_pai_id?: string
  ordem: number
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export const categoriasService = {
  async listar(tipo?: "receita" | "despesa" | "ambos") {
    let query = supabase
      .from("categorias")
      .select("*")
      .eq("ativo", true)
      .order("ordem")
    
    if (tipo) {
      query = query.in("tipo", [tipo, "ambos"])
    }

    const { data, error } = await query

    if (error) throw error
    return data as Categoria[]
  },

  async listarSubcategorias(categoriaPaiId: string) {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("categoria_pai_id", categoriaPaiId)
      .eq("ativo", true)
      .order("ordem")

    if (error) throw error
    return data as Categoria[]
  },

  async criar(categoria: Omit<Categoria, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("categorias")
      .insert([categoria])
      .select()
      .single()

    if (error) throw error
    return data as Categoria
  },

  async atualizar(id: string, categoria: Partial<Omit<Categoria, "id" | "created_at" | "updated_at">>) {
    const { data, error } = await supabase
      .from("categorias")
      .update(categoria)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Categoria
  },

  async excluir(id: string) {
    // Soft delete - apenas marca como inativo
    const { error } = await supabase
      .from("categorias")
      .update({ ativo: false })
      .eq("id", id)

    if (error) throw error
  },

  async reordenar(categorias: { id: string; ordem: number }[]) {
    const { error } = await supabase
      .from("categorias")
      .upsert(
        categorias.map(({ id, ordem }) => ({
          id,
          ordem,
          updated_at: new Date().toISOString()
        }))
      )

    if (error) throw error
  }
} 