import { ref } from 'vue'

interface CurrentUser {
  id: string
  email: string
  name: string
}

const currentUser = ref<CurrentUser | null>(null)
const loading = ref(false)

export const useCurrentUser = () => {
  const supabase = useSupabaseClient()

  const fetchCurrentUser = async () => {
    if (currentUser.value) return currentUser.value

    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        loading.value = false
        return null
      }

      // Tentar buscar de user_profiles primeiro
      let userName = user.email?.split('@')[0] || 'Usuário'
      
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          userName = (profile as any)?.full_name || 
                    (profile as any)?.name || 
                    (profile as any)?.display_name ||
                    (profile as any)?.username ||
                    userName
        }
      } catch (err) {
        // Se não existir user_profiles, tentar profiles
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            userName = (profile as any)?.full_name || 
                      (profile as any)?.name || 
                      (profile as any)?.display_name ||
                      (profile as any)?.username ||
                      userName
          }
        } catch (err2) {
          console.log('Nenhuma tabela de perfil encontrada, usando email')
        }
      }

      currentUser.value = {
        id: user.id,
        email: user.email || '',
        name: userName
      }

      loading.value = false
      return currentUser.value
    } catch (err) {
      console.error('Error fetching current user:', err)
      loading.value = false
      return null
    }
  }

  const clearCurrentUser = () => {
    currentUser.value = null
  }

  return {
    currentUser,
    loading,
    fetchCurrentUser,
    clearCurrentUser
  }
}
