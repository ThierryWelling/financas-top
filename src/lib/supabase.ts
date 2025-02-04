import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos das tabelas
export interface Receita {
  id: number
  created_at: string
  valor: number
  descricao: string
  categoria: string
  data: string
  user_id: string
}

export interface Despesa {
  id: number
  created_at: string
  valor: number
  descricao: string
  categoria: string
  data: string
  user_id: string
}

export interface Sonho {
  id: number
  created_at: string
  titulo: string
  descricao: string
  valor_meta: number
  valor_atual: number
  data_meta: string
  categoria: string
  user_id: string
} 