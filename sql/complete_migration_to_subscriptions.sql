-- ============================================
-- MIGRAÇÃO COMPLETA PARA SISTEMA DE ASSINATURAS
-- ============================================
-- Este script executa todas as mudanças necessárias para
-- separar clientes (customers) de assinaturas (subscriptions)

-- ============================================
-- PASSO 1: Atualizar tabela companies para customers
-- ============================================

-- Adicionar campos de cliente
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_companies_birthday ON companies(birthday);
CREATE INDEX IF NOT EXISTS idx_companies_segment ON companies(segment);
CREATE INDEX IF NOT EXISTS idx_companies_document ON companies(document);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);

COMMENT ON TABLE companies IS 'Clientes do sistema (customers)';

-- ============================================
-- PASSO 2: Verificar se tabela plans existe
-- ============================================

-- Criar tabela plans se não existir
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Plano Recorrente',
  category TEXT,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PASSO 3: Criar tabela subscriptions
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'trial', 'suspended', 'cancelled')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day >= 1 AND due_day <= 31),
  
  amount DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  
  auto_billing_enabled BOOLEAN DEFAULT false,
  auto_billing_message TEXT,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due_day ON subscriptions(due_day);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- Trigger para updated_at
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

COMMENT ON TABLE subscriptions IS 'Assinaturas de clientes com planos recorrentes';

-- ============================================
-- PASSO 4: RLS Policies para subscriptions
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can view subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can update subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete subscriptions" ON subscriptions;
CREATE POLICY "Authenticated users can delete subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASSO 5: Migrar dados de payments para subscriptions
-- ============================================

-- Primeiro, criar planos baseados nos plan_name únicos em payments
INSERT INTO plans (name, price, billing_cycle, created_at)
SELECT DISTINCT 
  p.plan_name as name,
  AVG(p.amount) as price,
  'Mensal' as billing_cycle,
  MIN(p.created_at) as created_at
FROM payments p
WHERE p.plan_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM plans pl WHERE pl.name = p.plan_name
  )
GROUP BY p.plan_name
ON CONFLICT DO NOTHING;

-- Criar assinaturas únicas baseadas em pagamentos existentes
INSERT INTO subscriptions (
  customer_id,
  plan_id,
  status,
  start_date,
  due_day,
  amount,
  auto_billing_enabled,
  auto_billing_message,
  notes,
  created_at,
  created_by
)
SELECT DISTINCT ON (p.company_id, pl.id)
  p.company_id as customer_id,
  pl.id as plan_id,
  CASE 
    WHEN p.status = 'Pago' THEN 'active'
    WHEN p.status = 'Pendente' THEN 'pending'
    ELSE 'active'
  END as status,
  COALESCE(p.due_date, CURRENT_DATE) as start_date,
  EXTRACT(DAY FROM COALESCE(p.due_date, CURRENT_DATE))::INTEGER as due_day,
  p.amount,
  COALESCE(p.auto_billing_enabled, false) as auto_billing_enabled,
  p.auto_billing_message,
  p.notes,
  p.created_at,
  p.created_by
FROM payments p
INNER JOIN plans pl ON pl.name = p.plan_name
WHERE p.company_id IS NOT NULL
  AND p.plan_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.customer_id = p.company_id 
    AND s.plan_id = pl.id
  )
ORDER BY p.company_id, pl.id, p.created_at DESC
ON CONFLICT DO NOTHING;

-- ============================================
-- PASSO 6: Adicionar subscription_id aos payments
-- ============================================

ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
COMMENT ON COLUMN payments.subscription_id IS 'Referência à assinatura que gerou este pagamento';

-- Vincular pagamentos às assinaturas
UPDATE payments p
SET subscription_id = s.id
FROM subscriptions s
INNER JOIN plans pl ON pl.id = s.plan_id
WHERE p.company_id = s.customer_id
  AND p.plan_name = pl.name
  AND p.subscription_id IS NULL;

-- ============================================
-- PASSO 7: Relatório de migração
-- ============================================

DO $$
DECLARE
  total_customers INTEGER;
  total_subscriptions INTEGER;
  total_payments_linked INTEGER;
  total_payments_unlinked INTEGER;
  total_active_subscriptions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_customers FROM companies;
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  SELECT COUNT(*) INTO total_payments_linked FROM payments WHERE subscription_id IS NOT NULL;
  SELECT COUNT(*) INTO total_payments_unlinked FROM payments WHERE subscription_id IS NULL AND plan_name IS NOT NULL;
  SELECT COUNT(*) INTO total_active_subscriptions FROM subscriptions WHERE status = 'active';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   RELATÓRIO DE MIGRAÇÃO COMPLETO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de clientes: %', total_customers;
  RAISE NOTICE 'Total de assinaturas criadas: %', total_subscriptions;
  RAISE NOTICE 'Assinaturas ativas: %', total_active_subscriptions;
  RAISE NOTICE 'Pagamentos vinculados: %', total_payments_linked;
  RAISE NOTICE 'Pagamentos não vinculados: %', total_payments_unlinked;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
