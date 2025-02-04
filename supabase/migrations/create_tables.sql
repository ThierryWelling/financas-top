-- Habilita a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS receitas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data DATE NOT NULL
);

-- Tabela de Despesas
CREATE TABLE IF NOT EXISTS despesas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data DATE NOT NULL,
    pago BOOLEAN DEFAULT false
);

-- Tabela de Sonhos (Metas Financeiras)
CREATE TABLE IF NOT EXISTS sonhos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    valor_meta DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) DEFAULT 0,
    data_meta DATE,
    categoria TEXT NOT NULL,
    prioridade INTEGER DEFAULT 1
);

-- Políticas de Segurança (RLS)
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonhos ENABLE ROW LEVEL SECURITY;

-- Políticas para Receitas
CREATE POLICY "Usuários podem ver suas próprias receitas"
    ON receitas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias receitas"
    ON receitas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias receitas"
    ON receitas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias receitas"
    ON receitas FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para Despesas
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

-- Políticas para Sonhos
CREATE POLICY "Usuários podem ver seus próprios sonhos"
    ON sonhos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios sonhos"
    ON sonhos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios sonhos"
    ON sonhos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios sonhos"
    ON sonhos FOR DELETE
    USING (auth.uid() = user_id); 