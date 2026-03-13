-- Adicionar empresas com diferentes tipos de atraso
-- Data atual: 13/03/2026

-- 1. Empresas ATRASADAS HOJE (venceram hoje mas não pagaram)
INSERT INTO companies (id, name, email, whatsapp, phone, document, tags, created_at) VALUES
(gen_random_uuid(), 'Atrasado Hoje 1', 'atrasadohoje1@empresa.com.br', '5511111111111', '(11) 11111-1111', '11.111.111/0001-11', '["Atrasado-Hoje"]', '2026-01-01'),
(gen_random_uuid(), 'Atrasado Hoje 2', 'atrasadohoje2@empresa.com.br', '5511222222222', '(11) 22222-2222', '22.222.222/0001-22', '["Atrasado-Hoje"]', '2026-01-02'),
(gen_random_uuid(), 'Atrasado Hoje 3', 'atrasadohoje3@empresa.com.br', '5511333333333', '(11) 33333-3333', '33.333.333/0001-33', '["Atrasado-Hoje"]', '2026-01-03'),

-- 2. Empresas CRÍTICAS (>7 dias de atraso) - venceram entre 1-6 de março
(gen_random_uuid(), 'Crítico 8 dias', 'critico8@empresa.com.br', '5511444444444', '(11) 44444-4444', '44.444.444/0001-44', '["Crítico", "8-dias"]', '2026-01-04'),
(gen_random_uuid(), 'Crítico 10 dias', 'critico10@empresa.com.br', '5511555555555', '(11) 55555-5555', '55.555.555/0001-55', '["Crítico", "10-dias"]', '2026-01-05'),
(gen_random_uuid(), 'Crítico 12 dias', 'critico12@empresa.com.br', '5511666666666', '(11) 66666-6666', '66.666.666/0001-66', '["Crítico", "12-dias"]', '2026-01-06'),

-- 3. Empresas MUITO CRÍTICAS (>15 dias de atraso) - venceram em fevereiro
(gen_random_uuid(), 'Muito Crítico 20 dias', 'muitocritico20@empresa.com.br', '5511777777777', '(11) 77777-7777', '77.777.777/0001-77', '["Muito-Crítico", "20-dias"]', '2026-01-07'),
(gen_random_uuid(), 'Muito Crítico 25 dias', 'muitocritico25@empresa.com.br', '5511888888888', '(11) 88888-8888', '88.888.888/0001-88', '["Muito-Crítico", "25-dias"]', '2026-01-08'),
(gen_random_uuid(), 'Muito Crítico 30 dias', 'muitocritico30@empresa.com.br', '5511999999999', '(11) 99999-9999', '99.999.999/0001-99', '["Muito-Crítico", "30-dias"]', '2026-01-09');

-- 4. Criar assinaturas com datas específicas para simular atrasos
WITH plano_ids AS (
  SELECT id FROM plans LIMIT 1
),
novas_empresas AS (
  SELECT 
    id, 
    name,
    CASE 
      -- Atrasado hoje (due_day = 13, mas com due_date = hoje)
      WHEN name LIKE '%Atrasado Hoje%' THEN 13
      
      -- Críticos: venceram há 8, 10, 12 dias (dias 5, 3, 1 de março)
      WHEN name LIKE '%Crítico 8 dias%' THEN 5   -- venceu dia 5/03 (8 dias atrás)
      WHEN name LIKE '%Crítico 10 dias%' THEN 3  -- venceu dia 3/03 (10 dias atrás) 
      WHEN name LIKE '%Crítico 12 dias%' THEN 1  -- venceu dia 1/03 (12 dias atrás)
      
      -- Muito críticos: venceram há 20, 25, 30 dias (fevereiro)
      WHEN name LIKE '%Muito Crítico 20 dias%' THEN 22  -- venceu dia 22/02 (20 dias atrás)
      WHEN name LIKE '%Muito Crítico 25 dias%' THEN 17  -- venceu dia 17/02 (25 dias atrás)
      WHEN name LIKE '%Muito Crítico 30 dias%' THEN 12  -- venceu dia 12/02 (30 dias atrás)
      
      ELSE 15
    END as due_day,
    CASE 
      -- Criar due_date específico para cada tipo de atraso
      WHEN name LIKE '%Atrasado Hoje%' THEN '2026-03-13'::date  -- venceu hoje
      WHEN name LIKE '%Crítico 8 dias%' THEN '2026-03-05'::date   -- venceu há 8 dias
      WHEN name LIKE '%Crítico 10 dias%' THEN '2026-03-03'::date  -- venceu há 10 dias
      WHEN name LIKE '%Crítico 12 dias%' THEN '2026-03-01'::date  -- venceu há 12 dias
      WHEN name LIKE '%Muito Crítico 20 dias%' THEN '2026-02-22'::date  -- venceu há 20 dias
      WHEN name LIKE '%Muito Crítico 25 dias%' THEN '2026-02-17'::date  -- venceu há 25 dias
      WHEN name LIKE '%Muito Crítico 30 dias%' THEN '2026-02-12'::date  -- venceu há 30 dias
      ELSE '2026-03-01'::date
    END as due_date_especifica
  FROM companies 
  WHERE name LIKE '%Atrasado Hoje%' 
     OR name LIKE '%Crítico%' 
     OR name LIKE '%Muito Crítico%'
)

