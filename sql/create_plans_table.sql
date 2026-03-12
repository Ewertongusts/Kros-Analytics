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

CREATE POLICY "Enable read access for all users" ON plans
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON plans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON plans
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON plans
  FOR DELETE USING (auth.role() = 'authenticated');
