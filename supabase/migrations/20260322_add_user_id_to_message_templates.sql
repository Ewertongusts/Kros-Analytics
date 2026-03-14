-- Add user_id column to message_templates table
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
