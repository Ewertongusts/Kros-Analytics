-- Adiciona a coluna is_default na tabela de modelos de mensagem
-- Execute este script no Supabase SQL Editor

ALTER TABLE message_templates
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Opcional: criar um índice para busca rápida do template padrão
CREATE INDEX IF NOT EXISTS idx_message_templates_is_default 
ON message_templates (is_default) 
WHERE is_default = true;
