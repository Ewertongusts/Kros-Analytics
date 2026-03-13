-- Script completo com 3 empresas para cada filtro
-- Data atual: 13/03/2026 (sexta-feira)
-- Semana atual: 08/03 (domingo) a 14/03 (sábado)

-- 1. Limpar dados existentes
DELETE FROM subscriptions;
DELETE FROM companies;

-- 2. Criar empresas para cada filtro específico

-- ========================================
-- FILTRO: HOJE (due_day = 13)
-- ========================================
INSERT INTO companies (id, name, email, whatsapp, phone, document, tags, created_at) VALUES
(gen_random_uuid(), 'TechSolutions Hoje 1', 'hoje1@techsolutions.com.br', '5511987654321', '(11) 98765-4321', '12.345.678/0001-90', '["Hoje", "Premium"]', '2026-01-15'),
(gen_random_uuid(), 'DataCorp Hoje 2', 'hoje2@datacorp.com.br', '5511876543210', '(11) 87654-3210', '23.456.789/0001-01', '["Hoje", "VIP"]', '2026-01-20'),
(gen_random_uuid(), 'CloudFirst Hoje 3', 'hoje3@cloudfirst.com.br', '5511765432109', '(11) 76543-2109', '34.567.890/0001-12', '["Hoje", "Enterprise"]', '2026-02-01'),

-- ========================================
-- FILTRO: SEMANA (due_day entre 8-14, excluindo hoje=13)
-- ========================================
(gen_random_uuid(), 'Semana Domingo 1', 'semana1@domingo.com.br', '5511654321098', '(11) 65432-1098', '45.678.901/0001-23', '["Semana", "DevOps"]', '2026-02-05'),
(gen_random_uuid(), 'Semana Segunda 2', 'semana2@segunda.com.br', '5511543210987', '(11) 54321-0987', '56.789.012/0001-34', '["Semana", "AI"]', '2026-02-10'),
(gen_random_uuid(), 'Semana Terça 3', 'semana3@terca.com.br', '5511432109876', '(11) 43210-9876', '67.890.123/0001-45', '["Semana", "Blockchain"]', '2026-02-15'),

-- ========================================
-- FILTRO: PENDENTE (status = 'Pendente' - assinaturas ativas)
-- ========================================
(gen_random_uuid(), 'Pendente Futuro 1', 'pendente1@futuro.com.br', '5511321098765', '(11) 32109-8765', '78.901.234/0001-56', '["Pendente", "Mobile"]', '2026-02-20'),
(gen_random_uuid(), 'Pendente Futuro 2', 'pendente2@futuro.com.br', '5511210987654', '(11) 21098-7654', '89.012.345/0001-67', '["Pendente", "UX"]', '2026-02-25'),
(gen_random_uuid(), 'Pendente Futuro 3', 'pendente3@futuro.com.br', '5511109876543', '(11) 10987-6543', '90.123.456/0001-78', '["Pendente", "Security"]', '2026-03-01'),

-- ========================================
-- FILTRO: PAGO (status = 'Pago' - assinaturas inativas)
-- ========================================
(gen_random_uuid(), 'Pago Concluído 1', 'pago1@concluido.com.br', '5511098765432', '(11) 09876-5432', '01.234.567/0001-89', '["Pago", "E-commerce"]', '2026-03-05'),
(gen_random_uuid(), 'Pago Concluído 2', 'pago2@concluido.com.br', '5511987654320', '(11) 98765-4320', '12.345.678/0001-91', '["Pago", "Marketing"]', '2026-01-10'),
(gen_random_uuid(), 'Pago Concluído 3', 'pago3@concluido.com.br', '5511876543219', '(11) 87654-3219', '23.456.789/0001-02', '["Pago", "Consultoria"]', '2026-01-25'),

-- ========================================
-- FILTRO: SEM WA (sem WhatsApp)
-- ========================================
(gen_random_uuid(), 'Sem WhatsApp 1', 'semwa1@empresa.com.br', NULL, '(11) 76543-2108', '34.567.890/0001-13', '["Sem-WA", "Inovação"]', '2026-02-28'),
(gen_random_uuid(), 'Sem WhatsApp 2', 'semwa2@empresa.com.br', '', '(11) 65432-1097', '45.678.901/0001-24', '["Sem-WA", "Automação"]', '2026-03-02'),
(gen_random_uuid(), 'Sem WhatsApp 3', 'semwa3@empresa.com.br', '   ', '(11) 54321-0986', '56.789.012/0001-35', '["Sem-WA", "Logística"]', '2026-03-08'),

