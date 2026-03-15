import { ref, watch } from 'vue'

export interface TasksPagePreferences {
  showDashboard: boolean
  itemsPerPage: number
  sortBy: string
  collapsedColumns: string[]
}

const STORAGE_KEY = 'tasks_page_preferences'

export const useUserPreferences = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const preferences = ref<TasksPagePreferences>({
    showDashboard: false,
    itemsPerPage: 20,
    sortBy: 'created_at',
    collapsedColumns: []
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Carregar preferências do localStorage (fallback)
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        preferences.value = { ...preferences.value, ...parsed }
      }
    } catch (err) {
      console.error('Erro ao carregar preferências do localStorage:', err)
    }
  }

  // Salvar preferências no localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
    } catch (err) {
      console.error('Erro ao salvar preferências no localStorage:', err)
    }
  }

  // Carregar preferências do Supabase
  const loadFromSupabase = async () => {
    if (!user.value) {
      loadFromLocalStorage()
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.value.id)
        .eq('page', 'tasks')
        .single()

      if (err && err.code !== 'PGRST116') {
        throw err
      }

      if (data?.preferences) {
        preferences.value = { ...preferences.value, ...data.preferences }
      } else {
        loadFromLocalStorage()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar preferências'
      loadFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  // Salvar preferências no Supabase
  const saveToSupabase = async () => {
    if (!user.value) {
      saveToLocalStorage()
      return
    }

    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.value.id,
            page: 'tasks',
            preferences: preferences.value,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,page' }
        )

      if (err) throw err

      // Também salvar no localStorage como backup
      saveToLocalStorage()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao salvar preferências'
      // Ainda assim salvar no localStorage
      saveToLocalStorage()
    } finally {
      loading.value = false
    }
  }

  // Atualizar preferência individual
  const updatePreference = async <K extends keyof TasksPagePreferences>(
    key: K,
    value: TasksPagePreferences[K]
  ) => {
    preferences.value[key] = value
    await saveToSupabase()
  }

  // Resetar preferências
  const resetPreferences = async () => {
    preferences.value = {
      showDashboard: false,
      itemsPerPage: 20,
      sortBy: 'created_at',
      collapsedColumns: []
    }
    await saveToSupabase()
  }

  // Watch para salvar automaticamente quando preferências mudam
  watch(
    preferences,
    () => {
      saveToSupabase()
    },
    { deep: true, debounce: 500 }
  )

  return {
    preferences,
    loading,
    error,
    loadFromSupabase,
    saveToSupabase,
    updatePreference,
    resetPreferences
  }
}
