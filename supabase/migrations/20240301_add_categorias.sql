-- Criar tabela de categorias personalizadas
CREATE TABLE categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL DEFAULT '#7C3AED',
    tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa', 'ambos')),
    categoria_pai_id UUID REFERENCES categorias(id),
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, nome)
);

-- Criar índices
CREATE INDEX categorias_user_id_idx ON categorias(user_id);
CREATE INDEX categorias_categoria_pai_id_idx ON categorias(categoria_pai_id);

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias categorias"
    ON categorias FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias categorias"
    ON categorias FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
    ON categorias FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias"
    ON categorias FOR DELETE
    USING (auth.uid() = user_id);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_categorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_categorias_updated_at();

-- Inserir categorias padrão
INSERT INTO categorias (user_id, nome, descricao, icone, tipo, cor) VALUES
    (auth.uid(), 'Alimentação', 'Gastos com alimentação em geral', 'UtensilsCrossed', 'despesa', '#22C55E'),
    (auth.uid(), 'Moradia', 'Despesas relacionadas à moradia', 'Home', 'despesa', '#3B82F6'),
    (auth.uid(), 'Transporte', 'Gastos com transporte', 'Car', 'despesa', '#F59E0B'),
    (auth.uid(), 'Saúde', 'Despesas com saúde', 'Heart', 'despesa', '#EF4444'),
    (auth.uid(), 'Educação', 'Gastos com educação', 'GraduationCap', 'despesa', '#8B5CF6'),
    (auth.uid(), 'Lazer', 'Despesas com lazer e entretenimento', 'Gamepad2', 'despesa', '#EC4899'),
    (auth.uid(), 'Salário', 'Receita do trabalho', 'Briefcase', 'receita', '#10B981'),
    (auth.uid(), 'Investimentos', 'Rendimentos de investimentos', 'TrendingUp', 'receita', '#6366F1'),
    (auth.uid(), 'Freelance', 'Trabalhos extras', 'Code2', 'receita', '#F97316')
ON CONFLICT DO NOTHING; 