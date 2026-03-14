-- Criar tabela de categorias de despesas
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_expense_categories_name ON expense_categories(name);

-- Desabilitar RLS para permitir acesso
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;

-- Inserir categorias padrão
INSERT INTO expense_categories (name) VALUES
  ('Infraestrutura'),
  ('Software'),
  ('Marketing'),
  ('Pessoal'),
  ('Outros')
ON CONFLICT (name) DO NOTHING;
