-- Migrate existing sales from companies table to sales table
-- This moves all records with sale_type to the new sales table

BEGIN;

-- Insert all companies with sale_type into the sales table
INSERT INTO sales (
  id,
  user_id,
  company_id,
  sale_type,
  plan_name,
  custom_name,
  custom_category,
  custom_description,
  name,
  representative_name,
  whatsapp,
  email,
  monthly_price,
  discount_type,
  discount_value,
  final_value,
  payment_type,
  payment_status,
  payment_date,
  installments,
  installments_payment_type,
  down_payment,
  interest_type,
  interest_rate,
  notes,
  created_by,
  created_at,
  updated_at
)
SELECT
  id,
  user_id,
  id as company_id,
  sale_type,
  plan_name,
  custom_name,
  custom_category,
  custom_description,
  name,
  representative_name,
  whatsapp,
  email,
  monthly_price,
  discount_type,
  discount_value,
  final_value,
  payment_type,
  payment_status,
  payment_date,
  installments,
  installments_payment_type,
  down_payment,
  interest_type,
  interest_rate,
  notes,
  created_by,
  created_at,
  updated_at
FROM companies
WHERE sale_type IS NOT NULL
ON CONFLICT (id) DO NOTHING;

COMMIT;
