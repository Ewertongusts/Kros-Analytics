-- Adicionar campos type e category à tabela plans
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Plano Recorrente' CHECK (type IN ('Plano Recorrente', 'Serviço Único', 'Produto')),
ADD COLUMN IF NOT EXISTS category TEXT;

-- Atualizar planos existentes para ter o tipo padrão
UPDATE plans SET type = 'Plano Recorrente' WHERE type IS NULL;

-- Comentários
COMMENT ON COLUMN plans.type IS 'Tipo do item: Plano Recorrente, Serviço Único ou Produto';
COMMENT ON COLUMN plans.category IS 'Categoria/Tag do item: CRM, IA, Landing Page, etc';
