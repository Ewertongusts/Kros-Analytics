import { createClient } from '@supabase/supabase-js'

export const useSupabaseAdmin = () => {
  // Esta função só deve ser usada no servidor (server/api routes)
  // Para operações de admin no cliente, use as API routes em /api/admin/
  if (process.client) {
    throw new Error('useSupabaseAdmin só pode ser usado no servidor. Use as API routes em /api/admin/ no cliente.')
  }

  const config = useRuntimeConfig()
  
  // Create admin client with service key
  const supabaseAdmin = createClient(
    config.public.supabase.url,
    config.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  return {
    supabaseAdmin
  }
}