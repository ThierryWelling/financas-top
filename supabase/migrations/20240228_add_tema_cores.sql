-- Desabilitar triggers temporariamente
SET session_replication_role = 'replica';

-- Adicionar coluna para armazenar as cores do tema
ALTER TABLE configuracoes
ADD COLUMN IF NOT EXISTS cores_tema JSONB NOT NULL DEFAULT '{
  "escuro": {
    "cor_primaria": "#7C3AED",
    "cores_secundarias": {
      "background": "hsl(240 10% 3.9%)",
      "foreground": "hsl(0 0% 98%)",
      "card": "hsl(240 10% 3.9%)",
      "popover": "hsl(240 10% 3.9%)",
      "primary": "hsl(263.4 70% 50.4%)",
      "secondary": "hsl(240 3.7% 15.9%)",
      "muted": "hsl(240 3.7% 15.9%)",
      "accent": "hsl(240 3.7% 15.9%)"
    }
  },
  "claro": {
    "cor_primaria": "#6D28D9",
    "cores_secundarias": {
      "background": "hsl(0 0% 100%)",
      "foreground": "hsl(240 10% 3.9%)",
      "card": "hsl(0 0% 100%)",
      "popover": "hsl(0 0% 100%)",
      "primary": "hsl(262.1 83.3% 57.8%)",
      "secondary": "hsl(240 4.8% 95.9%)",
      "muted": "hsl(240 4.8% 95.9%)",
      "accent": "hsl(240 4.8% 95.9%)"
    }
  }
}';

-- Atualizar configurações existentes com as cores padrão
UPDATE configuracoes
SET cores_tema = '{
  "escuro": {
    "cor_primaria": "#7C3AED",
    "cores_secundarias": {
      "background": "hsl(240 10% 3.9%)",
      "foreground": "hsl(0 0% 98%)",
      "card": "hsl(240 10% 3.9%)",
      "popover": "hsl(240 10% 3.9%)",
      "primary": "hsl(263.4 70% 50.4%)",
      "secondary": "hsl(240 3.7% 15.9%)",
      "muted": "hsl(240 3.7% 15.9%)",
      "accent": "hsl(240 3.7% 15.9%)"
    }
  },
  "claro": {
    "cor_primaria": "#6D28D9",
    "cores_secundarias": {
      "background": "hsl(0 0% 100%)",
      "foreground": "hsl(240 10% 3.9%)",
      "card": "hsl(0 0% 100%)",
      "popover": "hsl(0 0% 100%)",
      "primary": "hsl(262.1 83.3% 57.8%)",
      "secondary": "hsl(240 4.8% 95.9%)",
      "muted": "hsl(240 4.8% 95.9%)",
      "accent": "hsl(240 4.8% 95.9%)"
    }
  }
}'::jsonb
WHERE cores_tema IS NULL;

-- Atualizar a função de configurações padrão
CREATE OR REPLACE FUNCTION criar_configuracoes_padrao()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuracoes (
        user_id,
        tema,
        cor_primaria,
        notificacoes,
        cores_tema
    )
    VALUES (
        NEW.id,
        'escuro',
        '#7C3AED',
        '{
            "despesas_proximas": true,
            "despesas_atrasadas": true,
            "metas_atingidas": true,
            "dicas_economia": true
        }'::jsonb,
        '{
          "escuro": {
            "cor_primaria": "#7C3AED",
            "cores_secundarias": {
              "background": "hsl(240 10% 3.9%)",
              "foreground": "hsl(0 0% 98%)",
              "card": "hsl(240 10% 3.9%)",
              "popover": "hsl(240 10% 3.9%)",
              "primary": "hsl(263.4 70% 50.4%)",
              "secondary": "hsl(240 3.7% 15.9%)",
              "muted": "hsl(240 3.7% 15.9%)",
              "accent": "hsl(240 3.7% 15.9%)"
            }
          },
          "claro": {
            "cor_primaria": "#6D28D9",
            "cores_secundarias": {
              "background": "hsl(0 0% 100%)",
              "foreground": "hsl(240 10% 3.9%)",
              "card": "hsl(0 0% 100%)",
              "popover": "hsl(0 0% 100%)",
              "primary": "hsl(262.1 83.3% 57.8%)",
              "secondary": "hsl(240 4.8% 95.9%)",
              "muted": "hsl(240 4.8% 95.9%)",
              "accent": "hsl(240 4.8% 95.9%)"
            }
          }
        }'::jsonb
    )
    ON CONFLICT (user_id) 
    DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reabilitar triggers
SET session_replication_role = 'origin'; 