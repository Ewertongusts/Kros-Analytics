import { ref } from 'vue'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export const useUsers = () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  const fetchUsers = async () => {
    loading.value = true
    try {
      const supabase = useSupabaseClient()
      
      // Buscar usuários da tabela auth.users (se disponível)
      // Caso contrário, buscar de uma tabela customizada
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, avatar_url')
        .order('name', { ascending: true })

      if (error) throw error
      
      users.value = data || []
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const getUserById = (id: string) => {
    return users.value.find(u => u.id === id)
  }

  const getUserByEmail = (email: string) => {
    return users.value.find(u => u.email === email)
  }

  return {
    users,
    loading,
    fetchUsers,
    getUserById,
    getUserByEmail
  }
}
