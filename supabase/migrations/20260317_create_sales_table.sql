-- Create a separate sales table to store sales separately from companies
-- This prevents sales from overwriting each other when different types are created

CREATE TABLE IF NOT EXISTS sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    
    -- Sale details
    sale_type text NOT NULL CHECK (sale_type IN ('produto', 'servico', 'personalizado')),
    plan_name text,
    custom_name text,
    custom_category text,
    custom_description text,
    
    -- Client info (denormalized for quick access)
    name text,
    representative_name text,
    whatsapp text,
    email text,
    
    -- Financial details
    monthly_price decimal(12,2) NOT NULL,
    discount_type text,
    discount_value decimal(12,2) DEFAULT 0,
    final_value decimal(12,2),
    
    -- Payment details
    payment_type text,
    payment_status text DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'scheduled')),
    payment_date timestamp with time zone,
    
    -- Installments
    installments integer DEFAULT 1,
    installments_payment_type text,
    down_payment decimal(12,2),
    
    -- Interest
    interest_type text,
    interest_rate decimal(5,2),
    
    -- Metadata
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_company_id ON sales(company_id);
CREATE INDEX idx_sales_sale_type ON sales(sale_type);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" ON sales
  FOR DELETE USING (auth.uid() = user_id);
