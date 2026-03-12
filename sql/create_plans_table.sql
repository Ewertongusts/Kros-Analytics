-- Criação da tabela de Planos
CREATE TABLE plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text DEFAULT 'Plano Recorrente' CHECK (type IN ('Plano Recorrente', 'Serviço Único', 'Produto')),
  category text,
  description text,
  price numeric NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'Mensal',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS (Row Level Security)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT para usuários autenticados
CREATE POLICY "Allow authenticated users to read plans" ON plans
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Permitir INSERT para usuários autenticados
CREATE POLICY "Allow authenticated users to insert plans" ON plans
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Allow authenticated users to update plans" ON plans
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir DELETE para usuários autenticados
CREATE POLICY "Allow authenticated users to delete plans" ON plans
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);
