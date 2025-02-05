-- Criar função para executar SQL dinamicamente
CREATE OR REPLACE FUNCTION executar_sql(comando text)
RETURNS void AS $$
BEGIN
    EXECUTE comando;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER; 