-- Script completo para popular o banco com dados de teste
-- Execute este script no Supabase SQL Editor

-- ============================================
-- PASSO 1: Criar alguns planos se não existirem
-- ============================================

DO $$
BEGIN
  -- Inserir planos se não existirem
  INSERT INTO plans (name, price, billing_cycle, type, category, description)
  SELECT * FROM (VALUES
    ('Plano Básico', 99.90, 'Mensal', 'Plano Recorrente', 'Assinatura', 'Plano básico com recursos essenciais'),
    ('Plano Profissional', 199.90, 'Mensal', 'Plano Recorrente', 'Assinatura', 'Plano profissional com recursos avançados'),
    ('Plano Enterprise', 499.90, 'Mensal', 'Plano Recorrente', 'Assinatura', 'Plano enterprise com todos os recursos'),
    ('Plano Anual Básico', 999.00, 'Anual', 'Plano Recorrente', 'Assinatura', 'Plano básico com pagamento anual'),
    ('Plano Anual Pro', 1999.00, 'Anual', 'Plano Recorrente', 'Assinatura', 'Plano profissional com pagamento anual')
  ) AS v(name, price, billing_cycle, type, category, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE plans.name = v.name
  );
  
  RAISE NOTICE 'Planos verificados/criados';
END $$;

-- ============================================
-- PASSO 2: Criar 100 empresas aleatórias
-- ============================================

DO $$
DECLARE
  company_names TEXT[] := ARRAY[
    'Tech Solutions', 'Digital Marketing', 'Cloud Services', 'Data Analytics',
    'Software House', 'Web Design', 'Mobile Apps', 'E-commerce', 'Consultoria',
    'Desenvolvimento', 'Inovação', 'Tecnologia', 'Sistemas', 'Automação',
    'Integração', 'Segurança', 'Infraestrutura', 'Suporte', 'Treinamento',
    'Gestão', 'Estratégia', 'Performance', 'Otimização', 'Soluções', 'Digital'
  ];
  
  company_types TEXT[] := ARRAY['Ltda', 'ME', 'EPP', 'EIRELI', 'S.A.'];
  
  first_names TEXT[] := ARRAY[
    'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda',
    'Rafael', 'Camila', 'Bruno', 'Patricia', 'Rodrigo', 'Amanda', 'Felipe',
    'Beatriz', 'Gustavo', 'Larissa', 'Thiago', 'Mariana', 'Gabriel', 'Isabela'
  ];
  
  last_names TEXT[] := ARRAY[
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Ferreira',
    'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Pereira', 'Ribeiro',
    'Martins', 'Rocha', 'Alves', 'Monteiro', 'Mendes', 'Barbosa', 'Pinto'
  ];
  
  tags_options TEXT[] := ARRAY['VIP', 'Premium', 'Novo', 'Ativo', 'Prioritário', 'Teste', 'Parceiro'];
  
  company_name TEXT;
  email TEXT;
  whatsapp TEXT;
  phone TEXT;
  document TEXT;
  tags JSONB;
  tags_array TEXT[];
  i INTEGER;
  random_tags INTEGER;
  j INTEGER;
