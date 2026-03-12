-- Adicionar campos de pagamento à tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS installments_payment_type TEXT,
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS down_payment DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_installments JSONB;

-- Comentários
COMMENT ON COLUMN companies.payment_type IS 'Tipo de pagamento da entrada ou pagamento único';
COMMENT ON COLUMN companies.installments_payment_type IS 'Tipo de pagamento das parcelas (quando diferente da entrada)';
COMMENT ON COLUMN companies.installments IS 'Número de parcelas (1 = à vista)';
COMMENT ON COLUMN companies.down_payment IS 'Valor da entrada/sinal';
COMMENT ON COLUMN companies.custom_installments IS 'Array com valores personalizados de cada parcela';

-- Atualizar registros existentes
UPDATE companies 
SET installments = 1, down_payment = 0
WHERE installments IS NULL OR down_payment IS NULL;
