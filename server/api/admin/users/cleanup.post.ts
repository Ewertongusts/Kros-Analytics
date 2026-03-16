import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()

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

    // Buscar todos os usuários da tabela users
    const { data: usersInTable, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')

    if (usersError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Erro ao buscar usuários: ${usersError.message}`
      })
    }

    const inconsistencies = []
    const toDelete = []

    // Verificar cada usuário se existe no auth
    for (const user of usersInTable || []) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.id)
      
      if (authError || !authUser.user) {
        inconsistencies.push({
          id: user.id,
          email: user.email,
          name: user.name,
          issue: 'Existe na tabela users mas não no auth'
        })
        toDelete.push(user.id)
      }
    }

    // Deletar usuários inconsistentes das tabelas
    if (toDelete.length > 0) {
      // Deletar da tabela users
      const { error: deleteUsersError } = await supabaseAdmin
        .from('users')
        .delete()
        .in('id', toDelete)

      if (deleteUsersError) {
        console.warn('Erro ao deletar usuários inconsistentes:', deleteUsersError)
      }

      // Deletar da tabela user_profiles
      const { error: deleteProfilesError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .in('id', toDelete)

      if (deleteProfilesError) {
        console.warn('Erro ao deletar profiles inconsistentes:', deleteProfilesError)
      }
    }

    return {
      success: true,
      message: `Limpeza concluída. ${inconsistencies.length} inconsistências encontradas e corrigidas.`,
      inconsistencies,
      deletedCount: toDelete.length
    }

  } catch (error: any) {
    console.error('Erro na limpeza:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro interno do servidor'
    })
  }
})