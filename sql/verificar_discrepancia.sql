-- Verificar discrepância entre empresas e assinaturas

-- 1. Contar total de empresas
SELECT 
  'Total de empresas na tabela companies:' as info,
  COUNT(*) as quantidade
FROM companies;

-- 2. Contar total de assinaturas
SELECT 
  'Total de assinaturas na tabela subscriptions:' as info,
  COUNT(*) as quantidade
FROM subscriptions;

-- 3. Verificar empresas SEM assinatura
SELECT 
  'Empresas SEM assinatura:' as info,
  COUNT(*) as quantidade
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.customer_id
WHERE s.id IS NULL;

-- 4. Listar empresas sem assinatura (se houver)
SELECT 
  'Empresas sem assinatura:' as tipo,
  c.name as empresa
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.customer_id
WHERE s.id IS NULL
LIMIT 10;

-- 5. Verificar assinaturas SEM empresa (órfãs)
SELECT 
  'Assinaturas órfãs (sem empresa):' as info,
  COUNT(*) as quantidade
FROM subscriptions s
LEFT JOIN companies c ON s.customer_id = c.id
WHERE c.id IS NULL;

-- 6. Contar assinaturas por status
SELECT 
  'Assinaturas por status:' as info;

SELECT 
  status,
  COUNT(*) as quantidade
FROM subscriptions
GROUP BY status
ORDER BY status;

-- 7. Verificar se há empresas duplicadas
SELECT 
  'Empresas com nomes duplicados:' as info;

SELECT 
  name,
  COUNT(*) as quantidade
FROM companies
GROUP BY name
HAVING COUNT(*) > 1;

-- 8. Verificar join entre empresas e assinaturas
SELECT 
  'Join empresas + assinaturas (deve ser 16 se tudo correto):' as info,
  COUNT(*) as quantidade
FROM companies c
INNER JOIN subscriptions s ON c.id = s.customer_id;