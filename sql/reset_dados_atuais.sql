-- Script para resetar dados com informações mais atuais
-- Data atual: 13/03/2026

-- 1. Limpar dados antigos
DELETE FROM subscriptions;
DELETE FROM companies;

-- 2. Resetar sequências (se necessário)
-- ALTER SEQUENCE companies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE subscriptions_id_seq RESTART WITH 1;

-- 3. Criar empresas com nomes mais realistas
INSERT INTO companies (id, name, email, whatsapp, phone, document, tags, created_at) VALUES
-- Empresas que vencem HOJE (13/03)
(gen_random_uuid(), 'TechSolutions Ltda', 'contato@techsolutions.com.br', '5511987654321', '(11) 98765-4321', '12.345.678/0001-90', '["Premium", "Tecnologia"]', '2026-01-15'),
(gen_random_uuid(), 'DataCorp Analytics', 'admin@datacorp.com.br', '5511876543210', '(11) 87654-3210', '23.456.789/0001-01', '["VIP", "Analytics"]', '2026-01-20'),

-- Empresas que vencem AMANHÃ (14/03)
(gen_random_uuid(), 'CloudFirst Solutions', 'info@cloudfirst.com.br', '5511765432109', '(11) 76543-2109', '34.567.890/0001-12', '["Cloud", "Enterprise"]', '2026-02-01'),
(gen_random_uuid(), 'DevOps Masters', 'team@devopsmasters.com.br', '5511654321098', '(11) 65432-1098', '45.678.901/0001-23', '["DevOps", "Premium"]', '2026-02-05'),

-- Empresas que venceram ONTEM (12/03)
(gen_random_uuid(), 'AI Innovations Inc', 'contact@aiinnovations.com.br', '5511543210987', '(11) 54321-0987', '56.789.012/0001-34', '["AI", "Startup"]', '2026-02-10'),
(gen_random_uuid(), 'BlockChain Experts', 'hello@blockchain.com.br', '5511432109876', '(11) 43210-9876', '67.890.123/0001-45', '["Blockchain", "Fintech"]', '2026-02-15'),

-- Empresas que vencem no DOMINGO (09/03) - início da semana
(gen_random_uuid(), 'Mobile Apps Studio', 'apps@mobilestudio.com.br', '5511321098765', '(11) 32109-8765', '78.901.234/0001-56', '["Mobile", "Apps"]', '2026-02-20'),
(gen_random_uuid(), 'UX Design House', 'design@uxhouse.com.br', '5511210987654', '(11) 21098-7654', '89.012.345/0001-67', '["Design", "UX"]', '2026-02-25'),

-- Empresas que vencem no SÁBADO (15/03) - fim da semana
(gen_random_uuid(), 'Security Systems Pro', 'security@syspro.com.br', '5511109876543', '(11) 10987-6543', '90.123.456/0001-78', '["Security", "Enterprise"]', '2026-03-01'),
(gen_random_uuid(), 'E-commerce Plus', 'vendas@ecommerceplus.com.br', '5511098765432', '(11) 09876-5432', '01.234.567/0001-89', '["E-commerce", "Retail"]', '2026-03-05'),

-- Empresas que vencem FORA da semana (para contraste)
(gen_random_uuid(), 'Marketing Digital 360', 'marketing@digital360.com.br', '5511987654320', '(11) 98765-4320', '12.345.678/0001-91', '["Marketing", "Digital"]', '2026-01-10'),
(gen_random_uuid(), 'Consultoria Estratégica', 'contato@estrategica.com.br', '5511876543219', '(11) 87654-3219', '23.456.789/0001-02', '["Consultoria", "Estratégia"]', '2026-01-25'),

