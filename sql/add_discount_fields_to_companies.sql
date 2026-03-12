-- Adicionar campos de desconto à tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type TEXT,
ADD COLUMN IF NOT EXISTS final_value DECIMAL(10,2);

-- Comentários
COMMENT ON COLUMN companies.discount_value IS 'Valor do desconto (percentual ou valor fixo)';
COMMENT ON COLUMN companies.discount_type IS 'Tipo de desconto: percentage (percentual) ou fixed (valor fixo)';
COMMENT ON COLUMN companies.final_value IS 'Valor final após desconto';

-- Atualizar registros existentes
UPDATE companies 
SET discount_value = 0, final_value = monthly_price
WHERE discount_value IS NULL OR final_value IS NULL;
