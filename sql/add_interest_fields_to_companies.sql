-- Adicionar campos de juros à tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_type TEXT;

-- Comentários
COMMENT ON COLUMN companies.interest_rate IS 'Taxa de juros (percentual ou valor fixo)';
COMMENT ON COLUMN companies.interest_type IS 'Tipo de juros: percentage (percentual) ou fixed (valor fixo)';

-- Atualizar registros existentes
UPDATE companies 
SET interest_rate = 0
WHERE interest_rate IS NULL;
