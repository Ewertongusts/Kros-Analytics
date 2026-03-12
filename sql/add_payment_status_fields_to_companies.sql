-- Adicionar campos de status de pagamento à tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Comentários
COMMENT ON COLUMN companies.payment_status IS 'Status do pagamento: paid (pago), pending (pendente), scheduled (agendado)';
COMMENT ON COLUMN companies.payment_date IS 'Data de pagamento agendado ou vencimento';

-- Atualizar registros existentes para "paid" por padrão
UPDATE companies 
SET payment_status = 'paid'
WHERE payment_status IS NULL;
