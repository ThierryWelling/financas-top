import { supabase } from "@/lib/supabase"

interface CoresSecundarias {
  background: string
  foreground: string
  card: string
  popover: string
  primary: string
  secondary: string
  muted: string
  accent: string
}

interface Configuracoes {
  id: string
  user_id: string
  cor_primaria: string
  cores_secundarias: CoresSecundarias
  notificacoes: {
    despesas_proximas: boolean
    despesas_atrasadas: boolean
    metas_atingidas: boolean
    dicas_economia: boolean
  }
  created_at?: string
  updated_at?: string
}

// Configurações específicas para cada tema
const TEMAS = {
  escuro: {
    cor_primaria: "#7C3AED", // Violeta escuro
    cores_secundarias: {
      background: "hsl(240 10% 3.9%)",
      foreground: "hsl(0 0% 98%)",
      card: "hsl(240 10% 3.9%)",
      popover: "hsl(240 10% 3.9%)",
      primary: "hsl(263.4 70% 50.4%)",
      secondary: "hsl(240 3.7% 15.9%)",
      muted: "hsl(240 3.7% 15.9%)",
      accent: "hsl(240 3.7% 15.9%)",
    }
  },
  claro: {
    cor_primaria: "#6D28D9", // Violeta claro
    cores_secundarias: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(240 10% 3.9%)",
      card: "hsl(0 0% 100%)",
      popover: "hsl(0 0% 100%)",
      primary: "hsl(262.1 83.3% 57.8%)",
      secondary: "hsl(240 4.8% 95.9%)",
      muted: "hsl(240 4.8% 95.9%)",
      accent: "hsl(240 4.8% 95.9%)",
    }
  }
}

const CONFIGURACOES_PADRAO = {
  tema: "escuro" as const,
  cor_primaria: TEMAS.escuro.cor_primaria,
  cores_tema: TEMAS,
  notificacoes: {
    despesas_proximas: true,
    despesas_atrasadas: true,
    metas_atingidas: true,
    dicas_economia: true,
  }
}

const CRIAR_TABELA_SQL = `
  CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tema TEXT NOT NULL DEFAULT 'escuro',
    cor_primaria TEXT NOT NULL DEFAULT '#7C3AED',
    cores_tema JSONB NOT NULL DEFAULT '${JSON.stringify(TEMAS)}',
    notificacoes JSONB NOT NULL DEFAULT '${JSON.stringify(CONFIGURACOES_PADRAO.notificacoes)}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
  );
`

export const configuracoesService = {
  async inicializar() {
    try {
      const { data: existingConfig } = await supabase
        .from('configuracoes')
        .select('*')
        .single()

      if (!existingConfig) {
        await this.resetar()
      }
    } catch (error) {
      console.error('Erro ao inicializar configurações:', error)
      throw error
    }
  },

  async carregar() {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Configurações não existem, criar padrão
          return await this.resetar()
        }
        throw error
      }

      return data as Configuracoes
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      throw error
    }
  },

  async atualizar(dados: Partial<Omit<Configuracoes, "id" | "user_id" | "created_at" | "updated_at">>): Promise<Configuracoes> {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .update(dados)
        .select()
        .single()

      if (error) throw error
      return data as Configuracoes
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }
  },

  async resetar() {
    try {
      const configuracoesPadrao = {
        cor_primaria: '#7C3AED',
        cores_secundarias: {
          background: "hsl(240 10% 3.9%)",
          foreground: "hsl(0 0% 98%)",
          card: "hsl(240 10% 3.9%)",
          popover: "hsl(240 10% 3.9%)",
          primary: "hsl(263.4 70% 50.4%)",
          secondary: "hsl(240 3.7% 15.9%)",
          muted: "hsl(240 3.7% 15.9%)",
          accent: "hsl(240 3.7% 15.9%)"
        },
        notificacoes: {
          despesas_proximas: true,
          despesas_atrasadas: true,
          metas_atingidas: true,
          dicas_economia: true
        }
      }

      const { data, error } = await supabase
        .from('configuracoes')
        .upsert(configuracoesPadrao)
        .select()
        .single()

      if (error) throw error
      return data as Configuracoes
    } catch (error) {
      console.error('Erro ao resetar configurações:', error)
      throw error
    }
  },

  async exportarDados() {
    try {
      const { data: receitas } = await supabase
        .from('receitas')
        .select('*')
        .order('data', { ascending: false })

      const { data: despesas } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false })

      const { data: sonhos } = await supabase
        .from('sonhos')
        .select('*')
        .order('created_at', { ascending: false })

      // Função auxiliar para converter objeto em CSV
      const objetoParaCSV = (objetos: any[], nomeArquivo: string) => {
        if (!objetos || objetos.length === 0) return

        // Obter cabeçalhos do primeiro objeto
        const headers = Object.keys(objetos[0])
        
        // Criar conteúdo CSV
        const csvContent = [
          // Cabeçalhos
          headers.join(','),
          // Linhas de dados
          ...objetos.map(obj => 
            headers.map(header => {
              const valor = obj[header]
              // Formatar valor para CSV
              if (valor === null || valor === undefined) return ''
              if (typeof valor === 'string') return `"${valor.replace(/"/g, '""')}"`
              if (typeof valor === 'object') return `"${JSON.stringify(valor).replace(/"/g, '""')}"`
              return valor
            }).join(',')
          )
        ].join('\n')

        // Criar e baixar arquivo
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financasia_${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }

      // Exportar cada tipo de dado em um arquivo CSV separado
      objetoParaCSV(receitas || [], 'receitas')
      objetoParaCSV(despesas || [], 'despesas')
      objetoParaCSV(sonhos || [], 'sonhos')

    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  },

  async excluirConta() {
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      )

      if (deleteError) throw deleteError

      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      throw error
    }
  }
} 