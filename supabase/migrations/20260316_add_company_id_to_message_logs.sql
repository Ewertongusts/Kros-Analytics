-- Add company_id column to message_logs if it doesn't exist
ALTER TABLE public.message_logs 
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_message_logs_company_id ON public.message_logs(company_id);

-- Add comment
COMMENT ON COLUMN public.message_logs.company_id IS 'ID da empresa para filtrar logs por empresa';
