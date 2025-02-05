-- Desabilitar triggers temporariamente
SET session_replication_role = 'replica';

-- Fazer backup dos dados existentes
CREATE TABLE IF NOT EXISTS configuracoes_backup AS 
SELECT * FROM configuracoes;

-- Dropar a tabela existente
DROP TABLE IF EXISTS configuracoes CASCADE;

-- Recriar a tabela com a estrutura correta
CREATE TABLE configuracoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cor_primaria TEXT NOT NULL DEFAULT '#7C3AED',
    cores_secundarias JSONB NOT NULL DEFAULT '{
        "background": "hsl(240 10% 3.9%)",
        "foreground": "hsl(0 0% 98%)",
        "card": "hsl(240 10% 3.9%)",
        "popover": "hsl(240 10% 3.9%)",
        "primary": "hsl(263.4 70% 50.4%)",
        "secondary": "hsl(240 3.7% 15.9%)",
        "muted": "hsl(240 3.7% 15.9%)",
        "accent": "hsl(240 3.7% 15.9%)"
    }',
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

-- Restaurar dados do backup com a nova estrutura
INSERT INTO configuracoes (
    id, 
    user_id, 
    cor_primaria,
    cores_secundarias,
    notificacoes,
    created_at,
    updated_at
)
SELECT 
    id, 
    user_id, 
    cor_primaria,
    cores_tema->'escuro'->'cores_secundarias' as cores_secundarias,
    notificacoes,
    created_at,
    updated_at
FROM configuracoes_backup
ON CONFLICT (user_id) DO NOTHING;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS configuracoes_user_id_idx ON configuracoes(user_id);

-- Habilitar RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON configuracoes;
CREATE POLICY "Usuários podem ver suas próprias configurações"
    ON configuracoes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias configurações" ON configuracoes;
CREATE POLICY "Usuários podem inserir suas próprias configurações"
    ON configuracoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON configuracoes;
CREATE POLICY "Usuários podem atualizar suas próprias configurações"
    ON configuracoes FOR UPDATE
    USING (auth.uid() = user_id);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracoes_updated_at();

-- Dropar a tabela de backup
DROP TABLE IF EXISTS configuracoes_backup;

-- Reabilitar triggers
SET session_replication_role = 'origin'; 