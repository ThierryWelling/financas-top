-- Criar função para atualizar status de despesas atrasadas
CREATE OR REPLACE FUNCTION atualizar_status_despesas_atrasadas()
RETURNS void AS $$
BEGIN
  -- Atualizar despesas atrasadas
  UPDATE despesas
  SET status = 'atrasada'
  WHERE data < CURRENT_DATE 
  AND status = 'prevista';
  
  -- Atualizar despesas pagas que estavam atrasadas
  UPDATE despesas
  SET status = 'paga'
  WHERE status = 'atrasada'
  AND data < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função diariamente
CREATE OR REPLACE FUNCTION trigger_atualizar_despesas_diariamente()
RETURNS trigger AS $$
BEGIN
  PERFORM atualizar_status_despesas_atrasadas();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS atualizar_despesas_diariamente ON despesas;
CREATE TRIGGER atualizar_despesas_diariamente
  AFTER INSERT OR UPDATE ON despesas
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_atualizar_despesas_diariamente(); 