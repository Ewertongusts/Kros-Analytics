-- Script para debugar quantas assinaturas existem

-- 1. Contar total de assinaturas
SELECT 'Total de assinaturas:' as info, COUNT(*) as quantidade FROM subscriptions;

-- 2. Contar por status
SELECT 'Por status:' as info;
SELECT status, COUNT(*) as quantidade FROM subscriptions GROUP BY status;

-- 3. Verificar se há customer_id NULL
SELECT 'Assinaturas sem customer_id:' as info, COUNT(*) as quantidade 
FROM subscriptions WHERE customer_id IS NULL;

-- 4. Verificar se há plan_id NULL
SELECT 'Assinaturas sem plan_id:' as info, COUNT(*) as quantidade 
FROM subscriptions WHERE plan_id IS NULL;

-- 5. Testar a query completa (igual ao composable)
SELECT 'Query completa:' as info;
SELECT 
  s.*,
  c.name as customer_name,
  p.name as plan_name
FROM subscriptions s
LEFT JOIN companies c ON s.customer_id = c.id
LEFT JOIN plans p ON s.plan_id = p.id
ORDER BY s.created_at DESC
LIMIT 20;

-- 6. Verificar se RLS está ativo
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('subscriptions', 'companies', 'plans');