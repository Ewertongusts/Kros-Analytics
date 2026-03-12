-- Adicionar campos que faltam na tabela companies

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS custom_name TEXT,
ADD COLUMN IF NOT EXISTS custom_category TEXT,
ADD COLUMN IF NOT EXISTS custom_description TEXT;

-- Comentários
COMMENT ON COLUMN companies.custom_name IS 'Nome personalizado do item (quando diferente do catálogo)';
COMMENT ON COLUMN companies.custom_category IS 'Categoria personalizada';
COMMENT ON COLUMN companies.custom_description IS 'Descrição personalizada do item';

-- Forçar refresh do schema cache
NOTIFY pgrst, 'reload schema';
