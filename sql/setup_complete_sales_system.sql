-- ============================================
-- SETUP COMPLETO DO SISTEMA DE VENDAS
-- Execute este script para configurar tudo
-- ============================================

-- 1. Adicionar campos de pagamento
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS installments_payment_type TEXT,
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS down_payment DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_installments JSONB;

-- 2. Adicionar campos de juros
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interest_type TEXT;

-- 3. Adicionar campos de desconto
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type TEXT,
ADD COLUMN IF NOT EXISTS final_value DECIMAL(10,2);

-- 4. Adicionar status de pagamento
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- 5. Adicionar campos de auditoria
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

-- 6. Adicionar campo sale_type se não existir
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS sale_type TEXT;

-- 7. Adicionar campos de personalização de vendas
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS custom_name TEXT,
ADD COLUMN IF NOT EXISTS custom_category TEXT,
ADD COLUMN IF NOT EXISTS custom_description TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_received_by ON companies(received_by);
CREATE INDEX IF NOT EXISTS idx_companies_payment_status ON companies(payment_status);
CREATE INDEX IF NOT EXISTS idx_companies_sale_type ON companies(sale_type);
CREATE INDEX IF NOT EXISTS idx_companies_custom_category ON companies(custom_category);

-- Atualizar registros existentes com valores padrão
UPDATE companies 
SET 
  installments = COALESCE(installments, 1),
  down_payment = COALESCE(down_payment, 0),
  interest_rate = COALESCE(interest_rate, 0),
  discount_value = COALESCE(discount_value, 0),
  final_value = COALESCE(final_value, monthly_price),
  payment_status = COALESCE(payment_status, 'paid')
WHERE installments IS NULL 
   OR down_payment IS NULL 
   OR interest_rate IS NULL 
   OR discount_value IS NULL 
   OR final_value IS NULL
   OR payment_status IS NULL;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Sistema de vendas configurado com sucesso!';
END $$;
