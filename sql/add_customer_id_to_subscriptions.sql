-- Adicionar campo customer_id à tabela subscriptions
-- Este campo faz referência ao cliente (companies) da assinatura

-- Adicionar campos necessários
DO $$ 
BEGIN
  -- Adicionar customer_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN customer_id UUID REFERENCES companies(id) ON DELETE CASCADE;
    CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
    COMMENT ON COLUMN subscriptions.customer_id IS 'Referência ao cliente (companies) desta assinatura';
  END IF;
  
  -- Adicionar due_day se não existir (dia de vencimento)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'due_day'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN due_day INTEGER DEFAULT 10;
    COMMENT ON COLUMN subscriptions.due_day IS 'Dia de vencimento da assinatura (1-31)';
  END IF;
  
  -- Adicionar start_date se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
    COMMENT ON COLUMN subscriptions.start_date IS 'Data de início da assinatura';
  END IF;
  
  -- Adicionar notes se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN notes TEXT;
    COMMENT ON COLUMN subscriptions.notes IS 'Observações sobre a assinatura';
  END IF;
  
  -- Adicionar created_by se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN created_by UUID REFERENCES auth.users(id);
    COMMENT ON COLUMN subscriptions.created_by IS 'Usuário que criou a assinatura';
  END IF;
  
  -- Adicionar created_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    COMMENT ON COLUMN subscriptions.created_at IS 'Data de criação da assinatura';
  END IF;
END $$;

-- Atualizar registros existentes (se houver) para preencher customer_id baseado em company_id
UPDATE subscriptions 
SET customer_id = company_id 
WHERE customer_id IS NULL AND company_id IS NOT NULL;
