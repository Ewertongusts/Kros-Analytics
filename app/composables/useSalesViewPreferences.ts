import { ref } from 'vue'

export interface SalesViewPreferences {
  viewMode: 'list' | 'cards'
  rememberPreferences: boolean
  searchQuery: string
  status: string
  startDate: string
  endDate: string
  activeFilter: string
}

const STORAGE_KEY = 'sales-view-preferences'

// Estado global compartilhado
const globalState = {
  viewMode: ref<'list' | 'cards'>('list'),
  rememberPreferences: ref(true),
  isLoaded: ref(false)
}

export const useSalesViewPreferences = () => {
  // Carregar preferências do localStorage
  const loadPreferences = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const prefs = JSON.parse(stored) as SalesViewPreferences
          globalState.viewMode.value = prefs.viewMode ?? 'list'
          globalState.rememberPreferences.value = prefs.rememberPreferences ?? true
        }
      } catch (error) {
        console.error('Erro ao carregar preferências de vendas:', error)
      }
      globalState.isLoaded.value = true
    }
  }

  // Salvar preferências no localStorage
  const savePreferences = (prefs: Partial<SalesViewPreferences>) => {
    if (process.client && globalState.rememberPreferences.value) {
      try {
        const currentPrefs = localStorage.getItem(STORAGE_KEY)
        const merged = {
          ...(currentPrefs ? JSON.parse(currentPrefs) : {}),
          ...prefs,
          viewMode: globalState.viewMode.value,
          rememberPreferences: globalState.rememberPreferences.value
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        console.log('Preferências de vendas salvas:', merged)
      } catch (error) {
        console.error('Erro ao salvar preferências de vendas:', error)
      }
    }
  }

  // Resetar preferências
  const resetPreferences = () => {
    globalState.viewMode.value = 'list'
    globalState.rememberPreferences.value = true
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    viewMode: globalState.viewMode,
    rememberPreferences: globalState.rememberPreferences,
    isLoaded: globalState.isLoaded,
    loadPreferences,
    savePreferences,
    resetPreferences
  }
}