-- ========================================
-- FILTRO: COBRADOS (com last_alert_at)
-- ========================================
(gen_random_uuid(), 'Cobrado Alerta 1', 'cobrado1@alerta.com.br', '5511432109875', '(11) 43210-9875', '67.890.123/0001-46', '["Cobrado", "Energia"]', '2026-03-10'),
(gen_random_uuid(), 'Cobrado Alerta 2', 'cobrado2@alerta.com.br', '5511321098764', '(11) 32109-8764', '78.901.234/0001-57', '["Cobrado", "Saúde"]', '2026-03-11'),
(gen_random_uuid(), 'Cobrado Alerta 3', 'cobrado3@alerta.com.br', '5511210987653', '(11) 21098-7653', '89.012.345/0001-68', '["Cobrado", "Educação"]', '2026-03-12'),

-- ========================================
-- FILTRO: NÃO COBRADOS (sem last_alert_at)
-- ========================================
(gen_random_uuid(), 'Não Cobrado 1', 'naocobrado1@empresa.com.br', '5511109876542', '(11) 10987-6542', '90.123.456/0001-79', '["Nao-Cobrado", "Fintech"]', '2026-01-05'),
(gen_random_uuid(), 'Não Cobrado 2', 'naocobrado2@empresa.com.br', '5511098765431', '(11) 09876-5431', '01.234.567/0001-80', '["Nao-Cobrado", "Gaming"]', '2026-01-08'),
(gen_random_uuid(), 'Não Cobrado 3', 'naocobrado3@empresa.com.br', '5511987654309', '(11) 98765-4309', '12.345.678/0001-92', '["Nao-Cobrado", "IoT"]', '2026-01-12'),

-- ========================================
-- FILTRO: ATRASADO (due_day < hoje e status ativo)
-- ========================================
(gen_random_uuid(), 'Atrasado Crítico 1', 'atrasado1@critico.com.br', '5511876543208', '(11) 87654-3208', '23.456.789/0001-03', '["Atrasado", "Crítico"]', '2026-01-15'),
(gen_random_uuid(), 'Atrasado Crítico 2', 'atrasado2@critico.com.br', '5511765432107', '(11) 76543-2107', '34.567.890/0001-14', '["Atrasado", "Urgente"]', '2026-01-18'),
(gen_random_uuid(), 'Atrasado Crítico 3', 'atrasado3@critico.com.br', '5511654321096', '(11) 65432-1096', '45.678.901/0001-25', '["Atrasado", "Perdido"]', '2026-01-22'),

-- ========================================
-- FILTRO: CRÍTICO (>7 dias de atraso)
-- ========================================
(gen_random_uuid(), 'Crítico Perdido 1', 'critico1@perdido.com.br', '5511543210985', '(11) 54321-0985', '56.789.012/0001-36', '["Crítico", "Churn"]', '2026-01-01'),
(gen_random_uuid(), 'Crítico Perdido 2', 'critico2@perdido.com.br', '5511432109874', '(11) 43210-9874', '67.890.123/0001-47', '["Crítico", "Recuperar"]', '2026-01-02'),
(gen_random_uuid(), 'Crítico Perdido 3', 'critico3@perdido.com.br', '5511321098763', '(11) 32109-8763', '78.901.234/0001-58', '["Crítico", "Risco"]', '2026-01-03'),

-- ========================================
-- FILTRO: CHURN (>30 dias de atraso)
-- ========================================
(gen_random_uuid(), 'Churn Cliente 1', 'churn1@cliente.com.br', '5511210987652', '(11) 21098-7652', '89.012.345/0001-69', '["Churn", "Perdido"]', '2025-12-01'),
(gen_random_uuid(), 'Churn Cliente 2', 'churn2@cliente.com.br', '5511109876541', '(11) 10987-6541', '90.123.456/0001-70', '["Churn", "Cancelado"]', '2025-12-05'),
(gen_random_uuid(), 'Churn Cliente 3', 'churn3@cliente.com.br', '5511098765430', '(11) 09876-5430', '01.234.567/0001-81', '["Churn", "Inativo"]', '2025-12-10');

