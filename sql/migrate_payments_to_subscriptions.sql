-- Migrar dados de payments para subscriptions
-- Este script cria assinaturas baseadas nos pagamentos recorrentes existentes

-- Inserir assinaturas únicas baseadas em pagamentos ativos
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
ORDER BY p.company_id, pl.id, p.created_at DESC;

-- Atualizar payments existentes para referenciar subscriptions
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
COMMENT ON COLUMN payments.subscription_id IS 'Referência à assinatura que gerou este pagamento';

-- Vincular pagamentos às assinaturas criadas
UPDATE payments p
SET subscription_id = s.id
FROM subscriptions s
INNER JOIN plans pl ON pl.id = s.plan_id
WHERE p.company_id = s.customer_id
  AND p.plan_name = pl.name
  AND p.subscription_id IS NULL;

-- Relatório de migração
DO $$
DECLARE
  total_subscriptions INTEGER;
  total_payments_linked INTEGER;
  total_payments_unlinked INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  SELECT COUNT(*) INTO total_payments_linked FROM payments WHERE subscription_id IS NOT NULL;
  SELECT COUNT(*) INTO total_payments_unlinked FROM payments WHERE subscription_id IS NULL AND plan_name IS NOT NULL;
  
  RAISE NOTICE '=== RELATÓRIO DE MIGRAÇÃO ===';
  RAISE NOTICE 'Total de assinaturas criadas: %', total_subscriptions;
  RAISE NOTICE 'Total de pagamentos vinculados: %', total_payments_linked;
  RAISE NOTICE 'Total de pagamentos não vinculados: %', total_payments_unlinked;
  RAISE NOTICE '============================';
END $$;
