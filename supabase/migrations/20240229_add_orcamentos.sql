-- Criar tabela de orçamentos
CREATE TABLE orcamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    categoria TEXT NOT NULL,
    valor_limite DECIMAL(10,2) NOT NULL,
    mes_ano DATE NOT NULL, -- Primeiro dia do mês de referência
    valor_atual DECIMAL(10,2) DEFAULT 0,
    alerta_percentual INTEGER DEFAULT 80, -- Percentual para alertar quando ultrapassar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, categoria, mes_ano)
);

-- Criar índices
CREATE INDEX orcamentos_user_id_idx ON orcamentos(user_id);
CREATE INDEX orcamentos_mes_ano_idx ON orcamentos(mes_ano);

-- Habilitar RLS
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios orçamentos"
    ON orcamentos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios orçamentos"
    ON orcamentos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios orçamentos"
    ON orcamentos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios orçamentos"
    ON orcamentos FOR DELETE
    USING (auth.uid() = user_id);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_orcamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_orcamentos_updated_at
    BEFORE UPDATE ON orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_orcamentos_updated_at();

-- Função para atualizar o valor atual do orçamento quando uma despesa é criada/atualizada
CREATE OR REPLACE FUNCTION atualizar_valor_atual_orcamento()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o valor atual do orçamento para o mês da despesa
    UPDATE orcamentos
    SET valor_atual = (
        SELECT COALESCE(SUM(valor), 0)
        FROM despesas
        WHERE user_id = NEW.user_id
        AND categoria = NEW.categoria
        AND DATE_TRUNC('month', data) = DATE_TRUNC('month', NEW.data)
    )
    WHERE user_id = NEW.user_id
    AND categoria = NEW.categoria
    AND mes_ano = DATE_TRUNC('month', NEW.data);

    -- Se o valor atual ultrapassou o percentual de alerta, criar uma notificação
    INSERT INTO notificacoes (user_id, titulo, mensagem, tipo)
    SELECT 
        o.user_id,
        'Alerta de Orçamento',
        'O gasto na categoria ' || o.categoria || ' atingiu ' || 
        ROUND((o.valor_atual / o.valor_limite * 100))::TEXT || '% do limite',
        'alerta'
    FROM orcamentos o
    WHERE o.user_id = NEW.user_id
    AND o.categoria = NEW.categoria
    AND o.mes_ano = DATE_TRUNC('month', NEW.data)
    AND o.valor_atual >= (o.valor_limite * o.alerta_percentual / 100)
    AND NOT EXISTS (
        SELECT 1 FROM notificacoes n
        WHERE n.user_id = o.user_id
        AND n.tipo = 'alerta'
        AND n.titulo = 'Alerta de Orçamento'
        AND n.mensagem LIKE '%' || o.categoria || '%'
        AND n.created_at >= NOW() - INTERVAL '24 hours'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o valor atual quando uma despesa é criada/atualizada
CREATE TRIGGER atualizar_orcamento_apos_despesa
    AFTER INSERT OR UPDATE ON despesas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_valor_atual_orcamento(); 