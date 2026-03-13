-- ============================================
-- SCRIPT COMPLETO: Corrigir e Migrar
-- ============================================

-- PASSO 1: Verificar estrutura atual da tabela plans
DO $$
DECLARE
  has_uuid_id BOOLEAN;
BEGIN
  -- Verificar se plans tem coluna id do tipo UUID
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) INTO has_uuid_id;
  
  IF NOT has_uuid_id THEN
    RAISE NOTICE 'Tabela plans precisa ser recriada com estrutura correta';
    
    -- Criar tabela temporária com estrutura correta
    CREATE TABLE IF NOT EXISTS plans_new (
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
    
    -- Copiar dados da tabela antiga se existir
    INSERT INTO plans_new (name, type, category, description, price, billing_cycle, created_at)
    SELECT 
      name,
      COALESCE(type, 'Plano Recorrente'),
      category,
      description,
      price,
      COALESCE(billing_cycle, 'Mensal'),
      COALESCE(created_at, NOW())
    FROM plans
    WHERE name IS NOT NULL AND price IS NOT NULL
    ON CONFLICT (id) DO NOTHING;
    
    -- Dropar tabela antiga
    DROP TABLE IF EXISTS plans CASCADE;
    
    -- Renomear nova tabela
    ALTER TABLE plans_new RENAME TO plans;
    
    -- Criar índice
    CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);
    
    RAISE NOTICE 'Tabela plans recriada com sucesso!';
  ELSE
    RAISE NOTICE 'Tabela plans já está correta';
  END IF;
END $$;

-- ============================================
-- PASSO 2: Atualizar tabela companies
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_companies_birthday ON companies(birthday);
CREATE INDEX IF NOT EXISTS idx_companies_segment ON companies(segment);
CREATE INDEX IF NOT EXISTS idx_companies_document ON companies(document);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);

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

-- ============================================
-- PASSO 4: RLS Policies
-- ============================================

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

-- ============================================
-- PASSO 5: Migrar dados
-- ============================================

-- Criar planos baseados em payments
INSERT INTO plans (name, price, billing_cycle, created_at)
SELECT DISTINCT 
  p.plan_name as name,
  AVG(p.amount) as price,
  'Mensal' as billing_cycle,
  MIN(p.created_at) as created_at
FROM payments p
WHERE p.plan_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM plans pl WHERE pl.name = p.plan_name)
GROUP BY p.plan_name
ON CONFLICT DO NOTHING;

-- Criar assinaturas
INSERT INTO subscriptions (
  customer_id, plan_id, status, start_date, due_day, amount,
  auto_billing_enabled, auto_billing_message, notes, created_at, created_by
)
SELECT DISTINCT ON (p.company_id, pl.id)
  p.company_id,
  pl.id,
  CASE WHEN p.status = 'Pago' THEN 'active' ELSE 'pending' END,
  COALESCE(p.due_date, CURRENT_DATE),
  EXTRACT(DAY FROM COALESCE(p.due_date, CURRENT_DATE))::INTEGER,
  p.amount,
  COALESCE(p.auto_billing_enabled, false),
  p.auto_billing_message,
  p.notes,
  p.created_at,
  p.created_by
FROM payments p
INNER JOIN plans pl ON pl.name = p.plan_name
WHERE p.company_id IS NOT NULL AND p.plan_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.customer_id = p.company_id AND s.plan_id = pl.id)
ORDER BY p.company_id, pl.id, p.created_at DESC
ON CONFLICT DO NOTHING;

-- Adicionar subscription_id aos payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);

-- Vincular payments às subscriptions
UPDATE payments p
SET subscription_id = s.id
FROM subscriptions s
INNER JOIN plans pl ON pl.id = s.plan_id
WHERE p.company_id = s.customer_id
  AND p.plan_name = pl.name
  AND p.subscription_id IS NULL;

-- ============================================
-- RELATÓRIO
-- ============================================

DO $$
DECLARE
  total_customers INTEGER;
  total_plans INTEGER;
  total_subscriptions INTEGER;
  total_payments_linked INTEGER;
  total_active_subscriptions INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_customers FROM companies;
  SELECT COUNT(*) INTO total_plans FROM plans;
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  SELECT COUNT(*) INTO total_payments_linked FROM payments WHERE subscription_id IS NOT NULL;
  SELECT COUNT(*) INTO total_active_subscriptions FROM subscriptions WHERE status = 'active';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   MIGRAÇÃO COMPLETA - SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Clientes: %', total_customers;
  RAISE NOTICE 'Planos: %', total_plans;
  RAISE NOTICE 'Assinaturas criadas: %', total_subscriptions;
  RAISE NOTICE 'Assinaturas ativas: %', total_active_subscriptions;
  RAISE NOTICE 'Pagamentos vinculados: %', total_payments_linked;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
