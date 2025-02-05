-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('alerta', 'dica', 'sugestao', 'acao')),
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias notificações"
    ON notificacoes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações"
    ON notificacoes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar suas notificações como lidas"
    ON notificacoes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND (
            (OLD.lida = FALSE AND NEW.lida = TRUE) -- Permite apenas marcar como lida
            OR (OLD.lida = NEW.lida) -- Ou manter o mesmo estado
        )
    );

-- Índices
CREATE INDEX notificacoes_user_id_idx ON notificacoes(user_id);
CREATE INDEX notificacoes_created_at_idx ON notificacoes(created_at);
CREATE INDEX notificacoes_lida_idx ON notificacoes(lida);

-- Trigger para limpar notificações antigas
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS trigger AS $$
BEGIN
    -- Manter apenas as últimas 100 notificações por usuário
    DELETE FROM notificacoes
    WHERE id IN (
        SELECT id
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM notificacoes
        ) sq
        WHERE rn > 100
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_limpar_notificacoes_antigas
    AFTER INSERT ON notificacoes
    FOR EACH STATEMENT
    EXECUTE FUNCTION limpar_notificacoes_antigas(); 