-- Desabilitar triggers temporariamente
SET session_replication_role = 'replica';

-- Verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracoes_updated_at();

-- Criar função para criar configurações padrão para novos usuários
CREATE OR REPLACE FUNCTION criar_configuracoes_padrao()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuracoes (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) 
    DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para criar configurações quando um novo usuário é criado
DROP TRIGGER IF EXISTS criar_configuracoes_novo_usuario ON auth.users;
CREATE TRIGGER criar_configuracoes_novo_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION criar_configuracoes_padrao();

-- Criar configurações para usuários existentes que não têm
INSERT INTO configuracoes (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM configuracoes WHERE user_id = auth.users.id
);

-- Habilitar RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON configuracoes;
CREATE POLICY "Usuários podem ver suas próprias configurações"
    ON configuracoes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON configuracoes;
CREATE POLICY "Usuários podem atualizar suas próprias configurações"
    ON configuracoes FOR UPDATE
    USING (auth.uid() = user_id);

-- Reabilitar triggers
SET session_replication_role = 'origin'; 