-- Adicionar coluna status à tabela despesas
ALTER TABLE despesas 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'prevista' 
CHECK (status IN ('prevista', 'paga', 'atrasada'));

-- Atualizar despesas existentes
UPDATE despesas 
SET status = CASE 
    WHEN pago = true THEN 'paga'
    WHEN data < CURRENT_DATE AND pago = false THEN 'atrasada'
    ELSE 'prevista'
END; 