-- Mais algumas empresas para volume
(gen_random_uuid(), 'Inovação Tecnológica ME', 'inovacao@tecno.com.br', '5511765432108', '(11) 76543-2108', '34.567.890/0001-13', '["Inovação", "Startup"]', '2026-02-28'),
(gen_random_uuid(), 'Automação Industrial', 'automacao@industrial.com.br', '5511654321097', '(11) 65432-1097', '45.678.901/0001-24', '["Automação", "Industrial"]', '2026-03-02'),
(gen_random_uuid(), 'Logística Inteligente', 'logistica@inteligente.com.br', '5511543210986', '(11) 54321-0986', '56.789.012/0001-35', '["Logística", "Smart"]', '2026-03-08'),
(gen_random_uuid(), 'Energia Renovável Ltda', 'energia@renovavel.com.br', '5511432109875', '(11) 43210-9875', '67.890.123/0001-46', '["Energia", "Sustentável"]', '2026-03-10');

-- 4. Criar assinaturas com datas mais realistas
-- Buscar IDs das empresas criadas
WITH empresa_ids AS (
  SELECT id, name FROM companies ORDER BY created_at
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
  'active',
  '2026-01-01'::date,
  CASE e.name
    -- Empresas que vencem HOJE (13/03)
    WHEN 'TechSolutions Ltda' THEN 13
    WHEN 'DataCorp Analytics' THEN 13
    
    -- Empresas que vencem AMANHÃ (14/03)
    WHEN 'CloudFirst Solutions' THEN 14
    WHEN 'DevOps Masters' THEN 14
    
    -- Empresas que venceram ONTEM (12/03)
    WHEN 'AI Innovations Inc' THEN 12
    WHEN 'BlockChain Experts' THEN 12
    
    -- Empresas que vencem no DOMINGO (09/03)
    WHEN 'Mobile Apps Studio' THEN 9
    WHEN 'UX Design House' THEN 9
    
    -- Empresas que vencem no SÁBADO (15/03) - fora da semana atual
    WHEN 'Security Systems Pro' THEN 15
    WHEN 'E-commerce Plus' THEN 15
    
    -- Empresas que vencem em outros dias (fora da semana)
    WHEN 'Marketing Digital 360' THEN 5
    WHEN 'Consultoria Estratégica' THEN 25
    
    -- Mais algumas na semana atual
    WHEN 'Inovação Tecnológica ME' THEN 10
    WHEN 'Automação Industrial' THEN 11
    WHEN 'Logística Inteligente' THEN 8  -- domingo
    WHEN 'Energia Renovável Ltda' THEN 14
    
    ELSE 20  -- default fora da semana
  END,
  CASE 
    WHEN e.name LIKE '%Premium%' OR e.name LIKE '%VIP%' OR e.name LIKE '%Enterprise%' THEN 2500.00
    WHEN e.name LIKE '%Pro%' OR e.name LIKE '%Plus%' THEN 1500.00
    WHEN e.name LIKE '%ME%' OR e.name LIKE '%Startup%' THEN 500.00
    ELSE 1000.00
  END,
  0,  -- discount_percent
  0,  -- discount_amount
  true,  -- auto_billing_enabled
  'Assinatura criada com dados atualizados',
  NOW(),
  NULL
FROM empresa_ids e
CROSS JOIN plano_ids p;

-- 5. Verificar resultado
SELECT 
  'Resumo dos dados criados:' as info;

SELECT 
  'Total de empresas:' as tipo,
  COUNT(*) as quantidade
FROM companies
UNION ALL
SELECT 
  'Total de assinaturas:' as tipo,
  COUNT(*) as quantidade
FROM subscriptions
UNION ALL
SELECT 
  'Assinaturas que vencem na semana atual (8-14):' as tipo,
  COUNT(*) as quantidade
FROM subscriptions 
WHERE due_day BETWEEN 8 AND 14 AND status = 'active';

-- 6. Mostrar distribuição por dia
SELECT 
  'Distribuição por due_day:' as info;

SELECT 
  due_day,
  COUNT(*) as quantidade,
  CASE 
    WHEN due_day BETWEEN 8 AND 14 THEN '✅ SEMANA ATUAL'
    ELSE '❌ FORA DA SEMANA'
  END as status_semana
FROM subscriptions 
WHERE status = 'active'
GROUP BY due_day
ORDER BY due_day;