-- Criar tabela de categorias de planos/produtos/serviços
CREATE TABLE IF NOT EXISTS plan_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#007BFF',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO plan_categories (name, color, icon) VALUES
  ('CRM', '#3B82F6', '📊'),
  ('Agente IA', '#8B5CF6', '🤖'),
  ('Landing Page', '#10B981', '🎨'),
  ('Implementação', '#F59E0B', '⚙️'),
  ('Consultoria', '#EC4899', '💡'),
  ('Gestão', '#6366F1', '📈')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE plan_categories IS 'Categorias para classificar planos, produtos e serviços';