BEGIN
  FOR i IN 1..100 LOOP
    company_name := company_names[1 + floor(random() * array_length(company_names, 1))] || ' ' ||
                    company_names[1 + floor(random() * array_length(company_names, 1))] || ' ' ||
                    company_types[1 + floor(random() * array_length(company_types, 1))];
    
    email := 'contato' || i || '@' || 
             lower(regexp_replace(company_names[1 + floor(random() * array_length(company_names, 1))], '[^a-zA-Z0-9]', '', 'g')) || 
             '.com.br';
    
    whatsapp := '55' || (10 + floor(random() * 89))::TEXT || '9' || (10000000 + floor(random() * 89999999))::TEXT;
    phone := '(' || (10 + floor(random() * 89))::TEXT || ') ' || (2000 + floor(random() * 7999))::TEXT || '-' || (1000 + floor(random() * 8999))::TEXT;
    document := (10000000 + floor(random() * 89999999))::TEXT || '0001' || (10 + floor(random() * 89))::TEXT;
    
    random_tags := floor(random() * 4);
    tags_array := ARRAY[]::TEXT[];
    IF random_tags > 0 THEN
      FOR j IN 1..random_tags LOOP
        tags_array := array_append(tags_array, tags_options[1 + floor(random() * array_length(tags_options, 1))]);
      END LOOP;
      tags_array := ARRAY(SELECT DISTINCT unnest(tags_array));
    END IF;
    
    -- Converter array para JSONB
    tags := to_jsonb(tags_array);
    
    INSERT INTO companies (name, email, whatsapp, phone, document, tags, created_at)
    VALUES (company_name, email, whatsapp, phone, document, tags, NOW() - (random() * INTERVAL '365 days'));
  END LOOP;
  
  RAISE NOTICE '100 empresas cadastradas!';
END $$;

-- ============================================
-- PASSO 3: Criar assinaturas para as empresas
-- ============================================

DO $$
DECLARE
  company_record RECORD;
  plans_array UUID[];
  selected_plan_id UUID;
  subscription_status TEXT;
  start_date DATE;
  due_day INTEGER;
  amount NUMERIC;
  discount_percent NUMERIC;
  auto_billing BOOLEAN;
  counter INTEGER := 0;
BEGIN
  SELECT ARRAY_AGG(id) INTO plans_array FROM plans;
  
  FOR company_record IN 
    SELECT id, name FROM companies 
    WHERE random() < 0.75
    ORDER BY created_at DESC
  LOOP
    selected_plan_id := plans_array[1 + floor(random() * array_length(plans_array, 1))];
    SELECT price INTO amount FROM plans WHERE id = selected_plan_id;
    
    CASE 
      WHEN random() < 0.85 THEN subscription_status := 'active';
      WHEN random() < 0.95 THEN subscription_status := 'suspended';
      ELSE subscription_status := 'cancelled';
    END CASE;
    
    start_date := CURRENT_DATE - (random() * 365)::INTEGER;
    due_day := 1 + floor(random() * 28);
    
    IF random() < 0.75 THEN
      discount_percent := 0;
    ELSE
      discount_percent := 5 + floor(random() * 26);
    END IF;
    
    auto_billing := random() < 0.65;
    
    INSERT INTO subscriptions (
      customer_id, plan_id, status, start_date, due_day, amount,
      discount_percent, discount_amount, auto_billing_enabled,
      auto_billing_message, notes, created_at
    ) VALUES (
      company_record.id, selected_plan_id, subscription_status, start_date, due_day, amount,
      discount_percent, ROUND(amount * discount_percent / 100, 2), auto_billing,
      CASE WHEN auto_billing THEN 'Olá! Sua mensalidade está disponível.' ELSE NULL END,
      CASE 
        WHEN subscription_status = 'suspended' THEN 'Suspensa por falta de pagamento'
        WHEN subscription_status = 'cancelled' THEN 'Cancelada a pedido'
        ELSE NULL
      END,
      start_date
    );
    
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE '% assinaturas criadas!', counter;
END $$;

-- ============================================
-- RESULTADOS
-- ============================================

SELECT '=== RESUMO ===' as info;

SELECT 
  'Empresas cadastradas' as tipo,
  COUNT(*)::TEXT as total
FROM companies
UNION ALL
SELECT 
  'Assinaturas criadas' as tipo,
  COUNT(*)::TEXT as total
FROM subscriptions
UNION ALL
SELECT 
  'Planos disponíveis' as tipo,
  COUNT(*)::TEXT as total
FROM plans;

SELECT '=== ASSINATURAS POR STATUS ===' as info;

SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND(AVG(amount), 2) as valor_medio,
  ROUND(SUM(amount), 2) as valor_total
FROM subscriptions
GROUP BY status
ORDER BY quantidade DESC;
