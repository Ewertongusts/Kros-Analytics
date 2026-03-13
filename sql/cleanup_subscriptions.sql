-- ============================================
-- LIMPEZA FINAL DA TABELA SUBSCRIPTIONS
-- ============================================
-- Remove colunas antigas que não são mais necessárias

-- Tornar todas as colunas antigas nullable para evitar erros
ALTER TABLE subscriptions ALTER COLUMN plan_name DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN monthly_price DROP NOT NULL;

-- Opcional: Remover colunas antigas (CUIDADO: isso apaga dados!)
-- Descomente apenas se tiver certeza que não precisa mais dessas colunas

-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS company_id;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS plan_name;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS monthly_price;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS is_active;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS billing_cycle;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS billing_day;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS instalment_count;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS instalment_value;

-- Garantir que amount e status não sejam NULL
UPDATE subscriptions 
SET 
  amount = COALESCE(amount, monthly_price, instalment_value, 0),
  status = COALESCE(status, CASE WHEN is_active THEN 'active' ELSE 'suspended' END, 'active')
WHERE amount IS NULL OR status IS NULL;

-- Tornar amount NOT NULL (agora que preenchemos)
ALTER TABLE subscriptions ALTER COLUMN amount SET NOT NULL;

-- Relatório
DO $$
DECLARE
  total_subscriptions INTEGER;
  total_with_plan_id INTEGER;
  total_with_amount INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  SELECT COUNT(*) INTO total_with_plan_id FROM subscriptions WHERE plan_id IS NOT NULL;
  SELECT COUNT(*) INTO total_with_amount FROM subscriptions WHERE amount IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   LIMPEZA COMPLETA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de assinaturas: %', total_subscriptions;
  RAISE NOTICE 'Com plan_id: %', total_with_plan_id;
  RAISE NOTICE 'Com amount: %', total_with_amount;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
