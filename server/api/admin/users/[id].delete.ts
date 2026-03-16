import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do usuário é obrigatório'
      })
    }

    // Criar cliente admin do Supabase no servidor
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

    // Primeiro, tentar deletar do auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    // Se o usuário não existe no auth, não é um erro crítico
    // Vamos continuar e limpar as tabelas relacionadas
    if (authError && !authError.message.includes('User not found')) {
      throw createError({
        statusCode: 500,
        statusMessage: `Erro ao deletar usuário do auth: ${authError.message}`
      })
    }

    // Deletar da tabela users (se existir)
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (usersError) {
      console.warn('Erro ao deletar da tabela users:', usersError)
    }

    // Deletar da tabela user_profiles (se existir)
    const { error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profilesError) {
      console.warn('Erro ao deletar da tabela user_profiles:', profilesError)
    }

    return {
      success: true,
      message: authError?.message.includes('User not found') 
        ? 'Usuário removido das tabelas (não existia no auth)'
        : 'Usuário deletado com sucesso'
    }

  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro interno do servidor'
    })
  }
})