-- Teste simples do filtro SEMANA
-- Hoje é 13/03/2026 (sexta-feira)

-- 1. Ver data atual
SELECT 
  CURRENT_DATE as hoje,
  EXTRACT(DAY FROM CURRENT_DATE) as dia_hoje,
  EXTRACT(DOW FROM CURRENT_DATE) as dia_semana; -- 0=domingo, 5=sexta

-- 2. Ver todas as assinaturas ativas com due_day
SELECT 
  id,
  due_day,
  status,
  amount
FROM subscriptions 
WHERE status = 'active' 
  AND due_day IS NOT NULL
ORDER BY due_day
LIMIT 10;

-- 3. Contar assinaturas por due_day
SELECT 
  due_day,
  COUNT(*) as quantidade
FROM subscriptions 
WHERE status = 'active' 
  AND due_day IS NOT NULL
GROUP BY due_day
ORDER BY due_day;

-- 4. Simular filtro SEMANA (13/03/2026 é sexta)
-- Semana atual: domingo 08/03 a sábado 14/03
WITH semana_atual AS (
  SELECT 
    DATE '2026-03-08' as inicio_semana,  -- domingo
    DATE '2026-03-14' as fim_semana      -- sábado
)
SELECT 
  s.id,
  s.due_day,
  s.amount,
  c.name as customer_name,
  -- Calcular próximo vencimento
  CASE 
    WHEN s.due_day <= 13 THEN  -- Se due_day já passou (hoje é 13)
      DATE '2026-04-01' + (s.due_day - 1) * INTERVAL '1 day'  -- próximo mês
    ELSE
      DATE '2026-03-01' + (s.due_day - 1) * INTERVAL '1 day'  -- este mês
  END as proximo_vencimento,
  sa.inicio_semana,
  sa.fim_semana
FROM subscriptions s
JOIN companies c ON s.customer_id = c.id
CROSS JOIN semana_atual sa
WHERE s.status = 'active' 
  AND s.due_day IS NOT NULL
  AND (
    CASE 
      WHEN s.due_day <= 13 THEN
        DATE '2026-04-01' + (s.due_day - 1) * INTERVAL '1 day'
      ELSE
        DATE '2026-03-01' + (s.due_day - 1) * INTERVAL '1 day'
    END
  ) BETWEEN sa.inicio_semana AND sa.fim_semana
ORDER BY proximo_vencimento;