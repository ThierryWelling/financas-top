-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tema TEXT NOT NULL DEFAULT 'escuro' CHECK (tema IN ('claro', 'escuro')),
  cor_primaria TEXT NOT NULL DEFAULT '#7C3AED',
  notificacoes JSONB NOT NULL DEFAULT '{
    "despesas_proximas": true,
    "despesas_atrasadas": true,
    "metas_atingidas": true,
    "dicas_economia": true
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Criar índice para melhorar performance de buscas por user_id
CREATE INDEX IF NOT EXISTS configuracoes_user_id_idx ON configuracoes(user_id);

-- Habilitar RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver apenas suas próprias configurações"
  ON configuracoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias configurações"
  ON configuracoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias configurações"
  ON configuracoes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias configurações"
  ON configuracoes FOR DELETE
  USING (auth.uid() = user_id);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_configuracoes_updated_at();

-- Criar função para criar configurações padrão para novos usuários
CREATE OR REPLACE FUNCTION criar_configuracoes_padrao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO configuracoes (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para criar configurações padrão para novos usuários
CREATE TRIGGER criar_configuracoes_padrao
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION criar_configuracoes_padrao(); 