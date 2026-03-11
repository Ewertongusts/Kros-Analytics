-- Migração para suporte a Anti-Ban (Randômico) nas configurações de CRM
ALTER TABLE crm_settings ADD COLUMN IF NOT EXISTS delay_min integer DEFAULT 15;
ALTER TABLE crm_settings ADD COLUMN IF NOT EXISTS delay_max integer DEFAULT 30;
ALTER TABLE crm_settings ADD COLUMN IF NOT EXISTS break_after integer DEFAULT 10;
ALTER TABLE crm_settings ADD COLUMN IF NOT EXISTS break_delay_min integer DEFAULT 5;
ALTER TABLE crm_settings ADD COLUMN IF NOT EXISTS break_delay_max integer DEFAULT 10;

-- Atualizar registro existente com valores padrão caso estejam nulos
UPDATE crm_settings 
SET 
  delay_min = COALESCE(delay_min, 15),
  delay_max = COALESCE(delay_max, 30),
  break_after = COALESCE(break_after, 10),
  break_delay_min = COALESCE(break_delay_min, 5),
  break_delay_max = COALESCE(break_delay_max, 10)
WHERE delay_min IS NULL;
