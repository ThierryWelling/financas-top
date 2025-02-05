-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover tabela se existir (para garantir uma criação limpa)
DROP TABLE IF EXISTS profiles;

-- Criar tabela de perfis de usuário
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nome TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Função para definir o primeiro usuário como administrador
CREATE OR REPLACE FUNCTION set_first_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para debug
    RAISE NOTICE 'Executando trigger set_first_user_as_admin para usuário %', NEW.id;
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE is_admin = true) THEN
        NEW.is_admin = true;
        RAISE NOTICE 'Definindo usuário % como primeiro administrador', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS set_first_user_admin ON profiles;
CREATE TRIGGER set_first_user_admin
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_first_user_as_admin();

-- Políticas de segurança
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem atualizar todos os perfis" ON profiles;

-- Política para visualização (mais permissiva para debug)
CREATE POLICY "Política de visualização de perfis"
    ON profiles FOR SELECT
    USING (true);  -- Permite que qualquer usuário autenticado veja os perfis

-- Política para inserção
CREATE POLICY "Política de inserção de perfis"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política para atualização
CREATE POLICY "Política de atualização de perfis"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir função de log para debug
CREATE OR REPLACE FUNCTION log_profiles_access()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Acesso à tabela profiles: operação %, usuário %', TG_OP, auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log de acesso
DROP TRIGGER IF EXISTS log_profiles_access_trigger ON profiles;
CREATE TRIGGER log_profiles_access_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profiles_access(); 