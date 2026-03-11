-- Execute este script no SQL Editor do seu Supabase Dashboard
-- para habilitar o campo de observações internas nas cobranças.

ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
