-- Consulta para verificar assinaturas que vencem na semana atual
-- Hoje: 13/03/2026 (sexta-feira)
-- Semana atual: 08/03/2026 (domingo) até 14/03/2026 (sábado)

-- 1. Ver data atual
SELECT 
  CURRENT_DATE as hoje,
  EXTRACT(DAY FROM CURRENT_DATE) as dia_hoje,
  EXTRACT(DOW FROM CURRENT_DATE) as dia_semana;

-- 2. Calcular início e fim da semana atual
WITH semana_atual AS (
  SELECT 
    CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer as inicio_semana,
    CURRENT_DATE + (6 - EXTRACT(DOW FROM CURRENT_DATE)::integer) as fim_semana
)
SELECT 
  'Semana atual:' as info,
  inicio_semana,
  fim_semana,
  EXTRACT(DAY FROM inicio_semana) as dia_inicio,
  EXTRACT(DAY FROM fim_semana) as dia_fim
FROM semana_atual;

-- 3. Assinaturas que deveriam aparecer no filtro SEMANA
-- (due_day entre 8 e 14, considerando que hoje é 13)
SELECT 
  s.id,
  c.name as customer_name,
  s.due_day,
  s.status,
  s.amount,
  CASE 
    WHEN s.due_day BETWEEN 8 AND 14 THEN 'DEVERIA APARECER'
    ELSE 'NÃO DEVERIA'
  END as deveria_aparecer
FROM subscriptions s
JOIN companies c ON s.customer_id = c.id
WHERE s.status = 'active' 
  AND s.due_day IS NOT NULL
  AND s.due_day BETWEEN 8 AND 14
ORDER BY s.due_day;

-- 4. Contar quantas deveriam aparecer
SELECT 
  'Total que deveria aparecer:' as info,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.status = 'active' 
  AND s.due_day IS NOT NULL
  AND s.due_day BETWEEN 8 AND 14;