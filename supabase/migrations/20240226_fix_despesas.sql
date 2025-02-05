-- Desabilitar triggers temporariamente
SET session_replication_role = 'replica';

-- Primeiro, vamos fazer backup dos dados existentes
CREATE TABLE IF NOT EXISTS despesas_backup AS 
SELECT * FROM despesas;

-- Agora vamos recriar a tabela com a estrutura correta
DROP TABLE IF EXISTS despesas CASCADE;

CREATE TABLE despesas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    categoria TEXT NOT NULL,
    data DATE NOT NULL,
    pago BOOLEAN NOT NULL DEFAULT false
);

-- Restaurar os dados do backup
INSERT INTO despesas (id, created_at, user_id, descricao, valor, categoria, data, pago)
SELECT 
    id, 
    created_at, 
    user_id, 
    descricao, 
    valor, 
    categoria, 
    data,
    CASE 
        WHEN status = 'paga' THEN true
        ELSE false
    END as pago
FROM despesas_backup;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS despesas_user_id_idx ON despesas(user_id);
CREATE INDEX IF NOT EXISTS despesas_data_idx ON despesas(data);
CREATE INDEX IF NOT EXISTS despesas_pago_idx ON despesas(pago);

-- Habilitar RLS (Row Level Security)
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias despesas"
    ON despesas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias despesas"
    ON despesas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas"
    ON despesas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias despesas"
    ON despesas FOR DELETE
    USING (auth.uid() = user_id);

-- Função para verificar despesas atrasadas
CREATE OR REPLACE FUNCTION verificar_despesas_atrasadas()
RETURNS void AS $$
BEGIN
    -- Aqui apenas logamos as despesas atrasadas não pagas
    INSERT INTO notificacoes (user_id, titulo, mensagem, tipo)
    SELECT 
        d.user_id,
        'Despesa Atrasada',
        'A despesa "' || d.descricao || '" de R$ ' || d.valor || ' está atrasada.',
        'alerta'
    FROM despesas d
    WHERE d.data < CURRENT_DATE 
    AND d.pago = false
    AND NOT EXISTS (
        SELECT 1 FROM notificacoes n
        WHERE n.user_id = d.user_id
        AND n.titulo = 'Despesa Atrasada'
        AND n.mensagem LIKE '%' || d.descricao || '%'
        AND n.created_at > (CURRENT_TIMESTAMP - interval '24 hours')
    );
END;
$$ LANGUAGE plpgsql;

-- Dropar a tabela de backup se tudo estiver ok
DROP TABLE IF EXISTS despesas_backup;

-- Reabilitar triggers
SET session_replication_role = 'origin'; 