-- ============================================
-- ATUALIZAÇÃO SEGURA DA TABELA SUBSCRIPTIONS
-- ============================================

-- PASSO 1: Criar planos que faltam baseado em plan_name
INSERT INTO plans (name, price, billing_cycle, created_at)
SELECT DISTINCT 
  s.plan_name as name,
  COALESCE(s.monthly_price, s.instalment_value, 0) as price,
  COALESCE(s.billing_cycle, 'Mensal') as billing_cycle,
  MIN(s.created_at) as created_at
FROM subscriptions s
WHERE s.plan_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM plans p WHERE p.name = s.plan_name)
GROUP BY s.plan_name, s.monthly_price, s.instalment_value, s.billing_cycle
ON CONFLICT DO NOTHING;

-- PASSO 2: Adicionar coluna plan_id (pode ser NULL temporariamente)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID;

-- PASSO 3: Preencher plan_id baseado em plan_name
UPDATE subscriptions s
SET plan_id = p.id
FROM plans p
WHERE s.plan_name = p.name
  AND s.plan_id IS NULL;

-- PASSO 4: Adicionar foreign key DEPOIS de preencher os dados
DO $$
BEGIN
  ALTER TABLE subscriptions 
    ADD CONSTRAINT fk_subscriptions_plan_id 
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- PASSO 5: Adicionar colunas que faltam
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_billing_enabled BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS auto_billing_message TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_by UUID;

-- PASSO 6: Migrar dados
UPDATE subscriptions 
SET 
  amount = COALESCE(amount, monthly_price, instalment_value, 0),
  status = CASE 
    WHEN status IS NOT NULL THEN status
    WHEN is_active = true THEN 'active'
    WHEN is_active = false THEN 'suspended'
    ELSE 'active'
  END,
  due_day = COALESCE(due_day, billing_day, 10)
WHERE amount IS NULL OR status IS NULL OR due_day IS NULL;

-- PASSO 7: Adicionar constraints
DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'pending', 'trial', 'suspended', 'cancelled'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_due_day_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_due_day_check 
    CHECK (due_day >= 1 AND due_day <= 31);
EXCEPTION WHEN OTHERS THEN NULL;
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
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID;
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
  total_plans INTEGER;
  total_subscriptions INTEGER;
  total_with_plan_id INTEGER;
  total_active INTEGER;
  total_payments_linked INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_plans FROM plans;
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  SELECT COUNT(*) INTO total_with_plan_id FROM subscriptions WHERE plan_id IS NOT NULL;
  SELECT COUNT(*) INTO total_active FROM subscriptions WHERE status = 'active';
  SELECT COUNT(*) INTO total_payments_linked FROM payments WHERE subscription_id IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   ATUALIZAÇÃO COMPLETA - SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de planos: %', total_plans;
  RAISE NOTICE 'Total de assinaturas: %', total_subscriptions;
  RAISE NOTICE 'Assinaturas com plan_id: %', total_with_plan_id;
  RAISE NOTICE 'Assinaturas ativas: %', total_active;
  RAISE NOTICE 'Pagamentos vinculados: %', total_payments_linked;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
