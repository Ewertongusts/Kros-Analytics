import { ref, computed } from 'vue'

export interface UserProfile {
  id: string
  full_name?: string
  name?: string
  display_name?: string
  username?: string
  role?: 'admin' | 'manager' | 'user'
  phone?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  created_at?: string
  updated_at?: string
}

export interface CreateUserData {
  email: string
  name: string
  role: 'admin' | 'manager' | 'user'
  password: string
  full_name?: string
  phone?: string
}

export const useUsers = () => {
  const supabase = useSupabaseClient()
  const users = ref<User[]>([])
  const userProfiles = ref<UserProfile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all users from the custom users table
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      users.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch user profiles
  const fetchUserProfiles = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      userProfiles.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching user profiles:', err)
    } finally {
      loading.value = false
    }
  }

  // Create new user (requires admin privileges)
  const createUser = async (userData: CreateUserData) => {
    loading.value = true
    error.value = null
    
    try {
      // Usar a API route do servidor para criar o usuário
      const { data } = await $fetch('/api/admin/users', {
        method: 'POST',
        body: userData
      })
      
      console.log('Usuário criado com sucesso:', data)
      await fetchUsers()
      return data.user
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar usuário'
      console.error('Error creating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user
  const updateUser = async (id: string, updates: Partial<User>) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update(updates as any)
        .eq('id', id)

      if (updateError) throw updateError
      
      await fetchUsers()
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateUserProfile = async (id: string, updates: Partial<UserProfile>) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id,
          ...updates,
          updated_at: new Date().toISOString()
        } as any)

      if (updateError) throw updateError
      
      await fetchUserProfiles()
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating user profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete user (requires admin privileges)
  const deleteUser = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      // Usar a API route do servidor para deletar o usuário
      const { data } = await $fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      
      console.log('Usuário deletado com sucesso:', data?.message || 'Operação concluída')
      await fetchUsers()
    } catch (err: any) {
      error.value = err.message || 'Erro ao deletar usuário'
      console.error('Error deleting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get user by ID
  const getUserById = (id: string) => {
    return computed(() => users.value.find(user => user.id === id))
  }

  // Get user profile by ID
  const getUserProfileById = (id: string) => {
    return computed(() => userProfiles.value.find(profile => profile.id === id))
  }

  // Filter users by role
  const getUsersByRole = (role: 'admin' | 'manager' | 'user') => {
    return computed(() => users.value.filter(user => user.role === role))
  }

  // Stats
  const userStats = computed(() => ({
    total: users.value.length,
    admins: users.value.filter(u => u.role === 'admin').length,
    managers: users.value.filter(u => u.role === 'manager').length,
    users: users.value.filter(u => u.role === 'user').length
  }))

  // Clean up inconsistent users
  const cleanupUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch('/api/admin/users/cleanup', {
        method: 'POST'
      })
      
      console.log('Limpeza concluída:', data)
      await fetchUsers()
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro na limpeza de usuários'
      console.error('Error cleaning up users:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users: readonly(users),
    userProfiles: readonly(userProfiles),
    loading: readonly(loading),
    error: readonly(error),
    userStats,
    fetchUsers,
    fetchUserProfiles,
    createUser,
    updateUser,
    updateUserProfile,
    deleteUser,
    cleanupUsers,
    getUserById,
    getUserProfileById,
    getUsersByRole
  }
}