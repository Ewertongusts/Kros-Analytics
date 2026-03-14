-- ============================================
-- MIGRAÇÃO: Criar Pagamentos a partir de Assinaturas
-- ============================================
-- Este script cria registros na tabela 'payments' baseados nas assinaturas ativas
-- Necessário porque o sistema ainda usa 'payments' para exibir dados no UI

-- PASSO 1: Criar pagamentos para assinaturas ativas
INSERT INTO payments (
  company_id,
  plan_name,
  amount,
  due_date,
  status,
  auto_billing_enabled,
  cron_message,
  notes,
  created_at,
  updated_at
)
SELECT 
  s.customer_id as company_id,
  p.name as plan_name,
  s.amount,
  -- Calcular próxima data de vencimento baseada no due_day
  CASE 
    WHEN s.due_day >= EXTRACT(DAY FROM CURRENT_DATE) THEN
      DATE_TRUNC('month', CURRENT_DATE) + (s.due_day - 1 || ' days')::INTERVAL
    ELSE
      DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (s.due_day - 1 || ' days')::INTERVAL
  END as due_date,
  'pending' as status,
  COALESCE(s.auto_billing_enabled, false) as auto_billing_enabled,
  s.auto_billing_message as cron_message,
  s.notes,
  s.created_at,
  NOW() as updated_at
FROM subscriptions s
INNER JOIN plans p ON s.plan_id = p.id
WHERE s.status IN ('active', 'trial')
  -- Não criar se já existe um pagamento para esta empresa neste mês
  AND NOT EXISTS (
    SELECT 1 FROM payments pay
    WHERE pay.company_id = s.customer_id
      AND EXTRACT(MONTH FROM pay.due_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM pay.due_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  );

-- PASSO 2: Verificar quantos pagamentos foram criados
SELECT 
  COUNT(*) as total_payments_created,
  COUNT(DISTINCT company_id) as unique_companies
FROM payments
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- PASSO 3: Listar os pagamentos criados
SELECT 
  p.id,
  c.name as company_name,
  p.plan_name,
  p.amount,
  p.due_date,
  p.status
FROM payments p
INNER JOIN companies c ON p.company_id = c.id
WHERE p.created_at >= NOW() - INTERVAL '1 minute'
ORDER BY p.due_date;
