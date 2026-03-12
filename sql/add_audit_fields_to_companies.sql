-- Adicionar campos de auditoria à tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by_name TEXT,
ADD COLUMN IF NOT EXISTS created_by_email TEXT,
ADD COLUMN IF NOT EXISTS received_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS received_by_name TEXT,
ADD COLUMN IF NOT EXISTS received_by_email TEXT,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS marked_paid_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS marked_paid_by_name TEXT,
ADD COLUMN IF NOT EXISTS marked_paid_by_email TEXT,
ADD COLUMN IF NOT EXISTS marked_paid_at TIMESTAMPTZ;

-- Comentários
COMMENT ON COLUMN companies.created_by IS 'ID do usuário que criou a venda';
COMMENT ON COLUMN companies.created_by_name IS 'Nome do usuário que criou a venda';
COMMENT ON COLUMN companies.created_by_email IS 'Email do usuário que criou a venda';
COMMENT ON COLUMN companies.received_by IS 'ID do usuário que recebeu o pagamento';
COMMENT ON COLUMN companies.received_by_name IS 'Nome do usuário que recebeu o pagamento';
COMMENT ON COLUMN companies.received_by_email IS 'Email do usuário que recebeu o pagamento';
COMMENT ON COLUMN companies.received_at IS 'Data/hora em que o pagamento foi recebido';
COMMENT ON COLUMN companies.marked_paid_by IS 'ID do usuário que marcou como pago (se diferente de quem recebeu)';
COMMENT ON COLUMN companies.marked_paid_by_name IS 'Nome do usuário que marcou como pago';
COMMENT ON COLUMN companies.marked_paid_by_email IS 'Email do usuário que marcou como pago';
COMMENT ON COLUMN companies.marked_paid_at IS 'Data/hora em que foi marcado como pago';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_received_by ON companies(received_by);
CREATE INDEX IF NOT EXISTS idx_companies_payment_status ON companies(payment_status);