-- 3. Criar assinaturas correspondentes
WITH empresa_dados AS (
  SELECT 
    id, 
    name,
    CASE 
      WHEN name LIKE '%Hoje%' THEN 13
      WHEN name LIKE '%Domingo%' THEN 8
      WHEN name LIKE '%Segunda%' THEN 9  
      WHEN name LIKE '%Terça%' THEN 10
      WHEN name LIKE '%Futuro%' THEN 20  -- fora da semana atual
      WHEN name LIKE '%Concluído%' THEN 15
      WHEN name LIKE '%WhatsApp%' THEN 25
      WHEN name LIKE '%Alerta%' THEN 18
      WHEN name LIKE '%Não Cobrado%' THEN 22
      WHEN name LIKE '%Atrasado%' THEN 5   -- já passou
      WHEN name LIKE '%Crítico%' THEN 1    -- muito atrasado
      WHEN name LIKE '%Churn%' THEN 10     -- churn baseado em data antiga
      ELSE 15
    END as due_day,
    CASE 
      WHEN name LIKE '%Concluído%' THEN 'cancelled'  -- Para aparecer como "Pago"
      ELSE 'active'
    END as status_assinatura
  FROM companies
),
plano_ids AS (
  SELECT id FROM plans LIMIT 1
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
  e.status_assinatura,
  CASE 
    WHEN e.name LIKE '%Churn%' THEN '2025-11-01'::date  -- Muito antiga para churn
    WHEN e.name LIKE '%Crítico%' THEN '2026-01-01'::date  -- Antiga para crítico
    WHEN e.name LIKE '%Atrasado%' THEN '2026-02-01'::date  -- Recente mas atrasada
    ELSE '2026-01-01'::date
  END,
  e.due_day,
  CASE 
    WHEN e.name LIKE '%Premium%' OR e.name LIKE '%VIP%' OR e.name LIKE '%Enterprise%' THEN 2500.00
    WHEN e.name LIKE '%Pro%' OR e.name LIKE '%Plus%' THEN 1500.00
    WHEN e.name LIKE '%Crítico%' OR e.name LIKE '%Churn%' THEN 5000.00  -- Valores altos para perdas críticas
    ELSE 1000.00
  END,
  0,  -- discount_percent
  0,  -- discount_amount
  true,  -- auto_billing_enabled
  CASE 
    WHEN e.name LIKE '%Hoje%' THEN 'Vence hoje - prioridade alta'
    WHEN e.name LIKE '%Semana%' THEN 'Vence nesta semana'
    WHEN e.name LIKE '%Crítico%' THEN 'Cliente em situação crítica'
    WHEN e.name LIKE '%Churn%' THEN 'Cliente perdido - mais de 30 dias'
    WHEN e.name LIKE '%Atrasado%' THEN 'Pagamento em atraso'
    ELSE 'Assinatura padrão'
  END,
  NOW(),
  NULL
FROM empresa_dados e
CROSS JOIN plano_ids p;

-- 4. Adicionar campos específicos para filtros

-- Adicionar last_alert_at para empresas "Cobradas"
UPDATE companies 
SET updated_at = '2026-03-10 10:00:00'
WHERE name LIKE '%Alerta%';

-- Simular last_alert_at através de uma coluna personalizada (se necessário)
-- Nota: Como não temos last_alert_at na tabela companies, 
-- vamos usar a lógica no código para identificar "cobrados" vs "não cobrados"

-- 5. Verificar resultado final
SELECT 'RESUMO FINAL:' as info;

SELECT 
  'Total de empresas criadas:' as tipo,
  COUNT(*) as quantidade
FROM companies
UNION ALL
SELECT 
  'Total de assinaturas criadas:' as tipo,
  COUNT(*) as quantidade
FROM subscriptions;

-- 6. Distribuição por filtros
SELECT 'DISTRIBUIÇÃO POR FILTROS:' as info;

-- Hoje (due_day = 13)
SELECT 
  'HOJE (due_day=13):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
JOIN companies c ON s.customer_id = c.id
WHERE s.due_day = 13 AND s.status = 'active'

UNION ALL

-- Semana (due_day entre 8-14)
SELECT 
  'SEMANA (due_day 8-14):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.due_day BETWEEN 8 AND 14 AND s.status = 'active'

UNION ALL

-- Pendente (status active)
SELECT 
  'PENDENTE (status active):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.status = 'active'

UNION ALL

-- Pago (status cancelled)
SELECT 
  'PAGO (status cancelled):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.status = 'cancelled'

UNION ALL

-- Sem WhatsApp
SELECT 
  'SEM WA (whatsapp vazio):' as filtro,
  COUNT(*) as quantidade
FROM companies c
WHERE c.whatsapp IS NULL OR TRIM(c.whatsapp) = ''

UNION ALL

-- Atrasado (due_day < 13)
SELECT 
  'ATRASADO (due_day < 13):' as filtro,
  COUNT(*) as quantidade
FROM subscriptions s
WHERE s.due_day < 13 AND s.status = 'active';

SELECT 'Script executado com sucesso! Teste todos os filtros.' as resultado;