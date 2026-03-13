-- Script para cadastrar 100 empresas aleatórias para testes
-- Execute este script no Supabase SQL Editor

DO $$
DECLARE
  company_names TEXT[] := ARRAY[
    'Tech Solutions', 'Digital Marketing', 'Cloud Services', 'Data Analytics',
    'Software House', 'Web Design', 'Mobile Apps', 'E-commerce', 'Consultoria',
    'Desenvolvimento', 'Inovação', 'Tecnologia', 'Sistemas', 'Automação',
    'Integração', 'Segurança', 'Infraestrutura', 'Suporte', 'Treinamento',
    'Gestão', 'Estratégia', 'Performance', 'Otimização', 'Soluções'
  ];
  
  company_types TEXT[] := ARRAY[
    'Ltda', 'ME', 'EPP', 'EIRELI', 'S.A.'
  ];
  
  first_names TEXT[] := ARRAY[
    'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda',
    'Rafael', 'Camila', 'Bruno', 'Patricia', 'Rodrigo', 'Amanda', 'Felipe',
    'Beatriz', 'Gustavo', 'Larissa', 'Thiago', 'Mariana'
  ];
  
  last_names TEXT[] := ARRAY[
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Ferreira',
    'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Pereira', 'Ribeiro',
    'Martins', 'Rocha', 'Alves', 'Monteiro', 'Mendes', 'Barbosa', 'Pinto'
  ];
  
  cities TEXT[] := ARRAY[
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
    'Brasília', 'Salvador', 'Fortaleza', 'Recife', 'Manaus', 'Goiânia',
    'Campinas', 'Florianópolis', 'Vitória', 'João Pessoa'
  ];
  
  states TEXT[] := ARRAY[
    'SP', 'RJ', 'MG', 'PR', 'RS', 'DF', 'BA', 'CE', 'PE', 'AM', 'GO', 'SC', 'ES', 'PB'
  ];
  
  tags_options TEXT[] := ARRAY[
    'VIP', 'Premium', 'Novo', 'Ativo', 'Prioritário', 'Teste', 'Parceiro'
  ];
  
  company_name TEXT;
  contact_name TEXT;
  email TEXT;
  whatsapp TEXT;
  phone TEXT;
  document TEXT;
  city TEXT;
  state TEXT;
  address TEXT;
  tags TEXT[];
  i INTEGER;
  random_tags INTEGER;
  j INTEGER;
BEGIN
  FOR i IN 1..100 LOOP
    -- Gerar nome da empresa
    company_name := company_names[1 + floor(random() * array_length(company_names, 1))] || ' ' ||
                    company_names[1 + floor(random() * array_length(company_names, 1))] || ' ' ||
                    company_types[1 + floor(random() * array_length(company_types, 1))];
    
    -- Gerar nome do contato
    contact_name := first_names[1 + floor(random() * array_length(first_names, 1))] || ' ' ||
                    last_names[1 + floor(random() * array_length(last_names, 1))];
    
    -- Gerar email
    email := lower(regexp_replace(company_name, '[^a-zA-Z0-9]', '', 'g')) || i || '@email.com';
    
    -- Gerar WhatsApp (formato brasileiro)
    whatsapp := '55' || 
                (10 + floor(random() * 89))::TEXT || 
                '9' || 
                (10000000 + floor(random() * 89999999))::TEXT;
    
    -- Gerar telefone
    phone := '(' || (10 + floor(random() * 89))::TEXT || ') ' ||
             (2000 + floor(random() * 7999))::TEXT || '-' ||
             (1000 + floor(random() * 8999))::TEXT;
    
    -- Gerar CNPJ
    document := (10000000 + floor(random() * 89999999))::TEXT || '0001' ||
                (10 + floor(random() * 89))::TEXT;
    
    -- Selecionar cidade e estado
    city := cities[1 + floor(random() * array_length(cities, 1))];
    state := states[1 + floor(random() * array_length(states, 1))];
    
    -- Gerar endereço
    address := 'Rua ' || last_names[1 + floor(random() * array_length(last_names, 1))] || ', ' ||
               (100 + floor(random() * 9900))::TEXT || ' - ' || city || '/' || state;
    
    -- Gerar tags aleatórias (0 a 3 tags)
    random_tags := floor(random() * 4);
    tags := ARRAY[]::TEXT[];
    
    IF random_tags > 0 THEN
      FOR j IN 1..random_tags LOOP
        tags := array_append(tags, tags_options[1 + floor(random() * array_length(tags_options, 1))]);
      END LOOP;
      -- Remover duplicatas
      tags := ARRAY(SELECT DISTINCT unnest(tags));
    END IF;
    
    -- Inserir empresa
    INSERT INTO companies (
      name,
      email,
      whatsapp,
      phone,
      document,
      address,
      city,
      state,
      tags,
      created_at
    ) VALUES (
      company_name,
      email,
      whatsapp,
      phone,
      document,
      address,
      city,
      state,
      tags,
      NOW() - (random() * INTERVAL '365 days')
    );
    
  END LOOP;
  
  RAISE NOTICE '100 empresas cadastradas com sucesso!';
END $$;

-- Verificar quantas empresas foram criadas
SELECT COUNT(*) as total_empresas FROM companies;

-- Ver algumas empresas criadas
SELECT 
  name,
  email,
  whatsapp,
  city,
  state,
  tags,
  created_at
FROM companies
ORDER BY created_at DESC
LIMIT 10;
