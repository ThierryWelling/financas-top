-- Criar tabela de configurações
CREATE TABLE configuracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tema TEXT NOT NULL DEFAULT 'escuro',
    cor_primaria TEXT NOT NULL DEFAULT '#7C3AED',
    notificacoes JSONB NOT NULL DEFAULT '{
        "despesasAtrasadas": true,
        "lembretesPagamento": true,
        "dicasEconomia": true,
        "relatoriosMensais": true,
        "atualizacoesSistema": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_config UNIQUE (user_id)
);

-- Criar índice
CREATE INDEX configuracoes_user_id_idx ON configuracoes(user_id);

-- Habilitar RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias configurações"
    ON configuracoes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias configurações"
    ON configuracoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
    ON configuracoes FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracoes_updated_at();

-- Função para criar configurações padrão para novos usuários
CREATE OR REPLACE FUNCTION criar_configuracoes_padrao()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuracoes (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar configurações quando um novo usuário é criado
CREATE TRIGGER criar_configuracoes_novo_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION criar_configuracoes_padrao(); 