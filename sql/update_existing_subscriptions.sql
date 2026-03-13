-- ============================================
-- ATUALIZAR TABELA SUBSCRIPTIONS EXISTENTE
-- ============================================
-- Este script atualiza a estrutura da tabela subscriptions
-- que já existe mas tem estrutura antiga

-- PASSO 1: Adicionar coluna plan_id
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT;

-- PASSO 2: Preencher plan_id baseado em plan_name
UPDATE subscriptions s
SET plan_id = p.id
FROM plans p
WHERE s.plan_name = p.name
  AND s.plan_id IS NULL;

-- PASSO 3: Adicionar colunas que faltam
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_billing_enabled BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_billing_message TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS end_date DATE;

-- PASSO 4: Migrar dados das colunas antigas para as novas
UPDATE subscriptions 
SET 
  amount = COALESCE(monthly_price, instalment_value, 0),
  status = CASE 
    WHEN is_active = true THEN 'active'
    WHEN is_active = false THEN 'suspended'
    ELSE 'active'
  END
WHERE amount IS NULL OR status IS NULL;

-- PASSO 5: Renomear/ajustar colunas
-- Manter due_day (já existe)
-- Manter customer_id (já existe)
-- Manter notes (já existe)
-- Manter created_at (já existe)
-- Manter created_by (já existe)

-- PASSO 6: Adicionar constraint de status
DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'pending', 'trial', 'suspended', 'cancelled'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- PASSO 7: Adicionar constraint de due_day
DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_due_day_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_due_day_check 
    CHECK (due_day >= 1 AND due_day <= 31);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- PASSO 8: Criar índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- PASSO 9: Trigger para updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- PASSO 10: RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can view subscriptions"
  ON subscriptions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can create subscriptions"
  ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can update subscriptions"
  ON subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can delete subscriptions"
  ON subscriptions FOR DELETE TO authenticated USING (true);

-- PASSO 11: Atualizar companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sales_rep TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_zipcode TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_companies_document ON companies(document);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);

-- PASSO 12: Adicionar subscription_id aos payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);

-- Vincular payments às subscriptions
UPDATE payments p
SET subscription_id = s.id
FROM subscriptions s
WHERE p.company_id = s.customer_id
  AND p.plan_name = s.plan_name
  AND p.subscription_id IS NULL;

-- RELATÓRIO
DO $$
DECLARE
  total_subscriptions INTEGER;
  total_with_plan_id INTEGER;
  total_active INTEGER;
  total_payments_linked INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  SELECT COUNT(*) INTO total_with_plan_id FROM subscriptions WHERE plan_id IS NOT NULL;
  SELECT COUNT(*) INTO total_active FROM subscriptions WHERE status = 'active';
  SELECT COUNT(*) INTO total_payments_linked FROM payments WHERE subscription_id IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   ATUALIZAÇÃO COMPLETA - SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de assinaturas: %', total_subscriptions;
  RAISE NOTICE 'Assinaturas com plan_id: %', total_with_plan_id;
  RAISE NOTICE 'Assinaturas ativas: %', total_active;
  RAISE NOTICE 'Pagamentos vinculados: %', total_payments_linked;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