INSERT INTO subscriptions (
  id, customer_id, plan_id, status, start_date, due_day, amount, 
  discount_percent, discount_amount, auto_billing_enabled, 
  notes, created_at, created_by
)
SELECT 
  gen_random_uuid(),
  e.id,
  p.id,
  'active',  -- Todas ativas para aparecerem como "Atrasado"
  '2026-01-01'::date,  -- Data de início
  e.due_day,
  CASE 
    WHEN e.name LIKE '%Muito Crítico%' THEN 5000.00  -- Valores altos para críticos
    WHEN e.name LIKE '%Crítico%' THEN 3000.00
    ELSE 1500.00
  END,
  0,  -- discount_percent
  0,  -- discount_amount
  true,  -- auto_billing_enabled
  CASE 
    WHEN e.name LIKE '%Atrasado Hoje%' THEN 'Venceu hoje - atraso de 0 dias'
    WHEN e.name LIKE '%Crítico 8 dias%' THEN 'Venceu em 05/03 - atraso de 8 dias'
    WHEN e.name LIKE '%Crítico 10 dias%' THEN 'Venceu em 03/03 - atraso de 10 dias'
    WHEN e.name LIKE '%Crítico 12 dias%' THEN 'Venceu em 01/03 - atraso de 12 dias'
    WHEN e.name LIKE '%Muito Crítico 20 dias%' THEN 'Venceu em 22/02 - atraso de 20 dias'
    WHEN e.name LIKE '%Muito Crítico 25 dias%' THEN 'Venceu em 17/02 - atraso de 25 dias'
    WHEN e.name LIKE '%Muito Crítico 30 dias%' THEN 'Venceu em 12/02 - atraso de 30 dias'
    ELSE 'Assinatura com atraso'
  END,
  NOW(),
  NULL
FROM novas_empresas e
CROSS JOIN plano_ids p;

-- 5. Verificar resultado
SELECT 'NOVOS DADOS CRIADOS:' as info;

SELECT 
  'Total de empresas agora:' as tipo,
  COUNT(*) as quantidade
FROM companies
UNION ALL
SELECT 
  'Total de assinaturas agora:' as tipo,
  COUNT(*) as quantidade
FROM subscriptions;

-- 6. Simular contagem de críticos (>7 dias)
-- Hoje é 13/03/2026, então críticos são os que venceram antes de 06/03/2026

SELECT 'SIMULAÇÃO DOS FILTROS:' as info;

-- Atrasados hoje (due_day = 13)
SELECT 
  'ATRASADOS HOJE (due_day=13):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.due_day = 13 AND s.status = 'active'

UNION ALL

-- Críticos (due_day < 6, considerando que hoje é 13)
SELECT 
  'CRÍTICOS (due_day 1-5, >7 dias atraso):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.due_day BETWEEN 1 AND 5 AND s.status = 'active'

UNION ALL

-- Muito críticos (due_day < 28 do mês anterior, >15 dias)
SELECT 
  'MUITO CRÍTICOS (due_day 12-22, >15 dias):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.due_day BETWEEN 12 AND 22 AND s.status = 'active';

SELECT 'Agora teste os filtros: HOJE, CRÍTICO, ATRASADO!' as resultado;