-- Criar tabela de notificações
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('alerta', 'dica', 'sugestao', 'acao')),
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices
CREATE INDEX notificacoes_user_id_idx ON notificacoes(user_id);
CREATE INDEX notificacoes_created_at_idx ON notificacoes(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notificacoes_updated_at
  BEFORE UPDATE ON notificacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_notificacoes_updated_at();

-- Políticas de segurança
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON notificacoes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias notificações"
  ON notificacoes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
  ON notificacoes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias notificações"
  ON notificacoes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 