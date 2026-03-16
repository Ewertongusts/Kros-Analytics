-- Fix users table to properly reference auth.users
-- Remove the default value for id and add foreign key constraint

-- First, remove the default value for id column
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;

-- Add foreign key constraint to auth.users (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;
    END IF;
END $$;

-- Clean up any orphaned records (users that don't exist in auth.users)
DELETE FROM public.users 
WHERE id NOT IN (
    SELECT id FROM auth.users
);

-- Clean up any orphaned user_profiles
DELETE FROM public.user_profiles 
WHERE id NOT IN (
    SELECT id FROM auth.users
);