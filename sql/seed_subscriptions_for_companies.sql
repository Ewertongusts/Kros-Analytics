-- Script para criar assinaturas aleatórias para as empresas cadastradas
-- Execute DEPOIS de criar as empresas e ter planos cadastrados

DO $$
DECLARE
  company_record RECORD;
  plan_record RECORD;
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
  -- Buscar todos os planos disponíveis
  SELECT ARRAY_AGG(id) INTO plans_array FROM plans;
  
  IF plans_array IS NULL OR array_length(plans_array, 1) = 0 THEN
    RAISE EXCEPTION 'Nenhum plano encontrado! Cadastre planos antes de criar assinaturas.';
  END IF;
  
  RAISE NOTICE 'Encontrados % planos', array_length(plans_array, 1);
  
  -- Para cada empresa, criar 1 assinatura (70% das empresas terão assinatura)
  FOR company_record IN 
    SELECT id, name FROM companies 
    WHERE random() < 0.7  -- 70% das empresas terão assinatura
    ORDER BY created_at DESC
  LOOP
    -- Selecionar plano aleatório
    selected_plan_id := plans_array[1 + floor(random() * array_length(plans_array, 1))];
    
    -- Buscar detalhes do plano
    SELECT price INTO amount FROM plans WHERE id = selected_plan_id;
    
    -- Status aleatório (80% ativo, 10% suspenso, 10% cancelado)
    CASE 
      WHEN random() < 0.8 THEN subscription_status := 'active';
      WHEN random() < 0.9 THEN subscription_status := 'suspended';
      ELSE subscription_status := 'cancelled';
    END CASE;
    
    -- Data de início aleatória (últimos 12 meses)
    start_date := CURRENT_DATE - (random() * 365)::INTEGER;
    
    -- Dia de vencimento aleatório (1 a 28)
    due_day := 1 + floor(random() * 28);
    
    -- Desconto aleatório (70% sem desconto, 30% com desconto de 5% a 30%)
    IF random() < 0.7 THEN
      discount_percent := 0;
    ELSE
      discount_percent := 5 + floor(random() * 26);
    END IF;
    
    -- Cobrança automática (60% ativada)
    auto_billing := random() < 0.6;
    
    -- Inserir assinatura
    INSERT INTO subscriptions (
      customer_id,
      plan_id,
      status,
      start_date,
      due_day,
      amount,
      discount_percent,
      discount_amount,
      auto_billing_enabled,
      auto_billing_message,
      notes,
      created_at
    ) VALUES (
      company_record.id,
      selected_plan_id,
      subscription_status,
      start_date,
      due_day,
      amount,
      discount_percent,
      ROUND(amount * discount_percent / 100, 2),
      auto_billing,
      CASE 
        WHEN auto_billing THEN 'Olá! Sua mensalidade está disponível para pagamento.'
        ELSE NULL
      END,
      CASE 
        WHEN subscription_status = 'suspended' THEN 'Suspensa por falta de pagamento'
        WHEN subscription_status = 'cancelled' THEN 'Cancelada a pedido do cliente'
        ELSE NULL
      END,
      start_date
    );
    
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE '% assinaturas criadas com sucesso!', counter;
END $$;

-- Verificar assinaturas criadas
SELECT 
  s.id,
  c.name as customer_name,
  p.name as plan_name,
  s.status,
  s.amount,
  s.discount_percent,
  s.due_day,
  s.auto_billing_enabled,
  s.start_date
FROM subscriptions s
JOIN companies c ON s.customer_id = c.id
JOIN plans p ON s.plan_id = p.id
ORDER BY s.created_at DESC
LIMIT 20;

-- Estatísticas
SELECT 
  status,
  COUNT(*) as total,
  ROUND(AVG(amount), 2) as valor_medio,
  SUM(amount) as valor_total
FROM subscriptions
GROUP BY status
ORDER BY total DESC;
