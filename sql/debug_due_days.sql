-- Debug: Verificar due_day das assinaturas

-- 1. Ver due_day de todas as assinaturas
SELECT 
  'Due days das assinaturas:' as info;

SELECT 
  id,
  customer_id,
  due_day,
  start_date,
  status,
  amount
FROM subscriptions 
ORDER BY due_day
LIMIT 20;

-- 2. Contar quantas têm due_day NULL
SELECT 
  'Assinaturas sem due_day:' as info,
  COUNT(*) as quantidade
FROM subscriptions 
WHERE due_day IS NULL;

-- 3. Distribuição de due_days
SELECT 
  'Distribuição de due_days:' as info;

SELECT 
  due_day,
  COUNT(*) as quantidade
FROM subscriptions 
WHERE due_day IS NOT NULL
GROUP BY due_day
ORDER BY due_day;

-- 4. Ver que dia é hoje
SELECT 
  'Hoje é:' as info,
  CURRENT_DATE as data_atual,
  EXTRACT(DAY FROM CURRENT_DATE) as dia_atual,
  EXTRACT(DOW FROM CURRENT_DATE) as dia_da_semana; -- 0=domingo, 1=segunda, etc

-- 5. Calcular início e fim da semana atual
WITH semana_atual AS (
  SELECT 
    CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer as inicio_semana,
    CURRENT_DATE + (6 - EXTRACT(DOW FROM CURRENT_DATE)::integer) as fim_semana
)
SELECT 
  'Semana atual:' as info,
  inicio_semana,
  fim_semana
FROM semana_atual;

-- 6. Simular o filtro "SEMANA" - assinaturas que vencem nesta semana
WITH semana_atual AS (
  SELECT 
    CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer as inicio_semana,
    CURRENT_DATE + (6 - EXTRACT(DOW FROM CURRENT_DATE)::integer) as fim_semana
),
proximos_vencimentos AS (
  SELECT 
    s.id,
    s.due_day,
    s.status,
    c.name as customer_name,
    s.amount,
    -- Calcular próximo vencimento baseado no due_day
    CASE 
      WHEN s.due_day <= EXTRACT(DAY FROM CURRENT_DATE) THEN
        -- Se due_day já passou este mês, usar próximo mês
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (s.due_day - 1) * INTERVAL '1 day'
      ELSE
        -- Se due_day ainda não chegou este mês, usar este mês
        DATE_TRUNC('month', CURRENT_DATE) + (s.due_day - 1) * INTERVAL '1 day'
    END as proximo_vencimento
  FROM subscriptions s
  JOIN companies c ON s.customer_id = c.id
  WHERE s.due_day IS NOT NULL
    AND s.status = 'active'
)
SELECT 
  'Assinaturas que vencem nesta semana:' as info;

SELECT 
  pv.id,
  pv.customer_name,
  pv.due_day,
  pv.proximo_vencimento,
  pv.amount,
  sa.inicio_semana,
  sa.fim_semana,
  CASE 
    WHEN pv.proximo_vencimento >= sa.inicio_semana 
     AND pv.proximo_vencimento <= sa.fim_semana 
    THEN 'SIM' 
    ELSE 'NÃO' 
  END as vence_nesta_semana
FROM proximos_vencimentos pv
CROSS JOIN semana_atual sa
WHERE pv.proximo_vencimento >= sa.inicio_semana 
  AND pv.proximo_vencimento <= sa.fim_semana
ORDER BY pv.proximo_vencimento;

-- 7. Contar total de assinaturas que vencem nesta semana
WITH semana_atual AS (
  SELECT 
    CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer as inicio_semana,
    CURRENT_DATE + (6 - EXTRACT(DOW FROM CURRENT_DATE)::integer) as fim_semana
),
proximos_vencimentos AS (
  SELECT 
    s.id,
    s.due_day,
    CASE 
      WHEN s.due_day <= EXTRACT(DAY FROM CURRENT_DATE) THEN
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (s.due_day - 1) * INTERVAL '1 day'
      ELSE
        DATE_TRUNC('month', CURRENT_DATE) + (s.due_day - 1) * INTERVAL '1 day'
    END as proximo_vencimento
  FROM subscriptions s
  WHERE s.due_day IS NOT NULL
    AND s.status = 'active'
)
SELECT 
  'Total que vence nesta semana:' as info,
  COUNT(*) as quantidade
FROM proximos_vencimentos pv
CROSS JOIN semana_atual sa
WHERE pv.proximo_vencimento >= sa.inicio_semana 
  AND pv.proximo_vencimento <= sa.fim_semana;